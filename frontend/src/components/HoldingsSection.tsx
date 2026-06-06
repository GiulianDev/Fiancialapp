import { type Holding } from '../types/etf';

interface HoldingsSectionProps {
  holdings: Holding[];
  totaleHoldings: number;
  limite: number;
  onLoadMore: () => void;
}

export function HoldingsSection({
  holdings,
  totaleHoldings,
  limite,
  onLoadMore,
}: HoldingsSectionProps) {
  const holdingsSorted = [...holdings].sort((a, b) => b.peso_percentuale - a.peso_percentuale);
  const holdingsToShow = holdingsSorted.slice(0, limite);

  return (
    <div style={{ flex: '1', minWidth: '300px' }}>
      <h3 style={{ borderBottom: '2px solid #0066cc', paddingBottom: '5px' }}>
        Top Partecipazioni
      </h3>

      <p style={{ fontSize: '14px', color: '#555', fontStyle: 'italic' }}>
        Visualizzate <strong>{holdingsToShow.length}</strong> di <strong>{holdingsSorted.length}</strong> in anteprima
        (Aziende totali nel fondo: <strong>{totaleHoldings}</strong>)
      </p>

      {holdingsSorted.length > 0 ? (
        <>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            {holdingsToShow.map((h, i) => (
              <li key={i}>
                {h.nome}: <strong>{h.peso_percentuale.toFixed(2)}%</strong>
              </li>
            ))}
          </ul>

          {limite < holdingsSorted.length && (
            <button
              onClick={onLoadMore}
              style={{
                marginTop: '10px',
                padding: '6px 12px',
                cursor: 'pointer',
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            >
              Mostra altri 5 ({holdingsSorted.length - limite} rimanenti in anteprima)
            </button>
          )}
        </>
      ) : (
        <p>Dati partecipazioni non disponibili per questo asset.</p>
      )}
    </div>
  );
}
