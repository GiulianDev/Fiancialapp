import './App.css';
import { Outlet } from 'react-router';
import { AuthButton } from './components/AuthButton/AuthButton';

/**
 * APP ROOT LAYOUT
 * 
 * Questo è il layout principale dell'applicazione.
 * Contiene solo l'header e delega il resto (tab e pagine) ai layout/route figli.
 * 
 * Vantaggi di questa architettura:
 * - Separazione delle responsabilità: App = solo header
 * - SearchLayout = gestisce i tab in autonomia
 * - HoldingDetailPage = appare senza tab perché è fuori da SearchLayout
 * - No useEffect per controllare il path
 * - No state derivato
 * - Scalabile: aggiungere nuove rotte è triviale
 */
function App() {
  return (
    <div id="container">
      {/* HEADER - SEMPRE VISIBILE */}
      <div className='header'>
        <AuthButton />
        <div className="title">
          <h1>Ricerca Asset per ISIN</h1>
        </div>
      </div>

      {/* OUTLET - Qui il router renderizza le rotte figlie */}
      <div style={{ width: '100%' }}>
        <Outlet />
      </div>
    </div>
  );
}

export default App;