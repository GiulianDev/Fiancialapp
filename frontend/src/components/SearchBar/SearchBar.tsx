import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card/Card';
import './SearchBar.css';

interface SearchBarProps {
  isin: string;
  onIsinChange: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export function SearchBar({ isin, onIsinChange, onSearch, isLoading }: SearchBarProps) {
  // Aggiungiamo uno stato per tracciare se l'input è selezionato
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Card 
      // Usiamo w-full per il mobile e gestiamo l'allargamento su schermi medi (md)
      // La classe transition-all crea un'animazione fluida durante il cambio di dimensione
      className={`search-bar--container mx-auto w-full transition-all duration-300 ease-in-out 
                  ${isFocused ? 'md:max-w-3xl' : 'md:max-w-xl'}`}
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
        placeholder="Inserisci ISIN (es. IE00BK5BQT80)"
        className="w-full min-w-[260px] flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 outline-none transition focus:border-white/30 focus:bg-white/15 focus:ring-2 focus:ring-white/10"
      />

      <Button onClick={onSearch} disabled={isLoading}>
        {isLoading ? 'Ricerca in corso...' : 'Cerca Dati'}
      </Button>

    </Card>
  );
}