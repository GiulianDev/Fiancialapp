import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router'; 
import { useFavorites, useAuth } from '@context';
// import { useEtfSearch } from './hooks/useEtfSearch';
import { SearchBar } from './SearchBar/SearchBar';
import { EtfDetailTabs } from './EtfDetailTabs/EtfDetailTabs';

export function SearchPage() {
  const { user } = useAuth();

  // const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  
  // Leggiamo i parametri dall'URL
  const [searchParams, setSearchParams] = useSearchParams();
  const activeIsin = searchParams.get('isin') || '';
  const limiteHoldings = parseInt(searchParams.get('hLimit') || '5', 10);
  const limiteCountries = parseInt(searchParams.get('cLimit') || '5', 10);

  // Stato locale (Draft) per l'input mentre l'utente digita
  const [draftIsin, setDraftIsin] = useState(activeIsin);

  // Sincronizziamo la searchbar se l'utente usa i tasti Avanti/Indietro del browser
  useEffect(() => {
    setDraftIsin(activeIsin);
  }, [activeIsin]);

  const cercaEtf = () => {
    const querySana = draftIsin.trim().toUpperCase();

    if (querySana.length < 12) {
      console.log('INVALID ISIN');
      return;
    }
    
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

  // const toggleFavorite = async (isin: string, name?: string) => {
  //   if (isFavorite(isin)) {
  //     await removeFavorite(isin);
  //   } else {
  //     await addFavorite(isin, name);
  //   }
  // };

  return (
    <>
      <SearchBar 
        isin={draftIsin} 
        onIsinChange={setDraftIsin} 
        onSearch={cercaEtf} 
        placeholder="Inserisci l'ISIN dell'ETF (es. IE00BK5BQT80)..." 
      />

      {(activeIsin.length >= 12) && (
        <EtfDetailTabs
          isin={activeIsin} // Passiamo solo l'identificativo!
          limiteHoldings={limiteHoldings}
          limiteCountries={limiteCountries}
          onLoadMoreHoldings={handleLoadMoreHoldings}
          onLoadMoreCountries={handleLoadMoreCountries}
          // isFavorite={isFavorite(activeIsin)}
          isUserLoggedIn={Boolean(user)}
          // onToggleFavorite={toggleFavorite}
        />
      )}
    </>
  );
}