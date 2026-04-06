export type Difficulty = 'easy' | 'moderate' | 'hard' | 'expert'

export interface Route {
  id: string
  created_at: string
  user_id: string | null
  name: string
  description: string | null
  distance_km: number | null
  elevation_gain: number | null
  difficulty: Difficulty | null
  gpx_path: string
  share_token: string
  is_public: boolean
}

export interface Review {
  id: string
  route_id: string
  user_id: string | null
  rating: number
  comment: string | null
  created_at: string
}

export interface GpxTrack {
  name: string
  coordinates: [number, number][] // [lng, lat]
  elevations: number[]
  distanceKm: number
  elevationGain: number
}
