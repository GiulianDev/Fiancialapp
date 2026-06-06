import './App.css';
import { SearchBar } from './components/SearchBar';
import { EtfDetails } from './components/EtfDetails/EtfDetails';
import { useEtfSearch } from './hooks/useEtfSearch';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';

function App() {
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

  return (
    <div id="container">
      <div className="auth-container">
        <button
          className="auth-button"
          onClick={user ? signOut : signIn}
          disabled={authLoading}
          aria-label={user ? 'Esci da Google' : 'Login con Google'}
          title={user ? 'Esci' : 'Login'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v1h20v-1c0-3.3-6.7-5-10-5z" />
          </svg>
        </button>
      </div>
        
      
      <div className="title-container">
        <h1>Ricerca Asset per ISIN</h1>
      </div>

      <div className="serchabar-container">
        <SearchBar isin={isin} onIsinChange={setIsin} onSearch={cercaEtf} isLoading={caricando} />
      </div>

      {errore && <p style={{ color: 'red', fontWeight: 'bold' }}>{errore}</p>}

      {dati && dati.status === 'success' && (
        <EtfDetails
          data={dati}
          limiteHoldings={limiteHoldings}
          limiteCountries={limiteCountries}
          onLoadMoreHoldings={() => setLimiteHoldings((prev) => prev + 5)}
          onLoadMoreCountries={() => setLimiteCountries((prev) => prev + 5)}
        />
      )}
    </div>
  );
}

export default App;