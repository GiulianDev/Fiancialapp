// src/features/portfolio/components/EtfCharts/PieChartDisplay.tsx

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CustomScrollableLegend } from './CustomScrollableLegend';

interface PieChartDisplayProps {
  data: Array<Record<string, any>>; 
  dataKey: string;
  nameKey: string;
  title: string;
  subtitle?: string;
  maxItems?: number;       
  residualLabel?: string;  
  onItemClick?: (item: Record<string, any>) => void; // 🎯 NUOVA: Event handler generico
}

export function PieChartDisplay({ 
  data, 
  dataKey, 
  nameKey,
  title, 
  subtitle,
  maxItems, 
  residualLabel = 'Altro',
  onItemClick // 🎯 Estraiamo la prop
}: PieChartDisplayProps) {

  const processedData = useMemo(() => {
    if (!maxItems || data.length <= maxItems) {
      return [...data].sort((a, b) => (b[dataKey] || 0) - (a[dataKey] || 0));
    }

    const sorted = [...data].sort((a, b) => (b[dataKey] || 0) - (a[dataKey] || 0));
    const topItems = sorted.slice(0, maxItems);
    
    const residualWeight = sorted
      .slice(maxItems)
      .reduce((sum, item) => sum + (Number(item[dataKey]) || 0), 0);

    if (residualWeight > 0) {
      return [
        ...topItems,
        {
          [nameKey]: residualLabel,
          [dataKey]: residualWeight,
        },
      ];
    }

    return topItems;
  }, [data, dataKey, nameKey, maxItems, residualLabel]);

  const chartColors = useMemo(() => {
    const totalItems = processedData.length;
    if (totalItems === 0) return [];

    const baseHue = 220; 
    const goldenAngle = 137.507764; 

    return Array.from({ length: totalItems }, (_, index) => {
      if (index === totalItems - 1 && processedData[index][nameKey] === residualLabel) {
        return 'hsl(215, 15%, 60%)'; 
      }
      
      const hue = (baseHue + index * goldenAngle) % 360;
      const saturation = 65; 
      const lightness = index % 2 === 0 ? 50 : 60;

      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });
  }, [processedData, nameKey, residualLabel]);

  return (
    <div className="w-full flex flex-col">
      <h4 className="text-md font-medium text-gray-300 border-b border-white/10 pb-2 mb-2">{title}</h4>
      
      {/* 🎯 Unico blocco per il sottotitolo: pulito e protetto dal controllo condizionale */}
      {subtitle && (
        <p className="text-xs text-gray-500 italic mb-3">
          {subtitle}
        </p>
      )} 

      <ResponsiveContainer width="99%" height={350}>
        <PieChart>
          <Pie  
            data={processedData} 
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={100} 
            // 🎯 Intercettiamo il click sulla fetta del grafico
            onClick={(entry) => onItemClick && onItemClick(entry.payload || entry)}
            style={{ cursor: onItemClick ? 'pointer' : 'default' }} // Cambia il cursore
          >
            {processedData.map((_, index) => (
              <Cell 
                key={`cell-${title}-${index}`} 
                fill={chartColors[index]} 
              />
            ))}
          </Pie>
          
          <Tooltip 
            formatter={(value) => `${(value as number).toFixed(2)}%`} 
            contentStyle={{ backgroundColor: '#1e1e2e', borderColor: '#313244', borderRadius: '8px', color: '#cdd6f4' }}
          />

          {/* <CustomScrollableLegend /> */}

          <Tooltip 
            formatter={(value) => `${(value as number).toFixed(2)}%`} 
          />

          {/* 🎯 Passiamo l'handler anche alla legenda */}
          <Legend content={<CustomScrollableLegend onItemClick={onItemClick} />} />

        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}