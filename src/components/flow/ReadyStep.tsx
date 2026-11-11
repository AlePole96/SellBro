import { useState } from 'react'
import type {
  FlowFormData,
  PhotoSaveStatus,
  PhotoshootState,
} from '../../pages/NewItemFlowPage'
import { copyToClipboard } from '../../lib/clipboard'
import { buildHashtags, formatHashtags } from '../../lib/hashtags'
import { PHOTOSHOOT_COUNT } from '../../lib/photoshoot'
import { toast } from '../ui'

interface Props {
  formData: FlowFormData
  itemId: string
  photoshoot: PhotoshootState
  photoSave: PhotoSaveStatus
  onRetryPhotoshoot: () => void
  onNewItem: () => void
  onViewItem: () => void
}

const VINTED_CLOSING =
  'Spedisco velocemente e con cura. Se hai domande o vuoi vedere altre foto scrivimi pure, rispondo volentieri! Dai un\'occhiata anche agli altri articoli del mio armadio: prendendone più di uno risparmi sulla spedizione.'

const SUBITO_CLOSING =
  'Ritiro a mano oppure spedizione, come preferisci. Il prezzo è leggermente trattabile per chi è davvero interessato. Scrivimi in chat per qualsiasi domanda o per altre foto, rispondo subito!'

function buildListingText(
  data: FlowFormData,
  bullet: string,
  closing: string,
  footer = '',
): string {
  const header = [data.brand, data.title].filter(Boolean).join(' — ')
  const details = [
    data.size && `Taglia: ${data.size}`,
    `Condizioni: ${data.condition}`,
    `Difetti: ${data.defects || 'nessuno da segnalare'}`,
  ]
    .filter(Boolean)
    .map((line) => `${bullet}${line}`)
    .join('\n')

  return [header, data.description.trim(), details, closing, footer]
    .filter(Boolean)
    .join('\n\n')
}

function buildVintedText(data: FlowFormData): string {
  const hashtags = buildHashtags({
    category: data.category,
    title: data.title,
    brand: data.brand,
    suggested: data.hashtags,
  })
  return buildListingText(data, '', VINTED_CLOSING, formatHashtags(hashtags))
}

function buildSubitoText(data: FlowFormData): string {
  return buildListingText(data, '▸ ', SUBITO_CLOSING)
}

const PHOTO_SAVE_LABELS: Record<PhotoSaveStatus, string | null> = {
  idle: null,
  saving: 'Salvo le foto nell\'articolo...',
  saved: 'Foto salvate nell\'articolo',
  error: 'Alcune foto non sono state salvate nell\'articolo',
}

function PhotoshootGallery({
  photoshoot,
  photoSave,
  onRetry,
}: {
  photoshoot: PhotoshootState
  photoSave: PhotoSaveStatus
  onRetry: () => void
}) {
  const saveLabel = PHOTO_SAVE_LABELS[photoSave]

  return (
    <div className="rounded-xl border border-edge bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-content">Foto da studio</span>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
          AI
        </span>
      </div>

      {photoshoot.status === 'loading' && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: PHOTOSHOOT_COUNT }, (_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-lg bg-raised"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-muted">
            Sto preparando {PHOTOSHOOT_COUNT} scatti su fondale da studio. La prima volta può volerci un minuto.
          </p>
        </>
      )}

      {photoshoot.status === 'done' && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {photoshoot.photos.map((photo, i) => (
              <a
                key={photo.url}
                href={photo.url}
                download={photo.file.name}
                aria-label={`Scarica foto da studio ${i + 1}`}
                className="group relative block aspect-square overflow-hidden rounded-lg ring-1 ring-edge"
              >
                <img
                  src={photo.url}
                  alt={`Foto da studio ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-base/75 py-1 text-center text-[11px] font-medium text-content">
                  Scarica
                </span>
              </a>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">
            L'oggetto è quello delle tue foto, cambia solo lo sfondo. Controlla che il contorno sia pulito e tieni nell'annuncio anche le foto reali.
          </p>
        </>
      )}

      {photoshoot.status === 'error' && (
        <div className="rounded-lg border border-warning/40 bg-warning/5 p-3">
          <p className="text-xs text-muted">
            {photoshoot.error ?? 'Generazione delle foto non riuscita'}
          </p>
          <button
            onClick={onRetry}
            className="mt-2 rounded-lg bg-raised px-3 py-1.5 text-xs font-medium text-content transition-colors hover:bg-primary/20"
          >
            Riprova
          </button>
        </div>
      )}

      {saveLabel && <p className="mt-2 text-[11px] text-faint">{saveLabel}</p>}
    </div>
  )
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

export function ReadyStep({
  formData,
  photoshoot,
  photoSave,
  onRetryPhotoshoot,
  onNewItem,
  onViewItem,
}: Props) {
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

      {photoshoot.status !== 'idle' && (
        <PhotoshootGallery
          photoshoot={photoshoot}
          photoSave={photoSave}
          onRetry={onRetryPhotoshoot}
        />
      )}

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
