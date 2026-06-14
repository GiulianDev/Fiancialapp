export interface HoldingDetails {
  status: string;
  isin: string;
  ticker: string;
  nome: string;
  settore: string;
  industria: string;
  paese: string;
  descrizione: string;
  dati_finanziari: {
    prezzo_attuale: number;
    valuta: string;
    market_cap: number;
    pe_ratio_trailing: number;
    dividendo_yield_percentuale: number;
  };
}

export interface StoricoPrezzo {
  data: string;
  prezzo: number;
  volume: number;
}

export interface HoldingHistory {
  status: string;
  isin: string;
  ticker: string;
  periodo_selezionato: string;
  valuta: string;
  andamento: StoricoPrezzo[];
}