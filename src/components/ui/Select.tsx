import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, error, options, placeholder, id, className = '', ...props },
    ref,
  ) {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm text-muted">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`w-full appearance-none rounded-lg border bg-surface px-3 py-2.5 text-content transition-all duration-150 ${
            error
              ? 'border-danger'
              : 'border-edge hover:border-muted'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  },
)
