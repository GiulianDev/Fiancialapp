import { useMemo } from 'react';
import { EtfCharts } from '../components/EtfCharts/EtfCharts';
import { Card } from '../../../shared/ui/Card/Card'; 
import { analyzePortfolio } from './portfolioUtils';
import { usePortfolioAnalisys } from './usePortfolioAnalisys';

interface PortfolioAnalysisProps {
  selectedIsins: string[];
  weights: Record<string, number>;
}

export function PortfolioAnalisys({ selectedIsins, weights }: PortfolioAnalysisProps) {
  // L'hook recupera o estrae dalla cache di React Query in modo reattivo
  const { etfData, loading, error } = usePortfolioAnalisys(selectedIsins);

  const combined = useMemo(() => {
    if (etfData.length === 0) return null;
    try {
      return analyzePortfolio(etfData, weights);
    } catch (err) {
      console.error('Errore durante l\'analisi combinata:', err);
      return null;
    }
  }, [etfData, weights]);

  if (loading) {
    return <div className="p-8 text-center text-white/70 font-medium animate-pulse">Calcolo dell'analisi in corso...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl text-center">Errore: {error}</div>;
  }
  
  if (!combined) return null;

  if (combined.count === 0) {
    return (
      <div className="p-4 text-amber-400 text-center bg-amber-500/10 border border-amber-500/20 rounded-xl backdrop-blur-md">
        ⚠️ Nessun ETF valido da analizzare. Assicurati di inserire quote maggiori di 0.
      </div>
    );
  }

  return (
    <div className="portfolio-analysis-results flex flex-col gap-6 mt-4 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">Efficienza & Costi</h4>
          <p className="text-3xl font-bold text-white">{combined.weightedTer}% <span className="text-sm font-normal text-white/60">TER Medio</span></p>
          <p className="text-sm text-white/70 mt-2">Costo annuo stimato: <strong className="text-white">{combined.totalFeesYearly}</strong></p>
        </Card>

        <Card>
          <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">Orientamento Stile</h4>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden flex border border-white/5">
              {/* Gli inline style per l'attributo width sono usati correttamente qui per il calcolo percentuale dinamico a runtime */}
              <div style={{ width: `${combined.styleAllocation.growth}%` }} className="bg-blue-500/60 h-full backdrop-blur-sm transition-all duration-500" title="Growth"></div>
              <div style={{ width: `${combined.styleAllocation.value}%` }} className="bg-emerald-500/60 h-full backdrop-blur-sm transition-all duration-500" title="Value / Difensivo"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-white/80 mt-2 font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500/80"></span>{combined.styleAllocation.growth}% Growth</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>{combined.styleAllocation.value}% Value</span>
          </div>
        </Card>
      </div>

      {combined.overlapAlerts.length > 0 && (
        <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl backdrop-blur-md">
          <h4 className="text-orange-400 font-bold mb-3 flex items-center gap-2 text-base"><span>⚠️</span> Rischio di Concentrazione Rilevato</h4>
          <ul className="text-sm text-white/80 list-disc pl-5 space-y-1">
            {combined.overlapAlerts.map((alert, idx) => (
              <li key={idx}>
                <span className="text-orange-300 font-semibold">{alert.nome}</span> pesa ben il <strong className="text-white font-bold">{alert.pesoComplessivo}%</strong> del portafoglio (è presente in {alert.contribuenti.length} ETF).
              </li>
            ))}
          </ul>
        </div>
      )}

      <EtfCharts combined={combined} />
    </div>
  );
}