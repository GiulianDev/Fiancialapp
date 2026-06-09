import { type EtfData, type Country } from '../../types/etf';
import { HoldingsSection } from '../HoldingsSection';
import { CountriesSection } from '../CountriesSection';
import { Card } from '../ui/Card/Card';
import './EtfDetails.css';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

interface EtfDetailsProps {
  data?: EtfData;
  limiteHoldings: number;
  limiteCountries: number;
  onLoadMoreHoldings: () => void;
  onLoadMoreCountries: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onHoldingClick?: (isin: string, name: string) => void;
  isFetching?: boolean;
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
  isFetching = false,
}: EtfDetailsProps) {
  
  const { user } = useAuth(); 
  const countriesArray: Country[] = data ? Object.entries(data.countries).map(([nome, peso]) => ({
    nome,
    peso,
  })) : [];

  // 👇 LA CHIAVE: Mostriamo lo skeleton completo solo se non abbiamo ancora nessun dato.
  // Se i dati dell'ETF precedente ci sono già, li teniamo visualizzati per non far saltare l'altezza.
  const showSkeleton = !data;

  return (
    <motion.div 
      layout 
      transition={{ 
        layout: { 
          type: "tween",
          ease: "easeInOut",
          duration: 0.4 // Transizione morbida e controllata
        } 
      }}
      className="etf-details__wrapper mx-auto w-12/12 md:max-w-3xl"
    >
    
      {/* 👇 Aggiungiamo la classe 'is-fetching' se stiamo aggiornando l'ETF in background */}
      <Card className={`etf-details--container w-full ${isFetching ? 'is-fetching' : ''}`}>
        
        {/* 👇 Se sta caricando ed esiste già un vecchio ETF, mostriamo una linea di progresso sleek */}
        {isFetching && data && (
          <div className="etf-details__loading-bar" />
        )}

        {/* HEADER */}
        <motion.div layout="position" className="header--container">
          
          {/* INFO */}
          <motion.div layout="position" className="info--container">
            {showSkeleton ? (
              <>
                <motion.div layout="position" className="skeleton skeleton-title" style={{ width: '60%', height: '28px', marginBottom: '8px' }} />
                <motion.div layout="position" className="skeleton skeleton-sub" style={{ width: '45%', height: '16px', marginBottom: '6px' }} />
              </>
            ) : (
              <>
                <motion.h2 layout="position" className="title">{data.nome}</motion.h2>
                <motion.p layout="position" className="subtitle">
                  ISIN: <strong>{data.isin}</strong> | Tipo Asset: <strong>{data.tipo_asset}</strong>
                </motion.p>
                {data.costo_annuo && data.costo_annuo > 0 && (
                  <motion.p layout="position" className="subtitle">
                    TER (Costo Annuo): <strong>{data.costo_annuo}%</strong>
                  </motion.p>
                )}
              </>
            )}
          </motion.div>

          {/* ADD TO FAVORITES BUTTON */}
          <motion.div layout="position" className='favorite--container'>
            {user && onToggleFavorite && (
              <button
                className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                onClick={onToggleFavorite}
                aria-label={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                disabled={showSkeleton}
              >
                {showSkeleton ? (
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                ) : (
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
                )}
              </button>
            )}
          </motion.div>

          {!user && (
            <motion.p layout="position" className="etf-details__favorite-hint">Accedi per salvare questo ETF nei preferiti.</motion.p>
          )}
        </motion.div>

        {/* GRIGLIA */}
        <motion.div layout="position" className="etf-details__grid">
          <HoldingsSection
            holdings={data?.holdings ?? []}
            totaleHoldings={data?.totale_holdings ?? 0}
            limite={limiteHoldings}
            onLoadMore={onLoadMoreHoldings}
            onHoldingClick={onHoldingClick}
            // 👇 Iniettiamo lo showSkeleton modificato così anche la griglia non collassa a vuoto
            isLoading={showSkeleton}
          />

          <CountriesSection
            countries={countriesArray}
            limite={limiteCountries}
            onLoadMore={onLoadMoreCountries}
            isLoading={showSkeleton}
          />
        </motion.div>
        
      </Card>

    </motion.div>
  );
}