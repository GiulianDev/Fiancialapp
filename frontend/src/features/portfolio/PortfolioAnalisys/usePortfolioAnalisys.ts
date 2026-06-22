import { useQuery } from '@tanstack/react-query';
import type { EtfData } from '../../../shared/types/etf';
import { SEARCH_ETF_API_URL } from '../../../shared/config/constants';
import { useAuth } from '../../../shared/contexts/AuthContext';

export function usePortfolioAnalisys(
  selectedIsins: string[],
  triggerFetch: boolean = true
) {
  const { user } = useAuth();

  const { 
    data: etfData = [], 
    isLoading, 
    error 
  } = useQuery({
    // 1. La Query Key: identifica univocamente questa richiesta nella cache
    queryKey: ['portfolio-etfs', selectedIsins],
    
    // 2. Enabled: la query parte SOLO se queste condizioni sono vere
    enabled: !!user && selectedIsins.length > 0 && triggerFetch,
    
    // 3. Stale Time: i dati rimangono "freschi" per 5 minuti (niente API call se richiedi gli stessi ISIN)
    staleTime: 1000 * 60 * 5, 

    // 4. Query Function: la logica di recupero dati
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