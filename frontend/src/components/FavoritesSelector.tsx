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
        setWeights(w => ({ ...w, [isin]: 1 })); 
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
      <h3>I tuoi preferiti</h3>
      <p>Seleziona gli ETF da analizzare e assegna un peso:</p>
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
                <input 
                  type="number" 
                  min="0"
                  step="any"
                  placeholder="Peso" 
                  value={weights[favorite.isin] ?? 1}
                  onChange={(e) => handleWeightChange(favorite.isin, e.target.value)}
                  style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                  title="Peso (es. capitale investito o quota)"
                />
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
