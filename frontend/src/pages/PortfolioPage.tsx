// src/pages/PortfolioPage.tsx
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
  const { favorites, loading: favsLoading } = useFavorites(user);
  const { savedPortfolio, loading: portfolioLoading, error: portfolioError, updatePortfolio } = usePortfolio(user);

  const [analysisData, setAnalysisData] = useState<{ isins: string[]; weights: Record<string, number> } | null>(null);
  
  // STATO PER CONTROLLARE L'ESECUZIONE DEI GRAFICI
  const [triggerFetch, setTriggerFetch] = useState(false);

  useEffect(() => {
    if (savedPortfolio) {
      const numericWeights: Record<string, number> = {};
      savedPortfolio.selectedIsins.forEach(isin => {
        numericWeights[isin] = parseFloat(savedPortfolio.weights[isin] || '0');
      });
      setAnalysisData({ isins: savedPortfolio.selectedIsins, weights: numericWeights });
      setTriggerFetch(true); // Al caricamento iniziale, avviamo i grafici
    }
  }, [savedPortfolio]);

  // FUNZIONE 1: Fa solo la simulazione senza salvare
  const handleTest = (
    selectedIsins: string[], 
    _rawWeights: Record<string, string>, 
    numericWeights: Record<string, number>, 
    _unit: '€' | '$' | '%'
  ) => {
    setAnalysisData({ isins: selectedIsins, weights: numericWeights });
    setTriggerFetch(true); // Scatena l'analisi
  };

  // FUNZIONE 2: Salva sul database e fa la simulazione
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
      setTriggerFetch(true); // Scatena l'analisi
    } catch (err) {
      console.error('Portfolio save failed in parent:', err);
    }
  };

  // FUNZIONE 3: Si attiva quando l'utente cambia un peso nel form
  const handleInputsChanged = () => {
    // Spegniamo l'analisi finché l'utente non riclicca Test o Applica
    setTriggerFetch(false); 
  };

  const isGlobalLoading = favsLoading || portfolioLoading;

  if (isGlobalLoading && !analysisData) {
    return <div className="text-center p-8 text-white/50">Sincronizzazione dati in corso...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      
      {portfolioError && (
        <div className="text-red-300 text-sm mb-4">Errore portafoglio: {portfolioError}</div>
      )}

      {/* Passiamo le tre funzioni al selettore usando i commenti corretti per il JSX */}
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
          triggerFetch={triggerFetch} // Passiamo lo stato
        />
      )}

    </div>
  );
}