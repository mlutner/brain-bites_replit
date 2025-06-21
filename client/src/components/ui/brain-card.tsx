import React from 'react';
import { cn } from '@/lib/utils';

interface BrainCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'selected' | 'gradient';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function BrainCard({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: BrainCardProps) {
  const baseClasses = 'brain-card';
  
  const variantClasses = {
    default: '',
    interactive: 'brain-card-interactive',
    selected: 'brain-card-selected',
    gradient: 'brain-gradient-light'
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function BrainCardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function BrainCardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('brain-heading-3 mb-2', className)} {...props}>
      {children}
    </h3>
  );
}

export function BrainCardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('brain-text-muted', className)} {...props}>
      {children}
    </p>
  );
}

export function BrainCardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

export function BrainCardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-6 pt-4 border-t border-border', className)} {...props}>
      {children}
    </div>
  );
}