// src/features/portfolio/components/BreakdownSection/BreakdownSection.tsx

import { useMemo } from 'react';
import { Button } from '@/shared/ui';
import { PieChartDisplay } from '@/shared/ui/PieChartDisplay/PieChartDisplay';

interface BreakdownItem {
  nome: string;
  [key: string]: any; 
}

interface BreakdownSectionProps {
  title: string;
  subtitle?: string;
  data: BreakdownItem[];
  dataKey: string;
  nameKey: string;
  residualLabel?: string;
  maxChartItems?: number;
  limiteLista?: number;   
  onLoadMore?: () => void; 
  onItemClick?: (item: Record<string, any>) => void; // 🎯 NUOVA: Event handler generico
  isLoading?: boolean;
}

export function BreakdownSection({
  title,
  subtitle,
  data,
  dataKey,
  nameKey,
  residualLabel = 'Altro',
  maxChartItems = 10,
  limiteLista,
  onLoadMore,
  onItemClick,
  isLoading = false
}: BreakdownSectionProps) {

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => (b[dataKey] || 0) - (a[dataKey] || 0));
  }, [data, dataKey]);

  // console.log('Breakdown section:', title);
  // console.log('Breakdown section:', sortedData);

  return (
    <div className="w-full flex flex-col">
      {isLoading ? (
        <div className="w-full p-4 space-y-3 animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="h-4 bg-white/5 rounded w-1/2"></div>
          <div className="h-[300px] bg-white/5 rounded-full mx-auto w-[300px] mt-6"></div>
        </div>
      ) : sortedData.length > 0 ? (
        <>
          <PieChartDisplay
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            title={title}
            subtitle={subtitle}
            maxItems={maxChartItems}
            residualLabel={residualLabel}
            onItemClick={onItemClick}
          />

          {limiteLista !== undefined && onLoadMore && limiteLista < sortedData.length && (
            <div className="mt-4 flex justify-start">
              <Button onClick={onLoadMore} variant="secondary">
                Mostra altri 5 ({sortedData.length - limiteLista} rimanenti)
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="p-4 text-center text-sm text-gray-500 italic">
          Nessun dato disponibile per {title.toLowerCase()}
        </div>
      )}
    </div>
  );
}