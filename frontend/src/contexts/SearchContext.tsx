import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EtfData } from '../types/etf';
import { SEARCH_ETF_API_URL } from '../constants';

interface SearchContextType {
  isin: string;
  setIsin: (isin: string) => void;
  dati: EtfData | null;
  caricando: boolean;
  errore: string | null;
  limiteHoldings: number;
  setLimiteHoldings: (limit: number | ((prev: number) => number)) => void;
  limiteCountries: number;
  setLimiteCountries: (limit: number | ((prev: number) => number)) => void;
  cercaEtf: () => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  
  const [isin, setIsin] = useState('IE00BK5BQT80');
  const [dati, setDati] = useState<EtfData | null>(null);
  const [caricando, setCaricando] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [limiteHoldings, setLimiteHoldings] = useState(5);
  const [limiteCountries, setLimiteCountries] = useState(5);

  const cercaEtf = useCallback(async () => {
    setCaricando(true);
    setErrore(null);
    setLimiteHoldings(5);
    setLimiteCountries(5);

    try {
      // const response = await fetch(`${API_URL}/api/v2/etf/${isin}`);
      const response = await fetch(`${SEARCH_ETF_API_URL}/${isin}`);
      const data = await response.json();

      if (data.status === 'error') {
        setErrore(data.message);
      } else {
        setDati(data);
      }
    } catch (error) {
      setErrore('Errore di connessione al server Python.');
    } finally {
      setCaricando(false);
    }
  }, [isin]);

  return (
    <SearchContext.Provider
      value={{
        isin,
        setIsin,
        dati,
        caricando,
        errore,
        limiteHoldings,
        setLimiteHoldings,
        limiteCountries,
        setLimiteCountries,
        cercaEtf,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
