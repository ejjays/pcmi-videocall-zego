"use client"

import { doc, updateDoc, collection, getDocs, setDoc, getDoc, onSnapshot, query, where } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { AdminUser, MeetingStatus } from "@/types/admin"

// Fixed meeting room ID
export const FIXED_ROOM_ID = "kamustahan01"

// Simplified retry configuration
const RETRY_ATTEMPTS = 1
const RETRY_DELAY = 1000

// Cache duration (3 minutes)
const CACHE_DURATION = 3 * 60 * 1000

// Cache management
interface CacheItem<T> {
  data: T
  timestamp: number
}

function setCache<T>(key: string, data: T): void {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(cacheItem))
  } catch (error) {
    console.warn('Failed to set cache:', error)
  }
}

function getCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    
    const cacheItem: CacheItem<T> = JSON.parse(cached)
    
    // Check if cache is still valid
    if (Date.now() - cacheItem.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key)
      return null
    }
    
    return cacheItem.data
  } catch {
    return null
  }
}

// Simplified retry operation
async function retryOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error: any) {
    // Only retry on network errors
    if (error.code === 'unavailable' || error.message.includes('offline')) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return await operation()
    }
    throw error
  }
}

// Simplified admin status check
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!userId) return false
  
  const cacheKey = `admin_status_${userId}`
  
  // Return cached value immediately if available
  const cached = getCache<boolean>(cacheKey)
  if (cached !== null) {
    return cached
  }
  
  // If no cache, try to fetch
  if (!db || !navigator.onLine) return false
  
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    const isAdmin = userDoc.exists() ? userDoc.data()?.isAdmin === true : false
    setCache(cacheKey, isAdmin)
    return isAdmin
  } catch (error: any) {
    console.warn("Error checking admin status:", error.message)
    return false
  }
}

// Make user admin
export async function makeUserAdmin(userId: string): Promise<void> {
  if (!db) throw new Error("Database not available")
  
  await retryOperation(async () => {
    // First ensure the user document exists
    await ensureUserDocumentExists(userId)
    
    // Then update admin status
    await updateDoc(doc(db, "users", userId), {
      isAdmin: true,
      updatedAt: new Date().toISOString()
    })
  })
  
  // Update cache
  setCache(`admin_status_${userId}`, true)
}

// Remove admin status
export async function removeUserAdmin(userId: string): Promise<void> {
  if (!db) throw new Error("Database not available")
  
  await retryOperation(async () => {
    // First ensure the user document exists
    await ensureUserDocumentExists(userId)
    
    // Then update admin status
    await updateDoc(doc(db, "users", userId), {
      isAdmin: false,
      updatedAt: new Date().toISOString()
    })
  })
  
  // Update cache
  setCache(`admin_status_${userId}`, false)
}

// 🔥 NEW: Ensure user document exists in Firestore
async function ensureUserDocumentExists(userId: string): Promise<void> {
  if (!db || !auth) return
  
  try {
    const userDocRef = doc(db, "users", userId)
    const userDoc = await getDoc(userDocRef)
    
    if (!userDoc.exists()) {
      console.log(`Creating missing Firestore document for user: ${userId}`)
      
      // Try to get user info from Firebase Auth
      let displayName = "Unknown User"
      let email = ""
      let photoURL = null
      
      // If this is the current user, we can get their info
      if (auth.currentUser && auth.currentUser.uid === userId) {
        displayName = auth.currentUser.displayName || auth.currentUser.email?.split("@")[0] || "Unknown User"
        email = auth.currentUser.email || ""
        photoURL = auth.currentUser.photoURL
      }
      
      // Create the document with available info
      await setDoc(userDocRef, {
        uid: userId,
        email: email,
        displayName: displayName,
        photoURL: photoURL,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        status: "offline",
        isAdmin: false,
        // Mark as legacy user
        isLegacyUser: true,
        legacyCreatedAt: new Date().toISOString()
      })
      
      console.log(`✅ Created Firestore document for legacy user: ${userId}`)
    }
  } catch (error) {
    console.warn(`Failed to ensure user document exists for ${userId}:`, error)
  }
}

