import { useQuery } from '@tanstack/react-query';
import { SEARCH_ETF_API_URL } from '@/shared/config/constants';

// Definiamo i tipi esatti di metriche che ci aspettiamo
export type RiskMetricType = 'volatilita' | 'sharpe' | 'drawdown' | 'beta';

interface ApiResponse {
  status: string;
  message?: string;
  data?: {valore: number};
}

export function useEtfMetric(isin: string, metricType: RiskMetricType) {
  return useQuery<number, Error>({
    // La chiave ora include il tipo di metrica, così React Query le gestisce in parallelo!
    queryKey: ['etf-metric', isin, metricType],

    queryFn: async (): Promise<number> => {
      // Chiamiamo l'endpoint specifico (es: /api/etf/IE00B4L5Y983/risk/volatilita)
      const response = await fetch(`${SEARCH_ETF_API_URL}/${isin}/risk/${metricType}`);
      
      if (!response.ok) {
        throw new Error(`Errore Server (${response.status})`);
      }
      
      const json: ApiResponse = await response.json();

      console.log('result: ', json);
      
      if (json.status === 'success' && typeof json.data?.valore === 'number') {
        return json.data.valore;
      } else {
        throw new Error(json.message || 'Dato non disponibile');
      }
    },

    staleTime: 1000 * 60 * 5, 
    enabled: isin.trim().length >= 10,
    retry: 1, // Fa solo 1 tentativo extra se fallisce, non blocca l'utente
  });
}