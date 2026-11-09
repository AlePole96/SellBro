import { useRef } from 'react'
import { Button } from '../ui'
import type { PhotoType } from '../../lib/types'
import { MAX_PHOTOS } from '../../lib/constants'

interface PhotoUploaderProps {
  currentCount: number
  uploading: boolean
  onUpload: (file: File, type: PhotoType) => Promise<void>
}

export function PhotoUploader({
  currentCount,
  uploading,
  onUpload,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const remaining = MAX_PHOTOS - currentCount

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    for (const file of files.slice(0, remaining)) {
      await onUpload(file, 'real')
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  if (remaining <= 0) return null

  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleChange}
        className="hidden"
      />
      <Button
        variant="secondary"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'Caricamento...' : `Aggiungi foto (${remaining})`}
      </Button>
    </div>
  )
}
