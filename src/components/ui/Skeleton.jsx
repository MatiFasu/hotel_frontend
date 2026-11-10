import React from 'react';

/**
 * Componente Skeleton con animación shimmer para estados de carga accesibles.
 */
export default function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
}) {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    circle: 'rounded-full',
    rect: 'rounded-lg w-full',
    card: 'h-32 w-full rounded-xl',
  }[variant] || 'h-4 w-full rounded';

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  const elements = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      style={style}
      aria-hidden="true"
      className={`
        bg-gradient-to-r from-dark-surface via-dark-elevated to-dark-surface
        bg-[length:200%_100%] animate-shimmer
        border border-dark-borderSubtle/50
        ${variantClasses}
        ${className}
      `}
    />
  ));

  return count === 1 ? elements[0] : <div className="space-y-2.5 w-full">{elements}</div>;
}

/**
 * Skeleton específico para filas de tablas.
 */
export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="border-b border-dark-borderSubtle animate-pulse">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="p-4">
              <div className="h-4 bg-dark-elevated rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
