import { type ButtonHTMLAttributes } from 'react';
import './FavoriteButton.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onToggleFavorite: () => void;
  showSkeleton: boolean;
  isFavorite: boolean;
}

export function FavoriteButton({ onToggleFavorite, showSkeleton, isFavorite }: ButtonProps) {

  return (
    <div className="favorite-button--container">
      <button 
        onClick={onToggleFavorite} 
        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
        aria-label={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
        disabled={showSkeleton}
        >
        {showSkeleton ? (
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        )}
      </button>
    </div>
  );
}
