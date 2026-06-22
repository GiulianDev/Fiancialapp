import { useParams, useNavigate } from 'react-router';
import { HoldingHistoryChart } from './HoldingHistoryChart/HoldingHistoryChart';
import { HoldingFinancialDetails } from './HoldingFinancialDetails/HoldingFinancialDetails';
import { HoldingMainDetails } from './HoldingMainDetails/HoldingMainDetails';

// import { HoldingDetails } from './components/HoldingDetails/HoldingDetails';

export function HoldingDetailPage() {
  const { isin } = useParams<{ isin: string }>(); 
  const navigate = useNavigate();

  const handleBack = () => { navigate(-1) };

  return (
    // 1. Aggiunto w-full e rimosso il padding orizzontale che entrava in conflitto con #root
    <div className="w-full max-w-6xl mx-auto space-y-6 flex flex-col box-border">
      
      {/* Header con bottone indietro coordinato al tema scuro */}
      <div>
        <button 
          onClick={handleBack}
          className="text-gray-200 hover:text-white flex items-center bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors text-sm font-medium backdrop-blur-sm border border-white/10"
        >
          <span className="mr-2">←</span> Torna Indietro
        </button>
      </div>


      {/* HOLDING DETAILS */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch w-full">
      
        {/* Colonna di sinistra: Si espande all'infinito (flex-1) */}
        <div className="flex-1 min-w-0">
          <HoldingMainDetails isin={isin || ''} />
        </div>
        
        {/* Colonna di destra: 1/3 dello spazio, ma bloccato a 400px massimi */}
        <div className="w-full md:w-1/3 shrink-0">
          <HoldingFinancialDetails isin={isin || ''} />
        </div>

      </div>
      
      {/* Grafico con lo storico */}
      <HoldingHistoryChart isin={isin || ''} />

    </div>
  );
}