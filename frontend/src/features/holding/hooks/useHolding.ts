import { useQuery } from '@tanstack/react-query';
import type { HoldingDetails } from '@/shared/types';
import { HOLDING_DETAIL_API, HOLDING_HISTORY_API } from '@/shared/config/constants';

// Hook per i dettagli anagrafici e fondamentali
export function useHoldingDetails(isin: string) {
  return useQuery<HoldingDetails, Error>({
    queryKey: ['holding-details', isin],
    queryFn: async () => {
      const response = await fetch(`${HOLDING_DETAIL_API}/${isin}`);
      const data = await response.json();
      if (data.status === 'error') throw new Error(data.message);
      return data;
    },
    enabled: isin.length > 0,
    staleTime: 1000 * 60 * 60, // I dati aziendali cambiano raramente (1 ora)
  });
}


// Hook per il grafico storico (dipende anche dal periodo)
export function useHoldingFull(isin: string, period: string) {
  return useQuery<HoldingHistory, Error>({
    queryKey: ['holding-full', isin, period],
    queryFn: async () => {
      const response = await fetch(`${HOLDING_HISTORY_API}/${isin}?period=${period}`);
      const data = await response.json();
      if (data.status === 'error') throw new Error(data.message);
      return data;
    },
    enabled: isin.length > 0,
    staleTime: 1000 * 60 * 5, // I prezzi cambiano, teniamo in cache per 5 min
  });
}