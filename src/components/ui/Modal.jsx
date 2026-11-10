import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';

/**
 * Componente Modal accesible (WCAG AA).
 * Maneja Escape, bloqueo de scroll en body y foco de atención.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className = '',
}) {
  const titleId = useId();
  const descId = useId();

  // Bloqueo de scroll y listener de Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  }[size] || 'max-w-lg';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop con desenfoque suave */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor del Modal */}
      <div
        className={`
          relative w-full ${sizeClasses} bg-dark-elevated border border-dark-border
          rounded-xl shadow-modal overflow-hidden z-10 animate-slide-up flex flex-col max-h-[90vh]
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-dark-borderSubtle bg-dark-surface/50">
          <div className="pr-4">
            {title && (
              <h3 id={titleId} className="text-base font-semibold text-gray-100">
                {title}
              </h3>
            )}
            {description && (
              <p id={descId} className="text-xs text-dark-muted mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-dark-muted hover:text-white p-1 rounded-lg hover:bg-dark-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body con scroll independiente */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer opcional */}
        {footer && (
          <div className="p-4 bg-dark-surface/80 border-t border-dark-borderSubtle flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
