import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Fetching all Firebase Auth users...')
    
    // Get all users from Firebase Auth (server-side only)
    const listUsersResult = await adminAuth.listUsers()
    const authUsers = listUsersResult.users
    
    console.log(`📊 Found ${authUsers.length} users in Firebase Auth`)
    
    // Convert to our AdminUser format
    const allUsers = await Promise.all(
      authUsers.map(async (authUser) => {
        // Check if user has Firestore document
        let firestoreData = null
        try {
          const userDocRef = doc(adminDb, 'users', authUser.uid)
          const userDoc = await getDoc(userDocRef)
          if (userDoc.exists()) {
            firestoreData = userDoc.data()
          }
        } catch (error) {
          console.warn(`Failed to get Firestore data for ${authUser.uid}:`, error)
        }
        
        return {
          uid: authUser.uid,
          email: authUser.email || 'No email',
          displayName: authUser.displayName || authUser.email?.split('@')[0] || 'Unknown User',
          photoURL: authUser.photoURL || null,
          isAdmin: firestoreData?.isAdmin === true,
          createdAt: authUser.metadata.creationTime || new Date().toISOString(),
          lastActive: authUser.metadata.lastSignInTime || authUser.metadata.creationTime || new Date().toISOString(),
          status: firestoreData?.status || 'offline',
          isLegacyUser: !firestoreData, // If no Firestore doc, it's a legacy user
          hasFirestoreDoc: !!firestoreData
        }
      })
    )
    
    console.log(`✅ Processed ${allUsers.length} total users`)
    
    return NextResponse.json({
      success: true,
      users: allUsers,
      total: allUsers.length
    })
    
  } catch (error: any) {
    console.error('❌ API Error fetching users:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        users: [],
        total: 0
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId } = await request.json()
    
    if (action === 'sync-user') {
      console.log(`🔄 API: Syncing user ${userId} to Firestore...`)
      
      // Get user from Firebase Auth
      const authUser = await adminAuth.getUser(userId)
      
      // Create/update Firestore document
      const userDocRef = doc(adminDb, 'users', userId)
      await setDoc(userDocRef, {
        uid: userId,
        email: authUser.email || '',
        displayName: authUser.displayName || authUser.email?.split('@')[0] || 'Unknown User',
        photoURL: authUser.photoURL || null,
        createdAt: authUser.metadata.creationTime || new Date().toISOString(),
        lastActive: authUser.metadata.lastSignInTime || new Date().toISOString(),
        status: 'offline',
        isAdmin: false,
        isLegacyUser: true,
        legacyCreatedAt: new Date().toISOString()
      }, { merge: true })
      
      console.log(`✅ Synced user ${userId} to Firestore`)
      
      return NextResponse.json({
        success: true,
        message: `User ${userId} synced successfully`
      })
    }
    
    if (action === 'sync-all') {
      console.log('🔄 API: Syncing ALL users to Firestore...')
      
      const listUsersResult = await adminAuth.listUsers()
      let syncedCount = 0
      
      for (const authUser of listUsersResult.users) {
        try {
          // Check if Firestore doc exists
          const userDocRef = doc(adminDb, 'users', authUser.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (!userDoc.exists()) {
            // Create Firestore document
            await setDoc(userDocRef, {
              uid: authUser.uid,
              email: authUser.email || '',
              displayName: authUser.displayName || authUser.email?.split('@')[0] || 'Unknown User',
              photoURL: authUser.photoURL || null,
              createdAt: authUser.metadata.creationTime || new Date().toISOString(),
              lastActive: authUser.metadata.lastSignInTime || new Date().toISOString(),
              status: 'offline',
              isAdmin: false,
              isLegacyUser: true,
              legacyCreatedAt: new Date().toISOString()
            })
            syncedCount++
          }
        } catch (error) {
          console.warn(`Failed to sync user ${authUser.uid}:`, error)
        }
      }
      
      console.log(`✅ Synced ${syncedCount} users to Firestore`)
      
      return NextResponse.json({
        success: true,
        message: `Synced ${syncedCount} users successfully`,
        syncedCount
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error: any) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}