import { Link } from 'react-router-dom'
import { Badge } from '../ui'
import type { Item } from '../../lib/types'

interface ItemCardProps {
  item: Item
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link
      to={`/items/${item.id}`}
      className="block rounded-xl border border-edge bg-surface p-4 transition-all duration-150 hover:border-muted hover:bg-raised active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium">{item.title}</h3>
          {item.brand && (
            <p className="truncate text-sm text-muted">{item.brand}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Badge variant="category" category={item.category}>
            {item.category}
          </Badge>
          <Badge variant="status" status={item.status}>
            {item.status}
          </Badge>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-3 text-sm">
          {item.price_listed != null && (
            <span className="font-semibold">{item.price_listed}€</span>
          )}
          {item.price_final != null && (
            <span className="text-success font-semibold">
              {item.price_final}€
            </span>
          )}
        </div>

        {item.platforms.length > 0 && (
          <div className="flex gap-1">
            {item.platforms.map((p) => (
              <span
                key={p}
                className="rounded bg-overlay px-1.5 py-0.5 text-xs text-faint"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
