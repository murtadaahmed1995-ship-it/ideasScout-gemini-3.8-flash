/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForFallback123456789",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0420846014.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0420846014",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0420846014.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "551794866201",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:551794866201:web:f9d5f90e5cd838c2f75288",
};

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || 'ai-studio-ideascout-e257922b-16fc-4684-b0db-c54618ef800e';

let app;
let authInstance: any;
let dbInstance: any;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(app);
  dbInstance = initializeFirestore(app, {}, databaseId);
} catch (err) {
  console.error("Firebase initialization warning:", err);
  try {
    app = getApps().length ? getApp() : initializeApp({
      apiKey: "AIzaSyDummyKeyForFallback123456789",
      projectId: "gen-lang-client-0420846014",
      authDomain: "gen-lang-client-0420846014.firebaseapp.com"
    });
    authInstance = getAuth(app);
    dbInstance = initializeFirestore(app, {}, databaseId);
  } catch (fallbackErr) {
    console.error("Firebase fallback initialization error:", fallbackErr);
  }
}

export const auth = authInstance;
export const db = dbInstance;
