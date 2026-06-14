import { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useHoldingHistory } from '../hooks/useHolding';

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
  // Stato locale solo per il selettore del tempo
  const [period, setPeriod] = useState<string>('1y');
  
  const { data, isLoading, error } = useHoldingHistory(isin, period);

  if (error) return <div className="p-4 text-red-500">Errore grafico: {error.message}</div>;

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Andamento Azionario</h3>
        
        {/* Selettore del periodo */}
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-md">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                period === p.value ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'
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
            {/* Usiamo AreaChart invece di LineChart per un look più moderno (stile Robinhood) */}
            <AreaChart data={data?.andamento} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="data" 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                tickMargin={10}
                minTickGap={30} // Evita sovrapposizione delle date
              />
              <YAxis 
                domain={['auto', 'auto']} // Scala automatica sui massimi e minimi
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => {
                  // 1. Se è un numero puro (il caso normale), formattiamo con i decimali
                  if (typeof value === 'number') {
                    return [`$${value.toFixed(2)}`, 'Prezzo'];
                  }
                  
                  // 2. Se Recharts impazzisce e ci passa array o undefined,
                  // facciamo un cast a stringa sicuro per evitare crash dell'UI.
                  return [String(value ?? ''), 'Prezzo'];
                }}
                labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="prezzo" 
                stroke="#2563eb" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}