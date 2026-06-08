import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import React from 'react';

interface PieChartDisplayProps {
  data: Array<{ nome: string; peso_percentuale?: number; peso?: number }>;
  dataKey: string;
  nameKey: string;
  title: string;
}

const COLORS = [
  '#0066cc',
  '#ff6b6b',
  '#4ecdc4',
  '#45b7d1',
  '#f7b731',
  '#5f27cd',
  '#00d2d3',
  '#ff9ff3',
  '#54a0ff',
  '#48dbfb',
  '#aaa',
];

export function PieChartDisplay({ data, dataKey, nameKey, title }: PieChartDisplayProps) {
  return (
    <div className="etf-charts__chart">
      <h4>{title}</h4>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie  
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={100} 
            // Rimosse le etichette dirette sul grafico per evitare tagli
            // labelLine={false} // Non più necessaria senza la prop 'label'
            // label={(entry) => `${String(entry.name).slice(0, 10)}: ${Number(entry.value).toFixed(1)}%`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${title}-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${(value as number).toFixed(2)}%`} />
          {/* Wrapper per la legenda con altezza fissa e scrollbar */}
          <Legend 
            wrapperStyle={{ 
              // paddingTop: '18px', 
              maxHeight: '120px', // Altezza massima fissa per la legenda
              overflowY: 'auto',   // Abilita lo scroll verticale se il contenuto è maggiore
              width: '100%'        // Assicura che occupi la larghezza disponibile
            }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
