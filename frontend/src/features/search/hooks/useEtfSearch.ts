// Chiama l'API di ricerca ETF e gestisce lo stato di caricamento, errori e dati con React Query.
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import type { EtfData } from '@/shared/types';
import { SEARCH_ETF_API_URL } from '@config/constants';

export function useEtfSearch(isin: string) {
  
  // Eseguiamo la query normalmente ma manteniamo una copia locale
  // dell'ultimo risultato valido per evitare flash di vuoto durante il refetch.
  const query = useQuery<EtfData, Error, EtfData, [string, string]>({
    // La chiave di cache tiene traccia dell'isin attivo
    queryKey: ['etf', isin],

    queryFn: async (): Promise<EtfData> => {
      const response = await fetch(`${SEARCH_ETF_API_URL}/${isin}`);
      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(data.message || 'Errore di connessione al server Python.');
      }

      console.log('Search ETF API success');
      return data;
    },

    staleTime: 1000 * 60 * 5, // I dati rimangono validi in cache per 5 minuti

    // CONTROLLO: Se l'isin è vuoto (primo avvio), la query è disabilitata.
    // Non fa chiamate a vuoto e non mostra errori.
    enabled: isin.trim().length > 0,
  });

  // Retain last successful data locally to emulate keepPreviousData when
  // the library version/types don't expose that option.
  const [retained, setRetained] = useState<EtfData | undefined>(undefined);

  useEffect(() => {
    if (query.data) setRetained(query.data);
  }, [query.data]);

  const effectiveData = query.data ?? retained;

  // Return the query result but with `data` replaced by effectiveData.
  return {
    ...query,
    data: effectiveData,
  } as any;
}