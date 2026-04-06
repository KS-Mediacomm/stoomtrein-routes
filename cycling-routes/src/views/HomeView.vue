<template>
  <main>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-20 px-4">
      <div class="max-w-3xl mx-auto text-center">
        <h1 class="text-4xl font-bold tracking-tight mb-4">Your cycling routes, all in one place</h1>
        <p class="text-emerald-100 text-lg mb-8">
          Upload GPX tracks, view them on a map, share routes with your group, and discover new roads.
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <RouterLink
            to="/routes"
            class="px-6 py-3 rounded-xl bg-white text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors"
          >
            Browse routes
          </RouterLink>
          <RouterLink
            to="/map"
            class="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors border border-emerald-400"
          >
            View all on map
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="f in features"
        :key="f.title"
        class="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow"
      >
        <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
          <component :is="f.icon" class="w-5 h-5 text-emerald-600" />
        </div>
        <h3 class="font-semibold text-gray-800 mb-1">{{ f.title }}</h3>
        <p class="text-sm text-gray-500">{{ f.description }}</p>
      </div>
    </section>

    <!-- Recent routes -->
    <section class="max-w-5xl mx-auto px-4 pb-16">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900">Recent routes</h2>
        <RouterLink to="/routes" class="text-sm text-emerald-600 hover:underline">See all</RouterLink>
      </div>

      <div v-if="routesStore.loading" class="text-gray-400 text-sm">Loading…</div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <RouteCard
          v-for="route in recentRoutes"
          :key="route.id"
          :route="route"
        />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Upload, Map, Star, Share2 } from 'lucide-vue-next'
import { useRoutesStore } from '@/stores/routes'
import RouteCard from '@/components/RouteCard.vue'

const routesStore = useRoutesStore()
const recentRoutes = computed(() => routesStore.routes.slice(0, 6))

onMounted(() => {
  if (!routesStore.routes.length) routesStore.fetchRoutes()
})

const features = [
  { icon: Upload, title: 'Upload GPX', description: 'Drag and drop your .gpx files and they\'re stored securely.' },
  { icon: Map, title: 'Interactive map', description: 'Each route rendered on a live map with elevation data.' },
  { icon: Share2, title: 'Shareable links', description: 'Generate a link and share any route with your group.' },
  { icon: Star, title: 'Reviews', description: 'Rate and comment on routes so others know what to expect.' },
]
</script>
