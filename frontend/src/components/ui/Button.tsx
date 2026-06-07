import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-semibold transition disabled:cursor-not-allowed';

  const variantStyles =
    variant === 'primary'
      ? 'bg-violet-500 text-white hover:bg-violet-400 disabled:bg-violet-300'
      : variant === 'secondary'
      ? 'bg-slate-700 text-white hover:bg-slate-600 disabled:bg-slate-500'
      : 'bg-transparent text-white hover:bg-white/10 disabled:text-slate-400';

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
}
