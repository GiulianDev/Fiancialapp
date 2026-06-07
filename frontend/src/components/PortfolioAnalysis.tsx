import { useState, useEffect } from 'react';
import { type FirebaseUser } from '../firebase';
import type { EtfData } from '../types/etf';
import { EtfFavorites } from './EtfFavorites/EtfFavorites';

// 1. IMPORTIAMO LA NOSTRA NUOVA UTILITY E LA SUA INTERFACCIA
import { analyzePortfolio, type AdvancedPortfolioAnalysis } from '../utils/portfolioUtils';

interface PortfolioAnalysisProps {
  user: FirebaseUser | null;
  selectedIsins: string[];
  weights: Record<string, number>;
}

export function PortfolioAnalysis({ user, selectedIsins, weights }: PortfolioAnalysisProps) {
  // 2. AGGIORNIAMO LO STATO PER USARE IL NUOVO TIPO AVANZATO
  const [combined, setCombined] = useState<AdvancedPortfolioAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const computeCombined = async () => {
      if (!user || selectedIsins.length === 0) return;

      setLoading(true);
      setError(null);
      try {
        // Scarichiamo i dati di tutti gli ETF selezionati
        const etfData = await Promise.all(
          selectedIsins.map(async (isin) => {
            const response = await fetch(`http://127.0.0.1:8000/api/etf/${isin}`);
            const payload = await response.json();
            if (!response.ok || payload?.status === 'error') {
              throw new Error(payload?.message ?? `Errore caricamento ISIN ${isin}`);
            }
            return payload as EtfData;
          })
        );
        
        // 3. ESEGUIAMO L'ANALISI COMPLETA CON UNA SOLA RIGA
        const analysisResult = analyzePortfolio(etfData, weights);
        setCombined(analysisResult);

      } catch (err) {
        console.error('Combine error:', err);
        setError(err instanceof Error ? err.message : 'Errore durante il calcolo.');
      } finally {
        setLoading(false);
      }
    };

    computeCombined();
  }, [user, selectedIsins, weights]);

  // Gestione degli stati di caricamento ed errore
  if (loading) return <div className="p-4 text-center">Calcolo dell'analisi in corso...</div>;
  if (error) return <div className="p-4 text-red-600">Errore: {error}</div>;
  if (!combined) return <div className="p-4 text-gray-500 text-center">Seleziona degli ETF per vedere l'analisi.</div>;

  // Se l'utente ha inserito 0 per tutti gli ETF
  if (combined.count === 0) {
    return (
      <div className="p-4 text-amber-600 text-center bg-amber-50 border border-amber-200 rounded-md">
        ⚠️ Nessun ETF valido da analizzare. Assicurati di inserire quote maggiori di 0.
      </div>
    );
  }

  // 4. PASSIAMO I DATI ARRICCHITI ALLA UI
  return (
    <div className="portfolio-analysis-results flex flex-col gap-6 mt-4">
      
      {/* Qui possiamo già iniziare a stampare i nuovi calcoli finanziari, 
        prima ancora dei grafici di EtfFavorites!
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* WIDGET COSTI */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Efficienza & Costi</h4>
          <p className="text-2xl font-bold text-gray-800">{combined.weightedTer}% <span className="text-sm font-normal text-gray-500">TER Medio</span></p>
          <p className="text-sm text-gray-600 mt-1">Costo annuo stimato: <strong>{combined.totalFeesYearly}</strong></p>
        </div>

        {/* WIDGET STILE DI INVESTIMENTO */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Orientamento Stile</h4>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
              <div style={{ width: `${combined.styleAllocation.growth}%` }} className="bg-blue-500 h-full" title="Growth"></div>
              <div style={{ width: `${combined.styleAllocation.value}%` }} className="bg-emerald-500 h-full" title="Value / Difensivo"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1 font-medium">
            <span className="text-blue-700">{combined.styleAllocation.growth}% Growth</span>
            <span className="text-emerald-700">{combined.styleAllocation.value}% Value</span>
          </div>
        </div>

      </div>

      {/* RENDERIZZAZIONE DEGLI ALLARMI DI SOVRAPPOSIZIONE */}
      {combined.overlapAlerts.length > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="text-orange-800 font-bold mb-2 flex items-center gap-2">
            <span>⚠️</span> Rischio di Concentrazione Rilevato
          </h4>
          <ul className="text-sm text-orange-900 list-disc pl-5">
            {combined.overlapAlerts.map((alert, idx) => (
              <li key={idx} className="mb-1">
                <strong>{alert.nome}</strong> pesa ben il <strong>{alert.pesoComplessivo}%</strong> del portafoglio totale (presente in {alert.contribuenti.length} ETF).
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* COMPONENTE GRAFICI STANDARD */}
      <EtfFavorites combined={combined} />
      
    </div>
  );
}