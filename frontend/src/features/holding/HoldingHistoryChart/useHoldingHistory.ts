import { useQuery } from '@tanstack/react-query';
import { HOLDING_HISTORY_API } from '@/shared/config/constants';
import type { HoldingHistoryChartProps } from './HoldingHistoryChartProps';


// Hook per il grafico storico (dipende anche dal periodo)
export function useHoldingHistory(isin: string, period: string) {
  return useQuery< HoldingHistoryChartProps, Error>({
    queryKey: ['holding-history', isin, period],
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
