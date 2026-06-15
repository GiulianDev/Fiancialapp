import { useEtfRisk } from '../hooks/useEtfRisk'; // Regola il percorso relativo se necessario

interface RiskSectionProps {
  isin: string;
  isLoading: boolean; // Indica lo stato di caricamento dell'asset principale
}

export function RiskSection({ isin, isLoading: isEtfLoading }: RiskSectionProps) {
  // Richiamiamo l'hook custom agganciato all'API Python
  const { data: riskData, isLoading: isRiskLoading, error } = useEtfRisk(isin);

  // Mostra lo skeleton durante il caricamento
  if (isEtfLoading || isRiskLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-32 bg-white/5 rounded-xl" />
        ))}
      </div>
    );
  }

  // Gestione dell'errore (es: Ticker Yahoo non associato o errore di rete)
  if (error) {
    return (
      <div className="p-6 text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl my-4">
        <p className="font-semibold">Analisi del Rischio momentaneamente non disponibile</p>
        <p className="text-xs mt-1 text-gray-400">{error.message}</p>
      </div>
    );
  }

  // ==================== ESTRAZIONE BLINDATA ====================
  // Estraiamo ogni proprietà singolarmente usando l'operatore di coalescenza nulla (??).
  // In questo modo, se una metrica è null o undefined dal backend, l'app non crasha e mostra 0.00
  
  // Controlla sia la chiave con il refuso (volatilia) sia quella corretta (volatilita)
  const volatilita = riskData?.volatilia_annua ?? riskData?.volatilia_annua ?? 0;
  const sharpe = riskData?.sharpe_ratio ?? 0;
  const maxDrawdown = riskData?.max_drawdown ?? 0;
  const beta = riskData?.beta ?? 0;
  // =============================================================

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
            {volatilita.toFixed(2)}%
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
          <span className={`text-2xl font-bold ${getSharpeColor(sharpe)}`}>
            {sharpe.toFixed(2)}
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
            {maxDrawdown.toFixed(2)}%
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
            {beta.toFixed(2)}
          </span>
          <p className="text-[11px] text-gray-500 mt-2 leading-tight">
            Sensibilità rispetto al mercato. Scostamenti superiori a 1 indicano uno strumento più amplificato rispetto all'indice generale.
          </p>
        </div>

      </div>

      <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center py-6 text-xs text-gray-400">
        🛡️ Calcolo avanzato in tempo reale basato sullo storico prezzi dell'ISIN {isin}.
      </div>
    </div>
  );
}