import { Card } from '@/shared/ui';
import { useHoldingFinancialDetails } from './useHoldingFinancialDetails';

export function HoldingFinancialDetails({isin}: {isin: string}) {

  
  // Eseguiamo la fetch dei dati aziendali
  const { data: details, isLoading, error } = useHoldingFinancialDetails(isin || '');

  return (

      <Card className={`flex flex-col justify-center min-h-[240px] max-w-[400px] ${isLoading ? "animate-pulse" : ""}`}>
        
        {error && (
          <div>          
            <p className="text-red-400 font-bold">Errore nel recupero dei fondamentali</p>
          </div>
        )}

        {isLoading && (
          <div>          
            <span className="text-gray-400">Caricamento...</span>
          </div>
        )}


        {/* Dati Aziendali */}
        {details && (
          <div className="w-full">

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
          </div>
        )}

      </Card>

  );
}