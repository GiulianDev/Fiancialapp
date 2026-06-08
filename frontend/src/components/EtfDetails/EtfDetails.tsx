import { type EtfData, type Country } from '../../types/etf';
import { type FirebaseUser } from '../../firebase';
import { HoldingsSection } from '../HoldingsSection';
import { CountriesSection } from '../CountriesSection';
import { Card } from '../ui/Card/Card';
import './EtfDetails.css';

interface EtfDetailsProps {
  data: EtfData;
  limiteHoldings: number;
  limiteCountries: number;
  onLoadMoreHoldings: () => void;
  onLoadMoreCountries: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  user?: FirebaseUser | null;
  onHoldingClick?: (isin: string, name: string) => void;
}

export function EtfDetails({
  data,
  limiteHoldings,
  limiteCountries,
  onLoadMoreHoldings,
  onLoadMoreCountries,
  isFavorite = false,
  onToggleFavorite,
  onHoldingClick,
  user,
}: EtfDetailsProps) {
  const countriesArray: Country[] = Object.entries(data.countries).map(([nome, peso]) => ({
    nome,
    peso,
  }));

  return (
    <Card className="etf-details--container mx-auto w-12/12 md:max-w-3xl">
      
      {/* HEADER */}
      <div className="header--container">
        
        {/* INFO */}
        <div className="info--container">
          <h2 className="title">{data.nome}</h2>
          <p className="subtitle">
            ISIN: <strong>{data.isin}</strong> | Tipo Asset: <strong>{data.tipo_asset}</strong>
          </p>
          {data.costo_annuo && data.costo_annuo > 0 && (
            <p className="subtitle">
              TER (Costo Annuo): <strong>{data.costo_annuo}%</strong>
            </p>
          )}
        </div>

        {/* FAVORITES */}
        <div className='favorite--container'>
          {user && onToggleFavorite && (
            <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={onToggleFavorite}
            aria-label={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
            title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          )}
        </div>
        {/* IF USER NOT LOG-IN */}
        {!user && (
          <p className="etf-details__favorite-hint">Accedi per salvare questo ETF nei preferiti.</p>
        )}
      </div>

      <div className="etf-details__grid">
        <HoldingsSection
          holdings={data.holdings}
          totaleHoldings={data.totale_holdings}
          limite={limiteHoldings}
          onLoadMore={onLoadMoreHoldings}
          onHoldingClick={onHoldingClick}
        />

        <CountriesSection
          countries={countriesArray}
          limite={limiteCountries}
          onLoadMore={onLoadMoreCountries}
        />
      </div>
      
    </Card>
  );
}
