import type { Category } from './types'

export const HASHTAG_COUNT = 10

const CATEGORY_HASHTAGS: Record<Category, string[]> = {
  vestiti: [
    'abbigliamento',
    'moda',
    'outfit',
    'stile',
    'usato',
    'secondhand',
    'preloved',
    'vintage',
    'armadio',
    'affare',
  ],
  tech: [
    'tecnologia',
    'elettronica',
    'tech',
    'gadget',
    'usato',
    'secondhand',
    'occasione',
    'affare',
    'informatica',
    'accessori',
  ],
  giochi: [
    'giochi',
    'giochidatavolo',
    'boardgame',
    'giocodisocieta',
    'divertimento',
    'famiglia',
    'usato',
    'secondhand',
    'regalo',
    'affare',
  ],
}

const TITLE_STOPWORDS = new Set([
  'con',
  'per',
  'del',
  'della',
  'dello',
  'dei',
  'degli',
  'delle',
  'dal',
  'dalla',
  'nel',
  'nella',
  'sul',
  'sulla',
  'una',
  'uno',
  'gli',
  'che',
  'come',
  'non',
  'piu',
  'tra',
  'fra',
  'the',
  'and',
  'with',
])

function normalizeHashtag(raw: string): string | null {
  const tag = raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

  if (tag.length < 2 || tag.length > 30 || /^\d+$/.test(tag)) return null
  return tag
}

function titleKeywords(title: string): string[] {
  return title.split(/\s+/).filter((word) => {
    const tag = normalizeHashtag(word)
    return tag !== null && tag.length >= 3 && !TITLE_STOPWORDS.has(tag)
  })
}

export interface HashtagSource {
  category: Category
  title: string
  brand?: string | null
  suggested?: string[]
}

export function buildHashtags(source: HashtagSource): string[] {
  const candidates = [
    ...(source.suggested ?? []),
    source.brand ?? '',
    ...titleKeywords(source.title),
    ...CATEGORY_HASHTAGS[source.category],
  ]

  const tags = new Set<string>()
  for (const candidate of candidates) {
    const tag = normalizeHashtag(candidate)
    if (tag) tags.add(tag)
  }

  return [...tags].slice(0, HASHTAG_COUNT)
}

export function formatHashtags(tags: string[]): string {
  return tags.map((tag) => `#${tag}`).join(' ')
}
