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
    throw new Error(`Missing Firebase Admin environment variable: ${key}`);
  }

  return value;
}

function createFirebaseAdminServices(): FirebaseAdminServices {
  const projectId = getRequiredEnv("FIREBASE_PROJECT_ID");
  const clientEmail = getRequiredEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = getRequiredEnv("FIREBASE_PRIVATE_KEY").replace(
    /\\n/g,
    "\n"
  );

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
