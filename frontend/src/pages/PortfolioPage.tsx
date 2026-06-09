import { useState, useEffect } from 'react';
import { type FirebaseUser, type SavedPortfolio } from '../firebase';
import { useFavorites } from '../hooks/useFavorites';
import { usePortfolio } from '../hooks/usePortfolio'; 
import { FavoritesSelector } from '../components/FavoritesSelector';
import { PortfolioAnalysis } from '../components/PortfolioAnalysis';

interface PortfolioPageProps {
  user: FirebaseUser | null;
}

export function PortfolioPage({ user }: PortfolioPageProps) {
  const { favorites, loading: favsLoading } = useFavorites();
  const { savedPortfolio, loading: portfolioLoading, error: portfolioError, updatePortfolio } = usePortfolio();

  const [analysisData, setAnalysisData] = useState<{ isins: string[]; weights: Record<string, number> } | null>(null);
  
  const [triggerFetch, setTriggerFetch] = useState(false);

  useEffect(() => {
    if (savedPortfolio) {
      const numericWeights: Record<string, number> = {};
      savedPortfolio.selectedIsins.forEach(isin => {
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
      await updatePortfolio(newPortfolio);
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
          user={user}
          selectedIsins={analysisData.isins}
          weights={analysisData.weights}
          triggerFetch={triggerFetch}
        />
      )}

    </div>
  );
}