import { CATEGORIES, STATUSES, PLATFORMS } from '../../lib/constants'
import type { Category, ItemStatus, Platform } from '../../lib/types'

export interface Filters {
  search: string
  category: Category | ''
  status: ItemStatus | ''
  platform: Platform | ''
}

interface ItemFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export function ItemFilters({ filters, onChange }: ItemFiltersProps) {
  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Cerca articoli..."
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          className="w-full rounded-lg border border-edge bg-surface py-2.5 pl-9 pr-3 text-sm text-content placeholder:text-faint transition-all duration-150 hover:border-muted"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip
          label="Tutte"
          active={filters.category === ''}
          onClick={() => set('category', '')}
        />
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c.value}
            label={c.label}
            active={filters.category === c.value}
            onClick={() =>
              set('category', filters.category === c.value ? '' : c.value)
            }
          />
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip
          label="Tutti"
          active={filters.status === ''}
          onClick={() => set('status', '')}
        />
        {STATUSES.map((s) => (
          <FilterChip
            key={s.value}
            label={s.label}
            active={filters.status === s.value}
            onClick={() =>
              set('status', filters.status === s.value ? '' : s.value)
            }
          />
        ))}
      </div>

      <div className="flex gap-2">
        <FilterChip
          label="Tutte"
          active={filters.platform === ''}
          onClick={() => set('platform', '')}
        />
        {PLATFORMS.map((p) => (
          <FilterChip
            key={p.value}
            label={p.label}
            active={filters.platform === p.value}
            onClick={() =>
              set('platform', filters.platform === p.value ? '' : p.value)
            }
          />
        ))}
      </div>
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 ${
        active
          ? 'bg-primary text-base'
          : 'bg-surface text-muted border border-edge hover:border-muted'
      }`}
    >
      {label}
    </button>
  )
}
