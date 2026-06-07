import { useState } from 'react';
// import { FavoritesPortfolio } from '../components/FavoritesPortfolio';
import { PortfolioAnalysis } from '../components/PortfolioAnalysis';
import { FavoritesSelector } from '../components/FavoritesSelector';
import { type Favorite, type FirebaseUser } from '../firebase';


interface PortfolioPageProps {
  user: FirebaseUser | null;
  favorites: Favorite[];
}

export function PortfolioPage({ user, favorites }: PortfolioPageProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState<{ isins: string[]; weights: Record<string, number> } | null>(null);

  const handleAnalyze = (isins: string[], weights: Record<string, number>) => {
    setAnalysisData({ isins, weights });
    setShowAnalysis(true);
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4 text-center">
        {/* <h1 className="text-3xl font-bold mb-6">Your Portfolio</h1> */}
        <p className="text-gray-600 border p-8 rounded-lg bg-gray-50">
          Effettua il login per visualizzare e analizzare il tuo portafoglio di ETF preferiti.
        </p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">


      

       {/* <h1 className="text-3xl font-bold mb-6">Your Portfolio</h1> */}

       <FavoritesSelector 
         user={user} 
         favorites={favorites} 
         onAnalyze={handleAnalyze} 
         isLoading={false} 
       />


      {showAnalysis && analysisData && (
        <>
          <PortfolioAnalysis 
            user={user} 
            selectedIsins={analysisData.isins} 
            weights={analysisData.weights} 
          />
        </>
      )}
    </div>
  );
}
