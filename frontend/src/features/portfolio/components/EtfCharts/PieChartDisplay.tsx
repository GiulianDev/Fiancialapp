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
}

export function PieChartDisplay({ 
  data, 
  dataKey, 
  nameKey, 
  title, 
  subtitle,
  maxItems, 
  residualLabel = 'Altro' 
}: PieChartDisplayProps) {

  // 🧠 1. Logica di aggregazione centralizzata dei dati
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

  // 🎨 2. Generatore di Palette Dinamica basato sull'Angolo Aureo
  const chartColors = useMemo(() => {
    const totalItems = processedData.length;
    if (totalItems === 0) return [];

    // Tonalità di partenza (220 = un blu/azzurro finanziario molto elegante)
    const baseHue = 220; 
    // L'angolo aureo garantisce la massima separazione visiva sul cerchio cromatico
    const goldenAngle = 137.507764; 

    return Array.from({ length: totalItems }, (_, index) => {
      // 🕵️‍♂️ UX Special Case: Se è l'ultimo elemento ed è il blocco "Altro", usiamo un grigio neutro elegante
      if (index === totalItems - 1 && processedData[index][nameKey] === residualLabel) {
        return 'hsl(215, 15%, 60%)'; 
      }

      // Calcolo matematico della tonalità (Hue)
      const hue = (baseHue + index * goldenAngle) % 360;
      
      // Saturazione costante al 65% per dare un effetto "pastello/premium" coerente
      const saturation = 65; 
      
      // Alterniamo la luminosità (Lightness) tra il 50% e il 60% per dare contrasto extra alle fette vicine
      const lightness = index % 2 === 0 ? 50 : 60;

      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });
  }, [processedData, nameKey, residualLabel]);

  return (
    <div className="etf-charts__chart" style={{ width: '100%' }}>
      <h4>{title}</h4>
      {subtitle && 
        <p style={{ fontSize: '14px', color: '#555', fontStyle: 'italic' }}>
          {subtitle}
        </p>
      } 

      <ResponsiveContainer width="99%" height={350}>
        <PieChart>
          <Pie  
            data={processedData} 
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={100} 
          >
            {processedData.map((_, index) => (
              <Cell 
                key={`cell-${title}-${index}`} 
                fill={chartColors[index]} // 🎯 Colore calcolato dinamicamente per l'indice corrente
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${(value as number).toFixed(2)}%`} />
          <Legend content={<CustomScrollableLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}