import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { compressImage } from '../lib/compression'
import type { Photo, PhotoType } from '../lib/types'
import { MAX_PHOTOS } from '../lib/constants'

export interface PhotoWithUrl extends Photo {
  url: string
}

export function usePhotos(itemId: string | undefined) {
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const fetchPhotos = useCallback(async () => {
    if (!itemId) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('item_id', itemId)
      .order('position')

    if (error || !data) {
      setLoading(false)
      return
    }

    const withUrls = await Promise.all(
      (data as Photo[]).map(async (photo) => {
        const { data: signedData } = await supabase.storage
          .from('item-photos')
          .createSignedUrl(photo.storage_path, 3600)
        return { ...photo, url: signedData?.signedUrl ?? '' }
      }),
    )

    setPhotos(withUrls)
    setLoading(false)
  }, [itemId])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const uploadPhoto = useCallback(
    async (file: File, photoType: PhotoType = 'real') => {
      if (!itemId) return { error: new Error('No item ID') }
      if (photos.length >= MAX_PHOTOS)
        return { error: new Error(`Massimo ${MAX_PHOTOS} foto`) }

      setUploading(true)
      try {
        const compressed = await compressImage(file)

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return { error: new Error('Not authenticated') }

        const fileName = `${crypto.randomUUID()}.jpg`
        const storagePath = `${user.id}/${itemId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('item-photos')
          .upload(storagePath, compressed, {
            contentType: 'image/jpeg',
          })

        if (uploadError) return { error: uploadError }

        const { data: photoData, error: insertError } = await supabase
          .from('photos')
          .insert({
            item_id: itemId,
            user_id: user.id,
            storage_path: storagePath,
            position: photos.length,
            photo_type: photoType,
          })
          .select()
          .single()

        if (insertError) return { error: insertError }

        const { data: signedData } = await supabase.storage
          .from('item-photos')
          .createSignedUrl(storagePath, 3600)

        const newPhoto: PhotoWithUrl = {
          ...(photoData as Photo),
          url: signedData?.signedUrl ?? '',
        }

        setPhotos((prev) => [...prev, newPhoto])
        return { error: null }
      } finally {
        setUploading(false)
      }
    },
    [itemId, photos.length],
  )

  const deletePhoto = useCallback(
    async (photoId: string) => {
      const photo = photos.find((p) => p.id === photoId)
      if (!photo) return

      await supabase.storage.from('item-photos').remove([photo.storage_path])
      await supabase.from('photos').delete().eq('id', photoId)

      setPhotos((prev) => prev.filter((p) => p.id !== photoId))
    },
    [photos],
  )

  const reorderPhotos = useCallback(
    async (reordered: PhotoWithUrl[]) => {
      setPhotos(reordered)

      await Promise.all(
        reordered.map((photo, index) =>
          supabase
            .from('photos')
            .update({ position: index })
            .eq('id', photo.id),
        ),
      )
    },
    [],
  )

  return {
    photos,
    loading,
    uploading,
    uploadPhoto,
    deletePhoto,
    reorderPhotos,
  }
}
