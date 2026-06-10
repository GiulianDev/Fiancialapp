import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Country, EtfData } from '@/shared/types';
import { Card } from '@/shared/ui';
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
  
  // Evitiamo che questo componente consumi direttamente il contesto auth.
  // Lo stato di login viene passato dall'esterno, rendendo EtfDetails più riusabile e testabile.
  const showFavoriteControls = Boolean(isUserLoggedIn && onToggleFavorite);

  // 🧠 PATTERN SENIOR: "Stale-While-Revalidate" UI
  // Quando cambia l'ISIN, 'data' diventa undefined. Noi salviamo l'ultimo ETF valido 
  // in questo stato per impedire al DOM di svuotarsi e far crollare l'altezza.
  const [retainedData, setRetainedData] = useState<EtfData | undefined>(data);

  useEffect(() => {
    // Se abbiamo dati validi, li salviamo in memoria
    if (data) {
      setRetainedData(data);
    }
  }, [data]);

  // Se 'data' è undefined (stiamo cercando un nuovo ETF), mostriamo i dati in memoria (retainedData)
  // Questo evita l'effetto di 'svuotamento' dell'interfaccia mentre arriva la nuova risposta.
  const activeData = data || retainedData;

  // Congelamento dei limiti visivi per evitare rimpicciolimenti durante i cambi di pagina
  const [visualLimits, setVisualLimits] = useState({
    holdings: limiteHoldings,
    countries: limiteCountries,
  });

  useEffect(() => {
    if (!isFetching) {
      setVisualLimits({
        holdings: limiteHoldings,
        countries: limiteCountries,
      });
    }
  }, [isFetching, limiteHoldings, limiteCountries]);

  const activeLimiteHoldings = isFetching ? Math.max(visualLimits.holdings, limiteHoldings) : limiteHoldings;
  const activeLimiteCountries = isFetching ? Math.max(visualLimits.countries, limiteCountries) : limiteCountries;

  const countriesArray: Country[] = activeData ? Object.entries(activeData.countries).map(([nome, peso]) => ({
    nome,
    peso,
  })) : [];

  // Lo scheletro completo (collasso dell'altezza) avviene SOLO al primissimo avvio
  const showSkeleton = !activeData;
  // Quando abbiamo dati vecchi ma stiamo refetchando, mostriamo un overlay
  // o skeleton parziale per comunicare il refresh senza svuotare la UI.
  const showFetchingOverlay = !!activeData && isFetching;
  return (
    <motion.div 
      layout 
      transition={{ 
        layout: { 
          type: "tween",
          ease: "easeInOut",
          duration: 0.35 // Transizione secca e diretta
        } 
      }}
      className="etf-details__wrapper mx-auto w-12/12 md:max-w-3xl"
    >
    
      <Card className={`etf-details--container w-full ${isFetching ? 'is-fetching' : ''}`}>
        
        {/* Barra di caricamento visibile solo se stiamo ricaricando su dati già esistenti */}
        {isFetching && activeData && (
          <div className="etf-details__loading-bar" />
        )}

        {/* HEADER */}
        <motion.div layout="position" className="header--container">
          
          <motion.div layout="position" className="info--container">
            
            {showSkeleton ? (
              <>
                  <motion.div layout="position" className="skeleton skeleton-sub" style={{ width: '45%', height: '16px', marginBottom: '6px' }} /> 
                  <motion.div layout="position" className="skeleton skeleton-title" style={{ width: '60%', height: '28px', marginBottom: '8px' }} />
              </>
            ) : (
              <>
                <motion.h2 layout="position" className="title">{activeData.nome}</motion.h2>
              
               

              </>
            )}


            {showFetchingOverlay ? (
              <>
                  <motion.div layout="position" className="skeleton skeleton-title" style={{ width: '60%', height: '28px', marginBottom: '8px' }} />
                  <motion.div layout="position" className="skeleton skeleton-sub" style={{ width: '45%', height: '16px', marginBottom: '6px' }} /> 
                  <motion.div layout="position" className="skeleton skeleton-sub" style={{ width: '100%', height: '8px', marginTop: 8, opacity: 0.6 }} />
              </>
            ) : (  
              <>
                <motion.h2 layout="position" className="title">
                  {activeData ? ( 
                    <> {activeData.nome}</> 
                  ) : ('N/A')}
                </motion.h2>
                <motion.p layout="position" className="subtitle">
                  ISIN: {activeData ? ( 
                    <>
                      ISIN: <strong>{activeData.isin}</strong> | Tipo Asset: <strong>{activeData.tipo_asset}</strong> 
                    </>
                   ) : ('N/A')}
                </motion.p>
                <motion.p layout="position" className="subtitle">
                  TER (Costo Annuo): {activeData ? ( <strong>{activeData.costo_annuo}%</strong> ) : ('N/A')}
                </motion.p>
              </>
            )}

          </motion.div>

          {/* ADD TO FAVORITES */}
          <motion.div layout="position" className='favorite--container'>
            {showFavoriteControls && (
              <button
                className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                onClick={onToggleFavorite}
                aria-label={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                disabled={showSkeleton || isFetching}
              >
                {showSkeleton || showFetchingOverlay ? (
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', opacity: showFetchingOverlay ? 0.6 : 1 }} />
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
        </motion.div>

        {/* GRIGLIA: Nutrita SEMPRE con activeData per impedire lo svuotamento */}
        <motion.div layout="position" className="etf-details__grid">
          <HoldingsSection
            holdings={activeData?.holdings ?? []}
            totaleHoldings={activeData?.totale_holdings ?? 0}
            limite={activeLimiteHoldings}
            onLoadMore={onLoadMoreHoldings}
            // Mostriamo loading anche durante il refetch mantenendo i dati precedenti
            isLoading={showSkeleton || isFetching}
          />

          <CountriesSection
            countries={countriesArray}
            limite={activeLimiteCountries}
            onLoadMore={onLoadMoreCountries}
            isLoading={showSkeleton || isFetching}
          />
        </motion.div>
        
      </Card>
    </motion.div>
  );
}