// 🔥 UPDATED: Get all users from BOTH Firebase Auth AND Firestore
export async function getAllUsers(): Promise<AdminUser[]> {
  const cacheKey = 'all_users'
  
  // Return cached users immediately if available
  const cached = getCache<AdminUser[]>(cacheKey)
  if (cached !== null) {
    console.log(`📦 Returning ${cached.length} cached users`)
    return cached
  }
  
  // If no cache, try to fetch
  if (!db || !navigator.onLine) {
    console.log("🔌 Offline or no database - returning empty array")
    return []
  }
  
  try {
    console.log("🔍 Fetching all users from Firestore...")
    
    // Get all users from Firestore
    const usersSnapshot = await getDocs(collection(db, "users"))
    const firestoreUsers = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as AdminUser))
    
    console.log(`📊 Found ${firestoreUsers.length} users in Firestore`)
    
    // 🔥 NEW: Also try to get users from Firebase Auth (if possible)
    // Note: In client-side code, we can only access the current user
    // But we'll create documents for any missing users when they're accessed
    
    // For now, let's work with what we have in Firestore
    // and create missing documents when users are promoted/demoted
    
    const allUsers = firestoreUsers.map(user => ({
      uid: user.uid,
      email: user.email || "Unknown Email",
      displayName: user.displayName || user.email?.split("@")[0] || "Unknown User",
      photoURL: user.photoURL || null,
      isAdmin: user.isAdmin === true,
      createdAt: user.createdAt || new Date().toISOString(),
      lastActive: user.lastActive || user.createdAt || new Date().toISOString(),
      status: user.status || "offline",
      isLegacyUser: user.isLegacyUser || false
    }))
    
    console.log(`✅ Processed ${allUsers.length} total users`)
    
    setCache(cacheKey, allUsers)
    return allUsers
  } catch (error: any) {
    console.warn("❌ Error fetching users:", error.message)
    return []
  }
}

// 🔥 NEW: Create missing Firestore documents for existing Firebase Auth users
export async function syncFirebaseAuthUsers(): Promise<void> {
  if (!db || !auth) {
    console.log("🔌 Database or Auth not available for sync")
    return
  }
  
  try {
    console.log("🔄 Starting Firebase Auth users sync...")
    
    // Note: In client-side code, we can only access the current authenticated user
    // We can't list all Firebase Auth users from the client
    // This function will be called when users sign in to ensure their documents exist
    
    if (auth.currentUser) {
      await ensureUserDocumentExists(auth.currentUser.uid)
      console.log("✅ Ensured current user document exists")
    }
    
    // Clear cache to force refresh
    localStorage.removeItem('all_users')
    
  } catch (error) {
    console.warn("❌ Error syncing Firebase Auth users:", error)
  }
}

// Start meeting
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
  
  setCache('meeting_status', meetingData)
}

// End meeting
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
  const cached = getCache<MeetingStatus>('meeting_status')
  if (cached) {
    setCache('meeting_status', { ...cached, ...endData })
  }
}

// Update participant count
export async function updateParticipantCount(count: number): Promise<void> {
  const updateData = {
    participantCount: count,
    lastUpdated: new Date().toISOString()
  }
  
  // Update cache immediately (optimistic update)
  const cached = getCache<MeetingStatus>('meeting_status')
  if (cached) {
    setCache('meeting_status', { ...cached, ...updateData })
  }
  
  // Try to update server in background
  if (db && navigator.onLine) {
    try {
      await updateDoc(doc(db, "meetings", FIXED_ROOM_ID), updateData)
    } catch (error) {
      console.warn('Failed to update participant count on server:', error)
    }
  }
}

// Meeting status listener
export function listenToMeetingStatus(callback: (status: MeetingStatus | null) => void): () => void {
  // Return cached data immediately
  const cached = getCache<MeetingStatus>('meeting_status')
  if (cached) {
    callback(cached)
  }
  
  if (!db || !navigator.onLine) {
    return () => {}
  }
  
  // Set up real-time listener
  const unsubscribe = onSnapshot(
    doc(db, "meetings", FIXED_ROOM_ID), 
    (doc) => {
      if (doc.exists()) {
        const status = doc.data() as MeetingStatus
        setCache('meeting_status', status)
        callback(status)
      } else {
        localStorage.removeItem('meeting_status')
        callback(null)
      }
    }, 
    (error) => {
      console.warn("Meeting status listener error:", error.message)
    }
  )
  
  return unsubscribe
}

// Get meeting status
export async function getMeetingStatus(): Promise<MeetingStatus | null> {
  const cacheKey = 'meeting_status'
  
  // Return cached value immediately if available
  const cached = getCache<MeetingStatus>(cacheKey)
  if (cached !== null) {
    return cached
  }
  
  // If no cache, try to fetch
  if (!db || !navigator.onLine) return null
  
  try {
    const meetingDoc = await getDoc(doc(db, "meetings", FIXED_ROOM_ID))
    if (meetingDoc.exists()) {
      const status = meetingDoc.data() as MeetingStatus
      setCache(cacheKey, status)
      return status
    }
    return null
  } catch (error: any) {
    console.warn("Error getting meeting status:", error.message)
    return null
  }
}

// Network status checker
export function checkNetworkStatus(): boolean {
  return navigator.onLine
}

// Initialize offline support
export function initializeOfflineSupport() {
  window.addEventListener('online', () => {
    console.log('Network connection restored')
  })
  
  window.addEventListener('offline', () => {
    console.log('Network connection lost')
  })
}