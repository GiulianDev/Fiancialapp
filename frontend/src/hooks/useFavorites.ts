import { useEffect, useState, useCallback } from 'react';
import { addFavorite, removeFavorite, getFavorites, isFavorite, type Favorite, type FirebaseUser } from '../firebase';

export function useFavorites(user: FirebaseUser | null) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteIsins, setFavoriteIsins] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load favorites when user changes
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setFavoriteIsins(new Set());
      return;
    }

    const loadFavorites = async () => {
      try {
        setLoading(true);
        const favs = await getFavorites(user.uid);
        setFavorites(favs);
        setFavoriteIsins(new Set(favs.map((f) => f.isin)));
        setError(null);
      } catch (err) {
        console.error('Failed to load favorites:', err);
        setError('Errore nel caricamento dei preferiti');
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  const toggleFavorite = useCallback(
    async (isin: string, name?: string) => {
      if (!user) return;

      try {
        const isFav = favoriteIsins.has(isin);
        if (isFav) {
          await removeFavorite(user.uid, isin);
          setFavoriteIsins((prev) => {
            const next = new Set(prev);
            next.delete(isin);
            return next;
          });
          setFavorites((prev) => prev.filter((f) => f.isin !== isin));
        } else {
          await addFavorite(user.uid, isin, name);
          const isNowFav = await isFavorite(user.uid, isin);
          if (isNowFav) {
            setFavoriteIsins((prev) => new Set(prev).add(isin));
            const newFav: Favorite = { userId: user.uid, isin, name };
            setFavorites((prev) => [...prev, newFav]);
          }
        }
        setError(null);
      } catch (err) {
        console.error('Failed to toggle favorite:', err);
        setError('Errore nell\'aggiornamento dei preferiti');
      }
    },
    [user, favoriteIsins]
  );

  const addToFavorites = useCallback(
    async (isin: string, name?: string) => {
      if (!user) return;
      if (favoriteIsins.has(isin)) return; // already favorite

      try {
        await addFavorite(user.uid, isin, name);
        setFavoriteIsins((prev) => new Set(prev).add(isin));
        setFavorites((prev) => [...prev, { userId: user.uid, isin, name }]);
        setError(null);
      } catch (err) {
        console.error('Failed to add favorite:', err);
        setError('Errore nell\'aggiunta ai preferiti');
      }
    },
    [user, favoriteIsins]
  );

  const removeFromFavorites = useCallback(
    async (isin: string) => {
      if (!user) return;
      if (!favoriteIsins.has(isin)) return; // not a favorite

      try {
        await removeFavorite(user.uid, isin);
        setFavoriteIsins((prev) => {
          const next = new Set(prev);
          next.delete(isin);
          return next;
        });
        setFavorites((prev) => prev.filter((f) => f.isin !== isin));
        setError(null);
      } catch (err) {
        console.error('Failed to remove favorite:', err);
        setError('Errore nella rimozione dai preferiti');
      }
    },
    [user, favoriteIsins]
  );

  return {
    favorites,
    favoriteIsins,
    loading,
    error,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
  };
}
