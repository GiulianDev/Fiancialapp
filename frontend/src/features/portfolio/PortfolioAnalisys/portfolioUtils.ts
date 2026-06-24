import type { EtfData } from '../Portfolio.interface';
import type { AggregatedResult } from '../../../shared/types/portfolio';

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
        knownHoldingsSum += holding.percentuale;
        
        const currentPeso = holdingsMap.get(holding.nome) ?? 0;
        holdingsMap.set(holding.nome, currentPeso + (holding.percentuale * etfRelativeWeight));
        
        const contributors = holdingContributorsMap.get(holding.nome) ?? [];
        if (!contributors.includes(etf.isin)) {
          contributors.push(etf.isin);
        }
        holdingContributorsMap.set(holding.nome, contributors);
      });
    }
    totalUnknownHoldings += Math.max(0, 100 - knownHoldingsSum) * etfRelativeWeight;

    // B. REGIONS (Corretto per gestire l'Array di oggetti {nome, percentuale})
    let knownRegionsSum = 0;
    if (etf.regions) {
      etf.regions.forEach((region) => {
        knownRegionsSum += region.percentuale;
        regionsMap.set(region.nome, (regionsMap.get(region.nome) ?? 0) + (region.percentuale * etfRelativeWeight));
      });
    }
    totalUnknownRegions += Math.max(0, 100 - knownRegionsSum) * etfRelativeWeight;

    // C. COUNTRIES (Corretto per gestire l'Array di oggetti {nome, percentuale})
    let knownCountriesSum = 0;
    if (etf.countries) {
      etf.countries.forEach((country) => {
        knownCountriesSum += country.percentuale;
        countriesMap.set(country.nome, (countriesMap.get(country.nome) ?? 0) + (country.percentuale * etfRelativeWeight));
      });
    }
    totalUnknownCountries += Math.max(0, 100 - knownCountriesSum) * etfRelativeWeight;

    // D. SECTORS (Corretto per gestire l'Array di oggetti {nome, percentuale})
    let knownSectorsSum = 0;
    if (etf.sectors) {
      etf.sectors.forEach((sector) => {
        knownSectorsSum += sector.percentuale;
        sectorsMap.set(sector.nome, (sectorsMap.get(sector.nome) ?? 0) + (sector.percentuale * etfRelativeWeight));
      });
    }
    totalUnknownSectors += Math.max(0, 100 - knownSectorsSum) * etfRelativeWeight;
  });

  const holdings = Array.from(holdingsMap.entries()).map(([nome, percentuale]) => ({ nome, percentuale })).sort((a, b) => b.percentuale - a.percentuale);
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
    
    const etfTer = etf.costo_annuo ?? 0.20; 
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
 */
function calculateOverlapAnalysis(
  aggregatedHoldings: Array<{ nome: string; percentuale: number }>,
  contributorsMap: Map<string, string[]>
): Array<{ nome: string; pesoComplessivo: number; contribuenti: string[] }> {
  
  const alerts: Array<{ nome: string; pesoComplessivo: number; contribuenti: string[] }> = [];

  aggregatedHoldings.forEach((holding) => {
    const contributors = contributorsMap.get(holding.nome) ?? [];
    
    if (contributors.length >= 2 && holding.percentuale > 3.0) {
      alerts.push({
        nome: holding.nome,
        pesoComplessivo: Number(holding.percentuale.toFixed(2)),
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