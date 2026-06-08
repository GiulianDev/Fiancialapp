import { type Country } from '../types/etf';
import { Button } from './ui/Button';

interface CountriesSectionProps {
  countries: Country[];
  limite: number;
  onLoadMore: () => void;
}

export function CountriesSection({ countries, limite, onLoadMore }: CountriesSectionProps) {
  const countriesSorted = [...countries].sort((a, b) => b.peso - a.peso);
  const countriesToShow = countriesSorted.slice(0, limite);

  return (
    <div style={{ flex: '1', minWidth: '200px' }}>
      <h3 style={{ borderBottom: '2px solid #0066cc', paddingBottom: '5px' }}>
        Esposizione Geografica
      </h3>

      <p style={{ fontSize: '14px', color: '#555', fontStyle: 'italic' }}>
        Visualizzati <strong>{countriesToShow.length}</strong> di <strong>{countriesSorted.length}</strong> paesi mappati
      </p>

      {countriesSorted.length > 0 ? (
        <>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            {countriesToShow.map((c, i) => (
              <li key={i}>
                {c.nome}: <strong>{c.peso.toFixed(2)}%</strong>
              </li>
            ))}
          </ul>

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
