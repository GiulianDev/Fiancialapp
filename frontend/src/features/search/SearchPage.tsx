import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router'; 
import { useFavorites, useAuth } from '@context';
import { SearchBar } from '.';
import { EtfDetails } from '.';
import { useEtfSearch } from '.';

// SearchPage è il compositore principale della ricerca ETF.
// - legge lo stato dalla query string (source of truth)
// - mantiene l'input locale come draft
// - esegue la fetch solo quando l'ISIN è confermato
// - passa i risultati al componente di presentazione EtfDetails
export function SearchPage() {
 
  // 1. Inizializziamo il router per leggere e scrivere l'URL
  const [searchParams, setSearchParams] = useSearchParams();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { user } = useAuth();

  // 2. Leggiamo lo stato REALE dall'URL (Source of Truth)
  // Se non ci sono parametri, usiamo i valori di default (5 per le liste)
  const activeIsin = searchParams.get('isin') || '';
  const limiteHoldings = parseInt(searchParams.get('hLimit') || '5', 10);
  const limiteCountries = parseInt(searchParams.get('cLimit') || '5', 10);

  // 3. Stato locale (Draft) per l'input mentre l'utente digita
  const [draftIsin, setDraftIsin] = useState(activeIsin);

  // Se l'utente usa il tasto "Indietro" del browser, l'activeIsin cambia.
  // Sincronizziamo la searchbar per riflettere l'URL attuale.
  useEffect(() => {
    setDraftIsin(activeIsin);
  }, [activeIsin]);

  // Restore last searched ISIN when user returns to the Search page via tab navigation.
  // We persist the last confirmed ISIN in sessionStorage so that switching tabs
  // (which may navigate away and then back without preserving query params)
  // can restore the detail view automatically.
  useEffect(() => {
    if (!activeIsin) {
      const last = sessionStorage.getItem('lastIsin');
      if (last) {
        // Ripristiniamo sia l'URL (per triggerare la fetch) sia il draft input
        setSearchParams((prev) => {
          prev.set('isin', last);
          return prev;
        });
        setDraftIsin(last);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 4. React Query pesca i dati in base all'ISIN confermato nell'URL
  const { 
    data: dati, 
    isLoading: caricando, 
    isFetching: fetching,
    error: errore
  } = useEtfSearch(activeIsin);

  // 5. Azioni che modificano l'URL
  const cercaEtf = () => {
    const querySana = draftIsin.trim().toUpperCase();
    if (querySana.length < 12) return;
    
    // Salviamo l'ultimo ISIN confermato per poterlo ripristinare
    // quando l'utente torna alla pagina tramite i tab.
    try {
      sessionStorage.setItem('lastIsin', querySana);
    } catch (e) {
      /* sessionStorage non disponibile: non bloccante */
    }

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