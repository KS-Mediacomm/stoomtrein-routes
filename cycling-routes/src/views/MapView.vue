<template>
  <main class="max-w-6xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">All routes on map</h1>
      <span class="text-sm text-gray-500">{{ tracks.length }} route{{ tracks.length !== 1 ? 's' : '' }} loaded</span>
    </div>

    <div v-if="loading" class="h-96 flex items-center justify-center text-gray-400">
      Loading routes and GPX files…
    </div>

    <AllRoutesMap v-else :tracks="tracks" height="600px" />

    <!-- Legend -->
    <div v-if="tracks.length" class="mt-4 flex flex-wrap gap-3">
      <div
        v-for="(item, idx) in tracks"
        :key="item.route.id"
        class="flex items-center gap-2 text-sm text-gray-600"
      >
        <span
          class="inline-block w-4 h-1.5 rounded-full"
          :style="{ backgroundColor: trackColor(idx) }"
        />
        <RouterLink :to="`/routes/${item.route.id}`" class="hover:text-emerald-600 hover:underline">
          {{ item.route.name }}
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useRoutesStore } from '@/stores/routes'
import { supabase, GPX_BUCKET } from '@/lib/supabase'
import { parseGpx } from '@/lib/gpx'
import { trackColor } from '@/lib/utils'
import AllRoutesMap from '@/components/AllRoutesMap.vue'
import type { Route, GpxTrack } from '@/types'

const routesStore = useRoutesStore()
const loading = ref(true)
const tracks = ref<{ route: Route; track: GpxTrack }[]>([])

onMounted(async () => {
  await routesStore.fetchRoutes()

  const results = await Promise.allSettled(
    routesStore.routes.map(async (route) => {
      const { data, error } = await supabase.storage.from(GPX_BUCKET).download(route.gpx_path)
      if (error || !data) return null
      const text = await data.text()
      const track = parseGpx(text)
      return { route, track }
    }),
  )

  tracks.value = results
    .filter((r): r is PromiseFulfilledResult<{ route: Route; track: GpxTrack }> =>
      r.status === 'fulfilled' && r.value !== null,
    )
    .map((r) => r.value)

  loading.value = false
})
</script>
