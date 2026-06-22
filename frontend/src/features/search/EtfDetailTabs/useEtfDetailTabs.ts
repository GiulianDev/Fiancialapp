// Chiama l'API di ricerca ETF e gestisce lo stato di caricamento, errori e dati con React Query.
import { useQuery } from '@tanstack/react-query';
import type { EtfData } from '@/shared/types';
import { ETF_INFO_API } from '@config/constants';

export function useEtfDetailTabs(isin: string) {
  
  return useQuery<EtfData, Error, EtfData, [string, string]>({
    queryKey: ['etf-info', isin],
    queryFn: async (): Promise<EtfData> => {
      const response = await fetch(`${ETF_INFO_API}/${isin}/info`);
      const data = await response.json();
      if (data.status === 'error') {
        throw new Error(data.message || 'Errore di connessione al server Python.');
      }
      console.log('ETF INFO API success');
      return data;
    },

    // CONTROLLO: Se l'isin è vuoto (primo avvio), la query è disabilitata.
    // Non fa chiamate a vuoto e non mostra errori.
    enabled: isin.trim().length > 0,
    
    staleTime: 1000 * 60 * 5, // I dati rimangono validi in cache per 5 minuti
  });
}