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
        // Non inizializziamo a 0 per permettere la visualizzazione del placeholder
        setWeights(w => {
          const newWeights = { ...w };
          delete newWeights[isin];
          return newWeights;
        }); 
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
      <p>Seleziona gli ETF e inserisci l'importo investito:</p>
      

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
                    <code style={{ padding: '2px 4px', borderRadius: '4px' }}>{favorite.isin}</code>
                    {/* <code style={{ background: '#eee', padding: '2px 4px', borderRadius: '4px' }}>{favorite.isin}</code> */}
                </span>
              </label>
              
              {isSelected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    placeholder="€ / $ 1000" 
                    value={weights[favorite.isin] || ''}
                    onChange={(e) => handleWeightChange(favorite.isin, e.target.value)}
                    style={{ width: '130px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                    title="Importo investito"
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

