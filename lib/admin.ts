"use client"

import { doc, updateDoc, collection, getDocs, setDoc, getDoc, onSnapshot, query, where, enableNetwork, disableNetwork } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminUser, MeetingStatus } from "@/types/admin"

// Fixed meeting room ID
export const FIXED_ROOM_ID = "kamustahan01"

// Optimized retry configuration - less aggressive
const RETRY_ATTEMPTS = 2
const RETRY_DELAY = 500

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

// Cache management
interface CacheItem<T> {
  data: T
  timestamp: number
}

function setCache<T>(key: string, data: T): void {
  const cacheItem: CacheItem<T> = {
    data,
    timestamp: Date.now()
  }
  localStorage.setItem(key, JSON.stringify(cacheItem))
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

// Utility function to retry operations with exponential backoff
async function retryOperation<T>(operation: () => Promise<T>, attempts = RETRY_ATTEMPTS): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await operation()
    } catch (error: any) {
      if (i === attempts - 1) throw error
      
      // Only retry on network errors
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)))
      } else {
        throw error // Don't retry on other errors
      }
    }
  }
  throw new Error('All retry attempts failed')
}

// Optimized admin status check with immediate cache return
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!userId) return false
  
  const cacheKey = `admin_status_${userId}`
  
  // Return cached value immediately if available
  const cached = getCache<boolean>(cacheKey)
  if (cached !== null) {
    // Optionally refresh in background
    if (db && navigator.onLine) {
      setTimeout(() => refreshAdminStatus(userId), 100)
    }
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

// Background refresh for admin status
async function refreshAdminStatus(userId: string): Promise<void> {
  if (!db || !navigator.onLine) return
  
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    const isAdmin = userDoc.exists() ? userDoc.data()?.isAdmin === true : false
    setCache(`admin_status_${userId}`, isAdmin)
  } catch (error) {
    // Silently fail background refresh
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
  
  // Update cache
  setCache(`admin_status_${userId}`, true)
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
  
  // Update cache
  setCache(`admin_status_${userId}`, false)
}

// Optimized user fetching with immediate cache return
export async function getAllUsers(): Promise<AdminUser[]> {
  const cacheKey = 'all_users'
  
  // Return cached users immediately if available
  const cached = getCache<AdminUser[]>(cacheKey)
  if (cached !== null) {
    // Optionally refresh in background
    if (db && navigator.onLine) {
      setTimeout(() => refreshUsers(), 100)
    }
    return cached
  }
  
  // If no cache, try to fetch
  if (!db || !navigator.onLine) return []
  
  try {
    const usersSnapshot = await getDocs(collection(db, "users"))
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as AdminUser))
    
    setCache(cacheKey, users)
    return users
  } catch (error: any) {
    console.warn("Error fetching users:", error.message)
    return []
  }
}

// Background refresh for users
async function refreshUsers(): Promise<void> {
  if (!db || !navigator.onLine) return
  
  try {
    const usersSnapshot = await getDocs(collection(db, "users"))
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as AdminUser))
    
    setCache('all_users', users)
  } catch (error) {
    // Silently fail background refresh
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
  
  setCache('meeting_status', meetingData)
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
  const cached = getCache<MeetingStatus>('meeting_status')
  if (cached) {
    setCache('meeting_status', { ...cached, ...endData })
  }
}

// Update participant count with optimistic updates
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

// Optimized meeting status listener with immediate cache return
export function listenToMeetingStatus(callback: (status: MeetingStatus | null) => void): () => void {
  // Return cached data immediately
  const cached = getCache<MeetingStatus>('meeting_status')
  if (cached) {
    callback(cached)
  }
  
  if (!db || !navigator.onLine) {
    return () => {}
  }
  
  // Set up real-time listener with error handling
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
      // Don't call callback on error to avoid overriding cached data
    }
  )
  
  return unsubscribe
}

// Optimized meeting status getter with immediate cache return
export async function getMeetingStatus(): Promise<MeetingStatus | null> {
  const cacheKey = 'meeting_status'
  
  // Return cached value immediately if available
  const cached = getCache<MeetingStatus>(cacheKey)
  if (cached !== null) {
    // Optionally refresh in background
    if (db && navigator.onLine) {
      setTimeout(() => refreshMeetingStatus(), 100)
    }
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

// Background refresh for meeting status
async function refreshMeetingStatus(): Promise<void> {
  if (!db || !navigator.onLine) return
  
  try {
    const meetingDoc = await getDoc(doc(db, "meetings", FIXED_ROOM_ID))
    if (meetingDoc.exists()) {
      const status = meetingDoc.data() as MeetingStatus
      setCache('meeting_status', status)
    }
  } catch (error) {
    // Silently fail background refresh
  }
}

// Network status checker
export function checkNetworkStatus(): boolean {
  return navigator.onLine
}

// Lightweight offline support initialization
export function initializeOfflineSupport() {
  // Only set up basic event listeners
  window.addEventListener('online', () => {
    console.log('Network connection restored')
  })
  
  window.addEventListener('offline', () => {
    console.log('Network connection lost')
  })
}