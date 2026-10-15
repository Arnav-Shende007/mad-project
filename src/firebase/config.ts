/**
 * AtmosIQ - Firebase Client Configuration
 * Gracefully detects environment variables and initializes Firestore.
 * Operates in Local-Only mode if variables are unconfigured.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseStatusInfo {
  isConfigured: boolean;
  projectId: string | null;
  statusMessage: string;
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let isConfigured = false;
let configStatusMessage = 'Checking configuration...';

// Validate configuration
const hasApiKey = Boolean(firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('YourFirebase'));
const hasProjectId = Boolean(firebaseConfig.projectId && !firebaseConfig.projectId.includes('your-atmosiq'));

if (hasApiKey && hasProjectId) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    try {
      // Use auto-detect long polling for resilience on mobile networks (prevents WebSocket drops)
      firestoreDb = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
      });
    } catch {
      firestoreDb = getFirestore(app);
    }
    isConfigured = true;
    configStatusMessage = `Connected to Firestore project: ${firebaseConfig.projectId}`;
    console.log('[Firebase] Initialized Firestore successfully for project:', firebaseConfig.projectId);
  } catch (err: any) {
    isConfigured = false;
    configStatusMessage = `Initialization error: ${err.message}`;
    console.warn('[Firebase] Initialization error:', err.message);
  }

} else {
  isConfigured = false;
  configStatusMessage = 'Unconfigured: Environment variables missing. Operating in Local-Only SQLite mode.';
}

export function getFirebaseStatus(): FirebaseStatusInfo {
  return {
    isConfigured,
    projectId: isConfigured ? (firebaseConfig.projectId || null) : null,
    statusMessage: configStatusMessage,
  };
}

export function getFirestoreInstance(): Firestore | null {
  return firestoreDb;
}
