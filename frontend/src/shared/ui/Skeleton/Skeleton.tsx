import './Skeleton.css';

// Definiamo l'interfaccia estendendo i tipi nativi di React se necessario,
// oppure dichiarando esplicitamente style e className.
export interface SkeletonProps {
  className?: string;          // Permette di passare classi aggiuntive
}

export function Skeleton({ className = '' }: SkeletonProps) {

  // Combiniamo la classe base obbligatoria con l'eventuale classe custom passata dall'esterno
  const combinedClassName = `skeleton ${className}`.trim();

  return (
    <div className='skeleton--container'> 
      <div className={combinedClassName} aria-hidden="true" />
    </div>
  );
}