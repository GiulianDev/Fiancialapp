// src/pages/SearchPage.tsx
import { SearchBar } from '../components/SearchBar/SearchBar';
import { EtfDetails } from '../components/EtfDetails/EtfDetails';
import { useFavorites } from '../contexts/FavoritesContext';
import { useSearch } from '../contexts/SearchContext';
import { useEtfSearch } from '../hooks/useEtfSearch';

interface SearchPageProps {
  onHoldingClick: (isin: string, name: string) => void;
}

export function SearchPage({ onHoldingClick }: SearchPageProps) {
  // 1. Consumiamo lo stato della UI che sopravvive ai cambi di tab e alle pagine di dettaglio
  const {
    isinInput,
    setIsinInput,
    activeIsin,
    setActiveIsin,
    limiteHoldings,
    setLimiteHoldings,
    limiteCountries,
    setLimiteCountries,
  } = useSearch();

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  // 2. Passiamo l'isin attivo (l'ultima ricerca confermata) a React Query
  const { 
    data: dati, 
    isLoading: caricando, 
    isFetching: fetching,
    error: errore
  } = useEtfSearch(activeIsin);

  // 3. Funzione di ricerca al click del pulsante o all'invio del form
  const cercaEtf = () => {
    const querySana = isinInput.trim();
    if (querySana.length < 12) return; // Evitiamo ricerche se l'ISIN non è formattato correttamente
    
    // Aggiornando l'isin attivo, React Query capisce se deve pescare dalla cache o fare la fetch
    setActiveIsin(querySana);
    setLimiteHoldings(5);
    setLimiteCountries(5);
  };

  const toggleFavorite = async (isin: string, name?: string) => {
    if (isFavorite(isin)) {
      await removeFavorite(isin);
    } else {
      await addFavorite(isin, name);
    }
  };

  return (
    <>
      <SearchBar 
        isin={isinInput} 
        onIsinChange={setIsinInput} 
        onSearch={cercaEtf} 
        isLoading={caricando} 
        placeholder="Inserisci l'ISIN dell'ETF (es. IE00BK5BQT80)..." 
      />

      {/* Mostra l'errore solo se la query fallisce */}
      {errore && <p style={{ color: 'red', fontWeight: 'bold' }}>{(errore as Error).message}</p>}

      {/* Mostra i dettagli dell'ETF: la card rimane visibile anche durante nuovi fetch
          (sostituendo i testi con uno skeleton quando `fetching` è true) */}
      {(activeIsin.trim().length >= 12) && (
        <EtfDetails
          data={dati}
          isFetching={fetching}
          limiteHoldings={limiteHoldings}
          limiteCountries={limiteCountries}
          onLoadMoreHoldings={() => setLimiteHoldings((prev) => prev + 5)}
          onLoadMoreCountries={() => setLimiteCountries((prev) => prev + 5)}
          isFavorite={isFavorite(activeIsin)}
          onToggleFavorite={() => toggleFavorite(activeIsin, dati?.nome)}
          onHoldingClick={onHoldingClick}
        />
      )}
    </>
  );
}