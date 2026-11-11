import type { AIAnalysisResult } from '../../lib/gemini'
import type { FlowFormData } from '../../pages/NewItemFlowPage'
import type { Category, Condition, Platform } from '../../lib/types'
import { CATEGORIES, CONDITIONS, PLATFORMS } from '../../lib/constants'
import { useState } from 'react'

interface Props {
  formData: FlowFormData
  aiResult: AIAnalysisResult
  previews: string[]
  onChange: (data: FlowFormData) => void
  onSubmit: (data: FlowFormData) => void
  onBack: () => void
}

function AIBadge() {
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
      AI
    </span>
  )
}

function FieldGroup({
  label,
  ai,
  missing,
  children,
}: {
  label: string
  ai?: boolean
  missing?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`rounded-xl border p-3 transition-all duration-200 ${
        missing
          ? 'border-warning/40 bg-warning/5'
          : ai
            ? 'border-primary/20 bg-primary/5'
            : 'border-edge bg-surface'
      }`}
    >
      <label className="mb-1.5 flex items-center text-xs font-medium text-muted">
        {label}
        {ai && <AIBadge />}
        {missing && (
          <span className="ml-2 text-[10px] text-warning">Da completare</span>
        )}
      </label>
      {children}
    </div>
  )
}

export function SmartFormStep({
  formData,
  aiResult,
  previews,
  onChange,
  onSubmit,
  onBack,
}: Props) {
  const [saving, setSaving] = useState(false)

  const update = (partial: Partial<FlowFormData>) =>
    onChange({ ...formData, ...partial })

  const isMissing = (field: string) => aiResult.missing_fields.includes(field)
  const isAiFilled = (field: string) => !isMissing(field)

  const handleSubmit = async () => {
    setSaving(true)
    await onSubmit(formData)
    setSaving(false)
  }

  return (
    <div className="space-y-4" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
      <div className="text-center">
        <h2 className="text-xl font-bold text-content">Controlla e completa</h2>
        <p className="mt-1 text-sm text-muted">
          Campi compilati dall'AI — modifica quello che vuoi
        </p>
      </div>

      {/* Photo previews */}
      <div className="flex justify-center gap-2">
        {previews.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Foto ${i + 1}`}
            className="h-20 w-20 rounded-lg object-cover ring-1 ring-edge"
          />
        ))}
      </div>

      {/* Confidence indicator */}
      <div className="flex items-center justify-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            aiResult.confidence === 'high'
              ? 'bg-success'
              : aiResult.confidence === 'medium'
                ? 'bg-warning'
                : 'bg-danger'
          }`}
        />
        <span className="text-xs text-muted">
          Confidenza AI:{' '}
          {aiResult.confidence === 'high'
            ? 'Alta'
            : aiResult.confidence === 'medium'
              ? 'Media'
              : 'Bassa'}
        </span>
      </div>

      {/* Form fields */}
      <div className="space-y-3">
        <FieldGroup label="Titolo" ai={isAiFilled('title')}>
          <input
            value={formData.title}
            onChange={(e) => update({ title: e.target.value })}
            className="w-full bg-transparent text-sm text-content outline-none placeholder:text-faint"
            placeholder="Titolo dell'articolo"
          />
        </FieldGroup>

        <FieldGroup label="Categoria" ai={isAiFilled('category')}>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => update({ category: cat.value as Category })}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                  formData.category === cat.value
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-raised text-muted hover:text-content'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup label="Descrizione" ai={isAiFilled('description')}>
          <textarea
            value={formData.description}
            onChange={(e) => update({ description: e.target.value })}
            rows={7}
            className="w-full resize-none bg-transparent text-sm text-content outline-none placeholder:text-faint"
            placeholder="Descrizione dell'articolo"
          />
        </FieldGroup>

        <div className="grid grid-cols-2 gap-3">
          <FieldGroup label="Marca" ai={isAiFilled('brand')} missing={isMissing('brand') && !formData.brand}>
            <input
              value={formData.brand}
              onChange={(e) => update({ brand: e.target.value })}
              className="w-full bg-transparent text-sm text-content outline-none placeholder:text-faint"
              placeholder="Es. Nike, Apple..."
            />
          </FieldGroup>

          <FieldGroup label="Taglia" ai={isAiFilled('size')} missing={isMissing('size') && !formData.size}>
            <input
              value={formData.size}
              onChange={(e) => update({ size: e.target.value })}
              className="w-full bg-transparent text-sm text-content outline-none placeholder:text-faint"
              placeholder="Es. M, 42..."
            />
          </FieldGroup>
        </div>

        <FieldGroup label="Condizioni" ai={isAiFilled('condition')}>
          <div className="flex flex-wrap gap-1.5">
            {CONDITIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => update({ condition: c.value as Condition })}
                className={`rounded-lg px-3 py-1.5 text-xs transition-all ${
                  formData.condition === c.value
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-raised text-muted hover:text-content'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup label="Difetti" ai={isAiFilled('defects')}>
          <input
            value={formData.defects}
            onChange={(e) => update({ defects: e.target.value })}
            className="w-full bg-transparent text-sm text-content outline-none placeholder:text-faint"
            placeholder="Nessuno"
          />
        </FieldGroup>

        {/* Price section */}
        <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="text-sm font-semibold text-content">Prezzo suggerito</span>
            <AIBadge />
          </div>
          <div className="mb-3 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-primary">
              {aiResult.suggested_price_min}€ — {aiResult.suggested_price_max}€
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted">Prezzo minimo</label>
              <div className="flex items-center rounded-lg bg-base px-3 py-2">
                <input
                  type="number"
                  value={formData.price_min ?? ''}
                  onChange={(e) =>
                    update({
                      price_min: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full bg-transparent text-sm text-content outline-none"
                  placeholder="Min"
                />
                <span className="text-sm text-faint">€</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Prezzo inserzione</label>
              <div className="flex items-center rounded-lg bg-base px-3 py-2">
                <input
                  type="number"
                  value={formData.price_listed ?? ''}
                  onChange={(e) =>
                    update({
                      price_listed: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full bg-transparent text-sm text-content outline-none"
                  placeholder="Listino"
                />
                <span className="text-sm text-faint">€</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platforms */}
        <FieldGroup label="Piattaforme">
          <div className="flex gap-2">
            {PLATFORMS.map((p) => {
              const active = formData.platforms.includes(p.value as Platform)
              return (
                <button
                  key={p.value}
                  onClick={() =>
                    update({
                      platforms: active
                        ? formData.platforms.filter((v) => v !== p.value)
                        : [...formData.platforms, p.value as Platform],
                    })
                  }
                  className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-raised text-muted hover:text-content'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </FieldGroup>

        <FieldGroup label="Note (opzionale)">
          <input
            value={formData.notes}
            onChange={(e) => update({ notes: e.target.value })}
            className="w-full bg-transparent text-sm text-content outline-none placeholder:text-faint"
            placeholder="Note personali..."
          />
        </FieldGroup>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl border border-edge py-3.5 text-sm font-medium text-muted transition-colors hover:bg-surface"
        >
          Indietro
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving || !formData.title}
          className="flex-[2] rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover disabled:opacity-50"
        >
          {saving ? 'Salvataggio...' : 'Salva articolo'}
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
