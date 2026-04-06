<template>
  <main class="max-w-4xl mx-auto px-4 py-8">
    <div v-if="loading" class="text-center py-20 text-gray-400">Loading route…</div>

    <div v-else-if="!route" class="text-center py-20">
      <p class="text-gray-500 mb-3">Route not found.</p>
      <RouterLink to="/routes" class="text-emerald-600 hover:underline">Back to routes</RouterLink>
    </div>

    <template v-else>
      <!-- Breadcrumb -->
      <RouterLink to="/routes" class="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-4">
        <ChevronLeft class="w-4 h-4" /> Routes
      </RouterLink>

      <div class="flex flex-col gap-6">
        <!-- Title row -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ route.name }}</h1>
            <p v-if="route.description" class="text-gray-500 mt-1">{{ route.description }}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <ShareButton :url="shareUrl" />
            <a
              :href="downloadUrl"
              download
              class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
            >
              <Download class="w-4 h-4" />
              Download GPX
            </a>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <p class="text-xl font-bold text-gray-900">{{ stat.value }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ stat.label }}</p>
          </div>
        </div>

        <!-- Map -->
        <RouteMap v-if="track" :track="track" height="420px" />
        <div v-else class="h-64 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
          Loading map…
        </div>

        <!-- Elevation chart -->
        <ElevationChart
          v-if="track && track.elevations.some((e) => e > 0)"
          :elevations="track.elevations"
          :distance-km="track.distanceKm"
        />

        <!-- Reviews -->
        <div>
          <div class="flex items-center gap-3 mb-4">
            <h2 class="text-lg font-bold text-gray-900">Reviews</h2>
            <div v-if="avgRating > 0" class="flex items-center gap-1">
              <StarRating :model-value="Math.round(avgRating)" readonly />
              <span class="text-sm text-gray-500">({{ reviewCount }})</span>
            </div>
          </div>
          <ReviewForm :route-id="route.id" class="mb-4" />
          <ReviewList :route-id="route.id" />
        </div>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ChevronLeft, Download } from 'lucide-vue-next'
import { useRoutesStore } from '@/stores/routes'
import { useReviewsStore } from '@/stores/reviews'
import { supabase, GPX_BUCKET } from '@/lib/supabase'
import { parseGpx } from '@/lib/gpx'
import type { Route as RouteType, GpxTrack } from '@/types'
import RouteMap from '@/components/RouteMap.vue'
import ElevationChart from '@/components/ElevationChart.vue'
import ReviewForm from '@/components/ReviewForm.vue'
import ReviewList from '@/components/ReviewList.vue'
import ShareButton from '@/components/ShareButton.vue'
import StarRating from '@/components/StarRating.vue'

const vueRoute = useRoute()
const routesStore = useRoutesStore()
const reviewsStore = useReviewsStore()

const route = ref<RouteType | null>(null)
const track = ref<GpxTrack | null>(null)
const loading = ref(true)

const shareUrl = computed(() => route.value ? routesStore.getShareUrl(route.value) : '')
const downloadUrl = computed(() => route.value ? routesStore.getDownloadUrl(route.value) : '')
const avgRating = computed(() => route.value ? reviewsStore.averageRating(route.value.id) : 0)
const reviewCount = computed(() => route.value ? (reviewsStore.reviewsByRoute[route.value.id]?.length ?? 0) : 0)

const stats = computed(() => {
  if (!route.value) return []
  return [
    { label: 'Distance', value: route.value.distance_km ? `${route.value.distance_km} km` : '—' },
    { label: 'Elevation gain', value: route.value.elevation_gain ? `${route.value.elevation_gain} m` : '—' },
    { label: 'Difficulty', value: route.value.difficulty ?? '—' },
    { label: 'Rating', value: avgRating.value > 0 ? `${avgRating.value.toFixed(1)} / 5` : '—' },
  ]
})

async function loadGpx(gpxPath: string) {
  const { data, error } = await supabase.storage.from(GPX_BUCKET).download(gpxPath)
  if (error || !data) return
  const text = await data.text()
  track.value = parseGpx(text)
}

onMounted(async () => {
  const id = vueRoute.params.id as string
  route.value = await routesStore.fetchRouteById(id)
  if (route.value) {
    await Promise.all([
      loadGpx(route.value.gpx_path),
      reviewsStore.fetchReviews(id),
    ])
  }
  loading.value = false
})
</script>
