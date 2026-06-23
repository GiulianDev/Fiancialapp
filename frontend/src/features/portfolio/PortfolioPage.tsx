import { useState, useEffect } from 'react';
import { usePortfolio } from '@context';
import { FavoritesSelector } from '.';
import { PortfolioAnalisys } from '.';
import type { SavedPortfolio } from '@/shared/types';
import { useFavorites } from '@/shared/Favorites';

export function PortfolioPage() {
  
  // Destrutturato removeFavorite direttamente dal context globale dei preferiti
  const { favorites, loading: favsLoading, removeFavorite } = useFavorites();
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
    return <div className="text-center p-8 text-white/50 w-full">Sincronizzazione dati in corso...</div>;
  }

  return (
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
        onRemoveFavorite={removeFavorite} // <-- PASSATO IL METODO DEL CONTEXT QUI
      />

      {analysisData && (
        <PortfolioAnalisys 
          selectedIsins={analysisData.isins}
          weights={analysisData.weights}
          triggerFetch={triggerFetch}
        />
      )}

    </div>
  );
}