import { describe, it, expect } from 'vitest'
import { buildVintedDescription, buildSubitoDescription } from '../src/lib/clipboard'
import type { Item } from '../src/lib/types'

const clothingItem: Item = {
  id: '1',
  user_id: 'u1',
  category: 'vestiti',
  title: 'Giacca in pelle',
  brand: 'Zara',
  size: 'M',
  measure_chest: 52,
  measure_length: 70,
  measure_waist: null,
  measure_shoulders: 44,
  measure_sleeve: null,
  measure_width: null,
  measure_height: null,
  measure_depth: null,
  condition: 'Ottime condizioni',
  defects: null,
  price_min: 30,
  price_listed: 45,
  price_final: null,
  status: 'pubblicato',
  platforms: ['vinted'],
  link_vinted: null,
  link_subito: null,
  published_at: null,
  sold_at: null,
  notes: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

const techItem: Item = {
  ...clothingItem,
  id: '2',
  category: 'tech',
  title: 'iPhone 13',
  brand: 'Apple',
  size: null,
  measure_chest: null,
  measure_length: null,
  measure_shoulders: null,
  measure_width: 7.1,
  measure_height: 14.6,
  measure_depth: 0.8,
}

describe('buildVintedDescription', () => {
  it('includes brand and title in header', () => {
    const desc = buildVintedDescription(clothingItem)
    expect(desc).toContain('Zara — Giacca in pelle')
  })

  it('includes size', () => {
    const desc = buildVintedDescription(clothingItem)
    expect(desc).toContain('Taglia: M')
  })

  it('includes clothing measures inline', () => {
    const desc = buildVintedDescription(clothingItem)
    expect(desc).toContain('Petto 52 cm')
    expect(desc).toContain('Lunghezza 70 cm')
    expect(desc).toContain('Spalle 44 cm')
  })

  it('omits null measures', () => {
    const desc = buildVintedDescription(clothingItem)
    expect(desc).not.toContain('Vita')
    expect(desc).not.toContain('Manica')
  })

  it('shows dimension measures for tech', () => {
    const desc = buildVintedDescription(techItem)
    expect(desc).toContain('Larghezza 7.1 cm')
    expect(desc).toContain('Altezza 14.6 cm')
    expect(desc).toContain('Profondità 0.8 cm')
  })

  it('shows defects as nessuno when null', () => {
    const desc = buildVintedDescription(clothingItem)
    expect(desc).toContain('Difetti: nessuno')
  })

  it('shows actual defects', () => {
    const item = { ...clothingItem, defects: 'Piccolo graffio' }
    const desc = buildVintedDescription(item)
    expect(desc).toContain('Difetti: Piccolo graffio')
  })

  it('appends notes if present', () => {
    const item = { ...clothingItem, notes: 'Spedizione veloce' }
    const desc = buildVintedDescription(item)
    expect(desc).toContain('Spedizione veloce')
  })

  it('handles item without brand', () => {
    const item = { ...clothingItem, brand: null }
    const desc = buildVintedDescription(item)
    expect(desc.startsWith('Giacca in pelle')).toBe(true)
  })

  it('ends with ten hashtags', () => {
    const lastLine = buildVintedDescription(clothingItem).split('\n').at(-1)
    expect(lastLine?.split(' ')).toHaveLength(10)
    expect(lastLine).toContain('#zara #giacca #pelle #abbigliamento')
  })
})

describe('buildSubitoDescription', () => {
  it('uses bullet points for measures', () => {
    const desc = buildSubitoDescription(clothingItem)
    expect(desc).toContain('▸ Petto: 52 cm')
    expect(desc).toContain('▸ Lunghezza: 70 cm')
  })

  it('includes footer text', () => {
    const desc = buildSubitoDescription(clothingItem)
    expect(desc).toContain('Prezzo trattabile')
  })

  it('includes bullet for condition', () => {
    const desc = buildSubitoDescription(clothingItem)
    expect(desc).toContain('▸ Condizioni: Ottime condizioni')
  })

  it('has no hashtags', () => {
    const desc = buildSubitoDescription(clothingItem)
    expect(desc).not.toContain('#')
  })
})
