import { useEtfOverviewChart } from './useEtfOverviewChart';
import type { EtfOverviewChartType } from './EtfOverviewChart.interface';
import { PieChartDisplay } from '@/shared/ui';

export interface EtfOverviewChartProps {
  isin: string;
  etfOverviewChartType: EtfOverviewChartType;
  title: string;
  onItemClick?: (item: Record<string, any>) => void; // 🎯 NUOVA: Event handler generico
}

export function EtfOverviewChart({ isin, etfOverviewChartType, title, onItemClick}: EtfOverviewChartProps) {
  
  // Ogni card lancia la sua fetch separata!
  const { data: value, isLoading, error } = useEtfOverviewChart(isin, etfOverviewChartType);


    const dataKey = "percentuale";
    const nameKey = "nome";

    // const sortedData = value?.holdings?.sort((a, b) => (b[dataKey] || 0) - (a[dataKey] || 0))

    const sortedData = value?.[etfOverviewChartType]?.sort((a, b) => (b[dataKey] || 0) - (a[dataKey] || 0))

    console.log(sortedData);



  return (
    <div className="w-full">


           {isLoading ? (
              <div className="w-full p-4 space-y-3 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-1/3"></div>
                <div className="h-4 bg-white/5 rounded w-1/2"></div>
                <div className="h-[300px] bg-white/5 rounded-full mx-auto w-[300px] mt-6"></div>
              </div>
            ) : sortedData ? (
              <>

                <PieChartDisplay
                  data={sortedData}
                  dataKey={dataKey}
                  nameKey={nameKey}
                  onItemClick={onItemClick}
                />
              
              </>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500 italic">
                Nessun dato disponibile per {title.toLowerCase()}
              </div>
            )}

    </div>
  );
}