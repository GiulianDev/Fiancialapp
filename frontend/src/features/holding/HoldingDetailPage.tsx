import { useParams, useLocation, useNavigate } from 'react-router';
import { Card } from '../../shared/ui/Card/Card';
import { useHoldingDetails } from './hooks/useHolding';
import { HoldingChart } from './components/HoldingChart';

export function HoldingDetailPage() {
  const { isin } = useParams<{ isin: string }>(); 
  const location = useLocation();
  const navigate = useNavigate();
  
  // Eseguiamo la fetch dei dati aziendali
  const { data: details, isLoading, error } = useHoldingDetails(isin || '');

  // Recupera il nome di fallback dallo state in attesa del backend
  const fallbackName = location.state?.name || 'Dettaglio Holding'; 

  const handleBack = () => { navigate(-1) };

  return (
    // Responsive: p-4 su mobile, p-6 su schermi più grandi
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header con bottone indietro - Adattato allo stile scuro/glass della dashboard */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={handleBack}
          className="text-gray-200 hover:text-white flex items-center bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors text-sm font-medium backdrop-blur-sm border border-white/10"
        >
          <span className="mr-2">←</span> Torna Indietro
        </button>
      </div>

      {isLoading && (
        <Card className="p-10 text-center animate-pulse text-gray-400">
          Recupero dati fondamentali per {fallbackName}...
        </Card>
      )}

      {error && (
        <Card className="p-6 bg-red-950/40 border-red-900/50 backdrop-blur-sm">
          <p className="text-red-400 font-bold">Errore: {error.message}</p>
        </Card>
      )}

      {/* Dati Aziendali */}
      {details && (
        <>
          {/* Responsive: 1 colonna su mobile, 3 colonne da tablet/desktop in su */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Colonna Principale: Info */}
            <Card className="p-6 col-span-1 md:col-span-2">
              <div className="flex flex-wrap items-baseline gap-2 mb-2">
                {/* Responsive: text-2xl su mobile, text-3xl su desktop per evitare che scenda a capo male */}
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 break-words max-w-full">
                  {details.nome}
                </h2>
              </div>
              {/* Testo secondario convertito in grigio chiaro coordinato */}
              <p className="text-gray-400 text-sm sm:text-base mb-6">
                {details.settore} • {details.industria} ({details.paese})
              </p>
              
              {/* Descrizione convertita in grigio morbido ad alta leggibilità */}
              <div className="text-sm text-gray-300 leading-relaxed max-w-none line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                {details.descrizione}
              </div>
            </Card>

            {/* Colonna Laterale: Statistiche - RIMOSSO il vecchio gradient chiaro per uniformare lo stile alla prima Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4 border-b border-white/10 pb-2">
                Fondamentali
              </h3>
              <div className="space-y-4">
                {/* Gestito gap-4 e allineamento per non rompere il layout sui telefoni stretti */}
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

          {/* Grafico Integrato - Avvolto in un contenitore anti-overflow per il mobile */}
          <div className="w-full overflow-hidden">
            <HoldingChart isin={isin || ''} />
          </div>
        </>
      )}

    </div>
  );
}
