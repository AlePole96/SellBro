import { useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ItemForm } from '../components/items/ItemForm'
import { PhotoSection } from '../components/photos/PhotoSection'
import { useItem, useItems } from '../hooks/useItems'
import { toast } from '../components/ui'

export default function ItemFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { item, loading } = useItem(id)
  const { createItem, updateItem } = useItems()
  const [submitting, setSubmitting] = useState(false)
  const [photoCount, setPhotoCount] = useState(0)

  const handlePhotoCount = useCallback((count: number) => {
    setPhotoCount(count)
  }, [])

  if (id && loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (id && !item) {
    return (
      <div className="py-20 text-center text-muted">
        Articolo non trovato
      </div>
    )
  }

  async function handleSubmit(data: Parameters<typeof createItem>[0]) {
    setSubmitting(true)
    try {
      if (id) {
        const { error } = await updateItem(id, data)
        if (error) {
          toast('Errore nel salvataggio', 'error')
          return
        }
        toast('Articolo aggiornato', 'success')
        navigate(`/items/${id}`)
      } else {
        const { data: created, error } = await createItem(data)
        if (error || !created) {
          toast('Errore nella creazione', 'error')
          return
        }
        toast('Articolo creato', 'success')
        navigate(`/items/${created.id}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">
        {id ? 'Modifica articolo' : 'Nuovo articolo'}
      </h1>

      {id && (
        <PhotoSection itemId={id} onCountChange={handlePhotoCount} />
      )}

      <ItemForm
        initial={item ?? undefined}
        photoCount={photoCount}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  )
}
