import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, id, className = '', ...props }, ref) {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm text-muted">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          rows={3}
          className={`w-full rounded-lg border bg-surface px-3 py-2.5 text-content placeholder:text-faint transition-all duration-150 resize-y ${
            error
              ? 'border-danger'
              : 'border-edge hover:border-muted'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  },
)
