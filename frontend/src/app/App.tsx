import './App.css';
import { Header } from '@/features/header/Header';
import { Outlet } from 'react-router';

/**
 * APP ROOT LAYOUT
 * 
 * Questo è il layout principale dell'applicazione.
 * Contiene solo l'header e delega il resto (tab e pagine) ai layout/route figli.
 * 
 * Vantaggi di questa architettura:
 * - Separazione delle responsabilità: App = solo header
 * - HomePage = gestisce i tab in autonomia
 * - HoldingDetailPage = appare senza tab perché è fuori da HomePage
 * - No useEffect per controllare il path
 * - No state derivato
 * - Scalabile: aggiungere nuove rotte è triviale
 */
function App() {
  return (
    <div id="container">

      {/* HEADER - SEMPRE VISIBILE */}
      <Header />

      {/* OUTLET - Qui il router renderizza le rotte figlie */}
      <Outlet />

    </div>
  );
}

export default App;