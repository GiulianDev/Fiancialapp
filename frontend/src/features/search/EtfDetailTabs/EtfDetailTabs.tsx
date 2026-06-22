import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router'; 
import { FavoriteButton } from '@/shared/ui/FavoriteButton/FavoriteButton';
import { Card, Loading } from '@/shared/ui';
import { Tabs, type TabItem } from '@/shared/ui/Tabs/Tabs';
import { BreakdownSection } from '../components/EtfSection/BreakdownSection';
import { RiskTab } from './RiskTab/RiskTab';
// import { useEtfSearch } from '../hooks/useEtfSearch';
import { useEtfDetailTabs } from './useEtfDetailTabs';
import { EtfOverviewTab } from './EtfOverviewTab/EtfOverviewTab';
// Importiamo l'hook direttamente nel componente autonomo

interface EtfDetailTabsProps {
  isin: string;
  limiteHoldings: number;
  limiteCountries: number;
  onLoadMoreHoldings: () => void;
  onLoadMoreCountries: () => void;
  isFavorite?: boolean;
  onToggleFavorite: (isin: string, name?: string) => void;
  isUserLoggedIn?: boolean;
}

const ETF_DETAILS_TABS: TabItem[] = [
  { id: 'overview', label: '📊 Panoramica' },
  { id: 'risk', label: '🛡️ Analisi Rischio' },
  { id: 'esg', label: '🌱 Sostenibilità ESG', disabled: true }
];

export function EtfDetailTabs({
  isin,
  limiteHoldings,
  limiteCountries,
  onLoadMoreHoldings,
  onLoadMoreCountries,
  isFavorite = false,
  onToggleFavorite,
  isUserLoggedIn = false,
}: EtfDetailTabsProps) {
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'overview';

  // Il componente recupera i suoi dati in autonomia
  // const { 
  //   data2, 
  //   isLoading: caricando2, 
  //   isFetching: fetching2,
  //   error: errore2
  // } = useEtfSearch(isin);

  const { 
    data: data, 
    isLoading: caricando, 
    isFetching: fetching,
    error: errore
  } = useEtfDetailTabs(isin);

  // Consideriamo in caricamento se React Query sta scaricando O se non abbiamo ancora i dati
  const isLoadingData = fetching || caricando || !data;

  // Parsing dei dizionari eseguiti in modo efficiente con useMemo
  // const countriesArray = useMemo(() => {
  //   if (!data?.countries) return [];
  //   return Object.entries(data.countries).map(([nome, peso]) => ({ nome, peso }));
  // }, [data?.countries]);

  // const sectorsArray = useMemo(() => {
  //   if (!data?.sectors) return [];
  //   return Object.entries(data.sectors).map(([nome, peso]) => ({ nome, peso }));
  // }, [data?.sectors]);

  const handleTabChange = (tabId: string) => {
    setSearchParams((prev) => {
      prev.set('tab', tabId);
      return prev;
    });
  };

  // const handleHoldingClick = (isinToNavigate: string, name: string) => {
  //   if (!isinToNavigate) return;
  //   navigate(`/holding/${isinToNavigate}`, { state: { name } });
  // };

  // Gestione dell'errore isolata all'interno del widget dei dettagli
  if (errore) {
    return (
      <div className="w-full p-4 mt-4 border border-red-500/20 rounded-lg bg-red-500/10 text-center">
        <p style={{ color: 'red', fontWeight: 'bold' }}>{(errore as Error).message}</p>
      </div>
    );
  }

  if (!isin) return null;

  return (
    <motion.div 
      key={data?.isin || 'empty'} 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full"
    >
      <Card>
        {/* DETAIL HEADER */}
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
                  onToggleFavorite={() => onToggleFavorite(isin, data?.nome)}
                  showSkeleton={isLoadingData}
                  isFavorite={isFavorite}
                />
              </motion.div>
            ) : (
              <motion.p layout="position" className="text-xs text-gray-500 text-right">Accedi per salvare</motion.p>
            )}
          </div>
        </div>

        {/* COMPONENTE DEI TAB */}
        <Tabs 
          tabs={ETF_DETAILS_TABS}
          activeTab={activeTab}
          onChange={handleTabChange}
        />

        {/* CONTENUTO DEL TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <EtfOverviewTab isin={isin}/>
        )}

        {/* CONTENUTO DEL TAB: RISK ANALYSIS */}
        {activeTab === 'risk' && (
          <motion.div layout="position" className="p-4 text-center text-gray-400 border border-dashed border-white/20 rounded-lg mt-4">
            <RiskTab isin={data?.isin || ''}/>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}