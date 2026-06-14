import { useQuery } from '@tanstack/react-query';
import type { HoldingDetails, HoldingHistory } from '@/shared/types';
import { API_URL } from '@/shared/config/constants';

// Hook per i dettagli anagrafici e fondamentali
export function useHoldingDetails(isin: string) {
  return useQuery<HoldingDetails, Error>({
    queryKey: ['holding-details', isin],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/holding-details/${isin}`);
      const data = await response.json();
      if (data.status === 'error') throw new Error(data.message);
      return data;
    },
    enabled: isin.length > 0,
    staleTime: 1000 * 60 * 60, // I dati aziendali cambiano raramente (1 ora)
  });
}

// Hook per il grafico storico (dipende anche dal periodo)
export function useHoldingHistory(isin: string, period: string) {
  return useQuery<HoldingHistory, Error>({
    queryKey: ['holding-history', isin, period],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/holding-history/${isin}?period=${period}`);
      const data = await response.json();
      if (data.status === 'error') throw new Error(data.message);
      return data;
    },
    enabled: isin.length > 0,
    staleTime: 1000 * 60 * 5, // I prezzi cambiano, teniamo in cache per 5 min
  });
}