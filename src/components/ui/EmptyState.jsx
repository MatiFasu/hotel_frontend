import React from 'react';
import { FolderOpen } from 'lucide-react';

/**
 * Estado vacío amigable y claro cuando un listado o búsqueda no arroja resultados.
 */
export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No hay registros disponibles',
  description = 'Comienza agregando tu primer elemento o ajusta los filtros de búsqueda.',
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-dark-elevated border border-dark-border flex items-center justify-center text-dark-muted mb-4 shadow-sm">
        <Icon size={24} />
      </div>
      <h4 className="text-sm font-semibold text-gray-200">
        {title}
      </h4>
      <p className="text-xs text-dark-muted max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
