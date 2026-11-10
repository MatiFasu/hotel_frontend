import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Info } from 'lucide-react';

/**
 * Diálogo accesible para confirmaciones de negocio (reemplazo de window.confirm).
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
}) {
  const iconConfig = {
    danger: { icon: AlertTriangle, bg: 'bg-red-950/40 border-red-500/30 text-red-400' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-950/40 border-amber-500/30 text-amber-400' },
    primary: { icon: Info, bg: 'bg-blue-950/40 border-blue-500/30 text-blue-400' },
  }[variant] || { icon: AlertTriangle, bg: 'bg-red-950/40 border-red-500/30 text-red-400' };

  const IconComponent = iconConfig.icon;

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={loading}>
        {cancelText}
      </Button>
      <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" footer={footer}>
      <div className="flex items-start gap-4 text-left">
        <div className={`p-2.5 rounded-xl border shrink-0 ${iconConfig.bg}`}>
          <IconComponent size={22} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-100">
            {title}
          </h4>
          <p className="text-xs text-dark-muted mt-1.5 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
}
