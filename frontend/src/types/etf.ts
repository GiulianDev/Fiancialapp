export interface Holding {
  nome: string;
  peso_percentuale: number;
  isin?: string;
}

export interface EtfData {
  status: string;
  nome: string;
  isin: string;
  tipo_asset: string;
  costo_annuo?: number;
  totale_holdings: number;
  holdings: Holding[];
  regions: Record<string, number>;
  countries: Record<string, number>;
  sectors: Record<string, number>;
}

export interface Country {
  nome: string;
  peso: number;
}

export interface Region {         
  nome: string;
  peso: number;
}

export interface Sector {         
  nome: string;
  peso: number;
}