import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Item } from '../lib/types'

type ItemInsert = Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export function useItems() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('updated_at', { ascending: false })

    if (!error && data) {
      setItems(data as Item[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const createItem = useCallback(async (item: ItemInsert) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: new Error('Not authenticated') }

    const { data, error } = await supabase
      .from('items')
      .insert({ ...item, user_id: user.id })
      .select()
      .single()

    if (!error && data) {
      setItems((prev) => [data as Item, ...prev])
    }
    return { data: data as Item | null, error }
  }, [])

  const updateItem = useCallback(
    async (id: string, updates: Partial<ItemInsert>) => {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (!error && data) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? (data as Item) : item)),
        )
      }
      return { data: data as Item | null, error }
    },
    [],
  )

  const deleteItem = useCallback(async (id: string) => {
    const { error } = await supabase.from('items').delete().eq('id', id)

    if (!error) {
      setItems((prev) => prev.filter((item) => item.id !== id))
    }
    return { error }
  }, [])

  return { items, loading, fetchItems, createItem, updateItem, deleteItem }
}

export function useItem(id: string | undefined) {
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    async function fetch() {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        setItem(data as Item)
      }
      setLoading(false)
    }

    fetch()
  }, [id])

  return { item, setItem, loading }
}
