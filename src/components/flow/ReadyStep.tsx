import { useState } from 'react'
import type { FlowFormData } from '../../pages/NewItemFlowPage'
import { copyToClipboard } from '../../lib/clipboard'
import { toast } from '../ui'

interface Props {
  formData: FlowFormData
  itemId: string
  onNewItem: () => void
  onViewItem: () => void
}

function buildVintedText(data: FlowFormData): string {
  const lines: string[] = []
  const header = [data.brand, data.title].filter(Boolean).join(' — ')
  lines.push(header)
  if (data.size) lines.push(`Taglia: ${data.size}`)
  lines.push(`Condizioni: ${data.condition}`)
  lines.push(`Difetti: ${data.defects || 'nessuno'}`)
  if (data.description) {
    lines.push('')
    lines.push(data.description)
  }
  return lines.join('\n')
}

function buildSubitoText(data: FlowFormData): string {
  const lines: string[] = []
  const header = [data.brand, data.title].filter(Boolean).join(' — ')
  lines.push(header)
  lines.push('')
  if (data.size) lines.push(`▸ Taglia: ${data.size}`)
  lines.push(`▸ Condizioni: ${data.condition}`)
  lines.push(`▸ Difetti: ${data.defects || 'nessuno'}`)
  if (data.description) {
    lines.push('')
    lines.push(data.description)
  }
  lines.push('')
  lines.push('Prezzo trattabile. Spedizione o ritiro in zona.')
  return lines.join('\n')
}

function CopyCard({
  platform,
  text,
  color,
}: {
  platform: string
  text: string
  color: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      toast(`Copiato per ${platform}!`, 'success')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-xl border border-edge bg-surface overflow-hidden">
      <div className={`flex items-center justify-between px-4 py-2.5 ${color}`}>
        <span className="text-sm font-bold text-white">{platform}</span>
        <button
          onClick={handleCopy}
          className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
            copied
              ? 'bg-white/30 text-white'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {copied ? 'Copiato!' : 'Copia'}
        </button>
      </div>
      <pre className="whitespace-pre-wrap p-4 text-xs leading-relaxed text-muted">
        {text}
      </pre>
    </div>
  )
}

export function ReadyStep({ formData, onNewItem, onViewItem }: Props) {
  const vintedText = buildVintedText(formData)
  const subitoText = buildSubitoText(formData)

  return (
    <div className="space-y-5" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-success"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-content">Pronto per la vendita!</h2>
        <p className="mt-1 text-sm text-muted">
          Copia e incolla le descrizioni nelle piattaforme
        </p>
      </div>

      {/* Summary card */}
      <div className="rounded-xl border border-edge bg-surface p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-content">{formData.title}</p>
            <p className="text-xs text-muted">
              {formData.brand && `${formData.brand} · `}
              {formData.category} · {formData.condition}
            </p>
          </div>
          {formData.price_listed && (
            <span className="text-lg font-bold text-primary">
              {formData.price_listed}€
            </span>
          )}
        </div>
      </div>

      {/* Copy cards */}
      <CopyCard
        platform="Vinted"
        text={vintedText}
        color="bg-[#09B1BA]"
      />
      <CopyCard
        platform="Subito"
        text={subitoText}
        color="bg-[#FA5A3E]"
      />

      {/* Copy title */}
      <button
        onClick={async () => {
          const ok = await copyToClipboard(formData.title)
          if (ok) toast('Titolo copiato!', 'success')
        }}
        className="w-full rounded-xl border border-edge py-3 text-sm font-medium text-muted transition-colors hover:bg-surface"
      >
        Copia solo il titolo
      </button>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onNewItem}
          className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover"
        >
          Nuovo articolo
        </button>
        <button
          onClick={onViewItem}
          className="flex-1 rounded-xl border border-edge py-3.5 text-sm font-medium text-muted transition-colors hover:bg-surface"
        >
          Vedi dettaglio
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
