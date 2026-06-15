import { PieChartDisplay } from '@/features/portfolio/components/EtfCharts/PieChartDisplay';
import { type Holding } from '../../../shared/types/etf';
import { useNavigate } from 'react-router';

interface HoldingsSectionProps {
  holdings: Holding[];
  totaleHoldings: number;
  limite: number;
  isLoading?: boolean;
}

export function HoldingsSection({
  holdings, totaleHoldings, limite,
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
      
      {isLoading ? (
        // ToDo - gestire il caricamento al posto dello skeleton con un componente più specifico
        <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
          {[...Array(5)].map((_, i) => (
            <li key={i} className="skeleton" style={{ height: '18px', margin: '6px 0', width: `${80 - i * 8}%` }} />
          ))}
        </ul>
      ) : holdingsSorted.length > 0 ? (
        <PieChartDisplay
          data={holdings}
          dataKey="peso_percentuale"
          nameKey="nome"
          title="Top Partecipazioni"
          subtitle={`Visualizzate ${holdingsToShow.length} di ${totaleHoldings} partecipazioni totali`}
          maxItems={20}
          residualLabel="Altre aziende"
          // 🎯 Passiamo la logica di click specifica per questo caso d'uso!
          onItemClick={(item) => {
            if (item.isin) {
              handleHoldingClick(item.isin, item.nome);
            }
          }}
        />
      ) : (
        <p>Dati partecipazioni non disponibili.</p>
      )}
    </div>
  );
}