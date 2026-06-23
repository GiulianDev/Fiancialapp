import { type ButtonHTMLAttributes, useState } from 'react';
import './FavoriteButton.css';
import { useFavorites } from '../FavoritesContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isin: string;
  name?: string; // Consigliato passarlo se disponibile
  showSkeleton?: boolean;
}

export function FavoriteButton({ isin, name, showSkeleton, disabled, ...props }: ButtonProps) {
  // Ora importiamo toggleFavorite direttamente dal context
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isProcessing, setIsProcessing] = useState(false);

  name = name ? name : isin;
  
  const isFav = isFavorite(isin);

  const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Blocchiamo eventuali click sui parent (es. Link o Card)
    e.preventDefault();
    e.stopPropagation();
    
    // Evitiamo che l'utente spammi il click
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await toggleFavorite(isin, name);
    } catch (error) {
      console.error("Errore durante l'aggiornamento dei preferiti:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="favorite-button--container">
      <button 
        onClick={handleToggle} 
        className={`favorite-btn ${isFav ? 'active' : ''}`}
        aria-label={isFav ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
        disabled={showSkeleton || isProcessing || disabled}
        {...props}
      >
        {showSkeleton ? (
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill={isFav ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        )}
      </button>
    </div>
  );
}