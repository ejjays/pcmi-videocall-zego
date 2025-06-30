import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// A single object to hold our initialized Firebase Admin services.
let adminServices: { auth: Auth; db: Firestore } | null = null;

function initializeAdminSDK() {
  // Check for all required environment variables.
  const envVars = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKeyBase64: process.env.FIREBASE_PRIVATE_KEY_BASE64,
  };

  for (const [key, value] of Object.entries(envVars)) {
    if (!value) {
      throw new Error(`Firebase Admin Init Error: Missing environment variable ${key}. Check your Vercel project settings.`);
    }
  }

  const decodedPrivateKey = Buffer.from(envVars.privateKeyBase64!, 'base64').toString('ascii');

  const app = initializeApp({
    credential: cert({
      projectId: envVars.projectId,
      clientEmail: envVars.clientEmail,
      privateKey: decodedPrivateKey,
    }),
    projectId: envVars.projectId,
  });

  console.log('✅ Firebase Admin SDK initialized successfully.');

  return {
    auth: getAuth(app),
    db: getFirestore(app),
  };
}

// This function ensures the SDK is initialized only once.
export function getAdminServices() {
  if (getApps().length === 0) {
    adminServices = initializeAdminSDK();
  }
  return adminServices!;
}