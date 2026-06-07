import { SearchBar } from '../components/SearchBar';
import { EtfDetails } from '../components/EtfDetails/EtfDetails';
import { type FirebaseUser } from '../firebase';
import { useEtfSearch } from '../hooks/useEtfSearch';
import { useFavorites } from '../hooks/useFavorites';

interface SearchPageProps {
  favoriteIsins: Set<string>;
  onToggleFavorite: (isin: string, name: string) => void;
  user: FirebaseUser | null;
}

export function SearchPage({user}: SearchPageProps) {

  const {
    isin,
    setIsin,
    cercaEtf,
    caricando,
    errore,
    dati,
    limiteHoldings,
    setLimiteHoldings,
    limiteCountries,
    setLimiteCountries,
  } = useEtfSearch();

  const { favoriteIsins, toggleFavorite } = useFavorites(user);

  return (
    <>
      <div style={{width: '80%'}}>
        <SearchBar isin={isin} onIsinChange={setIsin} onSearch={cercaEtf} isLoading={caricando} />
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
          onToggleFavorite={() => toggleFavorite(isin, dati.nome)}
          user={user}
        />
      )}
    </>
  );
}
