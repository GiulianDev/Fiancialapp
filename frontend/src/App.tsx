import './App.css';
import { useState } from 'react';
import { SearchPage } from './pages/SearchPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { AuthButton } from './components/AuthButton/AuthButton';
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

      <div className='header'>
        <AuthButton user={user} authLoading={authLoading} signIn={signIn} signOut={signOut} />  
        
        <div className="title">
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
      </div>

      {/* PAGE 1 - Search */}
      {page === 'search' && (
        <SearchPage
          isin={isin}
          onIsinChange={setIsin}
          cercaEtf={cercaEtf}
          caricando={caricando}
          errore={errore}
          dati={dati}
          limiteHoldings={limiteHoldings}
          setLimiteHoldings={setLimiteHoldings}
          limiteCountries={limiteCountries}
          setLimiteCountries={setLimiteCountries}
          favoriteIsins={favoriteIsins}
          onToggleFavorite={toggleFavorite}
          user={user}
        />
      )}

      {/* PAGE 2 - Favorites */}
      {page === 'portfolio' && <PortfolioPage user={user} favorites={favorites} />}
    </div>
  );
}

export default App;