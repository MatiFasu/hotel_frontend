import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', message, title, duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, type, message, title };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (message, title = '¡Operación exitosa!') => addToast({ type: 'success', message, title }),
    error: (message, title = 'Ocurrió un error') => addToast({ type: 'error', message, title }),
    warning: (message, title = 'Atención') => addToast({ type: 'warning', message, title }),
    info: (message, title = 'Información') => addToast({ type: 'info', message, title }),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast viewport */}
      <aside
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser utilizado dentro de un ToastProvider');
  }
  return context.toast;
}

function ToastItem({ toast, onDismiss }) {
  const configs = {
    success: {
      icon: CheckCircle2,
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/90 text-emerald-300',
      iconColor: 'text-emerald-400',
    },
    error: {
      icon: AlertCircle,
      border: 'border-red-500/30',
      bg: 'bg-red-950/90 text-red-300',
      iconColor: 'text-red-400',
    },
    warning: {
      icon: AlertTriangle,
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/90 text-amber-300',
      iconColor: 'text-amber-400',
    },
    info: {
      icon: Info,
      border: 'border-blue-500/30',
      bg: 'bg-blue-950/90 text-blue-300',
      iconColor: 'text-blue-400',
    },
  }[toast.type] || {
    icon: Info,
    border: 'border-dark-border',
    bg: 'bg-dark-elevated text-gray-200',
    iconColor: 'text-brand-400',
  };

  const IconComponent = configs.icon;

  return (
    <div
      role="alert"
      className={`
        pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-modal backdrop-blur-md
        animate-slide-up transition-all ${configs.bg} ${configs.border}
      `}
    >
      <IconComponent size={18} className={`shrink-0 mt-0.5 ${configs.iconColor}`} />
      <div className="flex-1 text-left min-w-0">
        {toast.title && <h5 className="text-xs font-semibold leading-tight">{toast.title}</h5>}
        <p className="text-xs opacity-90 mt-0.5 leading-snug break-words">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
