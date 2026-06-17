import { useQuery } from '@tanstack/react-query';
import type { HoldingFull } from '@/shared/types';
import { HOLDING_FULL_API } from '@/shared/config/constants';




// Hook per il grafico storico (dipende anche dal periodo)
export function useHoldingFull(isin: string, start: string, end: string) {
  return useQuery<HoldingFull, Error>({
    queryKey: ['holding-full', isin, start, end ],
    queryFn: async () => {
      const response = await fetch(`${HOLDING_FULL_API}/${isin}/${start}/${end} `);
      
      const data = await response.json();
      if (data.status === 'error') throw new Error(data.message);
      return data;
    },
    enabled: isin.length > 0,
    staleTime: 1000 * 60 * 5, // I prezzi cambiano, teniamo in cache per 5 min
  });
}