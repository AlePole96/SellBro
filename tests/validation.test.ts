import { describe, it, expect } from 'vitest'
import { validateItem, validateStatusTransition } from '../src/lib/validation'
import type { Item } from '../src/lib/types'

const baseItem: Partial<Item> = {
  title: 'Test Item',
  category: 'vestiti',
  condition: 'Come nuovo',
  price_min: 10,
  price_listed: 20,
  price_final: 18,
  platforms: ['vinted'],
}

describe('validateItem', () => {
  it('returns no errors for a valid item', () => {
    expect(validateItem(baseItem)).toEqual([])
  })

  it('requires title', () => {
    const errors = validateItem({ ...baseItem, title: '' })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'title' }),
    )
  })

  it('requires title to be non-whitespace', () => {
    const errors = validateItem({ ...baseItem, title: '   ' })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'title' }),
    )
  })

  it('requires category', () => {
    const errors = validateItem({ ...baseItem, category: undefined })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'category' }),
    )
  })

  it('requires condition', () => {
    const errors = validateItem({ ...baseItem, condition: '' })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'condition' }),
    )
  })

  it('rejects negative price_min', () => {
    const errors = validateItem({ ...baseItem, price_min: -5 })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'price_min' }),
    )
  })

  it('rejects negative price_listed', () => {
    const errors = validateItem({ ...baseItem, price_listed: -1 })
    expect(errors.some((e) => e.field === 'price_listed')).toBe(true)
  })

  it('rejects negative price_final', () => {
    const errors = validateItem({ ...baseItem, price_final: -1 })
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'price_final' }),
    )
  })

  it('rejects price_listed below price_min', () => {
    const errors = validateItem({
      ...baseItem,
      price_min: 20,
      price_listed: 10,
    })
    expect(errors).toContainEqual(
      expect.objectContaining({
        field: 'price_listed',
        message: expect.stringContaining('inferiore'),
      }),
    )
  })

  it('allows null prices', () => {
    const errors = validateItem({
      ...baseItem,
      price_min: null,
      price_listed: null,
      price_final: null,
    })
    expect(errors).toEqual([])
  })
})

describe('validateStatusTransition', () => {
  it('allows bozza with minimal data', () => {
    const errors = validateStatusTransition({}, 'bozza', 0)
    expect(errors).toEqual([])
  })

  it('requires title, category, condition, photos for pronto', () => {
    const errors = validateStatusTransition({}, 'pronto', 0)
    expect(errors.length).toBeGreaterThanOrEqual(4)
    expect(errors.map((e) => e.field)).toEqual(
      expect.arrayContaining(['title', 'category', 'condition', 'photos']),
    )
  })

  it('allows pronto with valid data and photos', () => {
    const errors = validateStatusTransition(baseItem, 'pronto', 1)
    expect(errors).toEqual([])
  })

  it('requires price_listed and platforms for pubblicato', () => {
    const item = { ...baseItem, price_listed: null, platforms: [] }
    const errors = validateStatusTransition(item, 'pubblicato', 1)
    expect(errors.map((e) => e.field)).toEqual(
      expect.arrayContaining(['price_listed', 'platforms']),
    )
  })

  it('allows pubblicato with complete data', () => {
    const errors = validateStatusTransition(baseItem, 'pubblicato', 1)
    expect(errors).toEqual([])
  })

  it('requires price_final for venduto', () => {
    const item = { ...baseItem, price_final: null }
    const errors = validateStatusTransition(item, 'venduto', 1)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'price_final' }),
    )
  })

  it('allows venduto with complete data', () => {
    const errors = validateStatusTransition(baseItem, 'venduto', 1)
    expect(errors).toEqual([])
  })

  it('requires photos even for venduto', () => {
    const errors = validateStatusTransition(baseItem, 'venduto', 0)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'photos' }),
    )
  })
})
