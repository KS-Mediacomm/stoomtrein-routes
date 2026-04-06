<template>
  <main class="max-w-4xl mx-auto px-4 py-8">
    <div v-if="loading" class="text-center py-20 text-gray-400">Loading shared route…</div>

    <div v-else-if="!route" class="text-center py-20">
      <p class="text-gray-500 mb-2">This share link is invalid or the route has been removed.</p>
      <RouterLink to="/routes" class="text-emerald-600 hover:underline">Browse all routes</RouterLink>
    </div>

    <template v-else>
      <div class="flex items-center gap-2 mb-6">
        <span class="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
          Shared route
        </span>
      </div>

      <div class="flex flex-col gap-6">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ route.name }}</h1>
            <p v-if="route.description" class="text-gray-500 mt-1">{{ route.description }}</p>
          </div>
          <a
            :href="downloadUrl"
            download
            class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:border-emerald-400 hover:text-emerald-700 transition-colors shrink-0"
          >
            <Download class="w-4 h-4" />
            Download GPX
          </a>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <p class="text-xl font-bold text-gray-900">{{ stat.value }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ stat.label }}</p>
          </div>
        </div>

        <!-- Map -->
        <RouteMap v-if="track" :track="track" height="420px" />

        <!-- Elevation -->
        <ElevationChart
          v-if="track && track.elevations.some((e) => e > 0)"
          :elevations="track.elevations"
          :distance-km="track.distanceKm"
        />

        <div class="text-center">
          <RouterLink to="/routes" class="text-sm text-emerald-600 hover:underline">
            Explore more routes →
          </RouterLink>
        </div>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { Download } from 'lucide-vue-next'
import { useRoutesStore } from '@/stores/routes'
import { supabase, GPX_BUCKET } from '@/lib/supabase'
import { parseGpx } from '@/lib/gpx'
import RouteMap from '@/components/RouteMap.vue'
import ElevationChart from '@/components/ElevationChart.vue'
import type { Route as RouteType, GpxTrack } from '@/types'

const vueRoute = useRoute()
const routesStore = useRoutesStore()

const route = ref<RouteType | null>(null)
const track = ref<GpxTrack | null>(null)
const loading = ref(true)

const downloadUrl = computed(() => route.value ? routesStore.getDownloadUrl(route.value) : '')

const stats = computed(() => {
  if (!route.value) return []
  return [
    { label: 'Distance', value: route.value.distance_km ? `${route.value.distance_km} km` : '—' },
    { label: 'Elevation gain', value: route.value.elevation_gain ? `${route.value.elevation_gain} m` : '—' },
    { label: 'Difficulty', value: route.value.difficulty ?? '—' },
  ]
})

onMounted(async () => {
  const token = vueRoute.params.token as string
  route.value = await routesStore.fetchRouteByToken(token)
  if (route.value) {
    const { data, error } = await supabase.storage.from(GPX_BUCKET).download(route.value.gpx_path)
    if (!error && data) {
      const text = await data.text()
      track.value = parseGpx(text)
    }
  }
  loading.value = false
})
</script>
