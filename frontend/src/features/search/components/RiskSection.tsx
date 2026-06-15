// import { Card } from '@/shared/ui';
// import { useEtfRisk } from '../hooks/useEtfRisk';
import { MetricCard } from './EtfDetails/MetricCard/MetricCard';

interface RiskSectionProps {
  isin: string;
  // isLoading: boolean;
}

export function RiskSection({ isin }: RiskSectionProps) {
  
  // const { data: riskData, isLoading: isRiskLoading, error } = useEtfRisk(isin);

  // Mostra lo skeleton durante il caricamento
  // if (isEtfLoading || isRiskLoading) {
  //   return (
  //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
  //       {[1, 2, 3, 4].map((n) => (
  //         <div key={n} className="h-32 bg-white/5 rounded-xl" />
  //       ))}
  //     </div>
  //   );
  // }

  // Gestione dell'errore (es: Ticker Yahoo non associato o errore di rete)
  // if (error) {
  //   return (
  //     <div className="p-6 text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl my-4">
  //       <p className="font-semibold">Analisi del Rischio momentaneamente non disponibile</p>
  //       <p className="text-xs mt-1 text-gray-400">{error.message}</p>
  //     </div>
  //   );
  // }

  // --- ESTRAZIONE SICURA E FORMATTAZIONE ---
  // Funzione helper per garantire che il valore sia sempre un numero
  // const formatNum = (val: any) => (typeof val === 'number' ? val : 0);

  // const volatilita = formatNum(riskData?.volatilita_annua ?? riskData?.volatilia_annua);
  // const sharpe = formatNum(riskData?.sharpe_ratio);
  // const maxDrawdown = formatNum(riskData?.max_drawdown);
  // const beta = formatNum(riskData?.beta);

  const getVolatilitaColor = (val: number) => {
    if (val < 10) return 'text-green-400'; // Rischio basso
    if (val <= 20) return 'text-blue-400'; // Rischio medio / Mercato azionario standard
    return 'text-red-400';                 // Rischio alto
  };

  const getSharpeColor = (val: number) => {
    if (val >= 1) return 'text-green-400'; // Ottimo rendimento corretto per il rischio
    if (val >= 0) return 'text-blue-400';  // Positivo ma migliorabile
    return 'text-red-400';                 // Il rischio preso non è stato ripagato
  };

  const getDrawdownColor = (val: number) => {
    // Il drawdown è solitamente un valore negativo (es: -25%)
    if (val >= -15) return 'text-green-400'; // Tenuta forte nelle crisi
    if (val >= -30) return 'text-blue-400';  // Crollo fisiologico di mercato
    return 'text-red-400';                   // Crollo grave
  };

  const getBetaColor = (val: number) => {
    if (val < 0.8) return 'text-green-400';  // Difensivo, oscilla meno del mercato
    if (val <= 1.2) return 'text-blue-400';  // Neutro, si muove in tandem col mercato
    return 'text-red-400';                   // Aggressivo, amplifica i movimenti
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: VOLATILITÀ */}
        <MetricCard 
          isin={isin}
          metricType="volatilita"
          title="Volatilità Annua"
          suffix="%"
          description="Indica l'oscillazione media del prezzo. Più è alta, più lo strumento è oscillante e rischioso."
          colorClass={getVolatilitaColor}
        />

        {/* CARD 2: INDICE DI SHARPE */}
        <MetricCard 
          isin={isin}
          metricType="sharpe"
          title="Indice di Sharpe"
          suffix="%"
          description="Misura l'efficienza: sopra 1 significa che il rendimento remunera adeguatamente il rischio corso."
          colorClass={getSharpeColor}
        />

        {/* CARD 3: MAXIMUM DRAWDOWN */}
        <MetricCard 
          isin={isin}
          metricType="drawdown"
          title="Massimo Ribasso Storico"
          suffix="%"
          description="La perdita massima registrata da questo ETF dal picco più alto a quello più basso in assoluto."
          colorClass={getDrawdownColor}
        />

        {/* CARD 4: BETA */}
        <MetricCard 
          isin={isin}
          metricType="beta"
          title="Beta di Mercato"
          suffix="%"
          description="Sensibilità rispetto al mercato. Scostamenti superiori a 1 indicano uno strumento più amplificato rispetto all'indice generale."
          colorClass={getBetaColor}
        />
        
      </div>

      <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center py-6 text-xs text-gray-400">
        🛡️ Calcolo avanzato basato sullo storico prezzi dell'ISIN {isin}.
      </div>
    </div>
  );
}