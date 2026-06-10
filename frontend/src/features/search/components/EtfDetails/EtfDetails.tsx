import { motion } from 'framer-motion';
import type { Country, EtfData } from '@/shared/types';
// import { Card } from '@/shared/ui';,
import { HoldingsSection } from '../HoldingsSection';
import { CountriesSection } from '../CountriesSection';
import './EtfDetails.css';

interface EtfDetailsProps {
  data?: EtfData;
  limiteHoldings: number;
  limiteCountries: number;
  onLoadMoreHoldings: () => void;
  onLoadMoreCountries: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isFetching?: boolean;
  isUserLoggedIn?: boolean;
}

export function EtfDetails({
  data,
  limiteHoldings,
  limiteCountries,
  onLoadMoreHoldings,
  onLoadMoreCountries,
  isFavorite = false,
  onToggleFavorite,
  isFetching = false,
  isUserLoggedIn = false,
}: EtfDetailsProps) {
  
  const showFavoriteControls = Boolean(isUserLoggedIn && onToggleFavorite);

  // Mappa i paesi solo se 'data' esiste
  const countriesArray: Country[] = data 
    ? Object.entries(data.countries).map(([nome, peso]) => ({
        nome,
        peso,
      })) 
    : [];

  // Lo skeleton si deve mostrare SEMPRE durante il caricamento (isFetching) 
  // o se non sono ancora presenti dati solidi (!data).
  const showSkeleton = isFetching || !data;

  return (
    <motion.div 
      layout 
      style={{ transformOrigin: 'top' }} // <-- 1. Ancora l'animazione in alto
      transition={{ 
        layout: { type: 'spring', bounce: 0, duration: 0.4 } // <-- 2. Molla senza rimbalzo
      }}
      className="etf-details__wrapper bg-slate-900 border border-slate-800 p-6 shadow-xl w-full"
    >
      <div className={`etf-details--container ${isFetching ? 'is-fetching' : ''}`}>
        
        {/* Barra di caricamento orizzontale in alto durante il fetching in background */}
        {isFetching && data && <div className="etf-details__loading-bar" />}

        {/* HEADER: Titolo, info e bottone preferiti */}
        <div className="header--container">
          
          {/* info--container ottimizzato con flex-1 e min-w-0 per risolvere il bug del Flexbox */}
          <div className="info--container">
            {showSkeleton ? (
              <>
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-sub" style={{ width: '45%', height: '16px', marginBottom: '6px' }} /> 
                <div className="skeleton skeleton-sub" style={{ width: '35%', height: '16px' }} /> 
              </>
            ) : (  
              <>
                <motion.h2 layout className="title">
                  {data?.nome || 'N/A'}
                </motion.h2>
                <motion.p layout className="subtitle">
                  ISIN: <strong>{data?.isin}</strong> | Tipo Asset: <strong>{data?.tipo_asset}</strong> 
                </motion.p>
                {data?.costo_annuo !== undefined && data.costo_annuo > 0 && (
                  <motion.p layout className="subtitle">
                    TER (Costo Annuo): <strong>{data.costo_annuo}%</strong>
                  </motion.p>
                )}
              </>
            )}
          </div>

          {/* Sezione Preferiti */}
          <motion.div layout="position" className="favorite--container">
            {showFavoriteControls && (
              <button 
                onClick={onToggleFavorite} 
                className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                aria-label={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                disabled={showSkeleton}
              >
                {showSkeleton ? (
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                )}
              </button>
            )}
          </motion.div>

          {!isUserLoggedIn && (
            <motion.p layout="position" className="etf-details__favorite-hint">Accedi per salvare nei preferiti.</motion.p>
          )}
        </div>

        {/* GRIGLIA: Nutrita con i dati in tempo reale */}
        <motion.div layout="position" className="etf-details__grid">
          <HoldingsSection
            holdings={data?.holdings ?? []}
            totaleHoldings={data?.totale_holdings ?? 0}
            limite={limiteHoldings}
            onLoadMore={onLoadMoreHoldings}
            isLoading={showSkeleton}
          />

          <CountriesSection
            countries={countriesArray}
            // totaleCountries={data?.totale_countries ?? 0}
            limite={limiteCountries}
            onLoadMore={onLoadMoreCountries}
            isLoading={showSkeleton}
          />
        </motion.div>

      </div>
    </motion.div>
  );
}