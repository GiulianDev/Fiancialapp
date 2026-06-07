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
  return (

     <Card className="search-bar--container mx-auto w-11/12 md:max-w-xl">

      <label htmlFor="isin-search" className="sr-only">
        Ricerca ISIN
      </label>
      
      <input
        id="isin-search"
        type="text"
        value={isin}
        onChange={(e) => onIsinChange(e.target.value.toUpperCase().trim())}
        placeholder="Inserisci ISIN (es. IE00BK5BQT80)"
        className="w-full min-w-[260px] flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 outline-none transition focus:border-white/30 focus:bg-white/15 focus:ring-2 focus:ring-white/10"
      />

      <Button onClick={onSearch} disabled={isLoading}>
        {isLoading ? 'Ricerca in corso...' : 'Cerca Dati'}
      </Button>

     </Card>

    // <div className="mb-6 rounded-[1.5rem] border border-white/15 bg-white/10 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl transition sm:flex sm:items-center sm:gap-4">
    //   <label htmlFor="isin-search" className="sr-only">
    //     Ricerca ISIN
    //   </label>

    //   <input
    //     id="isin-search"
    //     type="text"
    //     value={isin}
    //     onChange={(e) => onIsinChange(e.target.value.toUpperCase().trim())}
    //     placeholder="Inserisci ISIN (es. IE00BK5BQT80)"
    //     className="w-full min-w-[260px] flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 outline-none transition focus:border-white/30 focus:bg-white/15 focus:ring-2 focus:ring-white/10"
    //   />

    //   <Button onClick={onSearch} disabled={isLoading}>
    //     {isLoading ? 'Ricerca in corso...' : 'Cerca Dati'}
    //   </Button>
    // </div>
  );
}
