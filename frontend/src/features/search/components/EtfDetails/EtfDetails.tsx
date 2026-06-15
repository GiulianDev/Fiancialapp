// src/features/portfolio/components/EtfDetails/EtfDetails.tsx

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router'; 
import type { EtfData } from '@/shared/types';
import './EtfDetails.css';
import { FavoriteButton } from '@/shared/ui/FavoriteButton/FavoriteButton';
import { Card, Loading } from '@/shared/ui';
import { RiskSection } from '../RiskSection';
import { Tabs, type TabItem } from '@/shared/ui/Tabs/Tabs';
import { BreakdownSection } from '../EtfSection/BreakdownSection';

// 1. 🎯 IMPORTA IL NUOVO COMPONENTE GENERICO UNIFICATO

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
  onLoadMoreHoldings,
  onLoadMoreCountries,
  isFavorite = false,
  onToggleFavorite,
  isFetching = false,
  isUserLoggedIn = false,
}: EtfDetailsProps) {
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'overview';

  const isLoadingData = isFetching || !data;

  // 2. 🎯 PARSING DEI DIZIONARI IN ARRAY (Eseguiti solo se cambiano i dati)
  const countriesArray = useMemo(() => {
    if (!data?.countries) return [];
    return Object.entries(data.countries).map(([nome, peso]) => ({ nome, peso }));
  }, [data?.countries]);

  const regionsArray = useMemo(() => {
    if (!data?.regions) return [];
    return Object.entries(data.regions).map(([nome, peso]) => ({ nome, peso }));
  }, [data?.regions]);

  const sectorsArray = useMemo(() => {
    if (!data?.sectors) return [];
    return Object.entries(data.sectors).map(([nome, peso]) => ({ nome, peso }));
  }, [data?.sectors]);

  const handleTabChange = (tabId: string) => {
    setSearchParams((prev) => {
      prev.set('tab', tabId);
      return prev;
    });
  };

  // 3. 🎯 GESTORE DI CLICK PER LE AZIENDE (Mantiene la feature di navigazione)
  const handleHoldingClick = (item: any) => {
    if (item.isin) {
      navigate(`/holding/${item.isin}`, { state: { name: item.nome } });
    }
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

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (

          <motion.div layout="position" className="etf-details__grid">
            
            {/* IF: Ci sono le aziende (holdings)? */}
            {data?.holdings && data.holdings.length > 0 && (
              <BreakdownSection
                title="Top Partecipazioni"
                // 🎯 CALCOLO DINAMICO DEL SOTTOTITOLO
                subtitle={`Visualizzate ${Math.min(data.holdings.length, limiteHoldings)} di ${data.totale_holdings ?? data.holdings.length} partecipazioni totali`}
                data={data.holdings}
                dataKey="peso_percentuale"
                nameKey="nome"
                residualLabel="Altre aziende"
                maxChartItems={20}
                limiteLista={limiteHoldings}
                onLoadMore={onLoadMoreHoldings}
                onItemClick={handleHoldingClick}
                isLoading={isLoadingData}
              />
            )}

            {/* IF: Ci sono i paesi (countries)? */}
            {countriesArray.length > 0 && (
              <BreakdownSection
                title="Esposizione Geografica"
                // 🎯 CALCOLO DINAMICO DEL SOTTOTITOLO
                subtitle={`Visualizzati ${Math.min(countriesArray.length, limiteCountries)} di ${countriesArray.length} paesi mappati`}
                data={countriesArray}
                dataKey="peso"
                nameKey="nome"
                residualLabel="Altri paesi"
                maxChartItems={10}
                limiteLista={limiteCountries}
                onLoadMore={onLoadMoreCountries}
                isLoading={isLoadingData}
              />
            )}

            {/* IF: Ci sono le regioni? Mostra la sezione regioni automaticamente */}
            {regionsArray.length > 0 && (
              <BreakdownSection
                title="Esposizione Regionale"
                data={regionsArray}
                dataKey="peso"
                nameKey="nome"
                residualLabel="Altre regioni"
                maxChartItems={10}
                isLoading={isLoadingData}
              />
            )}

            {/* IF: Ci sono i settori? Mostra la sezione settori automaticamente */}
            {sectorsArray.length > 0 && (
              <BreakdownSection
                title="Esposizione Settoriale"
                data={sectorsArray}
                dataKey="peso"
                nameKey="nome"
                residualLabel="Altri settori"
                maxChartItems={10}
                isLoading={isLoadingData}
              />
            )}
            
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