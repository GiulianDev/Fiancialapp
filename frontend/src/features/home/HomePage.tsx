import { NavLink, useLocation, Outlet } from 'react-router';
import './HomePage.css';
/**
 * HOME PAGE
 * mostra i tab di navigazione per la ricerca ETF e per gestire il portfolio.
 */
export function HomePage() {
  
  const location = useLocation();

  return (
    <>

      <div className="navigation-tab--container">
        {/* 
          NavLink usa location.pathname + location.search per preservare i parametri.
        */}
        <NavLink
          to={`/search/${location.search}`}
          // end // significa che il link è attivo solo se l'URL corrisponde esattamente a "/"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Cerca ETF
        </NavLink>

        <NavLink
          to={`/portfolio${location.search}`}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Portafoglio preferiti
        </NavLink>
        
      </div>

      {/* Qui renderizziamo le pagine figlie (SearchPage o PortfolioPage) */}
      <Outlet />
    </>
  );
}
