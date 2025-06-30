import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// A single object to hold our initialized Firebase Admin services.
const adminServices = (() => {
  // Check if we're already initialized.
  if (getApps().length > 0) {
    const existingApp = getApps()[0];
    return {
      app: existingApp,
      auth: getAuth(existingApp),
      db: getFirestore(existingApp),
      initialized: true,
    };
  }

  // Check for all required environment variables.
  const privateKeyBase64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKeyBase64 || !clientEmail || !projectId) {
    console.warn('⚠️ Firebase Admin SDK not initialized: Missing one or more required environment variables.');
    return { app: null, auth: null, db: null, initialized: false };
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
      app: app,
      auth: getAuth(app),
      db: getFirestore(app),
      initialized: true,
    };
  } catch (error: any) {
    console.error('❌ Firebase Admin SDK initialization failed:', error.message);
    return { app: null, auth: null, db: null, initialized: false };
  }
})();

export const adminAuth = adminServices.auth;
export const adminDb = adminServices.db;
export const isAdminInitialized = adminServices.initialized;