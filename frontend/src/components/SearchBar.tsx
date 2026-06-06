interface SearchBarProps {
  isin: string;
  onIsinChange: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export function SearchBar({ isin, onIsinChange, onSearch, isLoading }: SearchBarProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <label htmlFor="isin-search" className="sr-only">
        Ricerca ISIN
      </label>

      <input
        id="isin-search"
        type="text"
        value={isin}
        onChange={(e) => onIsinChange(e.target.value.toUpperCase().trim())}
        placeholder="Inserisci ISIN (es. IE00BK5BQT80)"
        className="w-full min-w-[260px] flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:bg-white focus:ring-2 focus:ring-slate-200"
      />

      <button
        onClick={onSearch}
        className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isLoading}
      >
        {isLoading ? 'Ricerca in corso...' : 'Cerca Dati'}
      </button>
    </div>
  );
}
