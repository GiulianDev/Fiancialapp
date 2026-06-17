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
    // 1. Aggiunto w-full e rimosso il padding orizzontale che entrava in conflitto con #root
    <div className="w-full max-w-6xl mx-auto space-y-6 flex flex-col box-border">

      {isLoading && (
        <Card className="w-full p-10 text-center animate-pulse text-gray-400">
          Recupero dati fondamentali per {fallbackName}...
        </Card>
      )}

      {error && (
        <Card className="w-full p-6 bg-red-950/40 border-red-900/50 backdrop-blur-sm">
          <p className="text-red-400 font-bold">Errore: {error.message}</p>
        </Card>
      )}


      {/* Dati Aziendali */}
      {details && (
        <>
          {/* 2. Grid forzata a stare dentro il 100% della larghezza */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Colonna Principale: Info */}
            <Card className="col-span-1 md:col-span-2 overflow-hidden box-border">
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
            <Card>
              <h3 className="text-lg font-semibold text-gray-200 mb-4 border-b border-white/10 pb-2">
                Fondamentali
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-gray-400 text-sm sm:text-base">Prezzo Attuale</span>
                  {/* 3. Colore Prezzo Attuale corretto in grigio chiaro/bianco uniforme */}
                  <span className="text-xl sm:text-2xl font-bold text-gray-100 text-right">
                    {details.dati_finanziari.valuta} {details.dati_finanziari.prezzo_attuale}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-gray-400 text-sm sm:text-base">P/E Ratio</span>
                  {/* Testi convertiti in toni neutri di grigio */}
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

        </>
      )}

    </div>
  );
}