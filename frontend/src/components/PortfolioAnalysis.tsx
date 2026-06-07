import { useState } from 'react';
import { type Favorite, type FirebaseUser } from '../firebase';
import { Button } from './ui/Button';
import { Card } from './ui/Card/Card';
import type { AggregatedResult } from '../types/portfolio';
import type { EtfData } from '../types/etf';

interface PortfolioAnalysisProps {
  user: FirebaseUser | null;
  favorites: Favorite[];
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


export function PortfolioAnalysis({ user, favorites }: PortfolioAnalysisProps) {
  
  const [selectedIsins, setSelectedIsins] = useState<Set<string>>(new Set());
  
  // Stato per memorizzare il "peso" assegnato dall'utente a ciascun ETF (default: 1)
  const [weights, setWeights] = useState<Record<string, number>>({});
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


  const [combined, setCombined] = useState<AggregatedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
                  <Card className="favorites-portfolio__list">
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
                    <Button onClick={computeCombined} disabled={loading}>
                      {loading ? 'Calcolo in corso…' : 'Analizza Portafoglio'}
                    </Button>
                    {error && <p className="favorites-error" style={{ color: 'red' }}>{error}</p>}
                  </Card>
    
                  
                </div>
              )}
            </>
          )}
      
    </div>
  );


}
