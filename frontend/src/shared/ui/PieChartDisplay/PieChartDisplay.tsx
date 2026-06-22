// src/features/portfolio/components/EtfCharts/PieChartDisplay.tsx

import { useMemo } from 'react';
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
  subtitle = "Subtitle",
  maxItems = 5, 
  residualLabel = 'Altro',
  onItemClick 
}: PieChartDisplayProps) {

  // 1. Elaborazione dei dati con calcolo matematico del 100% e del taglio maxItems
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

    let topItems = sorted;
    let cutOffResidual = 0;

    if (maxItems && sorted.length > maxItems) {
      topItems = sorted.slice(0, maxItems);
      cutOffResidual = sorted.slice(maxItems).reduce((sum, item) => sum + parseValue(item), 0);
    }

    const finalResidualWeight = baseResidual + cutOffResidual;

    if (finalResidualWeight > 0.01) {
      return [
        ...topItems,
        {
          [nameKey]: residualLabel,
          [dataKey]: Number(finalResidualWeight.toFixed(2)), 
        },
      ];
    }

    return topItems;
  }, [data, dataKey, nameKey, maxItems, residualLabel]);

  // 2. Unione dei Dati con i Colori (Recharts 4.0 Pattern)
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

      // Restituiamo l'oggetto con la proprietà "fill" integrata e un flag di utilità
      return {
        ...item,
        fill: fillUrl,
        isResidual
      };
    });
  }, [processedData, nameKey, residualLabel]);

  // Intercettore del click: blocca l'evento se l'elemento è il residuo ("Altro")
  const handleItemClick = (entry: any) => {
    if (!onItemClick) return;
    
    const item = entry?.payload || entry; 
    
    if (item && item[nameKey] === residualLabel) {
      return;
    }

    onItemClick(item);
  };

  return (
    <div className="w-full flex flex-col">
      <h4 className="text-md font-medium text-gray-300 border-b border-white/10 pb-2 mb-2">{title}</h4>
      
      {subtitle && (
        <p className="text-xs text-gray-500 italic mb-3">
          {subtitle}
        </p>
      )} 

      <ResponsiveContainer width="99%" height={350}>
        <PieChart>
          <Pie  
            data={chartDataWithStyles} 
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={100} 
            onClick={handleItemClick}
            // Sostituisce il vecchio `<Cell>` usando la prop shape e il componente `<Sector>`
            shape={(props: any) => {
              // props contiene le posizioni generate da Recharts e i nostri dati in "payload"
              const { isResidual } = props.payload;
              
              return (
                <Sector 
                  {...props} 
                  style={{ 
                    ...props.style, 
                    cursor: onItemClick && !isResidual ? 'pointer' : 'default',
                    outline: 'none' // Evita il bordo azzurro bruttino al click su alcuni browser
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

          <Legend content={<CustomScrollableLegend onItemClick={handleItemClick} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}