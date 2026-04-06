import { defineStore } from 'pinia'
import { ref } from 'vue'
import { nanoid } from 'nanoid'
import { supabase, GPX_BUCKET, getGpxPublicUrl } from '@/lib/supabase'
import type { Route, Difficulty } from '@/types'

export const useRoutesStore = defineStore('routes', () => {
  const routes = ref<Route[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRoutes() {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('routes')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (err) { error.value = err.message }
    else { routes.value = data as Route[] }
    loading.value = false
  }

  async function fetchRouteById(id: string): Promise<Route | null> {
    const { data, error: err } = await supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .single()
    if (err) return null
    return data as Route
  }

  async function fetchRouteByToken(token: string): Promise<Route | null> {
    const { data, error: err } = await supabase
      .from('routes')
      .select('*')
      .eq('share_token', token)
      .single()
    if (err) return null
    return data as Route
  }

  async function uploadRoute(
    file: File,
    meta: {
      name: string
      description: string
      difficulty: Difficulty | null
      distanceKm: number
      elevationGain: number
      userId: string
    },
  ): Promise<Route> {
    const routeId = nanoid()
    const gpxPath = `${meta.userId}/${routeId}.gpx`

    const { error: uploadErr } = await supabase.storage
      .from(GPX_BUCKET)
      .upload(gpxPath, file, { contentType: 'application/gpx+xml', upsert: false })

    if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`)

    const shareToken = nanoid(10)

    const { data, error: insertErr } = await supabase
      .from('routes')
      .insert({
        id: routeId,
        user_id: meta.userId,
        name: meta.name,
        description: meta.description || null,
        distance_km: meta.distanceKm,
        elevation_gain: meta.elevationGain,
        difficulty: meta.difficulty,
        gpx_path: gpxPath,
        share_token: shareToken,
        is_public: true,
      })
      .select()
      .single()

    if (insertErr) {
      // Clean up orphaned file
      await supabase.storage.from(GPX_BUCKET).remove([gpxPath])
      throw new Error(`Database insert failed: ${insertErr.message}`)
    }

    return data as Route
  }

  async function deleteRoute(route: Route) {
    await supabase.storage.from(GPX_BUCKET).remove([route.gpx_path])
    await supabase.from('routes').delete().eq('id', route.id)
    routes.value = routes.value.filter((r) => r.id !== route.id)
  }

  function getDownloadUrl(route: Route): string {
    return getGpxPublicUrl(route.gpx_path)
  }

  function getShareUrl(route: Route): string {
    return `${window.location.origin}/share/${route.share_token}`
  }

  return {
    routes,
    loading,
    error,
    fetchRoutes,
    fetchRouteById,
    fetchRouteByToken,
    uploadRoute,
    deleteRoute,
    getDownloadUrl,
    getShareUrl,
  }
})
