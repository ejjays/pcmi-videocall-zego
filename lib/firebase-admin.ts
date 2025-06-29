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
  if (getApps().length > 0) {
    const app = getApps()[0];
    return { app, auth: getAuth(app), db: getFirestore(app) };
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error('Firebase Admin Init Error: A required environment variable is missing. Check Vercel settings.');
  }

  // This is the crucial part: replace '\\n' with actual newlines
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  const serviceAccount = {
    projectId: projectId,
    clientEmail: clientEmail,
    privateKey: privateKey,
  };

  const app = initializeApp({
    credential: cert(serviceAccount),
  });

  console.log('✅ Firebase Admin SDK initialized successfully via replacement method.');
  
  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };
}

export function getAdminServices(): AdminServices {
  if (!adminServices) {
    adminServices = initializeAdminSDK();
  }
  return adminServices;
}