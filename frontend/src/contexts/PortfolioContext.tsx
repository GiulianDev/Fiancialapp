import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  savePortfolio as savePortfolioService,
  getPortfolio as getPortfolioService,
  type SavedPortfolio,
} from '../services/portfolioService';

interface PortfolioContextType {
  portfolio: SavedPortfolio | null;
  loading: boolean;
  error: string | null;
  savePortfolio: (portfolio: SavedPortfolio) => Promise<void>;
  refreshPortfolio: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<SavedPortfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carica il portafoglio quando l'utente cambia
  useEffect(() => {
    if (user?.uid) {
      refreshPortfolio();
    } else {
      setPortfolio(null);
    }
  }, [user?.uid]);

  const refreshPortfolio = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getPortfolioService(user.uid);
      setPortfolio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading portfolio');
      console.error('Error loading portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePortfolio = async (newPortfolio: SavedPortfolio) => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      setError(null);
      await savePortfolioService(user.uid, newPortfolio);
      setPortfolio(newPortfolio);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error saving portfolio';
      setError(message);
      throw err;
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        loading,
        error,
        savePortfolio,
        refreshPortfolio,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
