import { SearchBar } from '../components/SearchBar/SearchBar';
import { EtfDetails } from '../components/EtfDetails/EtfDetails';
import { useSearch } from '../contexts/SearchContext';
import { useFavorites } from '../contexts/FavoritesContext';

interface SearchPageProps {
  onHoldingClick: (isin: string, name: string) => void;
}

export function SearchPage({ onHoldingClick }: SearchPageProps) {
  
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
  } = useSearch();

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const toggleFavorite = async (isin: string, name?: string) => {
    if (isFavorite(isin)) {
      await removeFavorite(isin);
    } else {
      await addFavorite(isin, name);
    }
  };

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
          isFavorite={isFavorite(isin)}
          onToggleFavorite={() => toggleFavorite(isin, dati.nome)}
          // 2. Passiamo direttamente la prop a EtfDetails senza logiche locali intermedie
          onHoldingClick={onHoldingClick}
        />
      )}
    </>
  );
}