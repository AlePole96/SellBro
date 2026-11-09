import type { Category, Condition, ItemStatus, Platform } from './types'

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'vestiti', label: 'Vestiti' },
  { value: 'tech', label: 'Tech' },
  { value: 'giochi', label: 'Giochi' },
]

export const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'Nuovo con cartellino', label: 'Nuovo con cartellino' },
  { value: 'Come nuovo', label: 'Come nuovo' },
  { value: 'Ottime condizioni', label: 'Ottime condizioni' },
  { value: 'Buone condizioni', label: 'Buone condizioni' },
  { value: 'Discrete condizioni', label: 'Discrete condizioni' },
]

export const STATUSES: { value: ItemStatus; label: string }[] = [
  { value: 'bozza', label: 'Bozza' },
  { value: 'pronto', label: 'Pronto' },
  { value: 'pubblicato', label: 'Pubblicato' },
  { value: 'venduto', label: 'Venduto' },
]

export const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'vinted', label: 'Vinted' },
  { value: 'subito', label: 'Subito' },
]

export const CLOTHING_MEASURES = [
  { key: 'measure_chest' as const, label: 'Petto' },
  { key: 'measure_length' as const, label: 'Lunghezza' },
  { key: 'measure_waist' as const, label: 'Vita' },
  { key: 'measure_shoulders' as const, label: 'Spalle' },
  { key: 'measure_sleeve' as const, label: 'Manica' },
]

export const DIMENSION_MEASURES = [
  { key: 'measure_width' as const, label: 'Larghezza' },
  { key: 'measure_height' as const, label: 'Altezza' },
  { key: 'measure_depth' as const, label: 'Profondità' },
]

export const MAX_PHOTOS = 5
