interface SearchBarProps {
  isin: string;
  onIsinChange: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export function SearchBar({ isin, onIsinChange, onSearch, isLoading }: SearchBarProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <input
        type="text"
        value={isin}
        onChange={(e) => onIsinChange(e.target.value.toUpperCase().trim())}
        placeholder="Inserisci ISIN (es. IE00BK5BQT80)"
        style={{ padding: '10px', marginRight: '10px', width: '280px', fontSize: '16px' }}
      />
      <button
        onClick={onSearch}
        style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}
        disabled={isLoading}
      >
        {isLoading ? 'Ricerca in corso...' : 'Cerca Dati'}
      </button>
    </div>
  );
}
