import React from 'react';
import { cn } from '@client/src/utils/cn';

interface ForumCardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  className?: string;
}

const paddingClasses: Record<string, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  none: 'p-0',
};

const ForumCard: React.FC<ForumCardProps> = ({
  children,
  padding = 'md',
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-[var(--surface)] border border-[var(--border)] rounded-sm',
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </div>
  );
};

export default ForumCard;
