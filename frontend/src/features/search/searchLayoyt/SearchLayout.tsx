import { NavLink, useLocation, Outlet } from 'react-router';
import './SearchLayout.css';
/**
 * SEARCH LAYOUT
 * 
 * Questo è il layout wrapper che mostra i tab di navigazione.
 * Viene renderizzato SOLO per le route "/" e "/portfolio".
 * Per "/holding/:isin" il layout non viene usato, quindi i tab non appaiono.
 */
export function SearchLayout() {
  const location = useLocation();

  return (
    <>
      <div className="page-selector">
        {/* 
          NavLink usa location.pathname + location.search per preservare i parametri.
          Se sei in "/?isin=IE00B&hLimit=10" e clicchi sul tab "Cerca ETF",
          rimane su "/?isin=IE00B&hLimit=10" (o vai a "/" se non ci sono parametri).
        */}
        <NavLink
          to={`/${location.search}`}
          end
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
