import { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useHoldingHistory } from '../hooks/useHolding';
// Importiamo il tuo componente Card (regola il path se necessario)
import { Card } from '../../../shared/ui/Card/Card';

interface Props {
  isin: string;
}

const PERIODS = [
  { label: '1 Mese', value: '1mo' },
  { label: '6 Mesi', value: '6mo' },
  { label: '1 Anno', value: '1y' },
  { label: '5 Anni', value: '5y' }
];

export function HoldingChart({ isin }: Props) {
  const [period, setPeriod] = useState<string>('1y');
  const { data, isLoading, error } = useHoldingHistory(isin, period);

  if (error) return <div className="p-4 text-red-400 font-semibold">Errore grafico: {error.message}</div>;

  return (
    // 1. Sostituito il div con la TUA Card per ereditare ombre, bordi e sfondi sfumati
    <Card className="w-full mt-6">
      
      {/* Header del grafico */}
      <div className="flex justify-between items-center mb-6">
        {/* Scritta principale in grigio chiaro/bianco coerente */}
        <h3 className="text-xl font-bold text-gray-100">Andamento Azionario</h3>
        
        {/* Selettore del periodo adattato allo stile scuro/trasparente */}
        <div className="flex space-x-2 bg-white/10 p-1 rounded-md backdrop-blur-sm">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                period === p.value 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenitore Grafico */}
      <div className="h-[350px] w-full">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400 animate-pulse">
            Caricamento grafico in corso...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.andamento} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              {/* Linee di griglia opache e discrete che si fondono con lo sfondo della card */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.1)" />
              
              {/* Assi con scritte grigie coordinate (gray-400) leggibili */}
              <XAxis 
                dataKey="data" 
                tick={{ fontSize: 12, fill: '#9ca3af' }} 
                tickMargin={10}
                minTickGap={30}
                stroke="rgba(255, 255, 255, 0.1)"
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                stroke="rgba(255, 255, 255, 0.1)"
              />
              
              {/* Tooltip con sfondo scuro/antracite e testi chiari antiriflesso */}
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid rgba(255, 255, 255, 0.15)', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                }}
                formatter={(value: any) => {
                  if (typeof value === 'number') {
                    return [`$${value.toFixed(2)}`, 'Prezzo'];
                  }
                  return [String(value ?? ''), 'Prezzo'];
                }}
                labelStyle={{ color: '#f3f4f6', fontWeight: 'bold', marginBottom: '4px' }}
                itemStyle={{ color: '#9ca3af' }}
              />
              
              <Area 
                type="monotone" 
                dataKey="prezzo" 
                stroke="#3b82f6" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}