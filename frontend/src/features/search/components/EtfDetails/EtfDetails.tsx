import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router'; 
import type { Country, EtfData } from '@/shared/types';
import { HoldingsSection } from '../HoldingsSection';
import { CountriesSection } from '../CountriesSection';
import './EtfDetails.css';
import { FavoriteButton } from '@/shared/ui/FavoriteButton/FavoriteButton';
import { Card, Loading } from '@/shared/ui';
import { RiskSection } from '../RiskSection';

interface EtfDetailsProps {
  data?: EtfData;
  limiteHoldings: number;
  limiteCountries: number;
  onLoadMoreHoldings: () => void;
  onLoadMoreCountries: () => void;
  isFavorite?: boolean;
  onToggleFavorite: () => void;
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
  
  // 1. Aggiunta gestione stato Tab via URL
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // Mappa i paesi solo se 'data' esiste
  const countriesArray: Country[] = data 
    ? Object.entries(data.countries).map(([nome, peso]) => ({
        nome,
        peso,
      })) 
    : [];

  // Lo skeleton si deve mostrare SEMPRE durante il caricamento (isFetching) 
  // o se non sono ancora presenti dati solidi (!data).
  const isLoadingData = isFetching || !data;

  // 2. Funzione per gestire il cambio tab
  const handleTabChange = (tabName: string) => {
    setSearchParams((prev) => {
      prev.set('tab', tabName);
      return prev;
    });
  };

  return (
    <motion.div 
      layout
      className='etf-details--container'
      style={{ transformOrigin: 'top' }}
      transition={{ 
        layout: { type: 'spring', bounce: 0, duration: 0.4 } // <-- 2. Molla senza rimbalzo
        // layout: { type: 'tween', ease: 'easeInOut', duration: 0.3 }
      }}
    >
      <Card>

        {/* DETAIL HEADER */}
        <div className='etf-detail--header'>

          {/* INFO */}
          <div className="info--container">

            {/* INFO */}
            <Loading isLoading={isLoadingData} variant="title">
              <motion.h2 layout>
                {data?.nome || 'N/A'}
              </motion.h2>
            </Loading>
              
            <Loading isLoading={isLoadingData} variant="subtitle">
              <motion.p layout>
                  ISIN: <strong>{data?.isin}</strong> | Tipo Asset: <strong>{data?.tipo_asset}</strong> 
                </motion.p>
            </Loading>

            <Loading isLoading={isLoadingData} variant="text">
              <motion.p layout>
                  TER (Costo Annuo): <strong>{data?.costo_annuo}%</strong>
                </motion.p>
            </Loading>
          </div>

          {/* FAVORITES */}
          <div className='favorite--container'>
            {isUserLoggedIn && (
              <motion.div layout="position">
                <FavoriteButton 
                  onToggleFavorite={onToggleFavorite}
                  showSkeleton={isLoadingData}
                  isFavorite={isFavorite}
                  />
              </motion.div>
            )}
            {/* NO LOGGED UDER */}
            {!isUserLoggedIn && (
              <motion.p layout="position" className="etf-details__favorite-hint">Accedi per salvare</motion.p>
            )}
          </div>

        </div>

        {/* 3. BARRA DI NAVIGAZIONE SUB-TAB */}
        <div className="flex gap-4 border-b border-white/10 mb-6 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => handleTabChange('overview')}
            className={`whitespace-nowrap px-2 py-1 text-sm transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            📊 Panoramica
          </button>
          
          <button
            onClick={() => handleTabChange('risk')}
            className={`whitespace-nowrap px-2 py-1 text-sm transition-colors border-b-2 ${
              activeTab === 'risk'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            🛡️ Analisi Rischio
          </button>

          <button disabled className="whitespace-nowrap px-2 py-1 text-sm text-gray-600 cursor-not-allowed border-b-2 border-transparent">
            🌱 Sostenibilità ESG
          </button>
        </div>

        {/* 4. CONTENUTO CONDIZIONALE BASATO SUL TAB */}
        {activeTab === 'overview' && (
          <motion.div layout="position" className="etf-details__grid">
            <HoldingsSection
              holdings={data?.holdings ?? []}
              totaleHoldings={data?.totale_holdings ?? 0}
              limite={limiteHoldings}
              onLoadMore={onLoadMoreHoldings}
              isLoading={isLoadingData}
            />

            <CountriesSection
              countries={countriesArray}
              limite={limiteCountries}
              onLoadMore={onLoadMoreCountries}
              isLoading={isLoadingData}
            />
          </motion.div>
        )}

        {activeTab === 'risk' && (
          <motion.div layout="position" className="p-4 text-center text-gray-400 border border-dashed border-white/20 rounded-lg mt-4">
            {/* <p>Sezione Analisi Rischio in costruzione...</p>
            <p className="text-sm">Qui inseriremo le metriche per l'ISIN: {data?.isin}</p> */}
            <RiskSection isin={data?.isin || ''} isLoading={isLoadingData} />
          </motion.div>
        )}

      </Card>
    </motion.div>
  );
}