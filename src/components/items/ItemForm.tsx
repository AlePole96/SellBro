import { useState, type FormEvent } from 'react'
import { Button, Input, Select, Textarea } from '../ui'
import {
  CATEGORIES,
  CONDITIONS,
  STATUSES,
  PLATFORMS,
  CLOTHING_MEASURES,
  DIMENSION_MEASURES,
} from '../../lib/constants'
import { validateItem, validateStatusTransition } from '../../lib/validation'
import type { Item, Category, ItemStatus, Platform } from '../../lib/types'

type ItemFormData = Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>

interface ItemFormProps {
  initial?: Item
  photoCount: number
  onSubmit: (data: ItemFormData) => Promise<void>
  submitting: boolean
}

const EMPTY_FORM: ItemFormData = {
  category: 'vestiti',
  title: '',
  brand: null,
  size: null,
  measure_chest: null,
  measure_length: null,
  measure_waist: null,
  measure_shoulders: null,
  measure_sleeve: null,
  measure_width: null,
  measure_height: null,
  measure_depth: null,
  condition: '',
  defects: null,
  price_min: null,
  price_listed: null,
  price_final: null,
  status: 'bozza',
  platforms: [],
  link_vinted: null,
  link_subito: null,
  published_at: null,
  sold_at: null,
  notes: null,
}

function toFormData(item: Item): ItemFormData {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, user_id, created_at, updated_at, ...rest } = item
  return rest
}

export function ItemForm({
  initial,
  photoCount,
  onSubmit,
  submitting,
}: ItemFormProps) {
  const [form, setForm] = useState<ItemFormData>(
    initial ? toFormData(initial) : EMPTY_FORM,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set<K extends keyof ItemFormData>(key: K, value: ItemFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function setNumber(key: keyof ItemFormData, raw: string) {
    const val = raw === '' ? null : Number(raw)
    set(key, val as ItemFormData[typeof key])
  }

  function togglePlatform(p: Platform) {
    set(
      'platforms',
      form.platforms.includes(p)
        ? form.platforms.filter((x) => x !== p)
        : [...form.platforms, p],
    )
  }

  const measures =
    form.category === 'vestiti' ? CLOTHING_MEASURES : DIMENSION_MEASURES

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const itemErrors = validateItem(form)
    const statusErrors = validateStatusTransition(
      form,
      form.status,
      photoCount,
    )
    const allErrors = [...itemErrors, ...statusErrors]

    if (allErrors.length > 0) {
      const errorMap: Record<string, string> = {}
      for (const err of allErrors) {
        if (!errorMap[err.field]) {
          errorMap[err.field] = err.message
        }
      }
      setErrors(errorMap)
      return
    }

    const data = { ...form }
    if (data.status === 'pubblicato' && !data.published_at) {
      data.published_at = new Date().toISOString()
    }
    if (data.status === 'venduto' && !data.sold_at) {
      data.sold_at = new Date().toISOString()
    }

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">
          Generale
        </h3>

        <Input
          id="title"
          label="Titolo"
          required
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          error={errors.title}
          placeholder="es. Giacca in pelle nera"
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            id="category"
            label="Categoria"
            value={form.category}
            onChange={(e) => set('category', e.target.value as Category)}
            options={CATEGORIES}
            error={errors.category}
          />
          <Select
            id="condition"
            label="Condizioni"
            value={form.condition}
            onChange={(e) => set('condition', e.target.value)}
            options={CONDITIONS}
            placeholder="Seleziona..."
            error={errors.condition}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="brand"
            label="Marca"
            value={form.brand ?? ''}
            onChange={(e) => set('brand', e.target.value || null)}
            placeholder="es. Zara"
          />
          <Input
            id="size"
            label="Taglia"
            value={form.size ?? ''}
            onChange={(e) => set('size', e.target.value || null)}
            placeholder="es. M, 42"
          />
        </div>

        <Textarea
          id="defects"
          label="Difetti"
          value={form.defects ?? ''}
          onChange={(e) => set('defects', e.target.value || null)}
          placeholder="Descrivi eventuali difetti..."
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">
          Misure (cm)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {measures.map((m) => (
            <Input
              key={m.key}
              id={m.key}
              label={m.label}
              type="number"
              step="0.5"
              min="0"
              suffix="cm"
              value={form[m.key] ?? ''}
              onChange={(e) => setNumber(m.key, e.target.value)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">
          Prezzi
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <Input
            id="price_min"
            label="Minimo"
            type="number"
            step="0.01"
            min="0"
            suffix="€"
            value={form.price_min ?? ''}
            onChange={(e) => setNumber('price_min', e.target.value)}
            error={errors.price_min}
          />
          <Input
            id="price_listed"
            label="Pubblicato"
            type="number"
            step="0.01"
            min="0"
            suffix="€"
            value={form.price_listed ?? ''}
            onChange={(e) => setNumber('price_listed', e.target.value)}
            error={errors.price_listed}
          />
          <Input
            id="price_final"
            label="Finale"
            type="number"
            step="0.01"
            min="0"
            suffix="€"
            value={form.price_final ?? ''}
            onChange={(e) => setNumber('price_final', e.target.value)}
            error={errors.price_final}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">
          Pubblicazione
        </h3>

        <Select
          id="status"
          label="Stato"
          value={form.status}
          onChange={(e) => set('status', e.target.value as ItemStatus)}
          options={STATUSES}
          error={errors.status}
        />

        <div>
          <span className="mb-2 block text-sm text-muted">Piattaforme</span>
          <div className="flex gap-2">
            {PLATFORMS.map((p) => {
              const active = form.platforms.includes(p.value)
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePlatform(p.value)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-edge bg-surface text-muted hover:border-muted'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
          {errors.platforms && (
            <p className="mt-1 text-xs text-danger">{errors.platforms}</p>
          )}
        </div>

        <Input
          id="link_vinted"
          label="Link Vinted"
          type="url"
          value={form.link_vinted ?? ''}
          onChange={(e) => set('link_vinted', e.target.value || null)}
          placeholder="https://www.vinted.it/..."
        />
        <Input
          id="link_subito"
          label="Link Subito"
          type="url"
          value={form.link_subito ?? ''}
          onChange={(e) => set('link_subito', e.target.value || null)}
          placeholder="https://www.subito.it/..."
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">
          Note
        </h3>
        <Textarea
          id="notes"
          value={form.notes ?? ''}
          onChange={(e) => set('notes', e.target.value || null)}
          placeholder="Informazioni aggiuntive..."
        />
      </section>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full"
        size="lg"
      >
        {submitting
          ? 'Salvataggio...'
          : initial
            ? 'Salva modifiche'
            : 'Crea articolo'}
      </Button>
    </form>
  )
}
