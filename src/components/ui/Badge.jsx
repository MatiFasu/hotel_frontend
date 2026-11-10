import React from 'react';

/**
 * Componente Badge semántico para estados de negocio.
 * @param {'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'active' | 'inactive'} variant
 * @param {'sm' | 'md'} size
 * @param {boolean} dot Muestra un punto indicador de estado
 */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) {
  const normalizedVariant = variant === 'active' ? 'success' : variant === 'inactive' ? 'danger' : variant;

  const variantClasses = {
    success: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30',
    danger: 'bg-red-950/40 text-red-300 border-red-500/30',
    warning: 'bg-amber-950/40 text-amber-300 border-amber-500/30',
    info: 'bg-blue-950/40 text-blue-300 border-blue-500/30',
    neutral: 'bg-dark-elevated text-gray-300 border-dark-border',
  }[normalizedVariant] || 'bg-dark-elevated text-gray-300 border-dark-border';

  const dotColorClasses = {
    success: 'bg-emerald-400',
    danger: 'bg-red-400',
    warning: 'bg-amber-400',
    info: 'bg-blue-400',
    neutral: 'bg-gray-400',
  }[normalizedVariant] || 'bg-gray-400';

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full select-none ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColorClasses}`} aria-hidden="true" />
      )}
      <span>{children}</span>
    </span>
  );
}
