import './App.css';
import { SearchBar } from './components/SearchBar';
import { EtfDetails } from './components/EtfDetails';
import { useEtfSearch } from './hooks/useEtfSearch';

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

  return (
    <div id="container">
      
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