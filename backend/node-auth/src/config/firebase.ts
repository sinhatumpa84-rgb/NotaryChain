import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

let firebaseApp: admin.app.App | null = null;

export const getFirebaseAdmin = () => {
  if (!firebaseApp) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Firebase environment variables are not configured.');
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      } as admin.ServiceAccount)
    });
  }

  return firebaseApp;
};

export const verifyFirebaseIdToken = async (token: string) => {
  const app = getFirebaseAdmin();
  return app.auth().verifyIdToken(token);
};

export const createFirebaseUser = async (input: { email: string; password: string; displayName?: string }) => {
  const app = getFirebaseAdmin();
  return app.auth().createUser({
    email: input.email,
    password: input.password,
    displayName: input.displayName
  });
};
