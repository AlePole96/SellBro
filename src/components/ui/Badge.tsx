import type { ItemStatus, Category } from '../../lib/types'

type Variant = 'status' | 'category' | 'default'

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  status?: ItemStatus
  category?: Category
  className?: string
}

const statusClasses: Record<ItemStatus, string> = {
  bozza: 'bg-status-bozza/15 text-status-bozza',
  pronto: 'bg-status-pronto/15 text-status-pronto',
  pubblicato: 'bg-status-pubblicato/15 text-status-pubblicato',
  venduto: 'bg-status-venduto/15 text-status-venduto',
}

const categoryClasses: Record<Category, string> = {
  vestiti: 'bg-cat-vestiti/15 text-cat-vestiti',
  tech: 'bg-cat-tech/15 text-cat-tech',
  giochi: 'bg-cat-giochi/15 text-cat-giochi',
}

export function Badge({
  children,
  variant = 'default',
  status,
  category,
  className = '',
}: BadgeProps) {
  let colorClasses = 'bg-surface text-muted'

  if (variant === 'status' && status) {
    colorClasses = statusClasses[status]
  } else if (variant === 'category' && category) {
    colorClasses = categoryClasses[category]
  }

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${colorClasses} ${className}`}
    >
      {children}
    </span>
  )
}
