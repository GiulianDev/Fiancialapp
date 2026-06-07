import { useState, useEffect } from 'react';
// IMPORT CORRETTO: Prendiamo SavedPortfolio da firebase.ts
import { type FirebaseUser, type SavedPortfolio } from '../firebase';
import { useFavorites } from '../hooks/useFavorites';
import { usePortfolio } from '../hooks/usePortfolio'; // Rimosso SavedPortfolio da qui
import { FavoritesSelector } from '../components/FavoritesSelector';
import { PortfolioAnalysis } from '../components/PortfolioAnalysis';

interface PortfolioPageProps {
  user: FirebaseUser | null;
}

export function PortfolioPage({ user }: PortfolioPageProps) {
  // Sfruttiamo i due hook custom speculari
  const { favorites, loading: favsLoading } = useFavorites(user);
  const { savedPortfolio, loading: portfolioLoading, updatePortfolio } = usePortfolio(user);

  // Stato locale per triggerare i grafici a schermo
  const [analysisData, setAnalysisData] = useState<{ isins: string[]; weights: Record<string, number> } | null>(null);

  // Se Firebase trova un portafoglio preesistente, avvia l'analisi al caricamento della pagina
  useEffect(() => {
    if (savedPortfolio) {
      const numericWeights: Record<string, number> = {};
      savedPortfolio.selectedIsins.forEach(isin => {
        numericWeights[isin] = parseFloat(savedPortfolio.weights[isin] || '0');
      });
      setAnalysisData({ isins: savedPortfolio.selectedIsins, weights: numericWeights });
    }
  }, [savedPortfolio]);

  // Gestione dell'azione al click del pulsante analizza
  const handleAnalyzeAndSave = async (
    selectedIsins: string[], 
    rawWeights: Record<string, string>, 
    numericWeights: Record<string, number>, 
    unit: '€' | '$' | '%'
  ) => {
    // 1. Mostra i grafici a schermo
    setAnalysisData({ isins: selectedIsins, weights: numericWeights });

    // 2. Salva su Firebase tramite l'hook dedicato
    const newPortfolio: SavedPortfolio = {
      selectedIsins,
      weights: rawWeights,
      unit
    };
    await updatePortfolio(newPortfolio);
  };

  const isGlobalLoading = favsLoading || portfolioLoading;

  if (isGlobalLoading && !analysisData) {
    return <div className="text-center p-8 text-white/50">Sincronizzazione dati in corso...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      
      <FavoritesSelector 
        user={user}
        favorites={favorites}
        isLoading={isGlobalLoading}
        initialData={savedPortfolio}
        onAnalyzeAndSave={handleAnalyzeAndSave}
      />

      {analysisData && (
        <PortfolioAnalysis 
          user={user}
          selectedIsins={analysisData.isins}
          weights={analysisData.weights}
        />
      )}

    </div>
  );
}