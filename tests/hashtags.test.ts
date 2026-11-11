import { describe, it, expect } from 'vitest'
import {
  buildHashtags,
  formatHashtags,
  HASHTAG_COUNT,
} from '../src/lib/hashtags'

describe('buildHashtags', () => {
  it('always returns ten tags, even without suggestions', () => {
    const tags = buildHashtags({ category: 'vestiti', title: 'Giacca' })
    expect(tags).toHaveLength(HASHTAG_COUNT)
  })

  it('puts suggested tags first, then brand and title keywords', () => {
    const tags = buildHashtags({
      category: 'vestiti',
      title: 'Giacca in pelle',
      brand: 'Zara',
      suggested: ['biker', 'autunno'],
    })
    expect(tags.slice(0, 5)).toEqual([
      'biker',
      'autunno',
      'zara',
      'giacca',
      'pelle',
    ])
  })

  it('normalizes symbols, case, accents and spaces', () => {
    const tags = buildHashtags({
      category: 'giochi',
      title: 'Gioco',
      suggested: ['#Gioco di Società', 'T-Shirt'],
    })
    expect(tags.slice(0, 2)).toEqual(['giocodisocieta', 'tshirt'])
  })

  it('removes duplicates', () => {
    const tags = buildHashtags({
      category: 'tech',
      title: 'Cuffie Sony',
      brand: 'Sony',
      suggested: ['sony', '#SONY', 'cuffie'],
    })
    expect(tags.filter((tag) => tag === 'sony')).toHaveLength(1)
    expect(tags.filter((tag) => tag === 'cuffie')).toHaveLength(1)
  })

  it('skips numbers, short words and stopwords from the title', () => {
    const tags = buildHashtags({
      category: 'tech',
      title: 'iPhone 13 con cover',
      brand: 'Apple',
    })
    expect(tags.slice(0, 3)).toEqual(['apple', 'iphone', 'cover'])
  })

  it('caps the list at ten tags', () => {
    const suggested = Array.from({ length: 15 }, (_, i) => `tag${i}x`)
    const tags = buildHashtags({ category: 'tech', title: 'Mouse', suggested })
    expect(tags).toEqual(suggested.slice(0, HASHTAG_COUNT))
  })
})

describe('formatHashtags', () => {
  it('prefixes each tag and joins with spaces', () => {
    expect(formatHashtags(['nike', 'tshirt'])).toBe('#nike #tshirt')
  })
})
