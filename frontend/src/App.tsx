import './App.css';
import { useState } from 'react';
import { SearchPage } from './pages/SearchPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { AuthButton } from './components/AuthButton/AuthButton';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';

function App() {
  const [page, setPage] = useState<'search' | 'portfolio'>('search');
  const { user, authLoading, signIn, signOut } = useFirebaseAuth();

  return (
    <div id="container">

      {/* HEADER */}
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
      {page === 'search' && (<SearchPage user={user}/> )}

      {/* PAGE 2 - Favorites */}
      {page === 'portfolio' && <PortfolioPage user={user} />}
    </div>
  );
}

export default App;