export interface Holding {
  nome: string;
  percentuale: number;
  isin?: string;
}

export interface Country {
  nome: string;
  percentuale: number;
}

export interface Region {         
  nome: string;
  percentuale: number;
}

export interface Sector {         
  nome: string;
  percentuale: number;
}

export interface EtfData {
  status: string;
  nome: string;
  isin: string;
  tipo_asset: string;
  costo_annuo?: number;
  totale_holdings: number;
  holdings: Holding[];
  regions: Region[]; // Record<string, number>;
  countries: Country[]; // Record<string, number>;
  sectors: Sector[]; // Record<string, number>;
}
