import { useState, useEffect } from 'react';
import { type FirebaseUser } from '../firebase';
import type { AggregatedResult } from '../types/portfolio';
import type { EtfData } from '../types/etf';
import { EtfFavorites } from './EtfFavorites/EtfFavorites';

interface PortfolioAnalysisProps {
  user: FirebaseUser | null;
  selectedIsins: string[];
  weights: Record<string, number>;
}

// Nuova logica di combinazione con gestione del residuo e pesi personalizzati
function combineEtfData(etfData: EtfData[], weights: Record<string, number>): AggregatedResult {
  const holdingsMap = new Map<string, number>();
  const countriesMap = new Map<string, number>();

  let totalUserWeight = etfData.reduce((sum, etf) => sum + (weights[etf.isin] || 1), 0);
  if (totalUserWeight === 0) totalUserWeight = 1; 

  let totalUnknownHoldings = 0;
  let totalUnknownCountries = 0;

  etfData.forEach((etf) => {
    const etfRelativeWeight = (weights[etf.isin] || 1) / totalUserWeight;

    let knownHoldingsSum = 0;
    etf.holdings.forEach((holding) => {
      knownHoldingsSum += holding.peso_percentuale;
      const currentAggregatedWeight = holdingsMap.get(holding.nome) ?? 0;
      holdingsMap.set(holding.nome, currentAggregatedWeight + (holding.peso_percentuale * etfRelativeWeight));
    });
    
    const unknownHoldings = Math.max(0, 100 - knownHoldingsSum);
    totalUnknownHoldings += unknownHoldings * etfRelativeWeight;

    let knownCountriesSum = 0;
    Object.entries(etf.countries).forEach(([country, peso]) => {
      knownCountriesSum += peso;
      const currentAggregatedWeight = countriesMap.get(country) ?? 0;
      countriesMap.set(country, currentAggregatedWeight + (peso * etfRelativeWeight));
    });
    
    const unknownCountries = Math.max(0, 100 - knownCountriesSum);
    totalUnknownCountries += unknownCountries * etfRelativeWeight;
  });

  const holdings = Array.from(holdingsMap.entries())
    .map(([nome, peso_percentuale]) => ({ nome, peso_percentuale }))
    .sort((a, b) => b.peso_percentuale - a.peso_percentuale);

  const countries = Array.from(countriesMap.entries())
    .map(([nome, peso]) => ({ nome, peso }))
    .sort((a, b) => b.peso - a.peso);

  return { 
    holdings, 
    countries, 
    count: etfData.length,
    residualHolding: totalUnknownHoldings,
    residualCountry: totalUnknownCountries
  };
}


export function PortfolioAnalysis({ user, selectedIsins, weights }: PortfolioAnalysisProps) {
  const [combined, setCombined] = useState<AggregatedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const computeCombined = async () => {
      if (!user || selectedIsins.length === 0) return;

      setLoading(true);
      setError(null);
      try {
        const etfData = await Promise.all(
          selectedIsins.map(async (isin) => {
            const response = await fetch(`http://127.0.0.1:8000/api/etf/${isin}`);
            const payload = await response.json();
            if (!response.ok || payload?.status === 'error') {
              throw new Error(payload?.message ?? `Errore caricamento ISIN ${isin}`);
            }
            return payload as EtfData;
          })
        );
        setCombined(combineEtfData(etfData, weights));
      } catch (err) {
        console.error('Combine error:', err);
        setError(err instanceof Error ? err.message : 'Errore durante il calcolo.');
      } finally {
        setLoading(false);
      }
    };

    computeCombined();
  }, [user, selectedIsins, weights]);

  if (loading) return <div className="p-4 text-center">Calcolo dell'analisi in corso...</div>;
  if (error) return <div className="p-4 text-red-600">Errore: {error}</div>;
  if (!combined) return <div className="p-4 text-gray-500 text-center">Seleziona degli ETF per vedere l'analisi.</div>;

  return (
    <div className="portfolio-analysis-results">
       <EtfFavorites combined={combined} />
    </div>
  );
}
