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
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      
      {/* Header con bottone indietro */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={handleBack}
          className="text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span className="mr-2">←</span> Torna Indietro
        </button>
      </div>

      {isLoading && (
        <Card className="p-10 text-center animate-pulse text-gray-500">
          Recupero dati fondamentali per {fallbackName}...
        </Card>
      )}

      {error && (
        <Card className="p-6 bg-red-50 border-red-200">
          <p className="text-red-600 font-bold">Errore: {error.message}</p>
        </Card>
      )}

      {/* Dati Aziendali */}
      {details && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Colonna Principale: Info */}
            <Card className="p-6 col-span-1 md:col-span-2">
              <div className="flex items-baseline space-x-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{details.nome}</h2>
                {/* <span className="text-lg font-mono text-gray-500 bg-gray-100 px-2 rounded">
                  {details.ticker}
                </span> */}
              </div>
              <p className="text-gray-600 mb-6">{details.settore} • {details.industria} ({details.paese})</p>
              
              <div className="prose text-sm text-gray-700 max-w-none line-clamp-4 hover:line-clamp-none transition-all">
                {details.descrizione}
              </div>
            </Card>

            {/* Colonna Laterale: Statistiche */}
            <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Fondamentali</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Prezzo Attuale</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {details.dati_finanziari.valuta} {details.dati_finanziari.prezzo_attuale}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">P/E Ratio</span>
                  <span className="font-semibold text-gray-800">
                    {details.dati_finanziari.pe_ratio_trailing?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Dividendo</span>
                  <span className="font-semibold text-gray-800">
                    {details.dati_finanziari.dividendo_yield_percentuale > 0 
                      ? `${details.dati_finanziari.dividendo_yield_percentuale.toFixed(2)}%` 
                      : 'Nessuno'}
                  </span>
                </div>
              </div>
            </Card>

          </div>

          {/* Grafico Integrato */}
          <HoldingChart isin={isin || ''} />
        </>
      )}

    </div>
  );
}