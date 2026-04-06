<template>
  <main class="max-w-5xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Routes</h1>
      <RouterLink
        to="/upload"
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
      >
        <Upload class="w-4 h-4" />
        Upload GPX
      </RouterLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-6">
      <select
        v-model="filterDifficulty"
        class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
      >
        <option value="">All difficulties</option>
        <option value="easy">Easy</option>
        <option value="moderate">Moderate</option>
        <option value="hard">Hard</option>
        <option value="expert">Expert</option>
      </select>

      <select
        v-model="sortBy"
        class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
      >
        <option value="date">Newest first</option>
        <option value="distance">Longest first</option>
        <option value="elevation">Most elevation</option>
      </select>
    </div>

    <div v-if="routesStore.loading" class="text-center py-20 text-gray-400">Loading routes…</div>

    <div v-else-if="!filtered.length" class="text-center py-20 text-gray-400">
      No routes found. <RouterLink to="/upload" class="text-emerald-600 hover:underline">Upload the first one!</RouterLink>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <RouteCard v-for="route in filtered" :key="route.id" :route="route" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Upload } from 'lucide-vue-next'
import { useRoutesStore } from '@/stores/routes'
import { useReviewsStore } from '@/stores/reviews'
import RouteCard from '@/components/RouteCard.vue'

const routesStore = useRoutesStore()
const reviewsStore = useReviewsStore()
const filterDifficulty = ref('')
const sortBy = ref('date')

const filtered = computed(() => {
  let list = [...routesStore.routes]
  if (filterDifficulty.value) {
    list = list.filter((r) => r.difficulty === filterDifficulty.value)
  }
  if (sortBy.value === 'distance') list.sort((a, b) => (b.distance_km ?? 0) - (a.distance_km ?? 0))
  else if (sortBy.value === 'elevation') list.sort((a, b) => (b.elevation_gain ?? 0) - (a.elevation_gain ?? 0))
  return list
})

onMounted(() => {
  routesStore.fetchRoutes()
})
</script>
