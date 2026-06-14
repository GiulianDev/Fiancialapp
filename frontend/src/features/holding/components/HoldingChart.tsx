import { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useHoldingHistory } from '../hooks/useHolding';
import { Card } from '../../../shared/ui/Card/Card';

interface Props {
  isin: string;
}

const PERIODS = [
  { label: '1M', value: '1mo' }, // Accorciato etichette per mobile
  { label: '6M', value: '6mo' },
  { label: '1A', value: '1y' },
  { label: '5A', value: '5y' }
];

export function HoldingChart({ isin }: Props) {
  const [period, setPeriod] = useState<string>('1y');
  const { data, isLoading, error } = useHoldingHistory(isin, period);

  if (error) return <div className="p-4 text-red-400 font-semibold">Errore grafico: {error.message}</div>;

  return (
    <Card className="w-full mt-6">
      
      {/* Header Responsivo */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-lg font-bold text-gray-100 whitespace-nowrap">
          Andamento
        </h3>
        
        {/* Selettore Periodi */}
        <div className="flex bg-white/5 p-1 rounded-lg backdrop-blur-sm w-full sm:w-auto">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                period === p.value 
                  ? 'bg-blue-600/80 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenitore Grafico con altezza fissa per evitare il collasso */}
      <div className="h-[250px] w-full">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500 animate-pulse">
            Caricamento dati...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={data?.andamento} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <XAxis 
                dataKey="data" 
                hide={true} // Nascondiamo le date su mobile per pulizia visiva
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickFormatter={(value) => value.toFixed(0)}
                stroke="transparent"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="prezzo" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}