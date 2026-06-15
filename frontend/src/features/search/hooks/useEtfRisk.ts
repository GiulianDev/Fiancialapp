import { SEARCH_ETF_API_URL } from '@/shared/config/constants';
import { useState, useEffect } from 'react';

interface RiskMetrics {
  volatilia_annua: number;
  sharpe_ratio: number;
  max_drawdown: number;
  beta: number;
}

interface ApiResponse {
  status: string;
  message?: string;
  dati_rischio?: RiskMetrics;
}

export function useEtfRisk(isin: string) {
  const [data, setData] = useState<RiskMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isin || isin.length < 12) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Legge la variabile d'ambiente o fa fallback sul server locale
        const response = await fetch(`${SEARCH_ETF_API_URL}/${isin}/risk`);
        
        if (!response.ok) {
          throw new Error(`Errore di rete (Status: ${response.status})`);
        }
        
        const json: ApiResponse = await response.json();
        
        if (json.status === 'success' && json.dati_rischio) {
          setData(json.dati_rischio);
        } else {
          throw new Error(json.message || 'Impossibile recuperare le metriche di rischio dal server.');
        }
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error(err.message || 'Errore sconosciuto'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isin]);

  return { data, isLoading, error };
}