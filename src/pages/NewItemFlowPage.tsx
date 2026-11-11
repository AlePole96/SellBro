import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeItemPhotos, type AIAnalysisResult } from '../lib/gemini'
import { generatePhotoshootImages } from '../lib/photoshoot'
import { compressImage } from '../lib/compression'
import { useItems } from '../hooks/useItems'
import { uploadItemPhoto } from '../hooks/usePhotos'
import { useAuth } from '../hooks/useAuth'
import { toast } from '../components/ui'
import { PhotoCaptureStep } from '../components/flow/PhotoCaptureStep'
import { AIAnalysisStep } from '../components/flow/AIAnalysisStep'
import { SmartFormStep } from '../components/flow/SmartFormStep'
import { ReadyStep } from '../components/flow/ReadyStep'
import type { Category, Condition, PhotoType, Platform } from '../lib/types'

export interface PhotoshootState {
  status: 'idle' | 'loading' | 'done' | 'error'
  photos: { file: File; url: string }[]
  error: string | null
}

export type PhotoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const IDLE_PHOTOSHOOT: PhotoshootState = {
  status: 'idle',
  photos: [],
  error: null,
}

async function uploadPhotos(
  itemId: string,
  photos: File[],
  photoType: PhotoType,
  startPosition: number,
): Promise<boolean> {
  let allSaved = true
  for (const [i, file] of photos.entries()) {
    try {
      const { error } = await uploadItemPhoto(
        itemId,
        file,
        photoType,
        startPosition + i,
      )
      if (error) allSaved = false
    } catch {
      allSaved = false
    }
  }
  return allSaved
}

export interface FlowFormData {
  title: string
  category: Category
  description: string
  brand: string
  size: string
  condition: Condition | string
  defects: string
  price_min: number | null
  price_listed: number | null
  platforms: Platform[]
  notes: string
}

type Step = 'photos' | 'analyzing' | 'form' | 'ready'

const INITIAL_FORM: FlowFormData = {
  title: '',
  category: 'vestiti',
  description: '',
  brand: '',
  size: '',
  condition: 'Buone condizioni',
  defects: '',
  price_min: null,
  price_listed: null,
  platforms: [],
  notes: '',
}

