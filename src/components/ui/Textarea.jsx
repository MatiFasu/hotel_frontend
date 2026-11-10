import React, { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Componente Textarea accesible y estilizado con Tailwind.
 */
const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    id: customId,
    className = '',
    required = false,
    disabled = false,
    rows = 3,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const textareaId = customId || generatedId;
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-semibold text-gray-300 select-none flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
          </span>
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`
          w-full rounded-lg bg-dark-surface text-gray-100 text-sm placeholder:text-dark-subtle
          border transition-all duration-150 outline-none
          py-2 px-3.5 resize-y
          ${error
            ? 'border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/30'
            : 'border-dark-border hover:border-gray-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed bg-dark-bg' : ''}
          ${className}
        `}
        {...props}
      />

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-red-400 flex items-center gap-1 font-medium mt-0.5">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-dark-muted mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Textarea;
