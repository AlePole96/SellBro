import imageCompression from 'browser-image-compression'

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.4,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  fileType: 'image/jpeg' as const,
  initialQuality: 0.82,
}

export async function compressImage(file: File): Promise<File> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Il file supera i 10 MB')
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Il file non è un\'immagine')
  }

  const compressed = await imageCompression(file, COMPRESSION_OPTIONS)
  return compressed
}

export function getCompressionOptions() {
  return { ...COMPRESSION_OPTIONS }
}
