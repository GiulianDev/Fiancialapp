import type { Country, Region, Sector, Holding } from './etf';

export interface AggregatedResult {
  holdings: Holding[];
  regions: Region[];     
  countries: Country[];
  sectors: Sector[];     
  count: number;
  residualHolding: number;
  residualRegion: number;
  residualCountry: number;
  residualSector: number;
}