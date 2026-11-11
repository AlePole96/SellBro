const CANVAS_SIZE = 1200
const ALPHA_THRESHOLD = 16

interface Scene {
  /** Share of the canvas side the product may occupy */
  fill: number
  /** Vertical shift of the product, as a share of the canvas side */
  offsetY: number
  shadow: { color: string; blur: number; offsetY: number }
  paintBackdrop: (ctx: CanvasRenderingContext2D, size: number) => void
}

const SCENES: Scene[] = [
  {
    fill: 0.8,
    offsetY: 0,
    shadow: { color: 'rgba(0, 0, 0, 0.22)', blur: 45, offsetY: 22 },
    paintBackdrop(ctx, size) {
      const light = ctx.createRadialGradient(
        size / 2,
        size * 0.42,
        size * 0.1,
        size / 2,
        size / 2,
        size * 0.85,
      )
      light.addColorStop(0, '#ffffff')
      light.addColorStop(1, '#e6e7ea')
      ctx.fillStyle = light
      ctx.fillRect(0, 0, size, size)
    },
  },
  {
    fill: 0.7,
    offsetY: 0.02,
    shadow: { color: 'rgba(70, 48, 24, 0.38)', blur: 55, offsetY: 30 },
    paintBackdrop(ctx, size) {
      const sweep = ctx.createLinearGradient(0, 0, 0, size)
      sweep.addColorStop(0, '#eee6da')
      sweep.addColorStop(0.6, '#e0d5c4')
      sweep.addColorStop(0.74, '#cdbfa8')
      sweep.addColorStop(1, '#c0af95')
      ctx.fillStyle = sweep
      ctx.fillRect(0, 0, size, size)

      const windowLight = ctx.createRadialGradient(
        size * 0.2,
        size * 0.15,
        0,
        size * 0.2,
        size * 0.15,
        size * 0.9,
      )
      windowLight.addColorStop(0, 'rgba(255, 250, 240, 0.45)')
      windowLight.addColorStop(1, 'rgba(255, 250, 240, 0)')
      ctx.fillStyle = windowLight
      ctx.fillRect(0, 0, size, size)
    },
  },
  {
    fill: 0.72,
    offsetY: 0,
    shadow: { color: 'rgba(0, 0, 0, 0.6)', blur: 60, offsetY: 30 },
    paintBackdrop(ctx, size) {
      const spotlight = ctx.createRadialGradient(
        size / 2,
        size * 0.45,
        size * 0.05,
        size / 2,
        size / 2,
        size * 0.8,
      )
      spotlight.addColorStop(0, '#565a66')
      spotlight.addColorStop(1, '#15161b')
      ctx.fillStyle = spotlight
      ctx.fillRect(0, 0, size, size)
    },
  },
]

export const PHOTOSHOOT_COUNT = SCENES.length

interface Cutout {
  source: HTMLCanvasElement
  x: number
  y: number
  width: number
  height: number
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas non disponibile')
  return ctx
}

async function cutOutProduct(file: File): Promise<Cutout> {
  const { removeBackground } = await import('@imgly/background-removal')
  const bitmap = await createImageBitmap(await removeBackground(file))

  const source = document.createElement('canvas')
  source.width = bitmap.width
  source.height = bitmap.height
  const ctx = getContext(source)
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  const { data, width, height } = ctx.getImageData(
    0,
    0,
    source.width,
    source.height,
  )
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > ALPHA_THRESHOLD) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < 0) {
    throw new Error('Non riesco a isolare l\'oggetto dalla foto')
  }

  return {
    source,
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  }
}

async function composeScene(
  cutout: Cutout,
  scene: Scene,
  index: number,
): Promise<File> {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const ctx = getContext(canvas)

  scene.paintBackdrop(ctx, CANVAS_SIZE)

  const maxSide = CANVAS_SIZE * scene.fill
  const scale = Math.min(maxSide / cutout.width, maxSide / cutout.height)
  const width = cutout.width * scale
  const height = cutout.height * scale

  ctx.shadowColor = scene.shadow.color
  ctx.shadowBlur = scene.shadow.blur
  ctx.shadowOffsetY = scene.shadow.offsetY
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(
    cutout.source,
    cutout.x,
    cutout.y,
    cutout.width,
    cutout.height,
    (CANVAS_SIZE - width) / 2,
    (CANVAS_SIZE - height) / 2 + CANVAS_SIZE * scene.offsetY,
    width,
    height,
  )

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.92),
  )
  if (!blob) throw new Error('Creazione della foto non riuscita')

  return new File([blob], `foto-studio-${index + 1}.jpg`, {
    type: 'image/jpeg',
  })
}

export async function generatePhotoshootImages(files: File[]): Promise<File[]> {
  const cutouts: Cutout[] = []
  for (const file of files) {
    cutouts.push(await cutOutProduct(file))
  }

  return Promise.all(
    SCENES.map((scene, index) =>
      composeScene(cutouts[index % cutouts.length], scene, index),
    ),
  )
}
