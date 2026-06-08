// src/components/PortfolioAnalysis.tsx
import { useMemo } from 'react';
import { type FirebaseUser } from '../firebase';
import { EtfCharts } from './EtfCharts/EtfCharts';
import { Card } from './ui/Card/Card'; 

// Importiamo l'utility di calcolo
import { analyzePortfolio } from '../utils/portfolioUtils';
// Importiamo il tuo nuovo custom hook!
import { useFetchedEtfData } from '../hooks/useFetchedEtfData';

interface PortfolioAnalysisProps {
  user: FirebaseUser | null;
  selectedIsins: string[];
  weights: Record<string, number>;
}

export function PortfolioAnalysis({ user, selectedIsins, weights }: PortfolioAnalysisProps) {
  
  // 1. Chiamiamo il nuovo hook. Niente URL piantati qui, se lo smazza l'hook!
  const { etfData, loading, error } = useFetchedEtfData(user, selectedIsins);

  // 2. Eseguiamo il calcolo matematico combinato sfruttando useMemo.
  // Si attiva solo quando cambiano i dati degli ETF scaricati o i pesi impostati.
  const combined = useMemo(() => {
    if (etfData.length === 0) return null;
    try {
      return analyzePortfolio(etfData, weights);
    } catch (err) {
      console.error('Errore durante l\'analisi combinata:', err);
      return null;
    }
  }, [etfData, weights]);

  // Gestione degli stati nativi della UI basati sull'hook
  if (loading) return <div className="p-4 text-center text-white/70">Calcolo dell'analisi in corso...</div>;
  if (error) return <div className="p-4 text-red-400">Errore: {error}</div>;
  if (!combined) return <div className="p-4 text-white/50 text-center">Seleziona degli ETF per vedere l'analisi.</div>;

  if (combined.count === 0) {
    return (
      <div className="p-4 text-amber-400 text-center bg-amber-500/10 border border-amber-500/20 rounded-xl backdrop-blur-md">
        ⚠️ Nessun ETF valido da analizzare. Assicurati di inserire quote maggiori di 0.
      </div>
    );
  }

  return (
    <div className="portfolio-analysis-results flex flex-col gap-6 mt-4">
      
      {/* SEZIONE METRICHE AVANZATE AVVOLTE NELLE TUE CARD NATIVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CARD EFFICIENZA E COSTI */}
        <Card>
          <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">
            Efficienza & Costi
          </h4>
          <p className="text-3xl font-bold text-white">
            {combined.weightedTer}% <span className="text-sm font-normal text-white/60">TER Medio</span>
          </p>
          <p className="text-sm text-white/70 mt-2">
            Costo annuo stimato: <strong className="text-white">{combined.totalFeesYearly}</strong>
          </p>
        </Card>

        {/* CARD ORIENTAMENTO STILE (GROWTH VS VALUE) */}
        <Card>
          <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">
            Orientamento Stile
          </h4>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden flex border border-white/5">
              <div 
                style={{ width: `${combined.styleAllocation.growth}%` }} 
                className="bg-blue-500/60 h-full backdrop-blur-sm transition-all duration-500" 
                title="Growth"
              ></div>
              <div 
                style={{ width: `${combined.styleAllocation.value}%` }} 
                className="bg-emerald-500/60 h-full backdrop-blur-sm transition-all duration-500" 
                title="Value / Difensivo"
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-white/80 mt-2 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500/80"></span>
              {combined.styleAllocation.growth}% Growth
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
              {combined.styleAllocation.value}% Value
            </span>
          </div>
        </Card>

      </div>

      {/* RENDERIZZAZIONE DEGLI ALLARMI DI SOVRAPPOSIZIONE */}
      {combined.overlapAlerts.length > 0 && (
        <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl backdrop-blur-md">
          <h4 className="text-orange-400 font-bold mb-3 flex items-center gap-2 text-base">
            <span>⚠️</span> Rischio di Concentrazione Rilevato
          </h4>
          <ul className="text-sm text-white/80 list-disc pl-5 space-y-1">
            {combined.overlapAlerts.map((alert, idx) => (
              <li key={idx}>
                <span className="text-orange-300 font-semibold">{alert.nome}</span> pesa ben il <strong className="text-white font-bold">{alert.pesoComplessivo}%</strong> del tuo intero portafoglio (è presente in {alert.contribuenti.length} ETF diversi).
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* COMPONENTE GRAFICI STANDARD */}
      <EtfCharts combined={combined} />
      
    </div>
  );
}