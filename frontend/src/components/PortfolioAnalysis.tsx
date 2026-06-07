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

function combineEtfData(etfData: EtfData[], weights: Record<string, number>): AggregatedResult {
  const holdingsMap = new Map<string, number>();
  const regionsMap = new Map<string, number>();
  const countriesMap = new Map<string, number>();
  const sectorsMap = new Map<string, number>();

  // 🛡️ SICUREZZA: Consideriamo SOLO gli ETF che hanno un peso valido e strettamente maggiore di 0
  const validEtfData = etfData.filter((etf) => (weights[etf.isin] ?? 0) > 0);

  // Calcoliamo la somma totale dei pesi basandoci esclusivamente sugli ETF validi
  const totalUserWeight = validEtfData.reduce((sum, etf) => sum + (weights[etf.isin] ?? 0), 0);

  // Se dopo il filtro non rimangono ETF validi o il peso totale è zero, restituiamo un aggregato vuoto sicuro
  if (validEtfData.length === 0 || totalUserWeight === 0) {
    return { 
      holdings: [], 
      regions: [],
      countries: [], 
      sectors: [],
      count: 0,
      residualHolding: 0,
      residualRegion: 0,
      residualCountry: 0,
      residualSector: 0
    };
  }

  let totalUnknownHoldings = 0;
  let totalUnknownRegions = 0;
  let totalUnknownCountries = 0;
  let totalUnknownSectors = 0;

  // Cicliamo solo sugli ETF validi (> 0)
  validEtfData.forEach((etf) => {
    const userWeight = weights[etf.isin] ?? 0;
    const etfRelativeWeight = userWeight / totalUserWeight;

    // 1. HOLDINGS
    let knownHoldingsSum = 0;
    if (etf.holdings) {
      etf.holdings.forEach((holding) => {
        knownHoldingsSum += holding.peso_percentuale;
        const current = holdingsMap.get(holding.nome) ?? 0;
        holdingsMap.set(holding.nome, current + (holding.peso_percentuale * etfRelativeWeight));
      });
    }
    totalUnknownHoldings += Math.max(0, 100 - knownHoldingsSum) * etfRelativeWeight;

    // 2. REGIONS
    let knownRegionsSum = 0;
    if (etf.regions) {
      Object.entries(etf.regions).forEach(([region, peso]) => {
        knownRegionsSum += peso;
        const current = regionsMap.get(region) ?? 0;
        regionsMap.set(region, current + (peso * etfRelativeWeight));
      });
    }
    totalUnknownRegions += Math.max(0, 100 - knownRegionsSum) * etfRelativeWeight;

    // 3. COUNTRIES
    let knownCountriesSum = 0;
    if (etf.countries) {
      Object.entries(etf.countries).forEach(([country, peso]) => {
        knownCountriesSum += peso;
        const current = countriesMap.get(country) ?? 0;
        countriesMap.set(country, current + (peso * etfRelativeWeight));
      });
    }
    totalUnknownCountries += Math.max(0, 100 - knownCountriesSum) * etfRelativeWeight;

    // 4. SECTORS
    let knownSectorsSum = 0;
    if (etf.sectors) {
      Object.entries(etf.sectors).forEach(([sector, peso]) => {
        knownSectorsSum += peso;
        const current = sectorsMap.get(sector) ?? 0;
        sectorsMap.set(sector, current + (peso * etfRelativeWeight));
      });
    }
    totalUnknownSectors += Math.max(0, 100 - knownSectorsSum) * etfRelativeWeight;
  });

  // Ordinamento dei risultati finali dal più grande al più piccolo
  const holdings = Array.from(holdingsMap.entries())
    .map(([nome, peso_percentuale]) => ({ nome, peso_percentuale }))
    .sort((a, b) => b.peso_percentuale - a.peso_percentuale);

  const regions = Array.from(regionsMap.entries())
    .map(([nome, peso]) => ({ nome, peso }))
    .sort((a, b) => b.peso - a.peso);

  const countries = Array.from(countriesMap.entries())
    .map(([nome, peso]) => ({ nome, peso }))
    .sort((a, b) => b.peso - a.peso);

  const sectors = Array.from(sectorsMap.entries())
    .map(([nome, peso]) => ({ nome, peso }))
    .sort((a, b) => b.peso - a.peso);

  return { 
    holdings, 
    regions,
    countries, 
    sectors,
    count: validEtfData.length, // Restituisce il conteggio reale degli ETF effettivamente considerati nell'analisi
    residualHolding: totalUnknownHoldings,
    residualRegion: totalUnknownRegions,
    residualCountry: totalUnknownCountries,
    residualSector: totalUnknownSectors
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

  // Se l'utente ha selezionato degli ETF ma il motore li ha scartati tutti perché a 0
  if (combined.count === 0) {
    return (
      <div className="p-4 text-amber-600 text-center bg-amber-50 border border-amber-200 rounded-md">
        ⚠️ Nessun ETF valido da analizzare. Assicurati di inserire quote maggiori di 0.
      </div>
    );
  }

  return (
    <div className="portfolio-analysis-results">
       <EtfFavorites combined={combined} />
    </div>
  );
}