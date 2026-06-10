import { type Holding } from '../../../shared/types/etf';
import { Button } from '../../../shared/ui/Button';
import { useNavigate } from 'react-router';

interface HoldingsSectionProps {
  holdings: Holding[];
  totaleHoldings: number;
  limite: number;
  onLoadMore: () => void;
  isLoading?: boolean;
}

/**
 * COMPONENTE SELF-CONTAINED
 * 
 * Pattern senior: il componente usa useNavigate direttamente invece di
 * aspettare un callback dall'alto. Questo rende il componente autonomo
 * e riduce il prop drilling.
 */
export function HoldingsSection({
  holdings, totaleHoldings, limite, onLoadMore,
  isLoading = false,
}: HoldingsSectionProps) {
  const navigate = useNavigate();
  
  const handleHoldingClick = (isin: string, name: string) => {
    navigate(`/holding/${isin}`, { state: { name } });
  };

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

      {isLoading ? (
        <>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            {[...Array(5)].map((_, i) => (
              <li key={i} className="skeleton" style={{ height: '18px', margin: '6px 0', width: `${80 - i * 8}%` }} />
            ))}
          </ul>
        </>
      ) : holdingsSorted.length > 0 ? (
        <>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            {holdingsToShow.map((h, i) => (
              <li 
                key={i}
                className={h.isin ? "cursor-pointer hover:bg-gray-700 p-1 rounded transition-colors" : ""}
                onClick={() => h.isin && handleHoldingClick(h.isin, h.nome)}
                style={h.isin ? { cursor: 'pointer' } : {}}
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