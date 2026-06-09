import './App.css';
import { useState } from 'react';
import { SearchPage } from './pages/SearchPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { HoldingDetailPage } from './pages/HoldingDetailPage';
// AUTH
import { AuthButton } from './components/AuthButton/AuthButton';
import { useAuth } from './contexts/AuthContext';

function App() {
  const [page, setPage] = useState<'search' | 'portfolio'>('search');
  
  // Recupera i dati di auth dal contesto invece dell'hook eliminato
  const { user } = useAuth(); 

  const [selectedHolding, setSelectedHolding] = useState<{ isin: string; name: string } | null>(null);

  return (
    <div id="container">

      {/* HEADER */}
      <div className='header'>

        {/* LOGIN BUTTON */}
        <AuthButton/>  
        
        <div className="title">
          <h1>Ricerca Asset per ISIN</h1>
        </div>

        {/* Nascondiamo il selettore se siamo nel dettaglio */}
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

      {/* 1. PAGINA DI DETTAGLIO: Viene renderizzata sopra se c'è una holding selezionata */}
      {selectedHolding && (
        <HoldingDetailPage
          isin={selectedHolding.isin}
          name={selectedHolding.name}
          onBack={() => setSelectedHolding(null)}
        />
      )}

      {/* 2. PAGINE PRINCIPALI: Rimangono SEMPRE montate. 
             Se c'è un dettaglio attivo, applichiamo 'display: none' per nasconderle senza distruggerle */}
      <div style={{ width: '100%', display: selectedHolding ? 'none' : 'block' }}>
        
        {/* PAGE 1 - Search */}
        {page === 'search' && (
          <SearchPage 
            user={user} 
            onHoldingClick={(isin, name) => setSelectedHolding({ isin, name })} 
          /> 
        )}

        {/* PAGE 2 - Favorites */}
        {page === 'portfolio' && <PortfolioPage user={user} />}
        
      </div>
    </div>
  );
}

export default App;