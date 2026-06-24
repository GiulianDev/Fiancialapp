import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/Button/Button';
import { Card } from '@/shared/ui';
import type { SavedPortfolio } from '@types';
import type { Favorite } from '@/shared/Favorites';

interface FavoritesSelectorProps {
  favorites: Favorite[];
  isLoading: boolean;
  initialData: SavedPortfolio | null;
  onTest: (isins: string[], raw: Record<string, string>, num: Record<string, number>, unit: '€' | '$' | '%') => void;
  onApplica: (isins: string[], raw: Record<string, string>, num: Record<string, number>, unit: '€' | '$' | '%') => void;
  onInputsChanged: () => void;
  onRemoveFavorite: (isin: string) => Promise<void> | void;
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
  const [copiedIsin, setCopiedIsin] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setSelectedIsins(new Set(initialData.selectedIsins));
      setWeights(initialData.weights);
      setUnit(initialData.unit);
    }
  }, [initialData]);

  const triggerChange = () => onInputsChanged();

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

  const handleCopyIsin = (e: React.MouseEvent, isin: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(isin)
      .then(() => {
        setCopiedIsin(isin);
        setTimeout(() => setCopiedIsin(null), 2000);
      })
      .catch((err) => console.error("Impossibile copiare l'ISIN:", err));
  };

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
        {/* HEADER */}
        <div className="flex justify-between items-center mb-2.5 w-full">
          <h3 className="m-0 text-white">Analisi Portafoglio</h3>
          <select 
            value={unit} 
            onChange={(e) => handleUnitChange(e.target.value as '€' | '$' | '%')}
            className="px-2 py-1 rounded-md border border-white/20 bg-transparent cursor-pointer text-white focus:outline-none"
          >
            <option value="€" className="text-black">Euro (€)</option>
            <option value="$" className="text-black">Dollari ($)</option>
            <option value="%" className="text-black">Percentuale (%)</option>
          </select>
        </div>
        
        <p className="text-white/70 w-full">
          Seleziona gli ETF e inserisci {unit === '%' ? 'la quota' : "l'importo investito"}:
        </p>
        
        {/* LISTA ETF */}
        <ul className="list-none p-0 my-5 w-full">
          {favorites.map((favorite) => {
            const isSelected = selectedIsins.has(favorite.isin);
            const weightValue = weights[favorite.isin] || '';
            const numVal = parseFloat(weightValue);
            const isInputInvalid = isSelected && weightValue !== '' && (isNaN(numVal) || numVal <= 0);

            return (
              <li key={favorite.isin} className="mb-3 flex items-center gap-2.5 min-h-[38px] w-full text-white flex-wrap">
                <div className="flex items-center gap-2 flex-1 min-w-0 h-full">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(favorite.isin)}
                    className="shrink-0 cursor-pointer"
                  />
                  <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                    {favorite.name ? `${favorite.name} ` : ''}
                    
                    <code 
                      onClick={(e) => handleCopyIsin(e, favorite.isin)}
                      className="px-1.5 py-0.5 rounded bg-white/10 text-white/90 ml-1 cursor-pointer relative inline-block"
                      title="Clicca per copiare l'ISIN"
                    >
                      {favorite.isin}
                      {copiedIsin === favorite.isin && (
                        <span className="absolute bottom-[135%] left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap shadow-md z-10 pointer-events-none">
                          Copiato!
                        </span>
                      )}
                    </code>
                  </span>
                </div>
                
                {isSelected && (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-sm text-white/50 min-w-[15px]">{unit}</span>
                    <input 
                      type="text"
                      inputMode="decimal"
                      placeholder={unit === '%' ? "es. 50" : "es. 1000"} 
                      value={weightValue}
                      onChange={(e) => handleWeightChange(favorite.isin, e.target.value)}
                      className={`w-[100px] px-2.5 py-1.5 rounded-md bg-transparent text-white transition-all duration-200 focus:outline-none border ${isInputInvalid ? 'border-red-600' : 'border-white/20'}`}
                      title={unit === '%' ? "Percentuale" : "Importo investito"}
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => handleRemoveClick(e, favorite.isin)}
                  className="bg-transparent border-none text-red-500/70 cursor-pointer p-1.5 flex items-center justify-center rounded-md transition-all duration-200 shrink-0 hover:text-red-500 hover:bg-red-500/10"
                  title="Rimuovi dai preferiti"
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

        {/* WARNINGS */}
        {isMissingValues && selectedIsins.size > 0 && (
          <div className="text-[0.85rem] text-red-400 mb-3 font-medium w-full">
            * Inserisci un valore maggiore di 0 per tutti gli ETF selezionati.
          </div>
        )}

        {showWarning && (
          <div className="p-3 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm leading-snug w-full">
            <strong>⚠️ Nota:</strong> La somma è pari a <strong>{totalWeight}%</strong> invece di 100%. L'analisi riproporzionerà le quote automaticamente.
          </div>
        )}

        {/* BUTTONS */}
        <div className="flex gap-3 mt-2 w-full">
          <Button 
            onClick={handleTestClick} 
            disabled={isLoading || selectedIsins.size === 0 || isMissingValues}
            className="flex-1 bg-white/10 text-white border border-white/20 hover:bg-white/20"
          >
            Test
          </Button>

          <Button 
            onClick={handleApplicaClick} 
            disabled={isLoading || selectedIsins.size === 0 || isMissingValues}
            className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Salvataggio...' : 'Applica e Salva'}
          </Button>
        </div>
      </Card>
    </div>
  );
}