import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface BrainBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function BrainBadge({
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  className,
  children,
  ...props
}: BrainBadgeProps) {
  const baseClasses = 'brain-badge';
  
  const variantClasses = {
    primary: 'brain-badge-primary',
    secondary: 'brain-badge-secondary',
    neutral: 'brain-badge-neutral',
    success: 'brain-badge-success',
    warning: 'brain-badge-warning',
    error: 'brain-badge-error'
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: '',
    lg: 'text-sm px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <span
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      {children}
    </span>
  );
}