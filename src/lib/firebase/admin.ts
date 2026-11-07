/**
 * DEEVEE CAPITAL — FIREBASE ADMIN SDK INITIALIZATION
 * Provides privileged server-side access to Firebase Auth, Cloud Firestore,
 * and Cloud Storage when service account credentials and Firestore API are active.
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, initializeFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;
let adminFirestore: Firestore | null = null;

export function isFirebaseAdminConfigured(): boolean {
  const enabled =
    process.env.DVC_FIRESTORE_ENABLED === "true" ||
    process.env.FIREBASE_Firestore_ENABLED === "true";
  const hasCreds = Boolean(
    process.env.DVC_SERVICE_ACCOUNT_KEY ||
      process.env.GCP_SERVICE_ACCOUNT_KEY ||
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
      (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
        process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) ||
      process.env.K_SERVICE ||
      process.env.FUNCTION_TARGET
  );
  return enabled && hasCreds;
}

export function getFirebaseAdminApp(): App | null {
  if (!isFirebaseAdminConfigured()) return null;
  if (adminApp) return adminApp;

  if (getApps().length > 0) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  try {
    const rawKeyInput =
      process.env.DVC_SERVICE_ACCOUNT_KEY ||
      process.env.GCP_SERVICE_ACCOUNT_KEY ||
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (rawKeyInput) {
      const rawKey = rawKeyInput.trim();
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

    // Fallback to Google Cloud Run / Cloud Functions Application Default Credentials
    if (process.env.K_SERVICE || process.env.FUNCTION_TARGET) {
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "deeveecapital-site",
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
  if (adminFirestore) return adminFirestore;
  const app = getFirebaseAdminApp();
  if (!app) return null;
  try {
    adminFirestore = initializeFirestore(app, { preferRest: true });
  } catch {
    adminFirestore = getFirestore(app);
  }
  return adminFirestore;
}

export function getFirebaseConfigurationStatus() {
  const hasWebSdk = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  const hasAdminCreds = Boolean(
    process.env.DVC_SERVICE_ACCOUNT_KEY ||
      process.env.GCP_SERVICE_ACCOUNT_KEY ||
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
      (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
        process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) ||
      process.env.K_SERVICE ||
      process.env.FUNCTION_TARGET
  );
  const firestoreEnabledFlag =
    process.env.DVC_FIRESTORE_ENABLED === "true" ||
    process.env.FIREBASE_Firestore_ENABLED === "true";

  const missingItems: string[] = [];
  if (!firestoreEnabledFlag) {
    missingItems.push(
      "Enable Cloud Firestore API (firestore.googleapis.com) on GCP project 'deeveecapital-site' and set DVC_FIRESTORE_ENABLED=true"
    );
  }
  if (!hasWebSdk) {
    missingItems.push(
      "Create a Firebase Web App in 'deeveecapital-site' and set NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID"
    );
  }
  if (!hasAdminCreds) {
    missingItems.push(
      "Provide DVC_SERVICE_ACCOUNT_KEY for Firebase Admin SDK custom claims & server operations"
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
