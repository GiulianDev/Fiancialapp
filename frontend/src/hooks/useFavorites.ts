import { useCallback } from 'react';
import { useFavorites as useFavoritesContext } from '../contexts/FavoritesContext';

/**
 * Hook personalizzato per gestire i preferiti
 * 
 * Ora usa il FavoritesContext per accedere ai dati globali
 * @deprecated Aggiorna i componenti per usare useFavorites() senza parametri
 * @param user - (DEPRECATED) Ignorato, il contesto fornisce l'utente
 * @returns oggetto con favorites, loading, error e metodi
 */
export function useFavorites(user?: any) {
  const context = useFavoritesContext();

  const toggleFavorite = useCallback(
    async (isin: string, name?: string) => {
      const isFav = context.favorites.some(f => f.isin === isin);
      if (isFav) {
        await context.removeFavorite(isin);
      } else {
        await context.addFavorite(isin, name);
      }
    },
    [context.favorites, context.addFavorite, context.removeFavorite]
  );

  const addToFavorites = useCallback(
    async (isin: string, name?: string) => {
      const alreadyFav = context.favorites.some(f => f.isin === isin);
      if (alreadyFav) return;
      await context.addFavorite(isin, name);
    },
    [context.favorites, context.addFavorite]
  );

  const removeFromFavorites = useCallback(
    async (isin: string) => {
      const isFav = context.favorites.some(f => f.isin === isin);
      if (!isFav) return;
      await context.removeFavorite(isin);
    },
    [context.favorites, context.removeFavorite]
  );

  return {
    favorites: context.favorites,
    favoriteIsins: new Set(context.favorites.map(f => f.isin)),
    loading: context.loading,
    error: context.error,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    isFavorite: context.isFavorite,
  };
}
