import { useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { type Favorite, type FirebaseUser } from '../firebase';
import { type EtfData, type Country, type Holding } from '../types/etf';

interface FavoritesPortfolioProps {
  user: FirebaseUser | null;
  favorites: Favorite[];
}

interface AggregatedResult {
  holdings: Holding[];
  countries: Country[];
  count: number;
  residualHolding: number;
  residualCountry: number;
}

// Nuova logica di combinazione con gestione del residuo e pesi personalizzati
function combineEtfData(etfData: EtfData[], weights: Record<string, number>): AggregatedResult {
  const holdingsMap = new Map<string, number>();
  const countriesMap = new Map<string, number>();

  // Calcola la somma totale dei pesi inseriti dall'utente (per normalizzarli al 100%)
  let totalUserWeight = etfData.reduce((sum, etf) => sum + (weights[etf.isin] || 1), 0);
  if (totalUserWeight === 0) totalUserWeight = 1; 

  let totalUnknownHoldings = 0;
  let totalUnknownCountries = 0;

  etfData.forEach((etf) => {
    // Peso effettivo di questo specifico ETF nel portafoglio aggregato
    const etfRelativeWeight = (weights[etf.isin] || 1) / totalUserWeight;

    // --- ELABORAZIONE HOLDINGS (Top 10) ---
    let knownHoldingsSum = 0;
    etf.holdings.forEach((holding) => {
      knownHoldingsSum += holding.peso_percentuale;
      const currentAggregatedWeight = holdingsMap.get(holding.nome) ?? 0;
      // Moltiplica il peso dell'azienda per il peso dell'ETF nel portafoglio
      holdingsMap.set(holding.nome, currentAggregatedWeight + (holding.peso_percentuale * etfRelativeWeight));
    });
    
    // Tutto ciò che manca per arrivare a 100% in questo ETF è "Residuo"
    const unknownHoldings = Math.max(0, 100 - knownHoldingsSum);
    totalUnknownHoldings += unknownHoldings * etfRelativeWeight;


    // --- ELABORAZIONE PAESI ---
    let knownCountriesSum = 0;
    Object.entries(etf.countries).forEach(([country, peso]) => {
      knownCountriesSum += peso;
      const currentAggregatedWeight = countriesMap.get(country) ?? 0;
      countriesMap.set(country, currentAggregatedWeight + (peso * etfRelativeWeight));
    });
    
    const unknownCountries = Math.max(0, 100 - knownCountriesSum);
    totalUnknownCountries += unknownCountries * etfRelativeWeight;
  });

  // Ordina i risultati dal maggiore al minore
  const holdings = Array.from(holdingsMap.entries())
    .map(([nome, peso_percentuale]) => ({ nome, peso_percentuale }))
    .sort((a, b) => b.peso_percentuale - a.peso_percentuale);

  const countries = Array.from(countriesMap.entries())
    .map(([nome, peso]) => ({ nome, peso }))
    .sort((a, b) => b.peso - a.peso);

  return { 
    holdings, 
    countries, 
    count: etfData.length,
    residualHolding: totalUnknownHoldings,
    residualCountry: totalUnknownCountries
  };
}

export function FavoritesPortfolio({ user, favorites }: FavoritesPortfolioProps) {
  const [selectedIsins, setSelectedIsins] = useState<Set<string>>(new Set());
  // Stato per memorizzare il "peso" assegnato dall'utente a ciascun ETF (default: 1)
  const [weights, setWeights] = useState<Record<string, number>>({});
  
  const [combined, setCombined] = useState<AggregatedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSelection = (isin: string) => {
    setSelectedIsins((prev) => {
      const next = new Set(prev);
      if (next.has(isin)) {
        next.delete(isin);
      } else {
        next.add(isin);
        // Quando selezioni un ETF, gli assegna un peso di default pari a 1 (uguale agli altri)
        setWeights(w => ({ ...w, [isin]: 1 })); 
      }
      return next;
    });
  };

  const handleWeightChange = (isin: string, value: string) => {
    const num = parseFloat(value);
    setWeights(prev => ({ ...prev, [isin]: isNaN(num) || num < 0 ? 0 : num }));
  };

  const computeCombined = async () => {
    if (!user) {
      setError('Devi effettuare il login per usare questa pagina.');
      return;
    }

    if (selectedIsins.size === 0) {
      setError('Seleziona almeno un ISIN dai preferiti.');
      setCombined(null);
      return;
    }

    setLoading(true);
    setError(null);
    setCombined(null);

    try {
      const etfData = await Promise.all(
        Array.from(selectedIsins).map(async (isin) => {
          const response = await fetch(`http://127.0.0.1:8000/api/etf/${isin}`);
          const payload = await response.json();

          if (!response.ok || payload?.status === 'error') {
            const message = payload?.message ?? `Errore caricamento ISIN ${isin}`;
            throw new Error(message);
          }

          return payload as EtfData;
        })
      );

      // Passiamo sia i dati scaricati che i pesi inseriti dall'utente
      setCombined(combineEtfData(etfData, weights));
    } catch (err) {
      console.error('Combine error:', err);
      setError(err instanceof Error ? err.message : 'Errore durante il calcolo del portafoglio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="favorites-portfolio">
      <h2>Portafoglio preferiti (X-Ray)</h2>
      {!user ? (
        <p className="favorites-info">Accedi per selezionare i preferiti e calcolare le percentuali aggregate.</p>
      ) : (
        <>
          {favorites.length === 0 ? (
            <p className="favorites-info">Non hai ancora preferiti salvati.</p>
          ) : (
            <div className="favorites-portfolio__grid">
              
              {/* --- COLONNA DI SELEZIONE E PESI --- */}
              <div className="favorites-portfolio__list">
                <p>Seleziona i preferiti e assegna un peso (es. quote o capitale investito):</p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {favorites.map((favorite) => {
                    const isSelected = selectedIsins.has(favorite.isin);
                    return (
                      <li key={favorite.isin} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(favorite.isin)}
                          />
                          <span>{favorite.name ? `${favorite.name} — ` : ''}<strong>{favorite.isin}</strong></span>
                        </label>
                        
                        {/* Input per il peso (visibile solo se l'ETF è selezionato) */}
                        {isSelected && (
                          <input 
                            type="number" 
                            min="0"
                            step="any"
                            placeholder="Peso" 
                            value={weights[favorite.isin] ?? 1}
                            onChange={(e) => handleWeightChange(favorite.isin, e.target.value)}
                            style={{ width: '80px', padding: '4px' }}
                            title="Inserisci le quote possedute, il capitale investito o la percentuale"
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
                <button className="favorites-portfolio__compute" onClick={computeCombined} disabled={loading}>
                  {loading ? 'Calcolo in corso…' : 'Analizza Portafoglio'}
                </button>
                {error && <p className="favorites-error" style={{ color: 'red' }}>{error}</p>}
              </div>

              {/* --- COLONNA DEI RISULTATI AGGREGATI --- */}
              {combined && (
                <div className="favorites-portfolio__result" style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                  <h3 style={{ color: '#0066cc', marginTop: 0 }}>Risultato Aggregato ({combined.count} ETF)</h3>
                  
                  <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginTop: '20px' }}>
                    
                    {/* GRAFICO A TORTA - HOLDINGS */}
                    <div className="favorites-portfolio__chart" style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <h4 style={{ borderBottom: '2px solid #0066cc', paddingBottom: '5px', width: '100%' }}>Composizione Aziende</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              ...combined.holdings.slice(0, 10),
                              ...(combined.residualHolding > 0 ? [{ nome: 'Altre aziende', peso_percentuale: combined.residualHolding }] : [])
                            ]}
                            dataKey="peso_percentuale"
                            nameKey="nome"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ nome, peso_percentuale }) => `${nome.slice(0, 10)}: ${peso_percentuale.toFixed(1)}%`}
                          >
                            {[
                              '#0066cc', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731',
                              '#5f27cd', '#00d2d3', '#ff9ff3', '#54a0ff', '#48dbfb', '#aaa'
                            ].map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${(value as number).toFixed(2)}%`} />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* GRAFICO A TORTA - PAESI */}
                    <div className="favorites-portfolio__chart" style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <h4 style={{ borderBottom: '2px solid #0066cc', paddingBottom: '5px', width: '100%' }}>Esposizione Geografica</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              ...combined.countries.slice(0, 10),
                              ...(combined.residualCountry > 0 ? [{ nome: 'Altri paesi', peso: combined.residualCountry }] : [])
                            ]}
                            dataKey="peso"
                            nameKey="nome"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ nome, peso }) => `${nome.slice(0, 10)}: ${(peso as number).toFixed(1)}%`}
                          >
                            {[
                              '#0066cc', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731',
                              '#5f27cd', '#00d2d3', '#ff9ff3', '#54a0ff', '#48dbfb', '#aaa'
                            ].map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${(value as number).toFixed(2)}%`} />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                  </div>

                  {/* LISTA DETTAGLIATA - HOLDINGS */}
                  <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginTop: '30px' }}>
                    <div className="favorites-portfolio__section" style={{ flex: '1', minWidth: '250px' }}>
                      <h4 style={{ borderBottom: '2px solid #0066cc', paddingBottom: '5px' }}>Dettagli Aziende</h4>
                      <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8', fontSize: '0.9em' }}>
                        {combined.holdings.slice(0, 15).map((holding) => (
                          <li key={holding.nome}>
                            {holding.nome}: <strong>{holding.peso_percentuale.toFixed(2)}%</strong>
                          </li>
                        ))}
                        
                        {combined.residualHolding > 0 && (
                          <li style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd', color: '#555' }}>
                            📦 <em>Altre aziende minori (Residuo)</em>: <strong>{combined.residualHolding.toFixed(2)}%</strong>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* LISTA DETTAGLIATA - PAESI */}
                    <div className="favorites-portfolio__section" style={{ flex: '1', minWidth: '250px' }}>
                      <h4 style={{ borderBottom: '2px solid #0066cc', paddingBottom: '5px' }}>Dettagli Paesi</h4>
                      <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8', fontSize: '0.9em' }}>
                        {combined.countries.slice(0, 15).map((country) => (
                          <li key={country.nome}>
                            {country.nome}: <strong>{country.peso.toFixed(2)}%</strong>
                          </li>
                        ))}
                        
                        {combined.residualCountry > 0 && (
                          <li style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd', color: '#555' }}>
                            🌍 <em>Altri paesi minori (Residuo)</em>: <strong>{combined.residualCountry.toFixed(2)}%</strong>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}