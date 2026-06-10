import './App.css';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router';
import { SearchPage } from './pages/SearchPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { HoldingDetailPage } from './pages/HoldingDetailPage';
import { AuthButton } from './components/AuthButton/AuthButton';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

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
            {/* Sfruttiamo la funzione className integrata di NavLink */}
            <NavLink 
              to="/" 
              end /* 💡 FONDAMENTALE: Evita che il tab rimanga acceso quando sei su /portfolio */
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