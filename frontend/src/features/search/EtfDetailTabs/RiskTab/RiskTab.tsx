
import { MetricCard } from "./MetricCard/MetricCard";
import { getBetaColor, getDrawdownColor, getSharpeColor, getVolatilitaColor } from "./RiskTabUtils";

interface RiskTabProps {
  isin: string;
}

export function RiskTab({ isin }: RiskTabProps) {

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