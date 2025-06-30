import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb, isAdminInitialized } from '@/lib/firebase-admin';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// A helper function to handle initialization errors.
const checkInitialization = () => {
  if (!isAdminInitialized) {
    return NextResponse.json(
      { success: false, error: 'Firebase Admin SDK not initialized. Check server logs and environment variables.' },
      { status: 503 } // 503 Service Unavailable is a fitting status code
    );
  }
  return null;
}

export async function GET(request: NextRequest) {
  const initError = checkInitialization();
  if (initError) return initError;

  try {
    const listUsersResult = await adminAuth!.listUsers();
    const authUsers = listUsersResult.users;

    const allUsers = await Promise.all(
      authUsers.map(async (authUser) => {
        let firestoreData = null;
        try {
          const userDoc = await getDoc(doc(adminDb!, 'users', authUser.uid));
          if (userDoc.exists()) {
            firestoreData = userDoc.data();
          }
        } catch (error) {
          console.warn(`Failed to get Firestore data for ${authUser.uid}:`, error);
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
          isLegacyUser: !firestoreData,
          hasFirestoreDoc: !!firestoreData
        };
      })
    );
    
    return NextResponse.json({ success: true, users: allUsers, total: allUsers.length });
    
  } catch (error: any) {
    console.error('❌ API GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const initError = checkInitialization();
  if (initError) return initError;

  try {
    const { action, userId } = await request.json();
    
    if (action === 'sync-all') {
      const listUsersResult = await adminAuth!.listUsers();
      let syncedCount = 0;
      
      for (const authUser of listUsersResult.users) {
        const userDocRef = doc(adminDb!, 'users', authUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
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
          });
          syncedCount++;
        }
      }
      
      return NextResponse.json({ success: true, message: `Synced ${syncedCount} new users successfully.` });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    
  } catch (error: any) {
    console.error('❌ API POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}