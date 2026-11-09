import { describe, it, expect } from 'vitest'
import { getCompressionOptions } from '../src/lib/compression'

describe('compression config', () => {
  it('has max size of 0.4 MB', () => {
    const opts = getCompressionOptions()
    expect(opts.maxSizeMB).toBe(0.4)
  })

  it('has max dimension of 1200px', () => {
    const opts = getCompressionOptions()
    expect(opts.maxWidthOrHeight).toBe(1200)
  })

  it('uses JPEG format', () => {
    const opts = getCompressionOptions()
    expect(opts.fileType).toBe('image/jpeg')
  })

  it('uses web worker', () => {
    const opts = getCompressionOptions()
    expect(opts.useWebWorker).toBe(true)
  })

  it('has quality of 0.82', () => {
    const opts = getCompressionOptions()
    expect(opts.initialQuality).toBe(0.82)
  })

  it('returns a copy, not a reference', () => {
    const a = getCompressionOptions()
    const b = getCompressionOptions()
    a.maxSizeMB = 999
    expect(b.maxSizeMB).toBe(0.4)
  })
})
