// src/contexts/SearchContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface SearchContextType {
  isinInput: string;
  setIsinInput: (val: string) => void;
  activeIsin: string;
  setActiveIsin: (val: string) => void;
  limiteHoldings: number;
  setLimiteHoldings: React.Dispatch<React.SetStateAction<number>>;
  limiteCountries: number;
  setLimiteCountries: React.Dispatch<React.SetStateAction<number>>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  
  // 1. Inizializziamo a stringa vuota: la barra mostrerà il placeholder all'avvio
  const [isinInput, setIsinInput] = useState('');
  const [activeIsin, setActiveIsin] = useState('');
  
  const [limiteHoldings, setLimiteHoldings] = useState(5);
  const [limiteCountries, setLimiteCountries] = useState(5);

  return (
    <SearchContext.Provider
      value={{
        isinInput,
        setIsinInput,
        activeIsin,
        setActiveIsin,
        limiteHoldings,
        setLimiteHoldings,
        limiteCountries,
        setLimiteCountries,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch deve essere usato all\'interno di un SearchProvider');
  }
  return context;
}