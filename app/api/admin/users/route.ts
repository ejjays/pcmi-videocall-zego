import { NextRequest, NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  // --- Start of Debugging Code ---
  console.log("--- VERCEL RUNTIME LOG: /api/admin/users GET ---");
  console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Loaded' : 'MISSING!');
  console.log("FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL ? 'Loaded' : 'MISSING!');
  // This is the important one for our new method:
  console.log("FIREBASE_PRIVATE_KEY:", process.env.FIREBASE_PRIVATE_KEY ? 'Loaded' : 'MISSING!');
  // --- End of Debugging Code ---

  try {
    const { auth, db } = getAdminServices();
    const listUsersResult = await auth.listUsers();
    const authUsers = listUsersResult.users;

    const allUsers = await Promise.all(
      authUsers.map(async (authUser) => {
        let firestoreData = null;
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
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
    console.error('❌ API GET Error:', error.message);
    return NextResponse.json({ success: false, error: 'Failed to fetch users. ' + error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    // --- Start of Debugging Code ---
    console.log("--- VERCEL RUNTIME LOG: /api/admin/users POST ---");
    console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Loaded' : 'MISSING!');
    console.log("FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL ? 'Loaded' : 'MISSING!');
    // This is the important one for our new method:
    console.log("FIREBASE_PRIVATE_KEY:", process.env.FIREBASE_PRIVATE_KEY ? 'Loaded' : 'MISSING!');
    // --- End of Debugging Code ---

  try {
    const { auth, db } = getAdminServices();
    const { action, userId } = await request.json();
    
    if (action === 'sync-all') {
      const listUsersResult = await auth.listUsers();
      let syncedCount = 0;
      
      for (const authUser of listUsersResult.users) {
        const userDocRef = doc(db, 'users', authUser.uid);
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
    console.error('❌ API POST Error:', error.message);
    return NextResponse.json({ success: false, error: 'Failed to sync users. ' + error.message }, { status: 500 });
  }
}