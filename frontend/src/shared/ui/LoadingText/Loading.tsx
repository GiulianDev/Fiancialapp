import React from 'react';
import { Skeleton } from '@ui';
import './Loading.css';

// Definiamo il custom type per le varianti ammesse
export type SkeletonVariant = 'title' | 'subtitle' | 'text';

export interface LoadingProps {
  isLoading: boolean;
  children: React.ReactNode;   // Accetta qualsiasi contenuto React
  variant?: SkeletonVariant; // Opzionale, accetta solo le 3 stringhe definite sopra
}

export function Loading({
  children,
  isLoading,
  variant = 'text',
}: LoadingProps) {

  // const combinedClassName = `loading--container ${variant}`.trim();

  // Se sta caricando, mostra lo skeleton configurato dal padre
  if (isLoading) {
    return (
      <div className="loading--container">     
        <div className={variant}> 
          <Skeleton className={variant} />
        </div> 
      </div>
    );
  }

  // Altrimenti, renderizza il testo reale (o i componenti figli)
  return (
    <div className="loading--container">      
      <div className={variant}>
        {children}
      </div>
    </div>
  )


}