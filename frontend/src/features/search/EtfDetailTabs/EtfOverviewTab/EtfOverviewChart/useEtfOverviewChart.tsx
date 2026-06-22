import { useQuery } from '@tanstack/react-query';
import { ETF_INFO_API } from '@/shared/config/constants';
import type { EtfOverviewChartType } from './EtfOverviewChart.interface';

export interface ApiResponse {
  status: string;
  message?: string;
  isin: string;
  nome: string;
  totale: number;
  holdings?: DataArray[];
  countries?: DataArray[];
  sectors?: DataArray[];
  regions?: DataArray[];
}

export interface DataArray {
  nome: string;
  percentuale: number;
  isin?: string;
}

export function useEtfOverviewChart(isin: string, etfOverviewChartType: EtfOverviewChartType) {
  
  return useQuery<ApiResponse, Error>({
    // La chiave ora include il tipo di metrica, così React Query le gestisce in parallelo!
    queryKey: ['etf-overview-chart', isin, etfOverviewChartType],

    queryFn: async (): Promise<ApiResponse> => {
      // Chiamiamo l'endpoint specifico
      const response = await fetch(`${ETF_INFO_API}/${isin}/${etfOverviewChartType}`);
      
      if (!response.ok) {
        throw new Error(`Errore Server (${response.status})`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.status === 'success') {
        console.log()
        return data;
      } else {
        throw new Error(data?.message || 'Dato non disponibile');
      }
    },

    staleTime: 1000 * 60 * 5, 
    enabled: isin.trim().length >= 10,
    retry: 1, // Fa solo 1 tentativo extra se fallisce, non blocca l'utente

  });
}