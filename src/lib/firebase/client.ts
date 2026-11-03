/**
 * DEEVEE CAPITAL — FIREBASE CLIENT SDK INITIALIZATION
 * Initializes Firebase Auth, Cloud Firestore, and Firebase Storage when
 * NEXT_PUBLIC_FIREBASE_* environment variables are configured.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "deeveecapital-site.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "deeveecapital-site",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "deeveecapital-site.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseClientConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.apiKey.length > 10 &&
      firebaseConfig.projectId
  );
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

export function getFirebaseClientApp(): FirebaseApp | null {
  if (!isFirebaseClientConfigured()) return null;
  if (!appInstance) {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return appInstance;
}

export function getFirebaseClientAuth(): Auth | null {
  const app = getFirebaseClientApp();
  if (!app) return null;
  if (!authInstance) {
    authInstance = getAuth(app);
  }
  return authInstance;
}

export function getFirebaseClientDb(): Firestore | null {
  const app = getFirebaseClientApp();
  if (!app) return null;
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
}

export function getFirebaseClientStorage(): FirebaseStorage | null {
  const app = getFirebaseClientApp();
  if (!app) return null;
  if (!storageInstance) {
    storageInstance = getStorage(app);
  }
  return storageInstance;
}
