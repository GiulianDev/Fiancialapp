import { useState } from 'react';
import { Button } from '@ui';
import { Card } from '@ui';
import './SearchBar.css';

interface SearchBarProps {
  isin: string;
  onIsinChange: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  placeholder: string;
}

export function SearchBar({ isin, onIsinChange, onSearch, isLoading, placeholder }: SearchBarProps) {
  // Aggiungiamo uno stato per tracciare se l'input è selezionato
  const [isFocused, setIsFocused] = useState(false);

  // Questo componente rimane 'dumb': non sa nulla del routing o dei dati.
  // Riceve il testo, notifica il cambiamento e lancia la ricerca al click/invio.
  return (
    <Card 
      // Usiamo w-full per il mobile e gestiamo l'allargamento su schermi medi (md)
      // La classe transition-all crea un'animazione fluida durante il cambio di dimensione
      className={`search-bar--container mx-auto w-full transition-all duration-300 ease-in-out 
                  ${isFocused ? 'md:max-w-3xl' : 'md:max-w-xl'}`}
    >
      <form
        className="flex flex-col md:flex-row gap-3 items-center"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <label htmlFor="isin-search" className="sr-only">
          Ricerca ISIN
        </label>
        
        <input
          id="isin-search"
          type="text"
          value={isin}
          onChange={(e) => onIsinChange(e.target.value.toUpperCase().trim())}
          // Attiviamo e disattiviamo lo stato quando l'utente clicca o esce dall'input
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full min-w-[260px] flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 outline-none transition focus:border-white/30 focus:bg-white/15 focus:ring-2 focus:ring-white/10"
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Ricerca in corso...' : 'Cerca Dati'}
        </Button>
      </form>
    </Card>
  );
}