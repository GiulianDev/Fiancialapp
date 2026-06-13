import { useState, useEffect } from 'react';
import { useFavorites, usePortfolio } from '@context';
import { FavoritesSelector } from '.';
import { PortfolioAnalysis } from '.';
import type { SavedPortfolio } from '.';

export function PortfolioPage() {
  
  // Il portfolio usa i context globali per caricare i dati dell'utente
  // e mantenere i salvataggi sincronizzati con Firestore.
  const { favorites, loading: favsLoading } = useFavorites();
  const { portfolio: savedPortfolio, loading: portfolioLoading, error: portfolioError, savePortfolio } = usePortfolio();

  const [analysisData, setAnalysisData] = useState<{ isins: string[]; weights: Record<string, number> } | null>(null);
  
  const [triggerFetch, setTriggerFetch] = useState(false);

  useEffect(() => {
    if (savedPortfolio) {
      const numericWeights: Record<string, number> = {};
      savedPortfolio.selectedIsins.forEach((isin: string | number) => {
        numericWeights[isin] = parseFloat(savedPortfolio.weights[isin] || '0');
      });
      setAnalysisData({ isins: savedPortfolio.selectedIsins, weights: numericWeights });
      setTriggerFetch(true); 
    }
  }, [savedPortfolio]);

  const handleTest = (
    selectedIsins: string[], 
    _rawWeights: Record<string, string>, 
    numericWeights: Record<string, number>, 
    _unit: '€' | '$' | '%'
  ) => {
    setAnalysisData({ isins: selectedIsins, weights: numericWeights });
    setTriggerFetch(true); 
  };

  const handleApplica = async (
    selectedIsins: string[], 
    rawWeights: Record<string, string>, 
    numericWeights: Record<string, number>, 
    unit: '€' | '$' | '%'
  ) => {
    const newPortfolio: SavedPortfolio = {
      selectedIsins,
      weights: rawWeights,
      unit
    };

    try {
      await savePortfolio(newPortfolio);
      setAnalysisData({ isins: selectedIsins, weights: numericWeights });
      setTriggerFetch(true); 
    } catch (err) {
      console.error('Portfolio save failed in parent:', err);
    }
  };

  const handleInputsChanged = () => {
    setTriggerFetch(false); 
  };

  const isGlobalLoading = favsLoading || portfolioLoading;

  if (isGlobalLoading && !analysisData) {
    // Aggiunto w-full qui
    return <div className="text-center p-8 text-white/50 w-full">Sincronizzazione dati in corso...</div>;
  }

  return (
    // Aggiunto w-full e max-w-full per blindare la larghezza
    <div className="flex flex-col gap-6 w-full max-w-full">
      
      {portfolioError && (
        <div className="text-red-300 text-sm mb-4">Errore portafoglio: {portfolioError}</div>
      )}

      <FavoritesSelector 
        favorites={favorites}
        isLoading={isGlobalLoading}
        initialData={savedPortfolio}
        onTest={handleTest}
        onApplica={handleApplica}
        onInputsChanged={handleInputsChanged}
      />


      

      {analysisData && (
        <PortfolioAnalysis 
          selectedIsins={analysisData.isins}
          weights={analysisData.weights}
          triggerFetch={triggerFetch}
        />
      )}

    </div>
  );
}