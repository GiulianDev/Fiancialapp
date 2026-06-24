import { useState, useEffect } from 'react';
import { usePortfolio } from '@context';
import { FavoritesSelector } from '.';
import { PortfolioAnalisys } from '.';
import type { SavedPortfolio } from '@/shared/types';
import { useFavorites } from '@/shared/Favorites';

export function PortfolioPage() {
  const { favorites, loading: favsLoading, removeFavorite } = useFavorites();
  const { portfolio: savedPortfolio, loading: portfolioLoading, error: portfolioError, savePortfolio } = usePortfolio();

  // Stato consolidato delegato ai componenti di analisi statistica
  const [analysisData, setAnalysisData] = useState<{ isins: string[]; weights: Record<string, number> } | null>(null);

  // Sincronizzazione iniziale con il DB all'avvio
  useEffect(() => {
    if (savedPortfolio) {
      const numericWeights: Record<string, number> = {};
      savedPortfolio.selectedIsins.forEach((isin: string) => {
        numericWeights[isin] = parseFloat(savedPortfolio.weights[isin] || '0');
      });
      setAnalysisData({ isins: savedPortfolio.selectedIsins, weights: numericWeights });
    }
  }, [savedPortfolio]);

  // Funzione Senior di Deep Comparison per evitare chiamate inutili al DB (Firebase)
  const isPortfolioUnchanged = (newIsins: string[], newWeights: Record<string, string>, newUnit: string) => {
    if (!savedPortfolio) return false;
    if (savedPortfolio.unit !== newUnit) return false;
    if (savedPortfolio.selectedIsins.length !== newIsins.length) return false;

    // Controllo se gli elementi dell'array coincidono
    const matchAllIsins = newIsins.every((isin) => savedPortfolio.selectedIsins.includes(isin));
    if (!matchAllIsins) return false;

    // Controllo se tutti i pesi (string) coincidono
    const matchAllWeights = newIsins.every((isin) => savedPortfolio.weights[isin] === newWeights[isin]);
    return matchAllWeights;
  };

  const handleTest = (
    selectedIsins: string[], 
    _rawWeights: Record<string, string>, 
    numericWeights: Record<string, number>, 
    // _unit: '€' | '$' | '%'
  ) => {
    // Aggiorna solo la UI locale per simulazione senza toccare il DB
    setAnalysisData({ isins: selectedIsins, weights: numericWeights });
  };

  const handleApplica = async (
    selectedIsins: string[], 
    rawWeights: Record<string, string>, 
    numericWeights: Record<string, number>, 
    unit: '€' | '$' | '%'
  ) => {
    // Controllo preventivo: se i dati non sono cambiati rispetto al DB, evita il salvataggio
    if (isPortfolioUnchanged(selectedIsins, rawWeights, unit)) {
      console.log('Nessuna modifica rilevata. Scrittura su DB saltata.');
      // Sincronizziamo comunque lo stato dell'analisi per sicurezza
      setAnalysisData({ isins: selectedIsins, weights: numericWeights });
      return;
    }

    const newPortfolio: SavedPortfolio = {
      selectedIsins,
      weights: rawWeights,
      unit
    };

    try {
      await savePortfolio(newPortfolio);
      setAnalysisData({ isins: selectedIsins, weights: numericWeights });
    } catch (err) {
      console.error('Portfolio save failed in parent:', err);
    }
  };

  const isGlobalLoading = favsLoading || portfolioLoading;

  if (isGlobalLoading && !analysisData) {
    return <div className="text-center p-8 text-white/50 w-full animate-pulse">Sincronizzazione dati in corso...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {portfolioError && (
        <div className="text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm mb-2">
          Errore portafoglio: {portfolioError}
        </div>
      )}

      <FavoritesSelector 
        favorites={favorites}
        isLoading={isGlobalLoading}
        initialData={savedPortfolio}
        onTest={handleTest}
        onApplica={handleApplica}
        onRemoveFavorite={removeFavorite}
      />

      {analysisData && analysisData.isins.length > 0 ? (
        <PortfolioAnalisys 
          selectedIsins={analysisData.isins}
          weights={analysisData.weights}
        />
      ) : (
        <div className="p-6 text-white/50 text-center bg-white/5 border border-white/10 rounded-xl mt-4">
          Seleziona almeno un ETF e clicca su <strong>"Test"</strong> o <strong>"Applica"</strong> per generare i grafici e l'analisi dettagliata.
        </div>
      )}
    </div>
  );
}