"use client"

import { doc, updateDoc, collection, getDocs, setDoc, getDoc, onSnapshot, query, where, enableNetwork, disableNetwork } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminUser, MeetingStatus } from "@/types/admin"

// Fixed meeting room ID
export const FIXED_ROOM_ID = "kamustahan01"

// Retry configuration
const RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000

// Utility function to retry operations
async function retryOperation<T>(operation: () => Promise<T>, attempts = RETRY_ATTEMPTS): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await operation()
    } catch (error: any) {
      console.warn(`Attempt ${i + 1} failed:`, error.message)
      
      // If it's an offline error, try to reconnect
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        try {
          if (db) {
            await enableNetwork(db)
            console.log('Network re-enabled')
          }
        } catch (networkError) {
          console.warn('Failed to re-enable network:', networkError)
        }
      }
      
      if (i === attempts - 1) throw error
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)))
    }
  }
  throw new Error('All retry attempts failed')
}

// Check if user is admin with retry logic
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!db || !userId) return false
  
  try {
    return await retryOperation(async () => {
      const userDoc = await getDoc(doc(db, "users", userId))
      return userDoc.exists() ? userDoc.data()?.isAdmin === true : false
    })
  } catch (error: any) {
    console.error("Error checking admin status:", error)
    
    // Return cached value if available
    const cached = localStorage.getItem(`admin_status_${userId}`)
    if (cached) {
      console.log('Using cached admin status')
      return JSON.parse(cached)
    }
    
    return false
  }
}

// Make user admin with retry logic
export async function makeUserAdmin(userId: string): Promise<void> {
  if (!db) throw new Error("Database not available")
  
  await retryOperation(async () => {
    await updateDoc(doc(db, "users", userId), {
      isAdmin: true,
      updatedAt: new Date().toISOString()
    })
  })
}

// Remove admin status with retry logic
export async function removeUserAdmin(userId: string): Promise<void> {
  if (!db) throw new Error("Database not available")
  
  await retryOperation(async () => {
    await updateDoc(doc(db, "users", userId), {
      isAdmin: false,
      updatedAt: new Date().toISOString()
    })
  })
}

// Get all users for admin management with retry logic
export async function getAllUsers(): Promise<AdminUser[]> {
  if (!db) return []
  
  try {
    return await retryOperation(async () => {
      const usersSnapshot = await getDocs(collection(db, "users"))
      const users = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as AdminUser))
      
      // Cache the result
      localStorage.setItem('cached_users', JSON.stringify(users))
      return users
    })
  } catch (error: any) {
    console.error("Error fetching users:", error)
    
    // Return cached users if available
    const cached = localStorage.getItem('cached_users')
    if (cached) {
      console.log('Using cached users data')
      return JSON.parse(cached)
    }
    
    return []
  }
}

// Start meeting (admin only) with retry logic
export async function startMeeting(adminUserId: string, adminName: string): Promise<void> {
  if (!db) throw new Error("Database not available")
  
  const meetingData: MeetingStatus = {
    roomId: FIXED_ROOM_ID,
    isActive: true,
    participantCount: 1,
    startedBy: adminUserId,
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  }
  
  await retryOperation(async () => {
    await setDoc(doc(db, "meetings", FIXED_ROOM_ID), meetingData)
  })
  
  // Cache the meeting status
  localStorage.setItem('meeting_status', JSON.stringify(meetingData))
}

// End meeting with retry logic
export async function endMeeting(): Promise<void> {
  if (!db) throw new Error("Database not available")
  
  const endData = {
    isActive: false,
    participantCount: 0,
    lastUpdated: new Date().toISOString()
  }
  
  await retryOperation(async () => {
    await updateDoc(doc(db, "meetings", FIXED_ROOM_ID), endData)
  })
  
  // Update cache
  const cached = localStorage.getItem('meeting_status')
  if (cached) {
    const meetingData = JSON.parse(cached)
    localStorage.setItem('meeting_status', JSON.stringify({ ...meetingData, ...endData }))
  }
}

// Update participant count with retry logic
export async function updateParticipantCount(count: number): Promise<void> {
  if (!db) throw new Error("Database not available")
  
  const updateData = {
    participantCount: count,
    lastUpdated: new Date().toISOString()
  }
  
  try {
    await retryOperation(async () => {
      await updateDoc(doc(db, "meetings", FIXED_ROOM_ID), updateData)
    })
    
    // Update cache
    const cached = localStorage.getItem('meeting_status')
    if (cached) {
      const meetingData = JSON.parse(cached)
      localStorage.setItem('meeting_status', JSON.stringify({ ...meetingData, ...updateData }))
    }
  } catch (error) {
    console.warn('Failed to update participant count, using local cache:', error)
  }
}

// Listen to meeting status changes with offline support
export function listenToMeetingStatus(callback: (status: MeetingStatus | null) => void): () => void {
  if (!db) {
    // Try to use cached data
    const cached = localStorage.getItem('meeting_status')
    if (cached) {
      callback(JSON.parse(cached))
    } else {
      callback(null)
    }
    return () => {}
  }
  
  // Set up real-time listener
  const unsubscribe = onSnapshot(
    doc(db, "meetings", FIXED_ROOM_ID), 
    (doc) => {
      if (doc.exists()) {
        const status = doc.data() as MeetingStatus
        callback(status)
        // Cache the status
        localStorage.setItem('meeting_status', JSON.stringify(status))
      } else {
        callback(null)
        localStorage.removeItem('meeting_status')
      }
    }, 
    (error) => {
      console.error("Error listening to meeting status:", error)
      
      // Fallback to cached data
      const cached = localStorage.getItem('meeting_status')
      if (cached) {
        console.log('Using cached meeting status due to connection error')
        callback(JSON.parse(cached))
      } else {
        callback(null)
      }
    }
  )
  
  return unsubscribe
}

// Get meeting status with retry logic
export async function getMeetingStatus(): Promise<MeetingStatus | null> {
  if (!db) {
    // Try cached data
    const cached = localStorage.getItem('meeting_status')
    return cached ? JSON.parse(cached) : null
  }
  
  try {
    return await retryOperation(async () => {
      const meetingDoc = await getDoc(doc(db, "meetings", FIXED_ROOM_ID))
      if (meetingDoc.exists()) {
        const status = meetingDoc.data() as MeetingStatus
        // Cache the result
        localStorage.setItem('meeting_status', JSON.stringify(status))
        return status
      }
      return null
    })
  } catch (error: any) {
    console.error("Error getting meeting status:", error)
    
    // Return cached data if available
    const cached = localStorage.getItem('meeting_status')
    if (cached) {
      console.log('Using cached meeting status')
      return JSON.parse(cached)
    }
    
    return null
  }
}

// Network status checker
export function checkNetworkStatus(): boolean {
  return navigator.onLine
}

// Initialize offline support
export function initializeOfflineSupport() {
  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('Network connection restored')
    if (db) {
      enableNetwork(db).catch(console.error)
    }
  })
  
  window.addEventListener('offline', () => {
    console.log('Network connection lost')
  })
}