import { useState, useEffect } from 'react';
import type { EtfData } from '../shared/types/etf';
import { SEARCH_ETF_API_URL } from '../shared/config/constants';
import { useAuth } from '../shared/contexts/AuthContext';

interface UseFetchedEtfDataResult {
  etfData: EtfData[];
  loading: boolean;
  error: string | null;
}

export function useFetchedEtfData(
  selectedIsins: string[],
  triggerFetch: boolean = true // <- Di default è true per caricare in automatico, ma puoi pilotarlo
): UseFetchedEtfDataResult {
  
  const { user } = useAuth(); 
  
  const [etfData, setEtfData] = useState<EtfData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Se non c'è l'utente, non ci sono ISIN o il trigger è spento, svuota e ferma tutto
    if (!user || selectedIsins.length === 0 || !triggerFetch) {
      setEtfData([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchMultipleEtfData = async () => {
      setLoading(true);
      setError(null);

      try {
        const fetchedData = await Promise.all(
          selectedIsins.map(async (isin) => {
            // Usiamo la costante ed il nuovo endpoint v2!
            const response = await fetch(`${SEARCH_ETF_API_URL}/${isin}`);
            const payload = await response.json();

            if (!response.ok || payload?.status === 'error') {
              const message = payload?.message ?? `Errore caricamento ISIN ${isin}`;
              throw new Error(message);
            }

            return payload as EtfData;
          })
        );
        setEtfData(fetchedData);
      } catch (err) {
        console.error('Error fetching multiple ETF data:', err);
        setError(err instanceof Error ? err.message : 'Errore durante il recupero dei dati ETF.');
      } finally {
        setLoading(false);
      }
    };

    fetchMultipleEtfData();

  }, [user, selectedIsins, triggerFetch]);

  return {
    etfData,
    loading,
    error,
  };
}