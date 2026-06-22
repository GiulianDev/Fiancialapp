// src/features/portfolio/components/EtfCharts/PieChartDisplay.tsx

import { useMemo, useState } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend, Sector } from 'recharts';
import { CustomScrollableLegend } from './CustomScrollableLegend';

interface PieChartDisplayProps {
  data: Array<Record<string, any>>; 
  dataKey: string;
  nameKey: string;
  title?: string;
  subtitle?: string;
  maxItems?: number;       
  residualLabel?: string;  
  onItemClick?: (item: Record<string, any>) => void; 
}

export function PieChartDisplay({ 
  data, 
  dataKey, 
  nameKey,
  title = "Titolo", 
  subtitle,
  maxItems = 5, 
  residualLabel = 'Altro',
  onItemClick 
}: PieChartDisplayProps) {

  // 🎯 Solleviamo lo stato qui, così il sottotitolo può leggerlo
  const [visibleCount, setVisibleCount] = useState(maxItems);

  // 1. Elaborazione per la Torta: NESSUN TAGLIO (maxItems), solo calcolo per arrivare a 100%
  const processedData = useMemo(() => {
    const parseValue = (item: Record<string, any>): number => {
      if (!item || item[dataKey] === undefined || item[dataKey] === null) return 0;
      const val = typeof item[dataKey] === 'string' 
        ? Number(item[dataKey].replace(',', '.')) 
        : Number(item[dataKey]);
      return isNaN(val) ? 0 : val;
    };

    const totalInputSum = data.reduce((sum, item) => sum + parseValue(item), 0);
    const normalizedInputSum = Number(totalInputSum.toFixed(4));
    const baseResidual = normalizedInputSum < 100 ? (100 - normalizedInputSum) : 0;

    const sorted = [...data].sort((a, b) => parseValue(b) - parseValue(a));

    if (baseResidual > 0.01) {
      return [
        ...sorted,
        {
          [nameKey]: residualLabel,
          [dataKey]: Number(baseResidual.toFixed(2)), 
        },
      ];
    }

    return sorted;
  }, [data, dataKey, nameKey, residualLabel]);

  // 2. Assegnazione Colori per tutti gli spicchi
  const chartDataWithStyles = useMemo(() => {
    const totalItems = processedData.length;
    if (totalItems === 0) return [];

    const baseHue = 220; 
    const goldenAngle = 137.507764; 

    return processedData.map((item, index) => {
      const isResidual = index === totalItems - 1 && item[nameKey] === residualLabel;
      
      let fillUrl = '';
      if (isResidual) {
        fillUrl = 'hsl(215, 15%, 60%)'; 
      } else {
        const hue = (baseHue + index * goldenAngle) % 360;
        const saturation = 65; 
        const lightness = index % 2 === 0 ? 50 : 60;
        fillUrl = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      }

      return {
        ...item,
        fill: fillUrl,
        isResidual
      };
    });
  }, [processedData, nameKey, residualLabel]);

  const handleItemClick = (entry: any) => {
    if (!onItemClick) return;
    const item = entry?.payload || entry; 
    if (item && item[nameKey] === residualLabel) return;
    onItemClick(item);
  };

  // 🎯 Calcoli per il sottotitolo
  const totalItems = data.length;
  const displayedCount = Math.min(visibleCount, totalItems);

  return (
    <div className="w-full flex flex-col">
      <h4 className="text-md font-medium text-gray-300 border-b border-white/10 pb-2 mb-2">{title}</h4>
      
      {/* 🎯 Sottotitolo aggiornato per mostrare n su totale */}
      <p className="text-xs text-gray-500 italic mb-3">
        {subtitle && <span className="mr-1">{subtitle} •</span>}
        Mostrati {displayedCount} su {totalItems} elementi
      </p>

      <ResponsiveContainer width="99%" height={390}>
        <PieChart>
          <Pie  
            data={chartDataWithStyles} 
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={100} 
            onClick={handleItemClick}
            labelLine={true}
            shape={(props: any) => {
              const { isResidual } = props.payload;
              return (
                <Sector 
                  {...props} 
                  style={{ 
                    ...props.style, 
                    cursor: onItemClick && !isResidual ? 'pointer' : 'default',
                    outline: 'none' 
                  }} 
                />
              );
            }}
          />
          
          <Tooltip 
            formatter={(value) => `${(value as number).toFixed(2)}%`} 
            contentStyle={{ 
              backgroundColor: '#1e1e2e', 
              borderColor: '#313244', 
              borderRadius: '8px', 
              color: '#cdd6f4' 
            }}
          />

          {/* Passiamo lo stato e la funzione per aggiornarlo alla legenda */}
          <Legend 
            content={
              <CustomScrollableLegend 
                dataKey={dataKey} 
                maxItems={maxItems}
                residualLabel={residualLabel}
                onItemClick={handleItemClick}
                visibleCount={visibleCount} 
                setVisibleCount={setVisibleCount} 
              />
            } 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}