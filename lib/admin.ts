"use client"

import { doc, updateDoc, collection, getDocs, setDoc, getDoc, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminUser, MeetingStatus } from "@/types/admin"

// Fixed meeting room ID
export const FIXED_ROOM_ID = "kamustahan01"

// Check if user is admin
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!db || !userId) return false
  
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    return userDoc.exists() ? userDoc.data()?.isAdmin === true : false
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

// Make user admin
export async function makeUserAdmin(userId: string): Promise<void> {
  if (!db) throw new Error("Database not available")
  
  await updateDoc(doc(db, "users", userId), {
    isAdmin: true,
    updatedAt: new Date().toISOString()
  })
}

// Remove admin status
export async function removeUserAdmin(userId: string): Promise<void> {
  if (!db) throw new Error("Database not available")
  
  await updateDoc(doc(db, "users", userId), {
    isAdmin: false,
    updatedAt: new Date().toISOString()
  })
}

// Get all users for admin management
export async function getAllUsers(): Promise<AdminUser[]> {
  if (!db) return []
  
  try {
    const usersSnapshot = await getDocs(collection(db, "users"))
    return usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as AdminUser))
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

// Start meeting (admin only)
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
  
  await setDoc(doc(db, "meetings", FIXED_ROOM_ID), meetingData)
}

// End meeting
export async function endMeeting(): Promise<void> {
  if (!db) throw new Error("Database not available")
  
  await updateDoc(doc(db, "meetings", FIXED_ROOM_ID), {
    isActive: false,
    participantCount: 0,
    lastUpdated: new Date().toISOString()
  })
}

// Update participant count
export async function updateParticipantCount(count: number): Promise<void> {
  if (!db) throw new Error("Database not available")
  
  await updateDoc(doc(db, "meetings", FIXED_ROOM_ID), {
    participantCount: count,
    lastUpdated: new Date().toISOString()
  })
}

// Listen to meeting status changes
export function listenToMeetingStatus(callback: (status: MeetingStatus | null) => void): () => void {
  if (!db) {
    callback(null)
    return () => {}
  }
  
  return onSnapshot(doc(db, "meetings", FIXED_ROOM_ID), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as MeetingStatus)
    } else {
      callback(null)
    }
  }, (error) => {
    console.error("Error listening to meeting status:", error)
    callback(null)
  })
}

// Get meeting status
export async function getMeetingStatus(): Promise<MeetingStatus | null> {
  if (!db) return null
  
  try {
    const meetingDoc = await getDoc(doc(db, "meetings", FIXED_ROOM_ID))
    return meetingDoc.exists() ? meetingDoc.data() as MeetingStatus : null
  } catch (error) {
    console.error("Error getting meeting status:", error)
    return null
  }
}