import { useQuery } from '@tanstack/react-query';
import { HOLDING_MAIN_DETAIL_API } from '@/shared/config/constants';
import type { HoldingMainDetailsProps } from './HoldingMainDetailsProps';

// Hook per i dettagli anagrafici e fondamentali
export function useHoldingMainDetails(isin: string) {
  return useQuery<HoldingMainDetailsProps, Error>({
    queryKey: ['holding-details', isin],
    queryFn: async () => {
      const response = await fetch(`${HOLDING_MAIN_DETAIL_API}/${isin}`);
      const data = await response.json();
      if (data.status === 'error') throw new Error(data.message);
      return data;
    },
    enabled: isin.length > 0,
    staleTime: 1000 * 60 * 60, // I dati aziendali cambiano raramente (1 ora)
  });
}


