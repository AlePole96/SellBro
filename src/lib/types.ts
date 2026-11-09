export type Category = 'vestiti' | 'tech' | 'giochi'

export type ItemStatus = 'bozza' | 'pronto' | 'pubblicato' | 'venduto'

export type Platform = 'vinted' | 'subito'

export type PhotoType = 'real' | 'generated'

export type Condition =
  | 'Nuovo con cartellino'
  | 'Come nuovo'
  | 'Ottime condizioni'
  | 'Buone condizioni'
  | 'Discrete condizioni'

export interface Item {
  id: string
  user_id: string
  category: Category
  title: string
  brand: string | null
  size: string | null

  measure_chest: number | null
  measure_length: number | null
  measure_waist: number | null
  measure_shoulders: number | null
  measure_sleeve: number | null
  measure_width: number | null
  measure_height: number | null
  measure_depth: number | null

  condition: Condition | string
  defects: string | null
  price_min: number | null
  price_listed: number | null
  price_final: number | null
  status: ItemStatus
  platforms: Platform[]
  link_vinted: string | null
  link_subito: string | null
  published_at: string | null
  sold_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Photo {
  id: string
  item_id: string
  user_id: string
  storage_path: string
  position: number
  photo_type: PhotoType
  created_at: string
}
