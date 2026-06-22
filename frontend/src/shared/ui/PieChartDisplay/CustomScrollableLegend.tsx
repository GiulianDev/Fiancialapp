// src/features/portfolio/components/EtfCharts/CustomScrollableLegend.tsx

import type { Dispatch, SetStateAction } from 'react';
import type { LegendProps } from 'recharts';

interface CustomScrollableLegendProps extends LegendProps {
  dataKey: string;
  maxItems?: number;       
  residualLabel?: string;  
  payload?: Array<{
    value: string; 
    color: string; 
    payload: Record<string, any>;
  }>;
  onItemClick?: (item: Record<string, any>) => void;
  // 🎯 Nuove props passate dal padre
  visibleCount: number;
  setVisibleCount: Dispatch<SetStateAction<number>>;
}

export function CustomScrollableLegend({ 
  payload, 
  dataKey, 
  maxItems = 5,
  residualLabel = 'Altro',
  onItemClick,
  visibleCount,     // Ricevuto dal padre
  setVisibleCount   // Ricevuto dal padre
}: CustomScrollableLegendProps) {
  
  const realData = payload?.filter(entry => entry.value !== residualLabel) || [];
  const baseResidualEntry = payload?.find(entry => entry.value === residualLabel);

  const sortedRealData = realData.sort((a, b) => {
    const valA = a.payload[dataKey] ?? 0;
    const valB = b.payload[dataKey] ?? 0;
    return valB - valA; 
  });

  let displayData = [...sortedRealData];
  let cutOffSum = 0;

  if (sortedRealData.length > visibleCount) {
    displayData = sortedRealData.slice(0, visibleCount);
    const cutOffItems = sortedRealData.slice(visibleCount);
    cutOffSum = cutOffItems.reduce((sum, entry) => sum + (entry.payload[dataKey] ?? 0), 0);
  }

  const baseResidualSum = baseResidualEntry ? (baseResidualEntry.payload[dataKey] ?? 0) : 0;
  const finalResidualSum = cutOffSum + baseResidualSum;

  if (finalResidualSum > 0.01) {
    displayData.push({
      value: residualLabel,
      color: 'hsl(215, 15%, 60%)', 
      payload: {
        [dataKey]: finalResidualSum,
        isResidual: true 
      }
    });
  }

  const hasMore = sortedRealData.length > visibleCount;
  const hasLess = visibleCount > maxItems;

  return (
    <div className="w-full flex flex-col pt-3 mt-2.5 border-t border-white/10">
      <div className="custom-scrollbar w-full max-h-[130px] overflow-y-auto pr-1">
        <ul className="list-none p-0 m-0">
          {displayData.map((entry, index) => { 
            const rawValue = entry.payload[dataKey];
            const value = typeof rawValue === 'number' ? rawValue : 0;
            const valueDisplay = `${value.toFixed(2)}%`;
            const isResidual = entry.value === residualLabel;
            
            return (
              <li 
                key={`legend-item-${index}`} 
                onClick={() => {
                  if (!isResidual && onItemClick) onItemClick(entry.payload);
                }}
                className={`flex items-center mb-1.5 text-sm text-gray-300 py-1 px-2 rounded transition-colors duration-200 ${
                  onItemClick && !isResidual ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'
                }`}
              >
                <span
                  className="inline-block w-3 h-3 rounded-sm mr-2 shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="truncate">
                  {entry.value}: <strong className="font-semibold text-white ml-1">{valueDisplay}</strong>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {(hasMore || hasLess) && (
        <div className="flex items-center gap-4 mt-2 px-2 select-none">
          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount(prev => prev + 5)}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors duration-150 flex items-center focus:outline-none cursor-pointer"
            >
              + Mostra più
            </button>
          )}
          {hasLess && (
            <button
              type="button"
              onClick={() => setVisibleCount(prev => Math.max(maxItems, prev - 5))}
              className="text-xs font-medium text-gray-500 hover:text-gray-400 transition-colors duration-150 flex items-center focus:outline-none cursor-pointer"
            >
              - Mostra meno
            </button>
          )}
        </div>
      )}
    </div>
  );
}