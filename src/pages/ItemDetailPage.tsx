import { useParams, useNavigate, Link } from 'react-router-dom'
import { useItem, useItems } from '../hooks/useItems'
import { Badge, Button, toast } from '../components/ui'
import { PhotoSection } from '../components/photos/PhotoSection'
import { buildVintedDescription, buildSubitoDescription, copyToClipboard } from '../lib/clipboard'
import {
  CLOTHING_MEASURES,
  DIMENSION_MEASURES,
} from '../lib/constants'
import type { Item } from '../lib/types'

function MeasureRow({ item }: { item: Item }) {
  const measures =
    item.category === 'vestiti' ? CLOTHING_MEASURES : DIMENSION_MEASURES

  const filled = measures.filter((m) => item[m.key] != null)
  if (filled.length === 0) return null

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {filled.map((m) => (
        <span key={m.key} className="text-muted">
          {m.label}:{' '}
          <span className="text-content">{item[m.key]} cm</span>
        </span>
      ))}
    </div>
  )
}

function PriceRow({ item }: { item: Item }) {
  const prices = [
    { label: 'Min', value: item.price_min },
    { label: 'Pubblicato', value: item.price_listed },
    { label: 'Finale', value: item.price_final },
  ].filter((p) => p.value != null)

  if (prices.length === 0) return null

  return (
    <div className="flex gap-4">
      {prices.map((p) => (
        <div key={p.label} className="text-center">
          <p className="text-xs text-faint">{p.label}</p>
          <p className="text-lg font-semibold">{p.value}€</p>
        </div>
      ))}
    </div>
  )
}

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { item, loading } = useItem(id)
  const { deleteItem } = useItems()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="py-20 text-center text-muted">
        Articolo non trovato
      </div>
    )
  }

  async function handleDelete() {
    if (!confirm('Eliminare questo articolo?')) return
    const { error } = await deleteItem(item!.id)
    if (error) {
      toast('Errore nell\'eliminazione', 'error')
      return
    }
    toast('Articolo eliminato', 'success')
    navigate('/')
  }

  async function handleCopyTitle() {
    const ok = await copyToClipboard(item!.title)
    toast(ok ? 'Titolo copiato' : 'Errore nella copia', ok ? 'success' : 'error')
  }

  async function handleCopyVinted() {
    const ok = await copyToClipboard(buildVintedDescription(item!))
    toast(ok ? 'Descrizione Vinted copiata' : 'Errore nella copia', ok ? 'success' : 'error')
  }

  async function handleCopySubito() {
    const ok = await copyToClipboard(buildSubitoDescription(item!))
    toast(ok ? 'Descrizione Subito copiata' : 'Errore nella copia', ok ? 'success' : 'error')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{item.title}</h1>
          {item.brand && (
            <p className="text-sm text-muted">{item.brand}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Badge variant="category" category={item.category}>
            {item.category}
          </Badge>
          <Badge variant="status" status={item.status}>
            {item.status}
          </Badge>
        </div>
      </div>

      <PhotoSection itemId={item.id} />

      <PriceRow item={item} />
      <MeasureRow item={item} />

      {item.size && (
        <p className="text-sm text-muted">
          Taglia: <span className="text-content">{item.size}</span>
        </p>
      )}

      <p className="text-sm text-muted">
        Condizioni: <span className="text-content">{item.condition}</span>
      </p>

      {item.defects && (
        <p className="text-sm text-muted">
          Difetti: <span className="text-content">{item.defects}</span>
        </p>
      )}

      {item.notes && (
        <div className="rounded-lg bg-surface p-3">
          <p className="text-xs text-faint mb-1">Note</p>
          <p className="text-sm whitespace-pre-wrap">{item.notes}</p>
        </div>
      )}

      {(item.link_vinted || item.link_subito) && (
        <div className="space-y-2">
          <p className="text-xs text-faint">Link annunci</p>
          {item.link_vinted && (
            <a
              href={item.link_vinted}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm text-primary hover:underline"
            >
              Vinted
            </a>
          )}
          {item.link_subito && (
            <a
              href={item.link_subito}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm text-primary hover:underline"
            >
              Subito
            </a>
          )}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs text-faint">Copia per piattaforma</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={handleCopyTitle}>
            Copia titolo
          </Button>
          <Button variant="secondary" size="sm" onClick={handleCopyVinted}>
            Desc. Vinted
          </Button>
          <Button variant="secondary" size="sm" onClick={handleCopySubito}>
            Desc. Subito
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-t border-edge pt-4">
        <Link to={`/items/${item.id}/edit`} className="flex-1">
          <Button variant="secondary" className="w-full">
            Modifica
          </Button>
        </Link>
        <Button variant="danger" onClick={handleDelete}>
          Elimina
        </Button>
      </div>
    </div>
  )
}
