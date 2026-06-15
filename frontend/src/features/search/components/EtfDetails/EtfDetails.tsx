import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router'; 
import type { Country, EtfData } from '@/shared/types';
import { HoldingsSection } from '../HoldingsSection';
import { CountriesSection } from '../CountriesSection';
import './EtfDetails.css';
import { FavoriteButton } from '@/shared/ui/FavoriteButton/FavoriteButton';
import { Card, Loading } from '@/shared/ui';
import { RiskSection } from '../RiskSection';
import { Tabs, type TabItem } from '@/shared/ui/Tabs/tabs';

// 1. 🎯 IMPORTA IL NUOVO COMPONENTE Condiviso
// (Adatta il percorso in base a dove hai salvato il file Tabs.tsx)

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

// 2. 🎯 CONFIGURAZIONE STATICA DEI TAB (definita fuori dal componente)
const ETF_DETAILS_TABS: TabItem[] = [
  { id: 'overview', label: '📊 Panoramica' },
  { id: 'risk', label: '🛡️ Analisi Rischio' },
  { id: 'esg', label: '🌱 Sostenibilità ESG', disabled: true } // Manteniamo il tab disabilitato come prima
];

export function EtfDetails({
  data,
  limiteHoldings,
  limiteCountries,
  onLoadMoreCountries,
  isFavorite = false,
  onToggleFavorite,
  isFetching = false,
  isUserLoggedIn = false,
}: EtfDetailsProps) {
  
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const countriesArray: Country[] = data 
    ? Object.entries(data.countries).map(([nome, peso]) => ({ nome, peso })) 
    : [];

  const isLoadingData = isFetching || !data;

  // 3. 🎯 FUNZIONE PER CAMBIARE IL TAB NELL'URL
  const handleTabChange = (tabId: string) => {
    setSearchParams((prev) => {
      prev.set('tab', tabId);
      return prev;
    });
  };

  return (
    <motion.div 
      layout
      className='etf-details--container'
      style={{ transformOrigin: 'top' }}
      transition={{ layout: { type: 'spring', bounce: 0, duration: 0.4 } }}
    >
      <Card>
        {/* DETAIL HEADER */}
        <div className='etf-detail--header'>
          <div className="info--container">
            <Loading isLoading={isLoadingData} variant="title">
              <motion.h2 layout>{data?.nome || 'N/A'}</motion.h2>
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

          <div className='favorite--container'>
            {isUserLoggedIn ? (
              <motion.div layout="position">
                <FavoriteButton 
                  onToggleFavorite={onToggleFavorite}
                  showSkeleton={isLoadingData}
                  isFavorite={isFavorite}
                />
              </motion.div>
            ) : (
              <motion.p layout="position" className="etf-details__favorite-hint">Accedi per salvare</motion.p>
            )}
          </div>
        </div>

        {/* TABS */}
        <Tabs 
          tabs={ETF_DETAILS_TABS}
          activeTab={activeTab}
          onChange={handleTabChange}
        />

        {/* CONTENUTO CONDIZIONALE BASATO SUL TAB */}
        {activeTab === 'overview' && (
          <motion.div layout="position" className="etf-details__grid">
            <HoldingsSection
              holdings={data?.holdings ?? []}
              totaleHoldings={data?.totale_holdings ?? 0}
              limite={limiteHoldings}
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
            <RiskSection isin={data?.isin || ''} isLoading={isLoadingData} />
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}