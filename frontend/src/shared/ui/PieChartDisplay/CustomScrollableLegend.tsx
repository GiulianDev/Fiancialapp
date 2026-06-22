// src/features/portfolio/components/EtfCharts/CustomScrollableLegend.tsx

import type { LegendProps } from 'recharts';

interface CustomScrollableLegendProps extends LegendProps {
  dataKey: string;
  maxItems?: number;       // Riceve il limite dal grafico genitore
  residualLabel?: string;  // Nome della label aggregata
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
  
  // 1. Separiamo i dati reali dal "residuo a 100" che il PieChart potrebbe aver generato
  const realData = payload?.filter(entry => entry.value !== residualLabel) || [];
  const baseResidualEntry = payload?.find(entry => entry.value === residualLabel);

  // 2. Ordiniamo i dati reali per percentuale in modo decrescente
  const sortedRealData = realData.sort((a, b) => {
    const valA = a.payload[dataKey] ?? 0;
    const valB = b.payload[dataKey] ?? 0;
    return valB - valA; 
  });

  // 3. Tagliamo a maxItems ed estraiamo la somma di tutto ciò che stiamo nascondendo
  let displayData = sortedRealData;
  let cutOffSum = 0;

  if (maxItems && sortedRealData.length > maxItems) {
    displayData = sortedRealData.slice(0, maxItems);
    const cutOffItems = sortedRealData.slice(maxItems);
    cutOffSum = cutOffItems.reduce((sum, entry) => sum + (entry.payload[dataKey] ?? 0), 0);
  }

  // 4. Sommiamo gli spicchi tagliati all'eventuale scarto matematico per arrivare a 100
  const baseResidualSum = baseResidualEntry ? (baseResidualEntry.payload[dataKey] ?? 0) : 0;
  const finalResidualSum = cutOffSum + baseResidualSum;

  // 5. Se la somma degli esclusi o dello scarto è > 0, aggiungiamo "Altro" nella scroll
  if (finalResidualSum > 0.01) {
    displayData.push({
      value: residualLabel,
      color: 'hsl(215, 15%, 60%)', // Colore fisso per "Altro"
      payload: {
        [dataKey]: finalResidualSum,
        isResidual: true 
      }
    });
  }

  return (
    <div className="custom-scrollbar w-full max-h-[120px] overflow-y-auto pt-4 mt-2.5 border-t border-white/10">
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
                // Preveniamo il click sulla voce "Altro" aggregata
                if (!isResidual && onItemClick) onItemClick(entry.payload);
              }}
              className={`flex items-center mb-2 text-sm text-gray-300 py-1 px-2 rounded transition-colors duration-200 ${
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
  );
}