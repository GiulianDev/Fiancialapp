import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router'; 
import { useFavorites, useAuth } from '@context';
import { useEtfSearch } from './hooks/useEtfSearch';
import { SearchBar } from './SearchBar/SearchBar';
import { EtfDetails } from './EtfDetailTabs/EtfDetailTabs';


// SearchPage è il compositore principale della ricerca ETF.
// - legge lo stato dalla query string (source of truth)
// - mantiene l'input locale come draft
// - esegue la fetch solo quando l'ISIN è confermato
// - passa i risultati al componente di presentazione EtfDetails
export function SearchPage() {
 
  const { user } = useAuth();

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  
  // Leggiamo i parametri dall'URL (isin, hLimit, cLimit)
  // Se non ci sono parametri, usiamo i valori di default (5 per le liste)
  const [searchParams, setSearchParams] = useSearchParams();
  const activeIsin = searchParams.get('isin') || '';
  const limiteHoldings = parseInt(searchParams.get('hLimit') || '5', 10); // num di holding da visualizzare, default 5
  const limiteCountries = parseInt(searchParams.get('cLimit') || '5', 10); // num di country da visualizzare, default 5

  // 3. Stato locale (Draft) per l'input mentre l'utente digita
  const [draftIsin, setDraftIsin] = useState(activeIsin);

  // Se l'utente usa il tasto "Indietro" del browser, l'activeIsin cambia.
  // Sincronizziamo la searchbar per riflettere l'URL attuale.
  useEffect(() => {
    setDraftIsin(activeIsin);
  }, [activeIsin]);

  // NOTE: we intentionally avoid automatic restoration here. Query params
  // should be preserved by the tab links (SearchLayout) so returning to
  // the Search page shows the correct `isin` from the URL. Keeping this
  // component simple avoids surprising automatic fetches.

  // 4. React Query pesca i dati in base all'ISIN confermato nell'URL
  const { 
    data: dati, 
    isLoading: caricando, 
    isFetching: fetching,
    error: errore
  } = useEtfSearch(activeIsin);

  // Al click su "Cerca Dati" aggiorniamo i parametri dell'URL
  const cercaEtf = () => {
    const querySana = draftIsin.trim().toUpperCase();

    // ToDo add visual control for invalid ISIN (e.g., toast notification)
    if (querySana.length < 12) {
      console.log('INVALID ISIN');
      return;
    }
    console.log('Navigating to Holding detail : ISIN ', querySana);
    // Aggiorniamo l'URL. Questo triggera in automatico React Query e aggiorna la UI
    setSearchParams((prev) => {
      prev.set('isin', querySana);
      // Nuova ricerca -> Resettiamo le espansioni cancellando i parametri
      prev.delete('hLimit');
      prev.delete('cLimit');
      return prev;
    });
  };

  const handleLoadMoreHoldings = () => {
    setSearchParams((prev) => {
      prev.set('hLimit', (limiteHoldings + 5).toString());
      return prev;
    });
  };

  const handleLoadMoreCountries = () => {
    setSearchParams((prev) => {
      prev.set('cLimit', (limiteCountries + 5).toString());
      return prev;
    });
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
        isin={draftIsin} 
        onIsinChange={setDraftIsin} 
        onSearch={cercaEtf} 
        isLoading={caricando} 
        placeholder="Inserisci l'ISIN dell'ETF (es. IE00BK5BQT80)..." 
      />

      {errore && <p style={{ color: 'red', fontWeight: 'bold' }}>{(errore as Error).message}</p>}

      {(activeIsin.length >= 12) && (
        <EtfDetails
          data={dati}
          isFetching={fetching}
          limiteHoldings={limiteHoldings}
          limiteCountries={limiteCountries}
          onLoadMoreHoldings={handleLoadMoreHoldings}
          onLoadMoreCountries={handleLoadMoreCountries}
          isFavorite={isFavorite(activeIsin)}
          isUserLoggedIn={Boolean(user)}
          onToggleFavorite={() => toggleFavorite(activeIsin, dati?.nome)}
        />
      )}
    </>
  );
}