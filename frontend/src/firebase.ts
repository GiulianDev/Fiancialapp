import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

// TUTTE le funzioni di firestore importate insieme
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc, // Aggiunto qui
  getDoc, // Aggiunto qui
  setDoc, // Aggiunto qui
  type Timestamp,
} from 'firebase/firestore';

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
const auth = getAuth(app);
const db = getFirestore(app);
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

// --- PREFERITI ---
export interface Favorite {
  id?: string;
  userId: string;
  isin: string;
  name?: string;
  createdAt?: Timestamp;
}

function favoritesCollection(userId: string) {
  return collection(db, 'users', userId, 'favorites');
}

export async function addFavorite(userId: string, isin: string, name?: string): Promise<void> {
  try {
    await addDoc(favoritesCollection(userId), {
      userId,
      isin,
      name,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
}

export async function removeFavorite(userId: string, isin: string): Promise<void> {
  try {
    const q = query(
      favoritesCollection(userId),
      where('isin', '==', isin)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
}

export async function getFavorites(userId: string): Promise<Favorite[]> {
  try {
    const q = query(favoritesCollection(userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Favorite));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
}

export async function isFavorite(userId: string, isin: string): Promise<boolean> {
  try {
    const q = query(
      favoritesCollection(userId),
      where('isin', '==', isin)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size > 0;
  } catch (error) {
    console.error('Error checking favorite:', error);
    throw error;
  }
}

// --- PORTAFOGLIO ---

export interface SavedPortfolio {
  selectedIsins: string[];
  weights: Record<string, string>;
  unit: '€' | '$' | '%';
  userId?: string;
}

// Funzione helper per la sotto-raccolta
function portfolioCollection(userId: string) {
  return collection(db, 'users', userId, 'portfolio');
}

export async function savePortfolio(userId: string, portfolio: SavedPortfolio): Promise<void> {
  try {
    // Usiamo l'helper portfolioCollection per creare il riferimento al documento 'current'
    const docRef = doc(portfolioCollection(userId), 'current');
    console.debug('Saving portfolio to Firestore', { userId, portfolio });
    await setDoc(docRef, {
      userId,
      ...portfolio,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving portfolio:', error);
    throw error;
  }
}

export async function getPortfolio(userId: string): Promise<SavedPortfolio | null> {
  try {
    // Usiamo l'helper portfolioCollection anche qui
    const docRef = doc(portfolioCollection(userId), 'current');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SavedPortfolio;
    }
    return null;
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    throw error;
  }
}