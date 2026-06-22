export interface HoldingHistoryChartProps {
  status: string;
  isin: string;
  ticker: string;
  periodo_selezionato: string;
  valuta: string;
  andamento: StoricoPrezzoProps[];
}

export interface StoricoPrezzoProps {
  data: string;
  prezzo: number;
  volume: number;
}