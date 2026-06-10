import type { EtfData } from '../shared/types/etf';
import type { AggregatedResult } from '../shared/types/portfolio';

// Interfaccia estesa per includere i nuovi calcoli finanziari avanzati
export interface AdvancedPortfolioAnalysis extends AggregatedResult {
  totalFeesYearly: number;       
  weightedTer: number;          
  overlapAlerts: Array<{ nome: string; pesoComplessivo: number; contribuenti: string[] }>; 
  styleAllocation: {            
    growth: number;
    value: number;
  };
  weightedEsgScore?: number;    
}

/**
 * 1. FUNZIONE PRINCIPALE DI AGGREGAZIONE (Core)
 */
export function analyzePortfolio(etfData: EtfData[], weights: Record<string, number>): AdvancedPortfolioAnalysis {
  const validEtfData = etfData.filter((etf) => (weights[etf.isin] ?? 0) > 0);
  const totalUserWeight = validEtfData.reduce((sum, etf) => sum + (weights[etf.isin] ?? 0), 0);

  if (validEtfData.length === 0 || totalUserWeight === 0) {
    return {
      holdings: [], regions: [], countries: [], sectors: [],
      count: 0, residualHolding: 0, residualRegion: 0, residualCountry: 0, residualSector: 0,
      totalFeesYearly: 0, weightedTer: 0, overlapAlerts: [],
      styleAllocation: { growth: 0, value: 0 }
    };
  }

  const holdingsMap = new Map<string, number>();
  const regionsMap = new Map<string, number>();
  const countriesMap = new Map<string, number>();
  const sectorsMap = new Map<string, number>();
  const holdingContributorsMap = new Map<string, string[]>();

  let totalUnknownHoldings = 0;
  let totalUnknownRegions = 0;
  let totalUnknownCountries = 0;
  let totalUnknownSectors = 0;

  validEtfData.forEach((etf) => {
    const userWeight = weights[etf.isin] ?? 0;
    const etfRelativeWeight = userWeight / totalUserWeight;

    // A. HOLDINGS
    let knownHoldingsSum = 0;
    if (etf.holdings) {
      etf.holdings.forEach((holding) => {
        knownHoldingsSum += holding.peso_percentuale;
        
        const currentPeso = holdingsMap.get(holding.nome) ?? 0;
        holdingsMap.set(holding.nome, currentPeso + (holding.peso_percentuale * etfRelativeWeight));
        
        const contributors = holdingContributorsMap.get(holding.nome) ?? [];
        if (!contributors.includes(etf.isin)) {
          contributors.push(etf.isin);
        }
        holdingContributorsMap.set(holding.nome, contributors);
      });
    }
    totalUnknownHoldings += Math.max(0, 100 - knownHoldingsSum) * etfRelativeWeight;

    // B. REGIONS
    let knownRegionsSum = 0;
    if (etf.regions) {
      Object.entries(etf.regions).forEach(([region, peso]) => {
        knownRegionsSum += peso;
        regionsMap.set(region, (regionsMap.get(region) ?? 0) + (peso * etfRelativeWeight));
      });
    }
    totalUnknownRegions += Math.max(0, 100 - knownRegionsSum) * etfRelativeWeight;

    // C. COUNTRIES
    let knownCountriesSum = 0;
    if (etf.countries) {
      Object.entries(etf.countries).forEach(([country, peso]) => {
        knownCountriesSum += peso;
        countriesMap.set(country, (countriesMap.get(country) ?? 0) + (peso * etfRelativeWeight));
      });
    }
    totalUnknownCountries += Math.max(0, 100 - knownCountriesSum) * etfRelativeWeight;

    // D. SECTORS
    let knownSectorsSum = 0;
    if (etf.sectors) {
      Object.entries(etf.sectors).forEach(([sector, peso]) => {
        knownSectorsSum += peso;
        sectorsMap.set(sector, (sectorsMap.get(sector) ?? 0) + (peso * etfRelativeWeight));
      });
    }
    totalUnknownSectors += Math.max(0, 100 - knownSectorsSum) * etfRelativeWeight;
  });

  const holdings = Array.from(holdingsMap.entries()).map(([nome, peso_percentuale]) => ({ nome, peso_percentuale })).sort((a, b) => b.peso_percentuale - a.peso_percentuale);
  const regions = Array.from(regionsMap.entries()).map(([nome, peso]) => ({ nome, peso })).sort((a, b) => b.peso - a.peso);
  const countries = Array.from(countriesMap.entries()).map(([nome, peso]) => ({ nome, peso })).sort((a, b) => b.peso - a.peso);
  const sectors = Array.from(sectorsMap.entries()).map(([nome, peso]) => ({ nome, peso })).sort((a, b) => b.peso - a.peso);

  // ESECUZIONE UTILITY
  const { weightedTer, totalFeesYearly } = calculatePortfolioCosts(validEtfData, weights, totalUserWeight);
  const overlapAlerts = calculateOverlapAnalysis(holdings, holdingContributorsMap);
  const styleAllocation = calculateStyleAllocation(sectors);

  return {
    holdings, regions, countries, sectors,
    count: validEtfData.length,
    residualHolding: totalUnknownHoldings,
    residualRegion: totalUnknownRegions,
    residualCountry: totalUnknownCountries,
    residualSector: totalUnknownSectors,
    weightedTer,
    totalFeesYearly,
    overlapAlerts,
    styleAllocation
  };
}

