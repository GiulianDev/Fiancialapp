import { useQuery } from '@tanstack/react-query';
import { HOLDING_FINANCIAL_DETAIL_API } from '@/shared/config/constants';
import type { HoldingFinancialDetailsProps } from './HoldingFinancialDetailsProps';

// Hook per i dettagli anagrafici e fondamentali
export function useHoldingFinancialDetails(isin: string) {
  return useQuery<HoldingFinancialDetailsProps, Error>({
    queryKey: ['holding-financial-details', isin],
    queryFn: async () => {
      const response = await fetch(`${HOLDING_FINANCIAL_DETAIL_API}/${isin}`);
      const data = await response.json();
      if (data.status === 'error') throw new Error(data.message);
      return data;
    },
    enabled: isin.length > 0,
    staleTime: 1000 * 60 * 60, // I dati aziendali cambiano raramente (1 ora)
  });
}
