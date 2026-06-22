// Definiamo i tipi esatti di metriche che ci aspettiamo
export type RiskMetricType = 'volatilita' | 'sharpe' | 'drawdown' | 'beta';

export interface MetricCardProps {
  isin: string;
  metricType: RiskMetricType;
  title: string;
  description: string;
  suffix?: string;
  colorClass?: string | ((val: number) => string);
}