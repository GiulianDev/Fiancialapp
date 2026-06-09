import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  addFavorite as addFavoriteService,
  removeFavorite as removeFavoriteService,
  getFavorites as getFavoritesService,
  isFavorite as isFavoriteService
} from '../services/favoriteService';
import type { Favorite } from '../types/favorite';


interface FavoritesContextType {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  addFavorite: (isin: string, name?: string) => Promise<void>;
  removeFavorite: (isin: string) => Promise<void>;
  isFavorite: (isin: string) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carica i preferiti quando l'utente cambia
  useEffect(() => {
    if (user?.uid) {
      refreshFavorites();
    } else {
      setFavorites([]);
    }
  }, [user?.uid]);

  const refreshFavorites = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getFavoritesService(user.uid);
      setFavorites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading favorites');
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (isin: string, name?: string) => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      setError(null);
      await addFavoriteService(user.uid, isin, name);
      await refreshFavorites();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding favorite';
      setError(message);
      throw err;
    }
  };

  const removeFavorite = async (isin: string) => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      setError(null);
      await removeFavoriteService(user.uid, isin);
      await refreshFavorites();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error removing favorite';
      setError(message);
      throw err;
    }
  };

  const isFavorite = async (isin: string) => {
    if (!user?.uid) return false;
    
    try {
      setError(null);
      return await isFavoriteService(user.uid, isin);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error checking favorite';
      setError(message);
      throw err;
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        error,
        addFavorite,
        removeFavorite,
        isFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
