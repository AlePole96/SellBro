import type { Item, Category } from './types'

type MeasureKey = keyof Item & `measure_${string}`

interface MeasureLabel {
  key: MeasureKey
  label: string
}

const CLOTHING_MEASURES: MeasureLabel[] = [
  { key: 'measure_chest', label: 'Petto' },
  { key: 'measure_length', label: 'Lunghezza' },
  { key: 'measure_waist', label: 'Vita' },
  { key: 'measure_shoulders', label: 'Spalle' },
  { key: 'measure_sleeve', label: 'Manica' },
]

const DIMENSION_MEASURES: MeasureLabel[] = [
  { key: 'measure_width', label: 'Larghezza' },
  { key: 'measure_height', label: 'Altezza' },
  { key: 'measure_depth', label: 'Profondità' },
]

function getMeasures(category: Category): MeasureLabel[] {
  return category === 'vestiti' ? CLOTHING_MEASURES : DIMENSION_MEASURES
}

function formatMeasures(
  item: Item,
  measures: MeasureLabel[],
  separator: 'inline' | 'list',
): string {
  const filled = measures.filter((m) => item[m.key] != null)
  if (filled.length === 0) return ''

  if (separator === 'inline') {
    return filled.map((m) => `${m.label} ${item[m.key]} cm`).join(' · ')
  }

  return filled.map((m) => `▸ ${m.label}: ${item[m.key]} cm`).join('\n')
}

export function buildVintedDescription(item: Item): string {
  const lines: string[] = []

  const header = [item.brand, item.title].filter(Boolean).join(' — ')
  lines.push(header)

  if (item.size) {
    lines.push(`Taglia: ${item.size}`)
  }

  const measures = formatMeasures(item, getMeasures(item.category), 'inline')
  if (measures) {
    lines.push(measures)
  }

  lines.push(`Condizioni: ${item.condition}`)
  lines.push(`Difetti: ${item.defects || 'nessuno'}`)

  if (item.notes) {
    lines.push('')
    lines.push(item.notes)
  }

  return lines.join('\n')
}

export function buildSubitoDescription(item: Item): string {
  const lines: string[] = []

  const header = [item.brand, item.title].filter(Boolean).join(' — ')
  lines.push(header)
  lines.push('')

  if (item.size) {
    lines.push(`▸ Taglia: ${item.size}`)
  }

  const measures = formatMeasures(item, getMeasures(item.category), 'list')
  if (measures) {
    lines.push(measures)
  }

  lines.push(`▸ Condizioni: ${item.condition}`)
  lines.push(`▸ Difetti: ${item.defects || 'nessuno'}`)

  lines.push('')
  lines.push('Prezzo trattabile. Spedizione o ritiro in zona.')

  if (item.notes) {
    lines.push('')
    lines.push(item.notes)
  }

  return lines.join('\n')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
