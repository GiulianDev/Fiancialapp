import { SearchBar } from '../components/SearchBar/SearchBar';
import { EtfDetails } from '../components/EtfDetails/EtfDetails';
import { type FirebaseUser } from '../firebase';
import { useEtfSearch } from '../hooks/useEtfSearch';
import { useFavorites } from '../hooks/useFavorites';

interface SearchPageProps {
  user: FirebaseUser | null;
  onHoldingClick: (isin: string, name: string) => void;
}

export function SearchPage({ user, onHoldingClick }: SearchPageProps) {

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

  const { favoriteIsins, toggleFavorite } = useFavorites();

  return (
    <>
      <SearchBar isin={isin} onIsinChange={setIsin} onSearch={cercaEtf} isLoading={caricando} />

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
          // 2. Passiamo direttamente la prop a EtfDetails senza logiche locali intermedie
          onHoldingClick={onHoldingClick}
        />
      )}
    </>
  );
}