// src/features/portfolio/components/EtfCharts/CustomScrollableLegend.tsx

import type { LegendProps } from 'recharts';

interface CustomScrollableLegendProps extends LegendProps {
  dataKey: string; // 🎯 Aggiunta per rendere dinamica la lettura del valore
  payload?: Array<{
    value: string; 
    color: string; 
    payload: Record<string, any>;
  }>;
  onItemClick?: (item: Record<string, any>) => void;
}

export function CustomScrollableLegend({ payload, dataKey, onItemClick }: CustomScrollableLegendProps) {
  
  // Ordina i payload usando la dataKey dinamica passata dal grafico
  const sortedPayload = payload?.sort((a, b) => {
    const valA = a.payload[dataKey] ?? 0;
    const valB = b.payload[dataKey] ?? 0;
    return valB - valA; 
  });

  return (
    <div className="custom-scrollbar w-full max-h-[120px] overflow-y-auto pt-4 mt-2.5 border-t border-white/10">
      <ul className="list-none p-0 m-0">
        {sortedPayload?.map((entry, index) => { 
          // Estrapola il valore corretto dinamicamente
          const rawValue = entry.payload[dataKey];
          const value = typeof rawValue === 'number' ? rawValue : 0;
          const valueDisplay = `${value.toFixed(2)}%`;
          
          return (
            <li 
              key={`legend-item-${index}`} 
              onClick={() => onItemClick && onItemClick(entry.payload)}
              className={`flex items-center mb-2 text-sm text-gray-300 py-1 px-2 rounded transition-colors duration-200 ${
                onItemClick ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'
              }`}
            >
              <span
                className="inline-block w-3 h-3 rounded-sm mr-2 shrink-0"
                style={{ backgroundColor: entry.color }} // Recharts inietta il colore dinamicamente qui
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