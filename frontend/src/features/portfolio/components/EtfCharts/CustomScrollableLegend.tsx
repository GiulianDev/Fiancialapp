import type { LegendProps } from 'recharts';

interface CustomScrollableLegendProps extends LegendProps {
  payload?: Array<{
    value: string; // Il nome dell'elemento della legenda (es. nome dell'azienda/paese)
    color: string; // Il colore corrispondente alla fetta del grafico
    // `data` contiene l'oggetto originale passato alla Pie, che include nome e peso/peso_percentuale
    payload: { nome: string; peso_percentuale?: number; peso?: number }; 
  }>;
}

export function CustomScrollableLegend({ payload }: CustomScrollableLegendProps) {
  const sortedPayload = payload 
    ? [...payload].sort((a, b) => {
        const valA = a.payload.peso_percentuale ?? a.payload.peso ?? 0;
        const valB = b.payload.peso_percentuale ?? b.payload.peso ?? 0;
        return valB - valA; // Ordine decrescente
      })
    : [];

  return (
    <div 
      className="custom-scrollbar" // Applichiamo la classe qui
      style={{
        maxHeight: '120px', 
        overflowY: 'auto',   
        width: '100%',        
        paddingTop: '16px',
        marginTop: '10px', // Spazio tra grafico e legenda
        borderTop: '1px solid rgba(255, 255, 255, 0.1)' // Separatore visivo
      }}
    >
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {sortedPayload?.map((entry, index) => { // Usiamo il payload ordinato
          const value = entry.payload.peso_percentuale ?? entry.payload.peso;
          const valueDisplay = value !== undefined ? `${value.toFixed(2)}%` : '';

          return (
            <li 
              key={`legend-item-${index}`} 
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px',
                fontSize: '0.9rem',
                color: '#e8def8'
              }}
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
