import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Decode the base64 private key
const decodedPrivateKey = Buffer.from(
  process.env.FIREBASE_PRIVATE_KEY_BASE64!,
  'base64'
).toString('ascii');

// Initialize Firebase Admin SDK
let adminApp;
try {
  if (getApps().length === 0) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      // Use the decoded private key here
      private_key: decodedPrivateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };

    adminApp = initializeApp({
      credential: cert(serviceAccount as any),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    
    console.log('✅ Firebase Admin SDK initialized');
  } else {
    adminApp = getApps()[0];
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error);
  adminApp = null;
}

export const adminAuth = adminApp ? getAuth(adminApp) : null;
export const adminDb = adminApp ? getFirestore(adminApp) : null;

console.log('Firebase Admin services:', {
  authAvailable: !!adminAuth,
  dbAvailable: !!adminDb,
});