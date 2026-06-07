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
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [unit, setUnit] = useState<'€' | '$' | '%'>('€');

  const toggleSelection = (isin: string) => {
    setSelectedIsins((prev) => {
      const next = new Set(prev);
      if (next.has(isin)) {
        next.delete(isin);
        setWeights(w => {
          const newWeights = { ...w };
          delete newWeights[isin];
          return newWeights;
        }); 
      } else {
        next.add(isin);
      }
      return next;
    });
  };

  const handleWeightChange = (isin: string, value: string) => {
    const normalized = value.replace(',', '.');
    if (normalized === '' || /^\d*\.?\d*$/.test(normalized)) {
      setWeights(prev => ({ ...prev, [isin]: normalized }));
    }
  };

  const handleAnalyzeClick = () => {
    const numericWeights: Record<string, number> = {};
    selectedIsins.forEach(isin => {
      const val = parseFloat(weights[isin] || '0');
      numericWeights[isin] = isNaN(val) ? 0 : val;
    });
    onAnalyze(Array.from(selectedIsins), numericWeights);
  };

  // --- CALCOLO IN TEMPO REALE PER L'AVVISO ---
  const currentTotalWeight = Array.from(selectedIsins).reduce((sum, isin) => {
    const val = parseFloat(weights[isin] || '0');
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const showWarning = unit === '%' && selectedIsins.size > 0 && currentTotalWeight !== 100;

  return (
    <Card className="favorites-portfolio__list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>Analisi Portafoglio</h3>
        <select 
          value={unit} 
          onChange={(e) => setUnit(e.target.value as '€' | '$' | '%')}
          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
        >
          <option value="€">Euro (€)</option>
          <option value="$">Dollari ($)</option>
          <option value="%">Percentuale (%)</option>
        </select>
      </div>
      
      <p>Seleziona gli ETF e inserisci {unit === '%' ? 'la quota' : "l'importo investito"}:</p>
      
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
                </span>
              </label>
              
              {isSelected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#666', minWidth: '15px' }}>{unit}</span>
                  <input 
                    type="text"
                    inputMode="decimal"
                    placeholder={unit === '%' ? "es. 50" : "es. 1000"} 
                    value={weights[favorite.isin] || ''}
                    onChange={(e) => handleWeightChange(favorite.isin, e.target.value)}
                    style={{ width: '100px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                    title={unit === '%' ? "Percentuale" : "Importo investito"}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* BANNER DI AVVISO */}
      {showWarning && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '6px',
          color: '#92400e',
          fontSize: '0.9rem'
        }}>
          <strong>⚠️ Attenzione:</strong> La somma delle percentuali è <strong>{currentTotalWeight}%</strong> invece di 100%. L'analisi riproporzionerà i pesi automaticamente.
        </div>
      )}

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