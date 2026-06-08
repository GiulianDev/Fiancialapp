import { useState, useEffect } from 'react';
import type { EtfData } from '../types/etf';
import type { FirebaseUser } from '../firebase';

interface UseFetchedEtfDataResult {
  etfData: EtfData[];
  loading: boolean;
  error: string | null;
}

export function useFetchedEtfData(
  user: FirebaseUser | null,
  selectedIsins: string[],
  triggerFetch: boolean // Per controllare quando iniziare il fetching
): UseFetchedEtfDataResult {
  const [etfData, setEtfData] = useState<EtfData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || selectedIsins.length === 0 || !triggerFetch) {
      setEtfData([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchMultipleEtfData = async () => {
      setLoading(true);
      setError(null);
      setEtfData([]);

      try {
        const fetchedData = await Promise.all(
          selectedIsins.map(async (isin) => {
            const response = await fetch(`http://127.0.0.1:8000/api/v2/etf/${isin}`);
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
