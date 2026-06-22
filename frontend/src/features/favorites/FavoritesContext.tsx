import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import * as favoriteDb from '@services/favoriteService';
import type { Favorite } from '@types';

interface FavoritesContextType {
  favorites: Favorite[];
  favoriteIsins: Set<string>;
  loading: boolean;
  error: string | null;
  addFavorite: (isin: string, name?: string) => Promise<void>;
  removeFavorite: (isin: string) => Promise<void>;
  toggleFavorite: (isin: string, name?: string) => Promise<void>;
  isFavorite: (isin: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshFavorites = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await favoriteDb.getFavorites(user.uid);
      setFavorites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading favorites');
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Carica i preferiti quando l'utente cambia
  useEffect(() => {
    if (user?.uid) {
      refreshFavorites();
    } else {
      setFavorites([]);
    }
  }, [user?.uid, refreshFavorites]);

  const addFavorite = useCallback(async (isin: string, name?: string) => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      setError(null);
      await favoriteDb.addFavorite(user.uid, isin, name);
      await refreshFavorites();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding favorite';
      setError(message);
      throw err;
    }
  }, [user?.uid, refreshFavorites]);

  const removeFavorite = useCallback(async (isin: string) => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      setError(null);
      await favoriteDb.removeFavorite(user.uid, isin);
      await refreshFavorites();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error removing favorite';
      setError(message);
      throw err;
    }
  }, [user?.uid, refreshFavorites]);

  const toggleFavorite = useCallback(async (isin: string, name?: string) => {
    const isFav = favorites.some(f => f.isin === isin);
    if (isFav) {
      await removeFavorite(isin);
    } else {
      await addFavorite(isin, name);
    }
  }, [favorites, addFavorite, removeFavorite]);

  // Ottimizzazione: trasforma l'array in un Set per un controllo O(1) istantaneo
  const favoriteIsins = useMemo(() => {
    return new Set(favorites.map(f => f.isin));
  }, [favorites]);

  const isFavorite = useCallback((isin: string): boolean => {
    return favoriteIsins.has(isin);
  }, [favoriteIsins]);

  // Memorizzazione del valore del contesto per prevenire re-render a cascata
  const contextValue = useMemo(() => ({
    favorites,
    favoriteIsins,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refreshFavorites,
  }), [favorites, favoriteIsins, loading, error, addFavorite, removeFavorite, toggleFavorite, isFavorite, refreshFavorites]);

  return (
    <FavoritesContext.Provider value={contextValue}>
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