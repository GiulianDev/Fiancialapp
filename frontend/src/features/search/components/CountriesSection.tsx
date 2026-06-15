import { PieChartDisplay } from '@/features/portfolio/components/EtfCharts/PieChartDisplay';
import { type Country } from '../../../shared/types/etf';
import { Button } from '@/shared/ui';

interface CountriesSectionProps {
  countries: Country[];
  limite: number;
  onLoadMore: () => void;
  isLoading?: boolean;
}

export function CountriesSection({ countries, limite, onLoadMore, isLoading = false }: CountriesSectionProps) {
  const countriesSorted = [...countries].sort((a, b) => b.peso - a.peso);
  const countriesToShow = countriesSorted.slice(0, limite);

  return (
    <div style={{ flex: '1', minWidth: '200px' }}>
      
      {isLoading ? (
        // ToDo - gestire il caricamento al posto dello skeleton con un componente più specifico  <>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
          {[...Array(5)].map((_, i) => (
            <li key={i} className="skeleton" style={{ height: '16px', margin: '6px 0', width: `${70 - i * 8}%` }} />
          ))}
        </ul>
      ) : countriesSorted.length > 0 ? (
        <>
          <PieChartDisplay
            data={countries}
            dataKey="peso"
            nameKey="nome"
            title="Esposizione Geografica"
            subtitle={`Visualizzate ${countriesToShow.length} di ${countriesSorted.length} paesi mappati`}
            maxItems={countriesToShow.length}
            residualLabel="Altre aziende"
          />

          {limite < countriesSorted.length && (
            <Button onClick={onLoadMore}>
              Mostra altri 5 ({countriesSorted.length - limite} rimanenti)
            </Button>
          )}
          
        </>
      ) : (
        <p>Dati geografici non disponibili per questo asset.</p>
      )}
    </div>
  );
}
