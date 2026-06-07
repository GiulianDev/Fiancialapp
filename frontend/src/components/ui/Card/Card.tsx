import { type PropsWithChildren, type HTMLAttributes } from 'react';
import './Card.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Card({ children, className = '', ...props }: PropsWithChildren<CardProps>) {
  return (
    <div className={`ui-card ${className}`} {...props}>
      {children}
    </div>
  );
}
