/**
 * Firebase Configuration – NotaryChain
 * Real project: notarychain-95523
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            "AIzaSyAjRcSsuPEPlbcW0IEPIMGGlmP_Db-txQo",
  authDomain:        "notarychain-95523.firebaseapp.com",
  projectId:         "notarychain-95523",
  storageBucket:     "notarychain-95523.firebasestorage.app",
  messagingSenderId: "957414575981",
  appId:             "1:957414575981:web:1171b14cb756eeb27a1464",
  measurementId:     "G-5QMRGFM8SV"
};

// Safe HMR guard — prevent duplicate initialisation
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Always configured — real credentials are embedded
export const IS_CONFIGURED = true;

export default app;
