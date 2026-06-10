// src/hooks/useEtfSearch.ts
// Chiama l'API di ricerca ETF e gestisce lo stato di caricamento, errori e dati con React Query.
import { useQuery } from '@tanstack/react-query';
import { type EtfData } from '../index';
import { SEARCH_ETF_API_URL } from '../index';

export function useEtfSearch(isin: string) {
  return useQuery<EtfData, Error, EtfData, [string, string]>({
    // La chiave di cache tiene traccia dell'isin attivo
    queryKey: ['etf', isin], 
    
    queryFn: async (): Promise<EtfData> => {
      const response = await fetch(`${SEARCH_ETF_API_URL}/${isin}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message || 'Errore di connessione al server Python.');
      } 
      
      return data;
    },
    
    staleTime: 1000 * 60 * 5, // I dati rimangono validi in cache per 5 minuti

    // CONTROLLO: Se l'isin è vuoto (primo avvio), la query è disabilitata.
    // Non fa chiamate a vuoto e non mostra errori.
    enabled: isin.trim().length >= 0, 
  });
}