import "server-only";
import { cert, getApps, initializeApp, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Import the service account key directly
// Note: Ensure this file is not committed to public version control
// eslint-disable-next-line @typescript-eslint/no-require-imports
const serviceAccount = require("../../.key/project-testing-6de5b-firebase-adminsdk-fbsvc-1f758dbf60.json");

let app: App;

if (!getApps().length) {
  app = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  app = getApps()[0];
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
