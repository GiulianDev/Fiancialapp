// Menage favorites in Firestore for a user, including adding, removing, fetching, and checking if an ETF is a favorite.
import {
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Favorite } from './favorite';

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
