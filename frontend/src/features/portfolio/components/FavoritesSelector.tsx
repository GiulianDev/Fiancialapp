import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/Button/Button';
import { Card } from '@/shared/ui';
import type { Favorite, SavedPortfolio } from '@types';

interface FavoritesSelectorProps {
  favorites: Favorite[];
  isLoading: boolean;
  initialData: SavedPortfolio | null;
  onTest: (isins: string[], raw: Record<string, string>, num: Record<string, number>, unit: '€' | '$' | '%') => void;
  onApplica: (isins: string[], raw: Record<string, string>, num: Record<string, number>, unit: '€' | '$' | '%') => void;
  onInputsChanged: () => void;
  onRemoveFavorite: (isin: string) => Promise<void> | void; // NUOVA PROP per la rimozione dai preferiti
}

export function FavoritesSelector({ 
  favorites, 
  isLoading, 
  initialData, 
  onTest,
  onApplica,
  onInputsChanged,
  onRemoveFavorite
}: FavoritesSelectorProps) {
  
  const [selectedIsins, setSelectedIsins] = useState<Set<string>>(new Set());
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [unit, setUnit] = useState<'€' | '$' | '%'>('€');
  const [copiedIsin, setCopiedIsin] = useState<string | null>(null); // Stato locale per gestire il feedback di copia dell'ISIN

  useEffect(() => {
    if (initialData) {
      setSelectedIsins(new Set(initialData.selectedIsins));
      setWeights(initialData.weights);
      setUnit(initialData.unit);
    }
  }, [initialData]);

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

  // Funzione per la gestione della copia negli appunti dell'utente
  const handleCopyIsin = (e: React.MouseEvent, isin: string) => {
    e.stopPropagation(); // Evita qualsiasi interferenza sui click esterni
    navigator.clipboard.writeText(isin)
      .then(() => {
        setCopiedIsin(isin);
        setTimeout(() => {
          setCopiedIsin(null);
        }, 2000); // Il tooltip sparisce automaticamente dopo 2 secondi
      })
      .catch((err) => {
        console.error("Impossibile copiare l'ISIN negli appunti:", err);
      });
  };

  // Rimozione difensiva: pulisce lo stato locale prima di propagare l'azione al database/context padre
  const handleRemoveClick = (e: React.MouseEvent, isin: string) => {
    e.stopPropagation();
    
    setSelectedIsins((prev) => {
      const next = new Set(prev);
      next.delete(isin);
      return next;
    });

    setWeights((prev) => {
      const newWeights = { ...prev };
      delete newWeights[isin];
      return newWeights;
    });

    triggerChange();
    onRemoveFavorite(isin);
  };

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
    <div className="w-full">
      <Card className="favorites-portfolio__list w-full">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', width: '100%' }}>
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
        
        <p style={{ color: 'rgba(255,255,255,0.7)', width: '100%' }}>
          Seleziona gli ETF e inserisci {unit === '%' ? 'la quota' : "l'importo investito"}:
        </p>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0', width: '100%' }}>
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
                width: '100%',
                color: 'white',
                flexWrap: 'wrap'
              }}>
                {/* Rimosso <label> per evitare il click accidentale su tutta la riga */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 auto', minWidth: '0', height: '100%' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(favorite.isin)}
                    className="flex-shrink-0 cursor-pointer"
                  />
                  <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {favorite.name ? `${favorite.name} ` : ''}
                      
                      {/* ISIN Cliccabile con Tooltip di notifica incorporato */}
                      <code 
                        onClick={(e) => handleCopyIsin(e, favorite.isin)}
                        style={{ 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.9)',
                          marginLeft: '4px',
                          cursor: 'pointer',
                          position: 'relative',
                          display: 'inline-block'
                        }}
                        title="Clicca per copiare l'ISIN"
                      >
                        {favorite.isin}
                        
                        {copiedIsin === favorite.isin && (
                          <span style={{
                            position: 'absolute',
                            bottom: '135%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: '#10b981',
                            color: 'white',
                            fontSize: '0.75rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                            zIndex: 10,
                            pointerEvents: 'none'
                          }}>
                            Copiato!
                          </span>
                        )}
                      </code>
                  </span>
                </div>
                
                {isSelected && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
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

                {/* Pulsante di rimozione dai preferiti (Icona cestino) */}
                <button
                  type="button"
                  onClick={(e) => handleRemoveClick(e, favorite.isin)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(239, 68, 68, 0.7)',
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  title="Rimuovi dai preferiti"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ef4444';
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(239, 68, 68, 0.7)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>

        {isMissingValues && selectedIsins.size > 0 && (
          <div style={{ fontSize: '0.85rem', color: '#f87171', marginBottom: '12px', fontWeight: '500', width: '100%' }}>
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
            lineHeight: '1.4',
            width: '100%'
          }}>
            <strong>⚠️ Nota:</strong> La somma è pari a <strong>{totalWeight}%</strong> invece di 100%. L'analisi riproporzionerà le quote automaticamente.
          </div>
        )}

        {/* BUTTONS */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', width: '100%' }}>
          <Button 
            onClick={handleTestClick} 
            disabled={isLoading || selectedIsins.size === 0 || isMissingValues}
            style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            Test
          </Button>

          <Button 
            onClick={handleApplicaClick} 
            disabled={isLoading || selectedIsins.size === 0 || isMissingValues}
            style={{ flex: 1, backgroundColor: '#10b981', color: 'white' }}
          >
            {isLoading ? 'Salvataggio...' : 'Applica e Salva'}
          </Button>
        </div>
      </Card>
    </div>
  );
}