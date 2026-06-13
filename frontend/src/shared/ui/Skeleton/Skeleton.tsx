import './Skeleton.css';

export interface SkeletonProps {
  className?: string; // Permette di passare la variante 'title', 'subtitle', 'text'
}

export function Skeleton({ className = '' }: SkeletonProps) {
  // Combiniamo la classe base con l'eventuale variante
  const combinedClassName = `skeleton ${className}`.trim();

  return <div className={combinedClassName} aria-hidden="true" />;
}