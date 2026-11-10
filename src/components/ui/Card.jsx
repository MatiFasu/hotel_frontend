import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-dark-surface border border-dark-borderSubtle rounded-xl shadow-card overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-5 border-b border-dark-borderSubtle flex flex-col gap-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', as: Component = 'h3', ...props }) {
  return (
    <Component className={`text-base font-semibold text-gray-100 leading-tight ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-xs text-dark-muted ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-4 bg-dark-bg/40 border-t border-dark-borderSubtle flex items-center justify-end gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
