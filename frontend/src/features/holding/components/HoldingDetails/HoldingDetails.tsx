import { useLocation } from 'react-router';
import { useHoldingDetails } from '../../hooks/useHolding';
import { Card } from '@/shared/ui';

export function HoldingDetails({isin}: {isin: string}) {

  const location = useLocation();
  
  // Eseguiamo la fetch dei dati aziendali
  const { data: details, isLoading, error } = useHoldingDetails(isin || '');

  // Recupera il nome di fallback dallo state in attesa del backend
  const fallbackName = location.state?.name || 'Dettaglio Holding'; 

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 flex flex-col box-border">

      {/* CARICAMENTO: Stessa griglia dei dati con un'altezza minima per evitare sbalzi (Layout Shift) */}
      {isLoading && (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Info - In caricamento */}
          <Card className="col-span-1 md:col-span-2 min-h-[240px] flex items-center justify-center text-center animate-pulse box-border">
            <span className="text-gray-400">Recupero dati fondamentali per {fallbackName}...</span>
          </Card>
          
          {/* Card Statistiche - In caricamento */}
          <Card className="min-h-[240px] flex items-center justify-center animate-pulse box-border">
            <span className="text-gray-400">Caricamento...</span>
          </Card>
        </div>
      )}

      {error && (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Info - In caricamento */}
          <Card className="col-span-1 md:col-span-2 min-h-[240px] flex items-center justify-center text-center">
            <p className="text-red-400 font-bold">Errore del recupero dei dettagli</p>
          </Card>
          
          {/* Card Statistiche - In caricamento */}
          <Card className="min-h-[240px] flex items-center justify-center">
            <p className="text-red-400 font-bold">Errore nel recupero dei fondamentali</p>
          </Card>
        </div>
      )}


      {/* Dati Aziendali */}
      {details && (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Colonna Principale: Info */}
          <Card className="col-span-1 md:col-span-2 overflow-hidden box-border flex flex-col justify-center min-h-[240px]">
            <div className="flex flex-wrap items-baseline gap-2 mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 break-words max-w-full">
                {details.nome}
              </h2>
            </div>
            <p className="text-gray-400 text-sm sm:text-base mb-6">
              {details.settore} • {details.industria} ({details.paese})
            </p>
            
            <div className="text-sm text-gray-300 leading-relaxed max-w-none line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
              {details.descrizione}
            </div>
          </Card>

          {/* Colonna Laterale: Statistiche */}
          <Card className="flex flex-col justify-center min-h-[240px]">
            <h3 className="text-lg font-semibold text-gray-200 mb-4 border-b border-white/10 pb-2">
              Fondamentali
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-4">
                <span className="text-gray-400 text-sm sm:text-base">Prezzo Attuale</span>
                <span className="text-xl sm:text-2xl font-bold text-gray-100 text-right">
                  {details.dati_finanziari.valuta} {details.dati_finanziari.prezzo_attuale}
                </span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-gray-400 text-sm sm:text-base">P/E Ratio</span>
                <span className="font-semibold text-gray-200 text-right">
                  {details.dati_finanziari.pe_ratio_trailing?.toFixed(2) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-gray-400 text-sm sm:text-base">Dividendo</span>
                <span className="font-semibold text-gray-200 text-right">
                  {details.dati_finanziari.dividendo_yield_percentuale > 0 
                    ? `${details.dati_finanziari.dividendo_yield_percentuale.toFixed(2)}%` 
                    : 'Nessuno'}
                </span>
              </div>
            </div>
          </Card>

        </div>
      )}

    </div>
  );
}