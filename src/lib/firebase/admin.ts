/**
 * DEEVEE CAPITAL — FIREBASE ADMIN SDK INITIALIZATION
 * Provides privileged server-side access to Firebase Auth, Cloud Firestore,
 * and Cloud Storage when service account credentials and Firestore API are active.
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_Firestore_ENABLED === "true" &&
      (process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
        (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
          process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY))
  );
}

export function getFirebaseAdminApp(): App | null {
  if (!isFirebaseAdminConfigured()) return null;
  if (adminApp) return adminApp;

  if (getApps().length > 0) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
      let parsed: Record<string, string>;
      try {
        parsed = JSON.parse(rawKey);
      } catch {
        try {
          parsed = JSON.parse(rawKey.replace(/\\"/g, '"'));
        } catch {
          parsed = JSON.parse(Buffer.from(rawKey, "base64").toString("utf-8"));
        }
      }
      adminApp = initializeApp({
        credential: cert(parsed),
        projectId: parsed.project_id || "deeveecapital-site",
      });
      return adminApp;
    }

    if (
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    ) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "deeveecapital-site",
          clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
      return adminApp;
    }
  } catch (err) {
    console.warn("[Firebase Admin] Failed to initialize Admin SDK:", err);
  }

  return null;
}

export function getFirebaseAdminAuth(): Auth | null {
  const app = getFirebaseAdminApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseAdminFirestore(): Firestore | null {
  const app = getFirebaseAdminApp();
  return app ? getFirestore(app) : null;
}

export function getFirebaseConfigurationStatus() {
  const hasWebSdk = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  const hasAdminCreds = Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
      (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
        process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)
  );
  const firestoreEnabledFlag = process.env.FIREBASE_Firestore_ENABLED === "true";

  const missingItems: string[] = [];
  if (!firestoreEnabledFlag) {
    missingItems.push(
      "Enable Cloud Firestore API (firestore.googleapis.com) on GCP project 'deeveecapital-site' and set FIREBASE_Firestore_ENABLED=true"
    );
  }
  if (!hasWebSdk) {
    missingItems.push(
      "Create a Firebase Web App in 'deeveecapital-site' and set NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID"
    );
  }
  if (!hasAdminCreds) {
    missingItems.push(
      "Provide FIREBASE_SERVICE_ACCOUNT_KEY (or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) for Firebase Admin SDK custom claims & server operations"
    );
  }

  return {
    mode:
      hasWebSdk && hasAdminCreds && firestoreEnabledFlag
        ? ("firebase_cloud" as const)
        : ("sovereign_local_db" as const),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "deeveecapital-site",
    hasWebSdk,
    hasAdminCreds,
    firestoreEnabledFlag,
    missingItems,
  };
}
