import type { LegendProps } from 'recharts';

interface CustomScrollableLegendProps extends LegendProps {
  payload?: Array<{
    value: string; 
    color: string; 
    payload: Record<string, any>; // 🎯 Modificato per accettare tipi flessibili dal chart
  }>;
  onItemClick?: (item: Record<string, any>) => void; // 🎯 Prop in ingresso
}

export function CustomScrollableLegend({ payload, onItemClick }: CustomScrollableLegendProps) {
  const sortedPayload = payload?.sort((a, b) => {
    const valA = a.payload.peso_percentuale ?? a.payload.peso ?? 0;
    const valB = b.payload.peso_percentuale ?? b.payload.peso ?? 0;
    return valB - valA; 
  });

  return (
    <div 
      className="custom-scrollbar" 
      style={{
        maxHeight: '120px', 
        overflowY: 'auto',   
        width: '100%',        
        paddingTop: '16px',
        marginTop: '10px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
      }}
    >
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {sortedPayload?.map((entry, index) => { 
          const value = entry.payload.peso_percentuale ?? entry.payload.peso;
          const valueDisplay = value !== undefined ? `${value.toFixed(2)}%` : '';

          return (
            <li 
              key={`legend-item-${index}`} 
              onClick={() => onItemClick && onItemClick(entry.payload)} // 🎯 Trigger al click
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px',
                fontSize: '0.9rem',
                color: '#e8def8',
                cursor: onItemClick ? 'pointer' : 'default', // 🎯 Effetto hover
                transition: 'background-color 0.2s',
                borderRadius: '4px',
                padding: '2px 4px', // Leggero padding per l'area di click
              }}
              // Aggiungiamo hover state simulato per dare feedback visivo
              onMouseEnter={(e) => { if (onItemClick) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={(e) => { if (onItemClick) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  borderRadius: '3px',
                  backgroundColor: entry.color,
                  marginRight: '8px',
                }}
              />
              {entry.value}: <strong>{valueDisplay}</strong>
          </li>
          );
        })}
      </ul>
    </div>
  );
}