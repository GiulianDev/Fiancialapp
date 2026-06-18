export interface HoldingMainDetailsProps {
  status: string;
  isin: string;
  ticker: string;
  data: {
    nome: string;
    settore: string;
    industria: string;
    paese: string;
    descrizione: string;
  }
}