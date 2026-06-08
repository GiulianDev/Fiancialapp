import './App.css';
import { useState } from 'react';
import { SearchPage } from './pages/SearchPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { HoldingDetailPage } from './pages/HoldingDetailPage'; // 1. Importiamo la pagina di dettaglio qui
import { AuthButton } from './components/AuthButton/AuthButton';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';

function App() {
  const [page, setPage] = useState<'search' | 'portfolio'>('search');
  const { user, authLoading, signIn, signOut } = useFirebaseAuth();

  // 2. Spostato qui lo stato della holding selezionata
  const [selectedHolding, setSelectedHolding] = useState<{ isin: string; name: string } | null>(null);

  return (
    <div id="container">

      {/* HEADER */}
      <div className='header'>
        <AuthButton user={user} authLoading={authLoading} signIn={signIn} signOut={signOut} />  
        
        <div className="title">
          <h1>Ricerca Asset per ISIN</h1>
        </div>

        {/* Mostriamo il selettore di pagine SOLO se l'utente NON sta guardando il dettaglio di una holding */}
        {!selectedHolding && (
          <div className="page-selector">
            <button className={page === 'search' ? 'active' : ''} onClick={() => setPage('search')}>
              Cerca ETF
            </button>
            <button className={page === 'portfolio' ? 'active' : ''} onClick={() => setPage('portfolio')}>
              Portafoglio preferiti
            </button>
          </div>
        )}
      </div>

      {/* 4. GESTIONE DELLE PAGINE PRINCIPALI */}
      {selectedHolding ? (
        // Se c'è una holding selezionata, mostriamo la pagina di dettaglio a schermo intero (sotto il titolo)
        <HoldingDetailPage
          isin={selectedHolding.isin}
          name={selectedHolding.name}
          onBack={() => setSelectedHolding(null)} // Resetta lo stato per tornare indietro
        />
      ) : (
        // Altrimenti mostriamo il normale comportamento a due schede della tua app
        <>
          {/* PAGE 1 - Search */}
          {page === 'search' && (
            <SearchPage 
              user={user} 
              // Passiamo la funzione a SearchPage affinché possa dirci quale holding è stata cliccata
              onHoldingClick={(isin, name) => setSelectedHolding({ isin, name })} 
            /> 
          )}

          {/* PAGE 2 - Favorites */}
          {page === 'portfolio' && <PortfolioPage user={user} />}
        </>
      )}
    </div>
  );
}

export default App;