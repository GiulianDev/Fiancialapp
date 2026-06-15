import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { SEARCH_ETF_API_URL } from '@/shared/config/constants';

interface RiskMetrics {
  volatilita_annua?: number;
  volatilia_annua?: number;
  sharpe_ratio?: number;
  max_drawdown?: number;
  beta?: number;
}

interface ApiResponse {
  status: string;
  message?: string;
  dati_rischio?: RiskMetrics;
}

export function useEtfRisk(isin: string) {
  const query = useQuery<RiskMetrics, Error, RiskMetrics, [string, string]>({
    // La chiave di cache identifica univocamente questa query
    queryKey: ['etf-risk', isin],

    queryFn: async (): Promise<RiskMetrics> => {
      const response = await fetch(`${SEARCH_ETF_API_URL}/${isin}/risk`);
      
      if (!response.ok) {
        throw new Error(`Errore di rete (Status: ${response.status})`);
      }
      
      const json: ApiResponse = await response.json();
      
      if (json.status === 'success' && json.dati_rischio) {
        return json.dati_rischio;
      } else {
        throw new Error(json.message || 'Impossibile recuperare le metriche di rischio dal server.');
      }
    },

    // Manteniamo i dati validi in cache per 5 minuti (come nell'ETF Search)
    staleTime: 1000 * 60 * 5, 

    // Esegue la chiamata solo se c'è un ISIN valido
    enabled: isin.trim().length >= 12,
  });

  // Mantiene l'ultimo dato valido locale per evitare sfarfallii durante i refetch in background
  const [retainedData, setRetainedData] = useState<RiskMetrics | null>(null);

  useEffect(() => {
    if (query.data) {
      setRetainedData(query.data);
    }
  }, [query.data]);

  const effectiveData = query.data ?? retainedData;

  return {
    data: effectiveData,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error
  };
}