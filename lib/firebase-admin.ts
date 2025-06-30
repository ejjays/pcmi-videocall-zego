import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

interface AdminServices {
  app: App;
  auth: Auth;
  db: Firestore;
}

let adminServices: AdminServices | null = null;

function initializeAdminSDK(): AdminServices {
  // If already initialized, return the existing instance.
  if (getApps().length > 0) {
    const app = getApps()[0];
    return {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
    };
  }

  // Get environment variables.
  const privateKeyBase64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // Check if all required environment variables are present.
  if (!privateKeyBase64 || !clientEmail || !projectId) {
    throw new Error('Firebase Admin SDK: Missing required environment variables.');
  }

  try {
    const decodedPrivateKey = Buffer.from(privateKeyBase64, 'base64').toString('ascii');

    const serviceAccount = {
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: decodedPrivateKey,
    };

    const app = initializeApp({
      credential: cert(serviceAccount),
      projectId: projectId,
    });

    console.log('✅ Firebase Admin SDK initialized successfully.');
    
    return {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
    };
  } catch (error: any) {
    console.error('❌ Firebase Admin SDK initialization failed:', error.message);
    throw new Error('Could not initialize Firebase Admin SDK.');
  }
}

// This is the function your API routes will call.
export function getAdminServices(): AdminServices {
  if (!adminServices) {
    adminServices = initializeAdminSDK();
  }
  return adminServices;
}