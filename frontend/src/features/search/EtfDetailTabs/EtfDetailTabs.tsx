import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router'; 
import { FavoriteButton } from '@/shared/ui/FavoriteButton/FavoriteButton';
import { Card, Loading } from '@/shared/ui';
import { Tabs, type TabItem } from '@/shared/ui/Tabs/Tabs';
import { RiskTab } from './RiskTab/RiskTab';
import { useEtfDetailTabs } from './useEtfDetailTabs';
import { EtfOverviewTab } from './EtfOverviewTab/EtfOverviewTab';

interface EtfDetailTabsProps {
  isin: string;
  limiteHoldings: number;
  limiteCountries: number;
  onLoadMoreHoldings: () => void;
  onLoadMoreCountries: () => void;
  isUserLoggedIn?: boolean;
}

const ETF_DETAILS_TABS: TabItem[] = [
  { id: 'overview', label: '📊 Panoramica' },
  { id: 'risk', label: '🛡️ Analisi Rischio' },
  { id: 'esg', label: '🌱 Sostenibilità ESG', disabled: true }
];

export function EtfDetailTabs({
  isin,
  // onToggleFavorite,
  isUserLoggedIn = false,
}: EtfDetailTabsProps) {
  
  // Search params
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const { 
    data: data, 
    isLoading: caricando, 
    isFetching: fetching,
    error: errore
  } = useEtfDetailTabs(isin);

  // Consideriamo in caricamento se React Query sta scaricando O se non abbiamo ancora i dati
  const isLoadingData = fetching || caricando || !data;

  const handleTabChange = (tabId: string) => {
    setSearchParams((prev) => {
      prev.set('tab', tabId);
      return prev;
    });
  };

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
                  showSkeleton={isLoadingData}
                  isin={isin}
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
          <motion.div 
            layout="position" 
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 mt-6"
          >
            <EtfOverviewTab isin={isin}/>
          </motion.div>
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