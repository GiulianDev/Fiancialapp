import { initializeApp } from 'firebase/app';
// import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAcPUgILOecfoJAkkF1wnTjprNOh8Gmbds",
  authDomain: "financialapp-c7cf0.firebaseapp.com",
  projectId: "financialapp-c7cf0",
  storageBucket: "financialapp-c7cf0.firebasestorage.app",
  messagingSenderId: "629230247075",
  appId: "1:629230247075:web:057eca3c5be9d9c79f3316",
  measurementId: "G-6JEYC12CYR"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}

export function logout() {
  return signOut(auth);
}

export function onAuthStateChangedListener(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export type FirebaseUser = User;
