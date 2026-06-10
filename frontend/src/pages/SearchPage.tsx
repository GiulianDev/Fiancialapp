// src/pages/SearchPage.tsx
import { useState, useEffect } from 'react';
// IMPORT AGGIORNATO SECONDO LA DOCS V7
import { useSearchParams } from 'react-router'; 
import { SearchBar } from '../components/SearchBar/SearchBar';
import { EtfDetails } from '../components/EtfDetails/EtfDetails';
import { useFavorites } from '../contexts/FavoritesContext';
import { useEtfSearch } from '../hooks/useEtfSearch';

interface SearchPageProps {
  onHoldingClick: (isin: string, name: string) => void;
}

export function SearchPage({ onHoldingClick }: SearchPageProps) {
 
  // 1. Inizializziamo il router per leggere e scrivere l'URL
  const [searchParams, setSearchParams] = useSearchParams();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

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
          onToggleFavorite={() => toggleFavorite(activeIsin, dati?.nome)}
          onHoldingClick={onHoldingClick}
        />
      )}
    </>
  );
}