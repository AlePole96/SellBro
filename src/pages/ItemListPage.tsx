import { useState, useMemo } from 'react'
import { useItems } from '../hooks/useItems'
import { ItemCard } from '../components/items/ItemCard'
import { ItemFilters, type Filters } from '../components/items/ItemFilters'
import type { Item } from '../lib/types'

const DEFAULT_FILTERS: Filters = {
  search: '',
  category: '',
  status: '',
  platform: '',
}

function filterItems(items: Item[], filters: Filters): Item[] {
  return items.filter((item) => {
    if (filters.category && item.category !== filters.category) return false
    if (filters.status && item.status !== filters.status) return false
    if (
      filters.platform &&
      !item.platforms.includes(filters.platform)
    )
      return false

    if (filters.search) {
      const q = filters.search.toLowerCase()
      const searchable = [item.title, item.brand, item.notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!searchable.includes(q)) return false
    }

    return true
  })
}

export default function ItemListPage() {
  const { items, loading } = useItems()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const filtered = useMemo(() => filterItems(items, filters), [items, filters])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ItemFilters filters={filters} onChange={setFilters} />

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted">
            {items.length === 0
              ? 'Nessun articolo. Creane uno!'
              : 'Nessun risultato per i filtri selezionati'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-faint">
            {filtered.length} articol{filtered.length === 1 ? 'o' : 'i'}
          </p>
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
