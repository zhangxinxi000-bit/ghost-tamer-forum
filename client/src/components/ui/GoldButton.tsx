import React from 'react';
import { cn } from '@client/src/utils/cn';

interface GoldButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold-dim)] border border-[var(--gold)]',
  outline:
    'bg-transparent text-[var(--gold)] border border-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--primary-foreground)]',
  ghost:
    'bg-transparent text-[var(--gold)] border border-transparent hover:bg-[var(--surface-hover)]',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
};

const GoldButton: React.FC<GoldButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium tracking-wide transition-colors rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--gold)] disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default GoldButton;
