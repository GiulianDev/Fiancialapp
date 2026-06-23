import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import * as favoriteDb from './favoriteService';
import type { Favorite } from './favorite';
import { useAuth } from '@context';

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

  // Dentro FavoritesContext.tsx

const addFavorite = useCallback(async (isin: string, name?: string) => {
  if (!user?.uid) throw new Error('User not authenticated');
  
  // 1. OPTIMISTIC UPDATE: Aggiungiamo subito allo stato locale
  // (Adatta le proprietà dell'oggetto mock in base alla tua interfaccia Favorite)
  const optimisticFavorite = { isin, name: name || 'Sconosciuto' } as Favorite;
  setFavorites(prev => {
    if (prev.some(f => f.isin === isin)) return prev;
    return [...prev, optimisticFavorite];
  });

  try {
    setError(null);
    await favoriteDb.addFavorite(user.uid, isin, name);
      await refreshFavorites();
  } catch (err) {
    // 2. ROLLBACK: Se il server dà errore, rimuoviamo l'elemento
    setFavorites(prev => prev.filter(f => f.isin !== isin));
    const message = err instanceof Error ? err.message : 'Error adding favorite';
    setError(message);
    throw err;
  }
  }, [user?.uid, refreshFavorites]);

const removeFavorite = useCallback(async (isin: string) => {
  if (!user?.uid) throw new Error('User not authenticated');
  
  // Salviamo lo stato precedente per un eventuale rollback
  const previousFavorites = [...favorites];
  
  // 1. OPTIMISTIC UPDATE: Rimuoviamo subito allo stato locale
  setFavorites(prev => prev.filter(f => f.isin !== isin));

  try {
    setError(null);
    await favoriteDb.removeFavorite(user.uid, isin);
      await refreshFavorites();
  } catch (err) {
    // 2. ROLLBACK: Se fallisce, ripristiniamo la lista precedente
    setFavorites(previousFavorites);
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