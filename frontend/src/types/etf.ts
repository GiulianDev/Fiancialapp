export interface Holding {
  nome: string;
  peso_percentuale: number;
}

export interface EtfData {
  status: string;
  nome: string;
  isin: string;
  tipo_asset: string;
  costo_annuo?: number;
  totale_holdings: number;
  holdings: Holding[];
  countries: Record<string, number>;
}

export interface Country {
  nome: string;
  peso: number;
}
