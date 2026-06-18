import { useLocation } from 'react-router';
import { useHoldingDetails } from '../../hooks/useHolding';
import { Card } from '@/shared/ui';

export function HoldingMainDetails({isin}: {isin: string}) {

  const location = useLocation();
  
  // Eseguiamo la fetch dei dati aziendali
  const { data: details, isLoading, error } = useHoldingDetails(isin || '');

  // Recupera il nome di fallback dallo state in attesa del backend
  const fallbackName = location.state?.name || 'Dettaglio Holding'; 

  return (
    // Rimosso max-w-6xl e grid. Aggiunto h-full per pareggiare le altezze.
    <div className="w-full h-full flex flex-col box-border">

      {isLoading && (
        <Card className="w-full h-full min-h-[240px] flex items-center justify-center text-center animate-pulse box-border">
          <span className="text-gray-400">Recupero dati fondamentali per {fallbackName}...</span>
        </Card>
      )}

      {error && (
        <Card className="w-full h-full min-h-[240px] flex items-center justify-center text-center">
          <p className="text-red-400 font-bold">Errore del recupero dei dettagli</p>
        </Card>
      )}

      {details && (
        // Rimosse le classi col-span. Aggiunto w-full e h-full.
        <Card className="w-full h-full overflow-hidden box-border flex flex-col justify-center min-h-[240px]">
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
      )}

    </div>
  );
}