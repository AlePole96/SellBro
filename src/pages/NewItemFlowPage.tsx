import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeItemPhotos, type AIAnalysisResult } from '../lib/gemini'
import { compressImage } from '../lib/compression'
import { useItems } from '../hooks/useItems'
import { useAuth } from '../hooks/useAuth'
import { toast } from '../components/ui'
import { PhotoCaptureStep } from '../components/flow/PhotoCaptureStep'
import { AIAnalysisStep } from '../components/flow/AIAnalysisStep'
import { SmartFormStep } from '../components/flow/SmartFormStep'
import { ReadyStep } from '../components/flow/ReadyStep'
import type { Category, Condition, Platform } from '../lib/types'

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
  const [, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null)
  const [formData, setFormData] = useState<FlowFormData>(INITIAL_FORM)
  const [savedItemId, setSavedItemId] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  const handlePhotos = useCallback(async (selectedFiles: File[]) => {
    const compressed = await Promise.all(selectedFiles.map(compressImage))
    setFiles(compressed)

    const urls = compressed.map((f) => URL.createObjectURL(f))
    setPreviews(urls)

    setStep('analyzing')
    setAiError(null)

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
  }, [])

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
      } catch {
        toast('Errore nel salvataggio', 'error')
      }
    },
    [user, createItem],
  )

  const handleStartOver = useCallback(() => {
    previews.forEach(URL.revokeObjectURL)
    setStep('photos')
    setFiles([])
    setPreviews([])
    setAiResult(null)
    setFormData(INITIAL_FORM)
    setSavedItemId(null)
    setAiError(null)
  }, [previews])

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
          onNewItem={handleStartOver}
          onViewItem={() => navigate(`/items/${savedItemId}`)}
        />
      )}
    </div>
  )
}
