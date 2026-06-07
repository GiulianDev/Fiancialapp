import { useEffect, useState, useCallback } from 'react';
import { savePortfolio, getPortfolio, type SavedPortfolio, type FirebaseUser } from '../firebase';

export function usePortfolio(user: FirebaseUser | null) {
  const [savedPortfolio, setSavedPortfolio] = useState<SavedPortfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carica il portafoglio salvato quando l'utente cambia o effettua il login
  useEffect(() => {
    if (!user) {
      setSavedPortfolio(null);
      return;
    }

    const loadPortfolio = async () => {
      try {
        setLoading(true);
        const portfolio = await getPortfolio(user.uid);
        setSavedPortfolio(portfolio);
        setError(null);
      } catch (err) {
        console.error('Failed to load portfolio:', err);
        setError('Errore nel caricamento del portafoglio');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [user]);

  // Funzione per salvare e aggiornare lo stato locale del portafoglio
  const updatePortfolio = useCallback(
    async (portfolioData: SavedPortfolio) => {
      if (!user) return;

      try {
        setLoading(true);
        await savePortfolio(user.uid, portfolioData);
        setSavedPortfolio(portfolioData);
        setError(null);
      } catch (err) {
        console.error('Failed to update portfolio:', err);
        setError('Errore nel salvataggio del portafoglio');
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return {
    savedPortfolio,
    loading,
    error,
    updatePortfolio,
  };
}