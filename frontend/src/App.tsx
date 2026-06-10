import './App.css';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router';
import { SearchPage } from './pages/SearchPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { HoldingDetailPage } from './pages/HoldingDetailPage';
import { AuthButton } from './components/AuthButton/AuthButton';
import { useEffect, useState } from 'react';

function App() {

  /**
   * NAVIGAZIONE E GESTIONE URL CON REACT ROUTER V7
   * -----------------------------------------------
   * In questa sezione vedremo come gestire la navigazione tra le pagine e come sincronizzare lo stato dell'app con l'URL.
   * 
   * 1. NavLink: è un componente speciale di React Router che ci permette di creare link di navigazione. Ha una prop "className" che può essere una funzione che riceve un oggetto con la proprietà "isActive". Questo ci permette di applicare stili diversi al link attivo (es: evidenziare il tab della pagina corrente).
   * 
   * 2. useNavigate: è un hook che ci fornisce una funzione per navigare programmaticamente tra le pagine. Possiamo usarlo per andare a una nuova rotta quando l'utente clicca su una holding, passando anche uno "state" opzionale per trasmettere dati senza appesantire l'URL.
   * 
   * 3. useLocation: è un hook che ci permette di accedere alla posizione attuale, inclusi pathname e search (parametri dell'URL). Lo useremo per capire se siamo in una pagina di dettaglio e per recuperare eventuali dati passati tramite lo "state" del router.
   * 
   * 4. Sincronizzazione URL: la SearchPage legge i parametri dell'URL (es: ?isin=IE00B...) e li usa come "Source of Truth" per mostrare i dati corretti. Quando l'utente fa una nuova ricerca o carica più holdings, aggiorniamo l'URL di conseguenza, il che triggera automaticamente un nuovo fetch dei dati grazie a React Query.
   * 
   * 5. Tasto Indietro: quando siamo nella pagina di dettaglio di una holding, il tasto "Torna Indietro" non fa semplicemente navigate('/') ma navigate(-1), che ci riporta esattamente alla pagina precedente, con tutti i parametri dell'URL intatti (es: /?isin=IE123&hLimit=10), ripristinando esattamente lo stato della SearchPage come era prima di entrare nel dettaglio.
   * */ 
  const navigate = useNavigate();
  const location = useLocation();
  // Memorizziamo gli ultimi parametri di ricerca (es: "?isin=IE00B...&hLimit=10")
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  // Ascoltiamo i cambi di rotta. Se l'utente si trova nella SearchPage ("/")
  // e ci sono dei parametri nell'URL, li salviamo in memoria.
  useEffect(() => {
    if (location.pathname === '/' && location.search) {
      setLastSearchQuery(location.search);
    }
  }, [location]);
  // Controlliamo se siamo in una pagina di dettaglio per nascondere i tab
  const isDetailPage = location.pathname.startsWith('/holding/');

  // Funzione chiamata dalla SearchPage quando clicchi su una holding
  const handleHoldingClick = (isin: string, name: string) => {
    // Navighiamo alla nuova rotta passando il nome tramite lo "state" del router 
    // per tenere l'URL pulito (es. /holding/US12345)
    navigate(`/holding/${isin}`, { state: { name } });
  };

  return (
    <div id="container">

      {/* HEADER */}
      <div className='header'>
        
        {/* LOGIN BUTTON */}
        <AuthButton/>  
        
        <div className="title">
          <h1>Ricerca Asset per ISIN</h1>
        </div>

        {/* TAB di navigazione - appaiono solo se NON siamo in un dettaglio */}
        {!isDetailPage && (
          <div className="page-selector">
            <div className="page-selector">
            {/* 💡 LINK DINAMICO: Se esiste una ricerca precedente, il tab punterà a "/?isin=...", altrimenti al "/" pulito */}
            <NavLink 
              to={`/${lastSearchQuery}`} 
              end
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Cerca ETF
            </NavLink>
            <NavLink 
              to="/portfolio" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Portafoglio preferiti
            </NavLink>
          </div>
          </div>
        )}
      </div>

      {/* DEFINIZIONE DELLE ROTTE REALI */}
      <div style={{ width: '100%' }}>
        <Routes>
          {/* Pagina di ricerca: risponde al path base "/" */}
          <Route 
            path="/" 
            element={<SearchPage onHoldingClick={handleHoldingClick} />} 
          />
          
          {/* Pagina Portafoglio: risponde al path "/portfolio" */}
          <Route 
            path="/portfolio" 
            element={<PortfolioPage />} 
          />
          
          {/* Pagina Dettaglio: risponde a "/holding/ISIN_DINAMICO" */}
          <Route 
            path="/holding/:isin" 
            element={<HoldingDetailPage />} 
          />
        </Routes>
      </div>
      
    </div>
  );
}

export default App;