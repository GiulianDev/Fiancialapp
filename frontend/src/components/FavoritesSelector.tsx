// src/components/FavoritesSelector.tsx
import { useState, useEffect } from 'react';
import { type Favorite, type SavedPortfolio } from '../firebase';
import { Button } from './ui/Button';
import { Card } from './ui/Card/Card';

interface FavoritesSelectorProps {
  favorites: Favorite[];
  isLoading: boolean;
  initialData: SavedPortfolio | null;
  onTest: (isins: string[], raw: Record<string, string>, num: Record<string, number>, unit: '€' | '$' | '%') => void;
  onApplica: (isins: string[], raw: Record<string, string>, num: Record<string, number>, unit: '€' | '$' | '%') => void;
  onInputsChanged: () => void;
}

export function FavoritesSelector({ 
  favorites, 
  isLoading, 
  initialData, 
  onTest,
  onApplica,
  onInputsChanged
}: FavoritesSelectorProps) {
  const [selectedIsins, setSelectedIsins] = useState<Set<string>>(new Set());
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [unit, setUnit] = useState<'€' | '$' | '%'>('€');

  useEffect(() => {
    if (initialData) {
      setSelectedIsins(new Set(initialData.selectedIsins));
      setWeights(initialData.weights);
      setUnit(initialData.unit);
    }
  }, [initialData]);

  // Funzione di utilità per avvisare il componente padre che stiamo scrivendo
  const triggerChange = () => {
    onInputsChanged();
  };

  const handleUnitChange = (newUnit: '€' | '$' | '%') => {
    setUnit(newUnit);
    triggerChange();
  };

  const toggleSelection = (isin: string) => {
    triggerChange();
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
    triggerChange();
    let normalized = value.replace(',', '.');
    if (/^0[0-9]/.test(normalized)) {
      normalized = normalized.replace(/^0+/, '');
    }
    if (normalized === '' || /^\d*\.?\d*$/.test(normalized)) {
      setWeights(prev => ({ ...prev, [isin]: normalized }));
    }
  };

  // Prepara i dati numerici puliti da inviare ai bottoni
  const getCleanData = () => {
    const numericWeights: Record<string, number> = {};
    const selectedIsinsArray = Array.from(selectedIsins);
    
    selectedIsinsArray.forEach(isin => {
      const val = parseFloat(weights[isin] || '0');
      numericWeights[isin] = isNaN(val) ? 0 : val;
    });

    return { selectedIsinsArray, numericWeights };
  };

  const handleTestClick = () => {
    const { selectedIsinsArray, numericWeights } = getCleanData();
    onTest(selectedIsinsArray, weights, numericWeights, unit);
  };

  const handleApplicaClick = () => {
    const { selectedIsinsArray, numericWeights } = getCleanData();
    onApplica(selectedIsinsArray, weights, numericWeights, unit);
  };

  // Controlli di validità
  const isMissingValues = Array.from(selectedIsins).some(isin => {
    const val = parseFloat(weights[isin] || '');
    return isNaN(val) || val <= 0;
  });

  const totalWeight = Array.from(selectedIsins).reduce((sum, isin) => {
    const val = parseFloat(weights[isin] || '0');
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const showWarning = unit === '%' && !isMissingValues && totalWeight !== 100;

  return (
    <Card className="favorites-portfolio__list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, color: 'white' }}>Analisi Portafoglio</h3>
        <select 
          value={unit} 
          onChange={(e) => handleUnitChange(e.target.value as '€' | '$' | '%')}
          style={{ 
            padding: '4px 8px', 
            borderRadius: '6px', 
            border: '1px solid rgba(255,255,255,0.2)', 
            backgroundColor: 'transparent', 
            cursor: 'pointer',
            color: 'white',
            outline: 'none'
          }}
        >
          <option value="€" style={{ color: 'black' }}>Euro (€)</option>
          <option value="$" style={{ color: 'black' }}>Dollari ($)</option>
          <option value="%" style={{ color: 'black' }}>Percentuale (%)</option>
        </select>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.7)' }}>
        Seleziona gli ETF e inserisci {unit === '%' ? 'la quota' : "l'importo investito"}:
      </p>
      
      <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0' }}>
        {favorites.map((favorite) => {
          const isSelected = selectedIsins.has(favorite.isin);
          const weightValue = weights[favorite.isin] || '';
          const numVal = parseFloat(weightValue);
          
          const isInputInvalid = isSelected && weightValue !== '' && (isNaN(numVal) || numVal <= 0);

          return (
            <li key={favorite.isin} style={{ 
              marginBottom: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              minHeight: '38px',
              color: 'white'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, height: '100%' }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelection(favorite.isin)}
                />
                <span style={{ fontSize: '0.9rem' }}>
                    {favorite.name ? `${favorite.name} ` : ''}
                    <code style={{ 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.9)',
                      marginLeft: '4px'
                    }}>{favorite.isin}</code>
                </span>
              </label>
              
              {isSelected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', minWidth: '15px' }}>{unit}</span>
                  <input 
                    type="text"
                    inputMode="decimal"
                    placeholder={unit === '%' ? "es. 50" : "es. 1000"} 
                    value={weightValue}
                    onChange={(e) => handleWeightChange(favorite.isin, e.target.value)}
                    style={{ 
                      width: '100px', 
                      padding: '6px 10px', 
                      borderRadius: '6px', 
                      border: isInputInvalid ? '1px solid #dc2626' : '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: 'transparent',
                      color: 'white',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    title={unit === '%' ? "Percentuale" : "Importo investito"}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {isMissingValues && selectedIsins.size > 0 && (
        <div style={{ fontSize: '0.85rem', color: '#f87171', marginBottom: '12px', fontWeight: '500' }}>
          * Inserisci un valore maggiore di 0 per tutti gli ETF selezionati.
        </div>
      )}

      {showWarning && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '8px',
          color: '#fbbf24',
          fontSize: '0.9rem',
          lineHeight: '1.4'
        }}>
          <strong>⚠️ Nota:</strong> La somma è pari a <strong>{totalWeight}%</strong> invece di 100%. L'analisi riproporzionerà le quote automaticamente.
        </div>
      )}

      {/* NUOVA STRUTTURA A DUE BOTTONI */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <Button 
          onClick={handleTestClick} 
          disabled={isLoading || selectedIsins.size === 0 || isMissingValues}
          style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          🔬 Test
        </Button>

        <Button 
          onClick={handleApplicaClick} 
          disabled={isLoading || selectedIsins.size === 0 || isMissingValues}
          style={{ flex: 1, backgroundColor: '#10b981', color: 'white' }}
        >
          {isLoading ? 'Salvataggio...' : '💾 Applica e Salva'}
        </Button>
      </div>
    </Card>
  );
}