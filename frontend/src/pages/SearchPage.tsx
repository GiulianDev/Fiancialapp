import { SearchBar } from '../components/SearchBar';
import { EtfDetails } from '../components/EtfDetails/EtfDetails';
import { type FirebaseUser } from '../firebase';

interface SearchPageProps {
  isin: string;
  onIsinChange: (value: string) => void;
  cercaEtf: () => Promise<void>;
  caricando: boolean;
  errore: string | null;
  dati: any;
  limiteHoldings: number;
  setLimiteHoldings: (value: number | ((prev: number) => number)) => void;
  limiteCountries: number;
  setLimiteCountries: (value: number | ((prev: number) => number)) => void;
  favoriteIsins: Set<string>;
  onToggleFavorite: (isin: string, name: string) => void;
  user: FirebaseUser | null;
}

export function SearchPage({
  isin,
  onIsinChange,
  cercaEtf,
  caricando,
  errore,
  dati,
  limiteHoldings,
  setLimiteHoldings,
  limiteCountries,
  setLimiteCountries,
  favoriteIsins,
  onToggleFavorite,
  user,
}: SearchPageProps) {
  return (
    <>
      <div className="serchabar-container">
        <SearchBar isin={isin} onIsinChange={onIsinChange} onSearch={cercaEtf} isLoading={caricando} />
      </div>

      {errore && <p style={{ color: 'red', fontWeight: 'bold' }}>{errore}</p>}

      {dati && dati.status === 'success' && (
        <EtfDetails
          data={dati}
          limiteHoldings={limiteHoldings}
          limiteCountries={limiteCountries}
          onLoadMoreHoldings={() => setLimiteHoldings((prev) => prev + 5)}
          onLoadMoreCountries={() => setLimiteCountries((prev) => prev + 5)}
          isFavorite={favoriteIsins.has(isin)}
          onToggleFavorite={() => onToggleFavorite(isin, dati.nome)}
          user={user}
        />
      )}
    </>
  );
}
