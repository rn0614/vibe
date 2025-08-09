import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import styles from './Input.module.scss';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  size = 'md',
  fullWidth = false,
  startIcon,
  endIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const containerClass = [
    styles.container,
    fullWidth && styles.fullWidth,
    className
  ].filter(Boolean).join(' ');

  const inputClass = [
    styles.input,
    styles[size],
    startIcon && styles.hasStartIcon,
    endIcon && styles.hasEndIcon,
    error && styles.error
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        {startIcon && (
          <span className={styles.startIcon}>
            {startIcon}
          </span>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClass}
          {...props}
        />
        
        {endIcon && (
          <span className={styles.endIcon}>
            {endIcon}
          </span>
        )}
      </div>
      
      {(error || helperText) && (
        <div className={styles.message}>
          {error ? (
            <span className={styles.error}>{error}</span>
          ) : (
            <span className={styles.helperText}>{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
});
