import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../shared/config/firebase';

export interface SavedPortfolio {
  selectedIsins: string[];
  weights: Record<string, string>;
  unit: '€' | '$' | '%';
  userId?: string;
}

function portfolioCollection(userId: string) {
  return collection(db, 'users', userId, 'portfolio');
}

export async function savePortfolio(userId: string, portfolio: SavedPortfolio): Promise<void> {
  try {
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
