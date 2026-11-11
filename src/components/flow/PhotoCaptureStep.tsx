import { useState, useRef, useCallback } from 'react'

interface Props {
  onPhotos: (files: File[]) => void
  error: string | null
  onManual: () => void
}

export function PhotoCaptureStep({ onPhotos, error, onManual }: Props) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedPreviews, setSelectedPreviews] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const images = Array.from(files)
        .filter((f) => f.type.startsWith('image/'))
        .slice(0, 2)
      if (images.length === 0) return

      setSelectedFiles(images)
      setSelectedPreviews(images.map((f) => URL.createObjectURL(f)))
    },
    [],
  )

  const handleSubmit = useCallback(() => {
    if (selectedFiles.length > 0) {
      onPhotos(selectedFiles)
    }
  }, [selectedFiles, onPhotos])

  const handleRemove = useCallback(
    (idx: number) => {
      URL.revokeObjectURL(selectedPreviews[idx])
      setSelectedFiles((f) => f.filter((_, i) => i !== idx))
      setSelectedPreviews((p) => p.filter((_, i) => i !== idx))
    },
    [selectedPreviews],
  )

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-content">
          Cosa vuoi vendere?
        </h2>
        <p className="mt-1 text-sm text-muted">
          Scatta o carica 1-2 foto e l'AI farà il resto
        </p>
      </div>

      {error && (
        <div className="w-full rounded-xl border border-danger/30 bg-danger/10 p-4 text-center text-sm text-danger">
          {error}
          <p className="mt-1 text-xs text-muted">Riprova o usa l'inserimento manuale</p>
        </div>
      )}

      {selectedPreviews.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFiles(e.dataTransfer.files)
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex w-full cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all duration-300 ${
            dragOver
              ? 'scale-[1.02] border-primary bg-primary/10 shadow-lg shadow-primary/10'
              : 'border-edge hover:border-primary/50 hover:bg-surface/50'
          }`}
        >
          <div className={`rounded-2xl bg-primary/10 p-6 transition-transform duration-300 ${dragOver ? 'scale-110' : ''}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-semibold text-content">
              Tocca per scattare o caricare
            </p>
            <p className="mt-1 text-xs text-faint">
              Massimo 2 foto · JPG, PNG
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="flex gap-3 justify-center">
            {selectedPreviews.map((src, i) => (
              <div key={i} className="group relative">
                <img
                  src={src}
                  alt={`Foto ${i + 1}`}
                  className="h-40 w-40 rounded-xl object-cover shadow-lg ring-2 ring-edge"
                />
                <button
                  onClick={() => handleRemove(i)}
                  className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-danger text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
            {selectedPreviews.length < 2 && (
              <button
                onClick={() => inputRef.current?.click()}
                className="flex h-40 w-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-edge text-faint transition-colors hover:border-primary/50 hover:text-primary"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="mt-1 text-xs">Aggiungi</span>
              </button>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full rounded-xl bg-primary py-4 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
          >
            Analizza con AI
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <button
        onClick={onManual}
        className="text-sm text-faint transition-colors hover:text-muted"
      >
        oppure inserisci manualmente
      </button>
    </div>
  )
}
