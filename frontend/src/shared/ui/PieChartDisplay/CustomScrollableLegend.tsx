// src/features/portfolio/components/EtfCharts/CustomScrollableLegend.tsx

import { useState } from 'react';
import type { LegendProps } from 'recharts';

interface CustomScrollableLegendProps extends LegendProps {
  dataKey: string;
  maxItems?: number;       // Sganciato dal chart, definisce il passo iniziale minimo
  residualLabel?: string;  // Nome della label aggregata (es. 'Altro')
  payload?: Array<{
    value: string; 
    color: string; 
    payload: Record<string, any>;
  }>;
  onItemClick?: (item: Record<string, any>) => void;
}

export function CustomScrollableLegend({ 
  payload, 
  dataKey, 
  maxItems = 5,
  residualLabel = 'Altro',
  onItemClick 
}: CustomScrollableLegendProps) {
  // 🎯 Stato locale per gestire dinamicamente il limite di elementi visibili
  const [visibleCount, setVisibleCount] = useState(maxItems);
  
  // 1. Separiamo i dati reali dal residuo matematico calcolato dal PieChart genitore
  const realData = payload?.filter(entry => entry.value !== residualLabel) || [];
  const baseResidualEntry = payload?.find(entry => entry.value === residualLabel);

  // 2. Ordiniamo i dati reali per percentuale in modo decrescente
  const sortedRealData = realData.sort((a, b) => {
    const valA = a.payload[dataKey] ?? 0;
    const valB = b.payload[dataKey] ?? 0;
    return valB - valA; 
  });

  // 3. Tagliamo la visualizzazione in base al visibleCount dinamico dello stato
  let displayData = [...sortedRealData];
  let cutOffSum = 0;

  if (sortedRealData.length > visibleCount) {
    displayData = sortedRealData.slice(0, visibleCount);
    const cutOffItems = sortedRealData.slice(visibleCount);
    cutOffSum = cutOffItems.reduce((sum, entry) => sum + (entry.payload[dataKey] ?? 0), 0);
  }

  // 4. Sommiamo gli elementi nascosti all'eventuale scarto originale di base
  const baseResidualSum = baseResidualEntry ? (baseResidualEntry.payload[dataKey] ?? 0) : 0;
  const finalResidualSum = cutOffSum + baseResidualSum;

  // 5. Se ci sono elementi esclusi o scarti, iniettiamo la voce aggregata alla fine
  if (finalResidualSum > 0.01) {
    displayData.push({
      value: residualLabel,
      color: 'hsl(215, 15%, 60%)', // Colore neutro per la quota residuale
      payload: {
        [dataKey]: finalResidualSum,
        isResidual: true 
      }
    });
  }

  // Controlli per determinare la visibilità dei bottoni
  const hasMore = sortedRealData.length > visibleCount;
  const hasLess = visibleCount > maxItems;

  return (
    <div className="w-full flex flex-col pt-3 mt-2.5 border-t border-white/10">
      {/* Box Scrollabile per la lista */}
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

      {/* 🚀 Bottoni di controllo Minimali (a passi di 5) */}
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