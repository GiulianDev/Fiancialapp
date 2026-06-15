// src/features/portfolio/components/EtfDetails/EtfDetails.tsx

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router'; 
import type { EtfData } from '@/shared/types';
import { FavoriteButton } from '@/shared/ui/FavoriteButton/FavoriteButton';
import { Card, Loading } from '@/shared/ui';
import { RiskSection } from '../RiskSection';
import { Tabs, type TabItem } from '@/shared/ui/Tabs/Tabs';
import { BreakdownSection } from '../EtfSection/BreakdownSection';

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

const ETF_DETAILS_TABS: TabItem[] = [
  { id: 'overview', label: '📊 Panoramica' },
  { id: 'risk', label: '🛡️ Analisi Rischio' },
  { id: 'esg', label: '🌱 Sostenibilità ESG', disabled: true }
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

  // Parsing dei dizionari in array (eseguiti in modo efficiente con useMemo)
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

  // callback al click sulla singola holding
  const handleHoldingClick = (isin: string, name: string) => {
    console.log(isin, name);
    navigate(`/holding/${isin}`, { state: { name } });
  };

  return (
    <motion.div 
      layout
      className="w-full"
      style={{ transformOrigin: 'top' }}
      transition={{ layout: { type: 'spring', bounce: 0, duration: 0.4 } }}
    >
      <Card>
        {/* DETAIL HEADER (Convertito in Tailwind) */}
        <div className="flex justify-between min-h-[5rem] gap-4 mb-5">
          <div className="flex-grow">
            <Loading isLoading={isLoadingData} variant="title">
              <motion.h2 layout className="text-xl font-bold">{data?.nome || 'N/A'}</motion.h2>
            </Loading>
            <Loading isLoading={isLoadingData} variant="subtitle">
              <motion.p layout className="text-sm text-gray-400 mt-1">
                ISIN: <strong className="text-gray-200">{data?.isin}</strong> | Tipo Asset: <strong className="text-gray-200">{data?.tipo_asset}</strong> 
              </motion.p>
            </Loading>
            <Loading isLoading={isLoadingData} variant="text">
              <motion.p layout className="text-sm text-gray-400">
                TER (Costo Annuo): <strong className="text-gray-200">{data?.costo_annuo}%</strong>
              </motion.p>
            </Loading>
          </div>

          <div className="pl-2 max-w-[4rem] flex shrink-0 items-start">
            {isUserLoggedIn ? (
              <motion.div layout="position">
                <FavoriteButton 
                  onToggleFavorite={onToggleFavorite}
                  showSkeleton={isLoadingData}
                  isFavorite={isFavorite}
                />
              </motion.div>
            ) : (
              <motion.p layout="position" className="text-xs text-gray-500 text-right">Accedi per salvare</motion.p>
            )}
          </div>
        </div>

        {/* TABS */}
        <Tabs 
          tabs={ETF_DETAILS_TABS}
          activeTab={activeTab}
          onChange={handleTabChange}
        />

        {/* 🎯 CONTENUTO CONDIZIONALE RESPONSIVE (1 colonna su mobile, 2 colonne da 'lg' in su) */}
        {activeTab === 'overview' && (
          <motion.div 
            layout="position" 
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 mt-6"
          >
            {/* IF: Aziende */}
            {data?.holdings && data.holdings.length > 0 && (
              <BreakdownSection
                title="Top Partecipazioni"
                subtitle={`Visualizzate ${Math.min(data.holdings.length, limiteHoldings)} di ${data.totale_holdings ?? data.holdings.length} partecipazioni totali`}
                data={data.holdings}
                dataKey="peso_percentuale"
                nameKey="nome"
                residualLabel="Altre aziende"
                maxChartItems={20}
                limiteLista={limiteHoldings}
                onLoadMore={onLoadMoreHoldings}
                onItemClick={(item) => handleHoldingClick(item.isin, item.nome)}
                isLoading={isLoadingData}
              />
            )}

            {/* IF: Paesi */}
            {countriesArray.length > 0 && (
              <BreakdownSection
                title="Esposizione Geografica"
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

            {/* IF: Regioni */}
            {/* {regionsArray.length > 0 && (
              <BreakdownSection
                title="Esposizione Regionale"
                data={regionsArray}
                dataKey="peso"
                nameKey="nome"
                residualLabel="Altre regioni"
                maxChartItems={10}
                isLoading={isLoadingData}
              />
            )} */}

            {/* IF: Settori */}
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