import { usePhotos } from '../../hooks/usePhotos'
import { PhotoGrid } from './PhotoGrid'
import { PhotoUploader } from './PhotoUploader'
import { toast } from '../ui'
import type { PhotoType } from '../../lib/types'

interface PhotoSectionProps {
  itemId: string
  onCountChange?: (count: number) => void
}

export function PhotoSection({ itemId, onCountChange }: PhotoSectionProps) {
  const { photos, loading, uploading, uploadPhoto, deletePhoto, reorderPhotos } =
    usePhotos(itemId)

  if (onCountChange) {
    onCountChange(photos.length)
  }

  async function handleUpload(file: File, type: PhotoType) {
    const { error } = await uploadPhoto(file, type)
    if (error) {
      toast(error.message, 'error')
    }
  }

  async function handleDelete(id: string) {
    await deletePhoto(id)
    toast('Foto eliminata', 'success')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">
          Foto ({photos.length}/5)
        </h3>
        <PhotoUploader
          currentCount={photos.length}
          uploading={uploading}
          onUpload={handleUpload}
        />
      </div>
      <PhotoGrid
        photos={photos}
        onReorder={reorderPhotos}
        onDelete={handleDelete}
      />
    </div>
  )
}
