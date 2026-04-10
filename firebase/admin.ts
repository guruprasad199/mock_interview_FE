import {
  initializeApp,
  getApps,
  cert,
  getApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

type FirebaseAdminServices = {
  app: App;
  auth: Auth;
  db: Firestore;
};

let firebaseAdminServices: FirebaseAdminServices | null = null;

function getRequiredEnv(
  key:
    | "FIREBASE_PROJECT_ID"
    | "FIREBASE_CLIENT_EMAIL"
    | "FIREBASE_PRIVATE_KEY"
): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `Missing Firebase Admin environment variable: ${key}. Add it to .env.local for local development and to Vercel Project Settings -> Environment Variables for deployed environments.`
    );
  }

  return value;
}

function createFirebaseAdminServices(): FirebaseAdminServices {
  const projectId = getRequiredEnv("FIREBASE_PROJECT_ID");
  const clientEmail = getRequiredEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = getRequiredEnv("FIREBASE_PRIVATE_KEY")
    // Strip any surrounding quotes left by env parsers
    .replace(/^["']|["']$/g, "")
    // Strip any trailing comma (artifact when key was pasted from a JSON file)
    .replace(/,\s*$/, "")
    // Convert escaped newlines to real newlines
    .replace(/\\n/g, "\n");

  if (!privateKey.includes("BEGIN PRIVATE KEY") || !privateKey.includes("END PRIVATE KEY")) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY is malformed. Paste the full Firebase service account private key into Vercel exactly as provided, keeping the BEGIN/END PRIVATE KEY lines and escaped newline characters."
    );
  }

  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        projectId,
      });

  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };
}

function getFirebaseAdminServices(): FirebaseAdminServices {
  if (!firebaseAdminServices) {
    firebaseAdminServices = createFirebaseAdminServices();
  }

  return firebaseAdminServices;
}

export function getAdminApp() {
  return getFirebaseAdminServices().app;
}

export function getAdminAuth() {
  return getFirebaseAdminServices().auth;
}

export function getAdminDb() {
  return getFirebaseAdminServices().db;
}
