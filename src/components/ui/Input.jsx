import React, { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Componente Input accesible con soporte para validación inline y labels.
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    id: customId,
    leftIcon,
    rightIcon,
    className = '',
    required = false,
    disabled = false,
    type = 'text',
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-gray-300 select-none flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 pointer-events-none text-dark-muted flex items-center">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`
            w-full rounded-lg bg-dark-surface text-gray-100 text-sm placeholder:text-dark-subtle
            border transition-all duration-150 outline-none
            py-2 px-3.5
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || error ? 'pr-10' : ''}
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
          <div className="absolute right-3 pointer-events-none text-red-400 flex items-center">
            <AlertCircle size={16} />
          </div>
        ) : rightIcon ? (
          <div className="absolute right-3 pointer-events-none text-dark-muted flex items-center">
            {rightIcon}
          </div>
        ) : null}
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

export default Input;