/**
 * 2. CALCOLO EFFICIENZA E COSTI 
 */
function calculatePortfolioCosts(validEtfData: EtfData[], weights: Record<string, number>, totalUserWeight: number) {
  let totalWeightedTer = 0;

  validEtfData.forEach((etf) => {
    const userWeight = weights[etf.isin] ?? 0;
    const etfRelativeWeight = userWeight / totalUserWeight;
    
    const etfTer = etf.costo_annuo ?? 0.20; // Usa il costo_annuo reale, fallback a 0.20
    totalWeightedTer += etfTer * etfRelativeWeight;
  });

  const totalFeesYearly = (totalUserWeight * totalWeightedTer) / 100;

  return {
    weightedTer: Number(totalWeightedTer.toFixed(2)),
    totalFeesYearly: Number(totalFeesYearly.toFixed(2))
  };
}

/**
 * 3. INDICE DI SOVRAPPOSIZIONE REALE
 * (L'errore era qui: rimosso il "Marlin" dal tipo di peso_percentuale)
 */
function calculateOverlapAnalysis(
  aggregatedHoldings: Array<{ nome: string; peso_percentuale: number }>,
  contributorsMap: Map<string, string[]>
): Array<{ nome: string; pesoComplessivo: number; contribuenti: string[] }> {
  
  const alerts: Array<{ nome: string; pesoComplessivo: number; contribuenti: string[] }> = [];

  aggregatedHoldings.forEach((holding) => {
    const contributors = contributorsMap.get(holding.nome) ?? [];
    
    if (contributors.length >= 2 && holding.peso_percentuale > 3.0) {
      alerts.push({
        nome: holding.nome,
        pesoComplessivo: Number(holding.peso_percentuale.toFixed(2)),
        contribuenti: contributors
      });
    }
  });

  return alerts;
}

/**
 * 4. MATRICE STILE DI INVESTIMENTO
 */
function calculateStyleAllocation(aggregatedSectors: Array<{ nome: string; peso: number }>) {
  let growthScore = 0;
  let valueScore = 0;

  const growthSectors = ['Technology', 'Information Technology', 'Tecnologia', 'Consumer Cyclical', 'Beni di consumo ciclici', 'Communication', 'Servizi di comunicazione', 'Kommunikation', 'Technologie', 'Zykl. Konsumgüter'];
  const valueSectors = ['Financials', 'Servizi finanziari', 'Finanzen', 'Healthcare', 'Salute', 'Gesundheitswesen', 'Energy', 'Energia', 'Energie', 'Utilities', 'Utenze', 'Versorger', 'Consumer Defensive', 'Beni di consumo difensivi', 'Basiskonsumgüter'];

  aggregatedSectors.forEach((sector) => {
    if (growthSectors.includes(sector.nome)) {
      growthScore += sector.peso;
    } else if (valueSectors.includes(sector.nome)) {
      valueScore += sector.peso;
    }
  });

  const totalStyleWeight = growthScore + valueScore;
  if (totalStyleWeight === 0) return { growth: 50, value: 50 }; 

  return {
    growth: Number(((growthScore / totalStyleWeight) * 100).toFixed(0)),
    value: Number(((valueScore / totalStyleWeight) * 100).toFixed(0))
  };
}