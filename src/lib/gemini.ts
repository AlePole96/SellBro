import type { Category, Condition } from './types'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent'
const TIMEOUT_MS = 30_000

export interface AIAnalysisResult {
  title: string
  category: Category
  description_it: string
  brand: string | null
  condition: Condition
  size: string | null
  defects: string | null
  suggested_price_min: number
  suggested_price_max: number
  confidence: 'high' | 'medium' | 'low'
  missing_fields: string[]
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 2,
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (response.status === 503 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 2000 + Math.random() * 1000
        await new Promise((r) => setTimeout(r, delay))
        continue
      }

      return response
    } catch (err) {
      clearTimeout(timeout)
      if (err instanceof DOMException && err.name === 'AbortError') {
        if (attempt < maxRetries) continue
        throw new Error('Gemini API: timeout dopo 30 secondi', { cause: err })
      }
      throw err
    }
  }

  throw new Error('Gemini API non disponibile dopo i tentativi')
}

export async function analyzeItemPhotos(
  files: File[],
): Promise<AIAnalysisResult> {
  if (!GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY non configurata')
  }

  const imageParts = await Promise.all(
    files.map(async (file) => ({
      inline_data: {
        mime_type: file.type || 'image/jpeg',
        data: await fileToBase64(file),
      },
    })),
  )

  const prompt = `Sei un esperto di rivendita di articoli usati in Italia su Vinted e Subito.
Analizza le foto e rispondi SOLO con un JSON valido (nessun testo extra, nessun markdown).

Schema JSON richiesto:
{
  "title": "titolo in italiano per l'annuncio, breve e accattivante",
  "category": "vestiti" | "tech" | "giochi",
  "description_it": "testo dell'annuncio in italiano, vedi regole sotto",
  "brand": "marca se visibile, altrimenti null",
  "condition": "Nuovo con cartellino" | "Come nuovo" | "Ottime condizioni" | "Buone condizioni" | "Discrete condizioni",
  "size": "taglia/misura se visibile (es. M, L, 42), altrimenti null",
  "defects": "difetti visibili, altrimenti null",
  "suggested_price_min": numero in EUR, prezzo minimo consigliato per l'usato,
  "suggested_price_max": numero in EUR, prezzo massimo consigliato,
  "confidence": "high" | "medium" | "low",
  "missing_fields": ["lista di campi che non puoi determinare dalla foto, es. 'brand', 'size'"]
}

Regole per "description_it":
- 4-6 frasi (circa 70-110 parole), in prima persona, con il tono caldo e spontaneo di un privato che vende un oggetto a cui tiene, non di un negozio.
- Racconta cosa rende bello o utile l'articolo, per chi è perfetto e in quali occasioni usarlo: aiuta chi legge a immaginarsi mentre lo usa o lo indossa.
- Descrivi solo ciò che si vede nelle foto: non inventare materiali, caratteristiche tecniche, accessori inclusi o storia d'uso.
- Non citare taglia, condizioni, difetti, prezzo o spedizione: vengono aggiunti a parte.
- Niente saluti iniziali, niente invito finale a scrivere, niente emoji, niente elenchi puntati, niente slogan pubblicitari.

Basa il prezzo sulla categoria, marca, condizioni e mercato italiano dell'usato.`

  const response = await fetchWithRetry(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, ...imageParts] }],
      generationConfig: {
        temperature: 0.5,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Errore Gemini API: ${response.status} — ${err}`)
  }

  const data = (await response.json()) as GeminiResponse
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('Nessuna risposta da Gemini')
  }

  return JSON.parse(text) as AIAnalysisResult
}
