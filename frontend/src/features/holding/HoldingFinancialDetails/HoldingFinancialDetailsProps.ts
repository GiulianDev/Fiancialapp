export interface HoldingFinancialDetailsProps {
  status: string;
  isin: string;
  ticker: string;
  dati_finanziari: {
    prezzo_attuale: number;
    valuta: string;
    market_cap: number;
    pe_ratio_trailing: number;
    dividendo_yield_percentuale: number;
  };
}