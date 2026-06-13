import { motion } from 'framer-motion';
import type { Country, EtfData } from '@/shared/types';
import { HoldingsSection } from '../HoldingsSection';
import { CountriesSection } from '../CountriesSection';
import './EtfDetails.css';
import { FavoriteButton } from '@/shared/ui/FavoriteButton/FavoriteButton';
import { Card, Loading } from '@/shared/ui';
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';

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
      className='etf-details--container'
      style={{ transformOrigin: 'top' }} // <-- 1. Ancora l'animazione in alto
      transition={{ 
        layout: { type: 'spring', bounce: 0, duration: 0.4 } // <-- 2. Molla senza rimbalzo
        // layout: { type: 'tween', ease: 'easeInOut', duration: 0.3 }
      }}
      // className="bg-slate-900 border border-slate-800 p-6 shadow-xl w-full"
    >
      <Card>

        <div className='etf-detail--header'>

          <div className="info--container">

            {/* INFO */}
            <Loading isLoading={showSkeleton} variant="title">
              <motion.h2 layout>
                {data?.nome || 'N/A'}
              </motion.h2>
            </Loading>
              
            <Loading isLoading={showSkeleton} variant="subtitle">
              <motion.p layout>
                  ISIN: <strong>{data?.isin}</strong> | Tipo Asset: <strong>{data?.tipo_asset}</strong> 
                </motion.p>
            </Loading>

            <Loading isLoading={showSkeleton} variant="text">
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
                  showSkeleton={showSkeleton}
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

      </Card>




      
    </motion.div>
  );
}