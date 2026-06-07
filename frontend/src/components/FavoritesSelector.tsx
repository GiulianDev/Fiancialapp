import { useState } from 'react';
import { type Favorite, type FirebaseUser } from '../firebase';
import { Button } from './ui/Button';
import { Card } from './ui/Card/Card';

interface FavoritesSelectorProps {
  user: FirebaseUser | null;
  favorites: Favorite[];
  onAnalyze: (selectedIsins: string[], weights: Record<string, number>) => void;
  isLoading: boolean;
}

export function FavoritesSelector({ favorites, onAnalyze, isLoading }: FavoritesSelectorProps) {
  const [selectedIsins, setSelectedIsins] = useState<Set<string>>(new Set());
  const [weights, setWeights] = useState<Record<string, number>>({});

  const toggleSelection = (isin: string) => {
    setSelectedIsins((prev) => {
      const next = new Set(prev);
      if (next.has(isin)) {
        next.delete(isin);
      } else {
        next.add(isin);
        // Inizializziamo a 0 invece di 1 per gli Euro
        setWeights(w => ({ ...w, [isin]: 0 })); 
      }
      return next;
    });

  };

  const handleWeightChange = (isin: string, value: string) => {
    const num = parseFloat(value);
    setWeights(prev => ({ ...prev, [isin]: isNaN(num) || num < 0 ? 0 : num }));
  };

  const handleAnalyzeClick = () => {
    onAnalyze(Array.from(selectedIsins), weights);
  };

  return (
    <Card className="favorites-portfolio__list">
      <h3>Analisi Portafoglio</h3>
      <p>Seleziona gli ETF e inserisci l'importo investito in <strong>Euro (€)</strong> o in <strong>Dollari ($)</strong>:</p>
      
      
      {/* <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0' }}>
        {favorites.map((favorite) => {
          const isSelected = selectedIsins.has(favorite.isin);
          return (
            <li key={favorite.isin} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelection(favorite.isin)}
                />
                <span style={{ fontSize: '0.9rem' }}>
                    {favorite.name ? `${favorite.name} ` : ''}
                    <code style={{ background: '#eee', padding: '2px 4px', borderRadius: '4px' }}>{favorite.isin}</code>
                </span>
              </label>
              
              {isSelected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>€</span>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    placeholder="Esempio: 500" 
                    value={weights[favorite.isin] ?? ''}
                    onChange={(e) => handleWeightChange(favorite.isin, e.target.value)}
                    style={{ width: '100px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
              )}
              
            </li>
          );
        })}
      </ul> */}

      <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0' }}>
        {favorites.map((favorite) => {
          const isSelected = selectedIsins.has(favorite.isin);
          return (
            <li key={favorite.isin} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelection(favorite.isin)}
                />
                <span style={{ fontSize: '0.9rem' }}>
                    {favorite.name ? `${favorite.name} ` : ''}
                    <code style={{ background: '#eee', padding: '2px 4px', borderRadius: '4px' }}>{favorite.isin}</code>
                </span>
              </label>
              
              {isSelected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {/* Aggiungiamo i simboli €/$ */}
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>€/$</span>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01" // Permettiamo l'inserimento di decimali per la valuta
                    placeholder="Esempio: 1000" // Placeholder più chiaro
                    value={weights[favorite.isin] ?? ''} // Usa stringa vuota per un input più pulito quando 0
                    onChange={(e) => handleWeightChange(favorite.isin, e.target.value)}
                    style={{ width: '100px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                    title="Importo investito in Euro (€) o Dollari ($)" // Titolo per tooltip
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>


      <Button 
        onClick={handleAnalyzeClick} 
        disabled={isLoading || selectedIsins.size === 0}
        style={{ width: '100%' }}
      >
        {isLoading ? 'Analisi in corso...' : 'Analizza Selezione'}
      </Button>
    </Card>
  );
}

