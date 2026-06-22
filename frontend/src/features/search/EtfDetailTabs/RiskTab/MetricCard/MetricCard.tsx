import { useEtfMetric } from "@/features/search/EtfDetailTabs/RiskTab/MetricCard/useEtfMetric";
import type { MetricCardProps } from "./MetricCard.interface";



export function MetricCard({ isin, metricType, title, description, suffix = '', colorClass = 'text-gray-100' }: MetricCardProps) {
  // Ogni card lancia la sua fetch separata!
  const { data: value, isLoading, error } = useEtfMetric(isin, metricType);
  
  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col h-full min-h-[140px]">
      {/* Titolo */}
      <span className="text-xs text-gray-400 block mb-2 uppercase tracking-wider font-semibold">
        {title}
      </span>

      {/* CONTENITORE CENTRATO */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="w-16 h-8 bg-white/10 animate-pulse rounded-md"></div>
        ) : error ? (
          <span className="text-sm font-medium text-red-400/80 bg-red-400/10 px-2 py-1 rounded">
            Non disp.
          </span>
        ) : (
          value !== undefined && (
            <span className={`text-2xl font-bold ${typeof colorClass === 'function' ? colorClass(value) : colorClass}`}>
              {value.toFixed(2)}{suffix}
            </span>
          )
        )}
      </div>

      {/* Descrizione */}
      <p className="text-[11px] text-gray-500 mt-3 leading-tight text-center">
        {description}
      </p>
    </div>
  );
}