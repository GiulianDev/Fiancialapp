import { type Holding } from '../types/etf';
import { Button } from './ui/Button';

interface HoldingsSectionProps {
  holdings: Holding[];
  totaleHoldings: number;
  limite: number;
  onLoadMore: () => void;
  onHoldingClick?: (isin: string, name: string) => void;
}

export function HoldingsSection({
  holdings, totaleHoldings, limite, onLoadMore, onHoldingClick,
}: HoldingsSectionProps) {
  const holdingsSorted = [...holdings].sort((a, b) => b.peso_percentuale - a.peso_percentuale);
  const holdingsToShow = holdingsSorted.slice(0, limite);

  return (
    <div style={{ flex: '1', minWidth: '200px' }}>
      <h3 style={{ borderBottom: '2px solid #0066cc', paddingBottom: '5px' }}>
        Top Partecipazioni
      </h3>

      <p style={{ fontSize: '14px', color: '#555', fontStyle: 'italic' }}>
        Visualizzate <strong>{holdingsToShow.length}</strong> di <strong>{holdingsSorted.length}</strong> in anteprima
        (Aziende totali: <strong>{totaleHoldings}</strong>)
      </p>

      {holdingsSorted.length > 0 ? (
        <>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            {holdingsToShow.map((h, i) => (
              <li 
                key={i}
                // Il click e l'hover si attivano SOLO se c'è un ISIN valido
                className={h.isin && onHoldingClick ? "cursor-pointer hover:bg-gray-700 p-1 rounded transition-colors" : ""}
                onClick={() => h.isin && onHoldingClick && onHoldingClick(h.isin, h.nome)}
                style={h.isin && onHoldingClick ? { cursor: 'pointer' } : {}}
              >
                {h.nome}: <strong>{h.peso_percentuale.toFixed(2)}%</strong>
              </li>
            ))}
          </ul>

          {limite < holdingsSorted.length && (
            <Button onClick={onLoadMore}>
              Mostra altri 5 ({holdingsSorted.length - limite} rimanenti)
            </Button>
          )}
        </>
      ) : (
        <p>Dati partecipazioni non disponibili.</p>
      )}
    </div>
  );
}