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
  onItemClick?: (item: Record<string, any>) => void; 
}

export function PieChartDisplay({ 
  data, 
  dataKey, 
  nameKey,
  title, 
  subtitle,
  maxItems, 
  residualLabel = 'Altro',
  onItemClick 
}: PieChartDisplayProps) {

  // Elaborazione dei dati con calcolo matematico del 100% e del taglio maxItems
  const processedData = useMemo(() => {
    // Funzione helper per estrarre in modo sicuro il valore numerico
    const parseValue = (item: Record<string, any>): number => {
      if (!item || item[dataKey] === undefined || item[dataKey] === null) return 0;
      const val = typeof item[dataKey] === 'string' 
        ? Number(item[dataKey].replace(',', '.')) 
        : Number(item[dataKey]);
      return isNaN(val) ? 0 : val;
    };

    // 1. Calcoliamo la somma totale di TUTTI i dati inseriti dall'utente
    const totalInputSum = data.reduce((sum, item) => sum + parseValue(item), 0);
    
    // 2. Se la somma è inferiore a 100, calcoliamo il residuo "nativo" mancante di base
    // Arrotondiamo a 4 decimali per evitare i classici bug di approssimazione di JavaScript (es. 99.999999)
    const normalizedInputSum = Number(totalInputSum.toFixed(4));
    const baseResidual = normalizedInputSum < 100 ? (100 - normalizedInputSum) : 0;

    // 3. Ordiniamo i dati iniziali in ordine decrescente
    const sorted = [...data].sort((a, b) => parseValue(b) - parseValue(a));

    let topItems = sorted;
    let cutOffResidual = 0;

    // 4. Se è impostato un limite ed è superato, isoliamo i primi N elementi e sommiamo gli altri
    if (maxItems && sorted.length > maxItems) {
      topItems = sorted.slice(0, maxItems);
      cutOffResidual = sorted.slice(maxItems).reduce((sum, item) => sum + parseValue(item), 0);
    }

    // 5. Il residuo finale sarà la somma di quello che mancava al 100% + gli elementi tagliati
    const finalResidualWeight = baseResidual + cutOffResidual;

    // Se c'è un residuo significativo (maggiore dello 0.01%), appendiamo la fetta "Altro"
    if (finalResidualWeight > 0.01) {
      return [
        ...topItems,
        {
          [nameKey]: residualLabel,
          // Fissiamo a 2 decimali per la visualizzazione pulita nel grafico
          [dataKey]: Number(finalResidualWeight.toFixed(2)), 
        },
      ];
    }

    return topItems;
  }, [data, dataKey, nameKey, maxItems, residualLabel]);

  // Generazione dinamica dei colori (mantiene un colore neutro/grigio per il Residuo)
  const chartColors = useMemo(() => {
    const totalItems = processedData.length;
    if (totalItems === 0) return [];

    const baseHue = 220; 
    const goldenAngle = 137.507764; 

    return Array.from({ length: totalItems }, (_, index) => {
      // Se l'elemento corrente è l'ultimo ed è la fetta dei residui ("Altro"), assegna il colore grigio desaturato
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
            onClick={(entry) => onItemClick && onItemClick(entry.payload || entry)}
            style={{ cursor: onItemClick ? 'pointer' : 'default' }}
          >
            {processedData.map((_, index) => (
              <Cell 
                key={`cell-${title}-${index}`} 
                fill={chartColors[index]} 
              />
            ))}
          </Pie>
          
          {/* Tooltip unico personalizzato con lo stile dark */}
          <Tooltip 
            formatter={(value) => `${(value as number).toFixed(2)}%`} 
            contentStyle={{ 
              backgroundColor: '#1e1e2e', 
              borderColor: '#313244', 
              borderRadius: '8px', 
              color: '#cdd6f4' 
            }}
          />

          {/* Legenda Custom Scrollable con passaggio dell'handler di click */}
          <Legend content={<CustomScrollableLegend onItemClick={onItemClick} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}