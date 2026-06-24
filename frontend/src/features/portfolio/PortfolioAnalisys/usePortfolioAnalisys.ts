import { useQuery } from '@tanstack/react-query';
import type { EtfData } from '../../../shared/types/etf';
import { SEARCH_ETF_API_URL } from '../../../shared/config/constants';
import { useAuth } from '../../../shared/contexts/AuthContext';

export function usePortfolioAnalisys(selectedIsins: string[]) {
  const { user } = useAuth();

  const { 
    data: etfData = [], 
    isLoading, 
    error 
  } = useQuery({
    // La cache è legata unicamente alla combinazione di ISIN passati
    queryKey: ['portfolio-etfs', selectedIsins],
    
    // Parte in automatico solo se l'utente è loggato e ci sono ISIN da analizzare
    enabled: !!user && selectedIsins.length > 0,
    
    // Mantiene freschi i dati per 5 minuti evitanto chiamate API doppie
    staleTime: 1000 * 60 * 5, 

    queryFn: async (): Promise<EtfData[]> => {
      const fetchedData = await Promise.all(
        selectedIsins.map(async (isin) => {
          const response = await fetch(`${SEARCH_ETF_API_URL}/${isin}`);
          const payload = await response.json();

          if (!response.ok || payload?.status === 'error') {
            const message = payload?.message ?? `Errore caricamento ISIN ${isin}`;
            throw new Error(message);
          }

          return payload as EtfData;
        })
      );
      
      return fetchedData;
    }
  });

  // Manteniamo la firma originale per non rompere il componente padre
  return {
    etfData,
    loading: isLoading,
    error: error instanceof Error ? error.message : (error as string | null),
  };
}