import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

export function Card({ className, children, header, footer, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'flex flex-col glass-card overflow-hidden',
        className
      )}
      {...props}
    >
      {header && (
        <div className="border-b border-slate-100 px-6 py-4">
          {header}
        </div>
      )}
      <div className="flex-1 px-6 py-6 font-medium">
        {children}
      </div>
      {footer && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-lg font-bold text-slate-800', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-sm text-slate-500 font-normal', className)}>
      {children}
    </p>
  );
}
