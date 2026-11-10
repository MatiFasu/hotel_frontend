import React, { forwardRef, useId } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

/**
 * Componente Select accesible y estilizado con Tailwind.
 */
const Select = forwardRef(function Select(
  {
    label,
    options = [],
    children,
    error,
    helperText,
    id: customId,
    className = '',
    required = false,
    disabled = false,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const selectId = customId || generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-gray-300 select-none flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`
            w-full rounded-lg bg-dark-surface text-gray-100 text-sm appearance-none
            border transition-all duration-150 outline-none
            py-2 pl-3.5 pr-10 cursor-pointer
            ${error
              ? 'border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/30'
              : 'border-dark-border hover:border-gray-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-dark-bg' : ''}
            ${className}
          `}
          {...props}
        >
          {children ? (
            children
          ) : (
            options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-dark-surface text-gray-100">
                {opt.label}
              </option>
            ))
          )}
        </select>

        <div className="absolute right-3 pointer-events-none text-dark-muted flex items-center">
          {error ? <AlertCircle size={16} className="text-red-400" /> : <ChevronDown size={16} />}
        </div>
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-red-400 flex items-center gap-1 font-medium mt-0.5">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-dark-muted mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Select;
