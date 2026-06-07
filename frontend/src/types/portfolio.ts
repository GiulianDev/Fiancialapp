import type { Country, Holding } from './etf';

export interface AggregatedResult {
  holdings: Holding[];
  countries: Country[];
  count: number;
  residualHolding: number;
  residualCountry: number;
}
