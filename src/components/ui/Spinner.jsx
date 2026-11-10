import React from 'react';

/**
 * Componente Spinner para estados de carga accesibles (WCAG AA).
 * @param {'sm' | 'md' | 'lg' | 'xl'} size Tamaño del spinner
 * @param {'brand' | 'white' | 'muted'} color Color del spinner
 * @param {string} className Clases adicionales
 */
export default function Spinner({ size = 'md', color = 'brand', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  }[size] || 'w-5 h-5 border-2';

  const colorClasses = {
    brand: 'border-brand-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    muted: 'border-dark-muted border-t-transparent',
  }[color] || 'border-brand-500 border-t-transparent';

  return (
    <div
      role="status"
      aria-label="Cargando"
      className={`inline-block animate-spin rounded-full ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
