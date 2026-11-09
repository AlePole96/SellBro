import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  suffix?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, suffix, id, className = '', ...props }, ref) {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            className={`w-full rounded-lg border bg-surface px-3 py-2.5 text-content placeholder:text-faint transition-all duration-150 ${
              error
                ? 'border-danger'
                : 'border-edge hover:border-muted'
            } ${suffix ? 'pr-12' : ''} ${className}`}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-faint">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  },
)
