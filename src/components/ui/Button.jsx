import React from 'react';
import Spinner from './Spinner';

/**
 * Componente Button accesible y reutilizable.
 * @param {'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline'} variant
 * @param {'sm' | 'md' | 'lg'} size
 * @param {boolean} loading Muestra spinner y bloquea clicks
 * @param {boolean} disabled
 * @param {React.ReactNode} leftIcon Ícono a la izquierda
 * @param {React.ReactNode} rightIcon Ícono a la derecha
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  }[size] || 'text-sm px-4 py-2 gap-2';

  const variantClasses = {
    primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm hover:shadow active:bg-brand-700',
    secondary: 'bg-dark-elevated hover:bg-dark-hover text-gray-200 border border-dark-border active:bg-dark-surface',
    danger: 'bg-red-600/90 hover:bg-red-500 text-white shadow-sm active:bg-red-700',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm active:bg-emerald-700',
    outline: 'border border-dark-border hover:border-gray-500 text-gray-200 hover:bg-dark-elevated/50 bg-transparent',
    ghost: 'text-gray-300 hover:text-white hover:bg-dark-elevated bg-transparent',
  }[variant] || 'bg-brand-600 hover:bg-brand-500 text-white';

  const isBlocked = disabled || loading;

  return (
    <button
      type={type}
      disabled={isBlocked}
      aria-disabled={isBlocked}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" color={variant === 'secondary' || variant === 'ghost' || variant === 'outline' ? 'muted' : 'white'} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
