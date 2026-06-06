import { useState } from 'react';
import './App.css';

function App() {
  const [isin, setIsin] = useState('IE00BK5BQT80');
  const [dati, setDati] = useState(null);
  const [caricando, setCaricando] = useState(false);
  const [errore, setErrore] = useState(null);

  // Limiti di visualizzazione iniziale per la paginazione locale (top 5)
  const [limiteHoldings, setLimiteHoldings] = useState(5);
  const [limiteCountries, setLimiteCountries] = useState(5);

  const cercaEtf = async () => {
    setCaricando(true);
    setErrore(null);
    // Resetta i selettori a 5 ad ogni nuova ricerca
    setLimiteHoldings(5);
    setLimiteCountries(5);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/etf/${isin}`);
      const data = await response.json();
      
      if (data.status === "error") {
        setErrore(data.message);
      } else {
        setDati(data);
      }
    } catch (error) {
      setErrore("Errore di connessione al server Python.");
    } finally {
      setCaricando(false);
    }
  };

  // --- LOGICA DI ORDINAMENTO E DI TAGLIO (SLICE) ---
  
  // Ordina le partecipazioni arrivate dall'API (saranno al massimo 10)
  const holdingsSorted = dati?.holdings 
    ? [...dati.holdings].sort((a, b) => b.peso_percentuale - a.peso_percentuale)
    : [];
  const holdingsToShow = holdingsSorted.slice(0, limiteHoldings);

  // Ordina i paesi (qui l'API di solito ci dà la lista completa di tutti i paesi)
  const countriesArray = dati?.countries 
    ? Object.entries(dati.countries).map(([nome, peso]) => ({ nome, peso }))
    : [];
  const countriesSorted = countriesArray.sort((a, b) => b.peso - a.peso);
  const countriesToShow = countriesSorted.slice(0, limiteCountries);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Ricerca Asset per ISIN</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={isin} 
          onChange={(e) => setIsin(e.target.value.toUpperCase().trim())} 
          placeholder="Inserisci ISIN (es. IE00BK5BQT80)"
          style={{ padding: '10px', marginRight: '10px', width: '280px', fontSize: '16px' }}
        />
        <button onClick={cercaEtf} style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }} disabled={caricando}>
          {caricando ? 'Ricerca in corso...' : 'Cerca Dati'}
        </button>
      </div>

      {errore && <p style={{ color: 'red', fontWeight: 'bold' }}>{errore}</p>}

      {dati && dati.status === "success" && (
        <div style={{ textAlign: 'left', background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ color: '#0066cc', marginTop: 0 }}>{dati.nome}</h2>
          <p style={{ margin: '5px 0' }}>ISIN: <strong>{dati.isin}</strong> | Tipo Asset: <strong>{dati.tipo_asset}</strong></p>
          {dati.costo_annuo > 0 && (
            <p style={{ margin: '5px 0' }}>TER (Costo Annuo): <strong>{dati.costo_annuo}%</strong></p>
          )}
          
          <div style={{ display: 'flex', gap: '50px', marginTop: '30px', flexWrap: 'wrap' }}>
            
            {/* --- SEZIONE PARTECIPAZIONI --- */}
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h3 style={{ borderBottom: '2px solid #0066cc', paddingBottom: '5px' }}>Top Partecipazioni</h3>
              
              {/* Contatore Avanzato Reale */}
              <p style={{ fontSize: '14px', color: '#555', fontStyle: 'italic' }}>
                Visualizzate <strong>{holdingsToShow.length}</strong> di <strong>{holdingsSorted.length}</strong> in anteprima 
                (Aziende totali nel fondo: <strong>{dati.totale_holdings}</strong>)
              </p>
              
              {holdingsSorted.length > 0 ? (
                <>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    {holdingsToShow.map((h, i) => (
                      <li key={i}>
                        {h.nome}: <strong>{h.peso_percentuale.toFixed(2)}%</strong>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Il pulsante si mostra solo se non abbiamo ancora visualizzato tutte le 10 righe dell'anteprima */}
                  {limiteHoldings < holdingsSorted.length && (
                    <button 
                      onClick={() => setLimiteHoldings(prev => prev + 5)}
                      style={{ marginTop: '10px', padding: '6px 12px', cursor: 'pointer', background: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                      Mostra altri 5 ({holdingsSorted.length - limiteHoldings} rimanenti in anteprima)
                    </button>
                  )}
                </>
              ) : (
                <p>Dati partecipazioni non disponibili per questo asset.</p>
              )}
            </div>

            {/* --- SEZIONE PAESI --- */}
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h3 style={{ borderBottom: '2px solid #0066cc', paddingBottom: '5px' }}>Esposizione Geografica</h3>
              
              <p style={{ fontSize: '14px', color: '#555', fontStyle: 'italic' }}>
                Visualizzati <strong>{countriesToShow.length}</strong> di <strong>{countriesSorted.length}</strong> paesi mappati
              </p>

              {countriesSorted.length > 0 ? (
                <>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    {countriesToShow.map((c, i) => (
                      <li key={i}>
                        {c.nome}: <strong>{c.peso.toFixed(2)}%</strong>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Questo si espande potenzialmente per tutti i paesi perché l'oggetto countries di solito è completo */}
                  {limiteCountries < countriesSorted.length && (
                    <button 
                      onClick={() => setLimiteCountries(prev => prev + 5)}
                      style={{ marginTop: '10px', padding: '6px 12px', cursor: 'pointer', background: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                      Mostra altri 5 ({countriesSorted.length - limiteCountries} rimanenti)
                    </button>
                  )}
                </>
              ) : (
                <p>Dati geografici non disponibili per questo asset.</p>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;