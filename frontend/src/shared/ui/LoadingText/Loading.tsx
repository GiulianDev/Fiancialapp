import React from 'react';
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'; // Aggiusta il path se necessario
import './Loading.css';

export type SkeletonVariant = 'title' | 'subtitle' | 'text';

export interface LoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  variant?: SkeletonVariant;
}

export function Loading({
  children,
  isLoading,
  variant = 'text',
}: LoadingProps) {

  // Se sta caricando, mostra solo lo skeleton con le dimensioni corrette
  if (isLoading) {
    return (
      <div className="loading--container">     
        <Skeleton className={variant} />
      </div>
    );
  }

  // Altrimenti, renderizza il testo reale avvolto nel contenitore semantico
  return (
    <div className="loading--container">      
      <div className={`loading--content ${variant}`.trim()}>
        {children}
      </div>
    </div>
  );
}