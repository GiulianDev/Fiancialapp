import './App.css';
import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { EtfDetails } from './components/EtfDetails/EtfDetails';
import { AuthButton } from './components/AuthButton/AuthButton';
import { FavoritesPortfolio } from './components/FavoritesPortfolio';
import { useEtfSearch } from './hooks/useEtfSearch';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { useFavorites } from './hooks/useFavorites';

function App() {
  const [page, setPage] = useState<'search' | 'portfolio'>('search');

  const {
    isin,
    setIsin,
    dati,
    caricando,
    errore,
    limiteHoldings,
    setLimiteHoldings,
    limiteCountries,
    setLimiteCountries,
    cercaEtf,
  } = useEtfSearch();

  const { user, authLoading, signIn, signOut } = useFirebaseAuth();
  const { favorites, favoriteIsins, toggleFavorite } = useFavorites(user);

  return (
    <div id="container">

      <AuthButton user={user} authLoading={authLoading} signIn={signIn} signOut={signOut} />  
      
      <div className="title-container">
        <h1>Ricerca Asset per ISIN</h1>
      </div>

      <div className="page-selector">
        <button className={page === 'search' ? 'active' : ''} onClick={() => setPage('search')}>
          Cerca ETF
        </button>
        <button className={page === 'portfolio' ? 'active' : ''} onClick={() => setPage('portfolio')}>
          Portafoglio preferiti
        </button>
      </div>

      {/* PAGE 1 - Search */}
      {page === 'search' && (
        <>
          <div className="serchabar-container">
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
      )}

      {/* PAGE 2 - Favorites */}
      {page === 'portfolio' && (
        <FavoritesPortfolio user={user} favorites={favorites} />
      )}
    </div>
  );
}

export default App;