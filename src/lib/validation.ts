import type { Item, ItemStatus } from './types'

export interface ValidationError {
  field: string
  message: string
}

export function validateStatusTransition(
  item: Partial<Item>,
  targetStatus: ItemStatus,
  photoCount: number,
): ValidationError[] {
  const errors: ValidationError[] = []

  if (targetStatus === 'pronto' || targetStatus === 'pubblicato' || targetStatus === 'venduto') {
    if (!item.title?.trim()) {
      errors.push({ field: 'title', message: 'Il titolo è obbligatorio' })
    }
    if (!item.category) {
      errors.push({ field: 'category', message: 'La categoria è obbligatoria' })
    }
    if (!item.condition?.trim()) {
      errors.push({ field: 'condition', message: 'Le condizioni sono obbligatorie' })
    }
    if (photoCount === 0) {
      errors.push({ field: 'photos', message: 'Almeno una foto è richiesta' })
    }
  }

  if (targetStatus === 'pubblicato' || targetStatus === 'venduto') {
    if (item.price_listed == null || item.price_listed <= 0) {
      errors.push({ field: 'price_listed', message: 'Il prezzo pubblicato è obbligatorio' })
    }
    if (!item.platforms || item.platforms.length === 0) {
      errors.push({ field: 'platforms', message: 'Seleziona almeno una piattaforma' })
    }
  }

  if (targetStatus === 'venduto') {
    if (item.price_final == null || item.price_final <= 0) {
      errors.push({ field: 'price_final', message: 'Il prezzo finale è obbligatorio' })
    }
  }

  return errors
}

export function validateItem(item: Partial<Item>): ValidationError[] {
  const errors: ValidationError[] = []

  if (!item.title?.trim()) {
    errors.push({ field: 'title', message: 'Il titolo è obbligatorio' })
  }

  if (!item.category) {
    errors.push({ field: 'category', message: 'La categoria è obbligatoria' })
  }

  if (!item.condition?.trim()) {
    errors.push({ field: 'condition', message: 'Le condizioni sono obbligatorie' })
  }

  if (item.price_min != null && item.price_min < 0) {
    errors.push({ field: 'price_min', message: 'Il prezzo minimo non può essere negativo' })
  }

  if (item.price_listed != null && item.price_listed < 0) {
    errors.push({ field: 'price_listed', message: 'Il prezzo pubblicato non può essere negativo' })
  }

  if (item.price_final != null && item.price_final < 0) {
    errors.push({ field: 'price_final', message: 'Il prezzo finale non può essere negativo' })
  }

  if (
    item.price_min != null &&
    item.price_listed != null &&
    item.price_listed < item.price_min
  ) {
    errors.push({
      field: 'price_listed',
      message: 'Il prezzo pubblicato non può essere inferiore al minimo',
    })
  }

  return errors
}
