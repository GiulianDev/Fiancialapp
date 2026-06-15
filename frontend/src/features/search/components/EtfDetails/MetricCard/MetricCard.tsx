import { useEtfMetric, type RiskMetricType } from "@/features/search/hooks/useEtfMetric";

interface MetricCardProps {
  isin: string;
  metricType: RiskMetricType;
  title: string;
  description: string;
  suffix?: string;
  colorClass?: string | ((val: number) => string);
}

export function MetricCard({ isin, metricType, title, description, suffix = '', colorClass = 'text-gray-100' }: MetricCardProps) {
  // Ogni card lancia la sua fetch separata!
  const { data: value, isLoading, error } = useEtfMetric(isin, metricType);
  
  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-between h-full min-h-[140px]">

      <span className="text-xs text-gray-400 block mb-1 uppercase tracking-wider font-semibold">
        {title}
      </span>

      {/* STATO DI CARICAMENTO ISOLATO */}
      {isLoading && (
        <div className="w-16 h-8 bg-white/10 animate-pulse rounded-md mt-1"></div>
      )}

      {/* STATO DI ERRORE ISOLATO */}
      {error && !isLoading && (
        <span className="text-sm font-medium text-red-400/80 bg-red-400/10 px-2 py-1 rounded">
          Non disp.
        </span>
      )}

      {/* STATO DI SUCCESSO */}
      {value !== undefined && !isLoading && !error && (
        <span className={`text-2xl font-bold ${typeof colorClass === 'function' ? colorClass(value) : colorClass}`}>
          {value.toFixed(2)}{suffix}
        </span>
      )}

      <p className="text-[11px] text-gray-500 mt-3 leading-tight">
        {description}
      </p>
    </div>
  );
}
