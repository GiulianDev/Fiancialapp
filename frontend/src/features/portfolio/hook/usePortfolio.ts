import { usePortfolio as usePortfolioContext } from '../../../shared/contexts/PortfolioContext';

/**
 * Hook personalizzato per gestire il portafoglio
 * 
 * Ora usa il PortfolioContext per accedere ai dati globali
 * @deprecated Aggiorna i componenti per usare usePortfolio() senza parametri
 * @param user - (DEPRECATED) Ignorato, il contesto fornisce l'utente
 * @returns oggetto con savedPortfolio, loading, error e updatePortfolio
 */
export function usePortfolio() {
  const context = usePortfolioContext();

  return {
    savedPortfolio: context.portfolio,
    loading: context.loading,
    error: context.error,
    updatePortfolio: context.savePortfolio,
  };
}