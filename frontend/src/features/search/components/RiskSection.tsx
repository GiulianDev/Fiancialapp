import { Card } from '@/shared/ui';

interface RiskSectionProps {
  isin: string;
  isLoading: boolean;
}

export function RiskSection({ isin, isLoading }: RiskSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-32 bg-white/5 rounded-xl" />
        ))}
      </div>
    );
  }

  // Nota: In futuro questi dati arriveranno dal backend Python associati all'ISIN.
  // Per adesso inseriamo dei dati mockup per validare l'UI e la resa visiva.
  const mockupRiskData = {
    volatilia_annua: 14.2, // in %
    sharpe_ratio: 1.15,    // valore numerico
    max_drawdown: -18.4,   // in %
    beta: 1.05             // rispetto al benchmark
  };

  const getSharpeColor = (val: number) => {
    if (val >= 1) return 'text-green-400';
    if (val >= 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: VOLATILITÀ */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <span className="text-xs text-gray-400 block mb-1 uppercase tracking-wider font-semibold">
            Volatilità Annua
          </span>
          <span className="text-2xl font-bold text-gray-100">
            {mockupRiskData.volatilia_annua}%
          </span>
          <p className="text-[11px] text-gray-500 mt-2 leading-tight">
            Indica l'oscillazione media del prezzo. Più è alta, più lo strumento è oscillante e rischioso.
          </p>
        </div>

        {/* CARD 2: INDICE DI SHARPE */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <span className="text-xs text-gray-400 block mb-1 uppercase tracking-wider font-semibold">
            Indice di Sharpe
          </span>
          <span className={`text-2xl font-bold ${getSharpeColor(mockupRiskData.sharpe_ratio)}`}>
            {mockupRiskData.sharpe_ratio}
          </span>
          <p className="text-[11px] text-gray-500 mt-2 leading-tight">
            Misura l'efficienza: sopra 1 significa che il rendimento remunera adeguatamente il rischio corso.
          </p>
        </div>

        {/* CARD 3: MAXIMUM DRAWDOWN */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <span className="text-xs text-gray-400 block mb-1 uppercase tracking-wider font-semibold">
            Massimo Ribasso Storico
          </span>
          <span className="text-2xl font-bold text-red-400">
            {mockupRiskData.max_drawdown}%
          </span>
          <p className="text-[11px] text-gray-500 mt-2 leading-tight">
            La perdita massima registrata da questo ETF dal picco più alto a quello più basso in assoluto.
          </p>
        </div>

        {/* CARD 4: BETA */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <span className="text-xs text-gray-400 block mb-1 uppercase tracking-wider font-semibold">
            Beta di Mercato
          </span>
          <span className="text-2xl font-bold text-blue-400">
            {mockupRiskData.beta}
          </span>
          <p className="text-[11px] text-gray-500 mt-2 leading-tight">
            Sensibilità rispetto al mercato. Scostamenti superiori a 1 indicano uno strumento più amplificato rispetto all'indice generale.
          </p>
        </div>

      </div>

      {/* QUI IN FUTURO POTREMO COSTRUIRE UN GRAFICO DELLE PERDITE (DRAWDOWN CHART) O UN GAUGER DI RISCHIO */}
      <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center py-6 text-xs text-gray-400">
        🛡️ Calcolo avanzato basato sullo storico prezzi a 36 mesi dell'ISIN {isin}.
      </div>
    </div>
  );
}