export default function NewItemFlowPage() {
  const navigate = useNavigate()
  const { createItem } = useItems()
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('photos')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null)
  const [formData, setFormData] = useState<FlowFormData>(INITIAL_FORM)
  const [savedItemId, setSavedItemId] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [photoshoot, setPhotoshoot] = useState<PhotoshootState>(IDLE_PHOTOSHOOT)
  const [photoSave, setPhotoSave] = useState<PhotoSaveStatus>('idle')
  const photoshootRun = useRef<Promise<File[]> | null>(null)

  const startPhotoshoot = useCallback(
    (sourceFiles: File[]) => {
      setPhotoshoot({ status: 'loading', photos: [], error: null })

      const run: Promise<File[]> = generatePhotoshootImages(sourceFiles).then(
        (generated) => {
          if (photoshootRun.current === run) {
            setPhotoshoot({
              status: 'done',
              photos: generated.map((file) => ({
                file,
                url: URL.createObjectURL(file),
              })),
              error: null,
            })
          }
          return generated
        },
        (err: unknown) => {
          if (photoshootRun.current === run) {
            setPhotoshoot({
              status: 'error',
              photos: [],
              error: err instanceof Error ? err.message : 'Errore sconosciuto',
            })
          }
          return []
        },
      )

      photoshootRun.current = run
      return run
    },
    [],
  )

  const handlePhotos = useCallback(async (selectedFiles: File[]) => {
    const compressed = await Promise.all(selectedFiles.map(compressImage))
    setFiles(compressed)

    const urls = compressed.map((f) => URL.createObjectURL(f))
    setPreviews(urls)

    setStep('analyzing')
    setAiError(null)
    void startPhotoshoot(compressed)

    try {
      const result = await analyzeItemPhotos(compressed)
      setAiResult(result)
      setFormData({
        title: result.title,
        category: result.category,
        description: result.description_it,
        brand: result.brand ?? '',
        size: result.size ?? '',
        condition: result.condition,
        defects: result.defects ?? '',
        price_min: result.suggested_price_min,
        price_listed: result.suggested_price_max,
        platforms: [],
        notes: '',
      })
      setStep('form')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore sconosciuto'
      setAiError(msg)
      setStep('photos')
      toast(msg, 'error')
    }
  }, [startPhotoshoot])

  const savePhotos = useCallback(
    async (itemId: string) => {
      setPhotoSave('saving')
      const realSaved = await uploadPhotos(itemId, files, 'real', 0)
      const generated = (await photoshootRun.current) ?? []
      const generatedSaved = await uploadPhotos(
        itemId,
        generated,
        'generated',
        files.length,
      )
      setPhotoSave(realSaved && generatedSaved ? 'saved' : 'error')
    },
    [files],
  )

  const handleRetryPhotoshoot = useCallback(async () => {
    const generated = await startPhotoshoot(files)
    if (!savedItemId || generated.length === 0) return

    setPhotoSave('saving')
    const saved = await uploadPhotos(
      savedItemId,
      generated,
      'generated',
      files.length,
    )
    setPhotoSave(saved ? 'saved' : 'error')
  }, [startPhotoshoot, files, savedItemId])

  const handleFormSubmit = useCallback(
    async (data: FlowFormData) => {
      if (!user) return

      try {
        const result = await createItem({
          category: data.category,
          title: data.title,
          brand: data.brand || null,
          size: data.size || null,
          condition: data.condition,
          defects: data.defects || null,
          price_min: data.price_min,
          price_listed: data.price_listed,
          price_final: null,
          status: 'bozza',
          platforms: data.platforms,
          link_vinted: null,
          link_subito: null,
          published_at: null,
          sold_at: null,
          notes: data.notes || null,
          measure_chest: null,
          measure_length: null,
          measure_waist: null,
          measure_shoulders: null,
          measure_sleeve: null,
          measure_width: null,
          measure_height: null,
          measure_depth: null,
        })

        if (result.error || !result.data) {
          throw result.error ?? new Error('Nessun dato restituito')
        }

        setSavedItemId(result.data.id)
        setFormData(data)
        setStep('ready')
        toast('Articolo creato!', 'success')
        void savePhotos(result.data.id)
      } catch {
        toast('Errore nel salvataggio', 'error')
      }
    },
    [user, createItem, savePhotos],
  )

  const handleStartOver = useCallback(() => {
    previews.forEach(URL.revokeObjectURL)
    photoshoot.photos.forEach((photo) => URL.revokeObjectURL(photo.url))
    photoshootRun.current = null
    setStep('photos')
    setFiles([])
    setPreviews([])
    setAiResult(null)
    setFormData(INITIAL_FORM)
    setSavedItemId(null)
    setAiError(null)
    setPhotoshoot(IDLE_PHOTOSHOOT)
    setPhotoSave('idle')
  }, [previews, photoshoot.photos])

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 pt-2">
        {(['photos', 'analyzing', 'form', 'ready'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${
                step === s
                  ? 'scale-110 bg-primary text-base shadow-lg shadow-primary/30'
                  : i < ['photos', 'analyzing', 'form', 'ready'].indexOf(step)
                    ? 'bg-success/20 text-success'
                    : 'bg-surface text-faint'
              }`}
            >
              {i < ['photos', 'analyzing', 'form', 'ready'].indexOf(step) ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < 3 && (
              <div
                className={`h-0.5 w-6 rounded transition-colors duration-500 ${
                  i < ['photos', 'analyzing', 'form', 'ready'].indexOf(step)
                    ? 'bg-success/40'
                    : 'bg-edge'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Steps */}
      {step === 'photos' && (
        <PhotoCaptureStep
          onPhotos={handlePhotos}
          error={aiError}
          onManual={() => navigate('/items/new')}
        />
      )}

      {step === 'analyzing' && <AIAnalysisStep previews={previews} />}

      {step === 'form' && aiResult && (
        <SmartFormStep
          formData={formData}
          aiResult={aiResult}
          previews={previews}
          onChange={setFormData}
          onSubmit={handleFormSubmit}
          onBack={() => setStep('photos')}
        />
      )}

      {step === 'ready' && savedItemId && (
        <ReadyStep
          formData={formData}
          itemId={savedItemId}
          photoshoot={photoshoot}
          photoSave={photoSave}
          onRetryPhotoshoot={handleRetryPhotoshoot}
          onNewItem={handleStartOver}
          onViewItem={() => navigate(`/items/${savedItemId}`)}
        />
      )}
    </div>
  )
}
