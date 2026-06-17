import { type PropsWithChildren, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Card({ children, className = '', ...props }: PropsWithChildren<CardProps>) {
  return (
    <div className={`bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col h-full min-h-[140px]" ${className}`} {...props}>
      {children}
    </div>
  );
}
