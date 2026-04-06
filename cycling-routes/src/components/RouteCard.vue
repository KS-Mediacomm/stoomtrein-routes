<template>
  <div
    class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
    @click="$router.push(`/routes/${route.id}`)"
  >
    <!-- Header strip by difficulty -->
    <div :class="['h-1.5', difficultyBg]" />

    <div class="p-4">
      <div class="flex items-start justify-between gap-2 mb-2">
        <h3 class="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
          {{ route.name }}
        </h3>
        <span
          v-if="route.difficulty"
          :class="['text-xs px-2 py-0.5 rounded-full border font-medium shrink-0', difficultyColor(route.difficulty)]"
        >
          {{ route.difficulty }}
        </span>
      </div>

      <p v-if="route.description" class="text-sm text-gray-500 line-clamp-2 mb-3">
        {{ route.description }}
      </p>

      <div class="flex items-center gap-4 text-sm text-gray-600">
        <span v-if="route.distance_km" class="flex items-center gap-1">
          <Route class="w-3.5 h-3.5" />
          {{ route.distance_km }} km
        </span>
        <span v-if="route.elevation_gain" class="flex items-center gap-1">
          <TrendingUp class="w-3.5 h-3.5" />
          {{ route.elevation_gain }} m
        </span>
        <span class="flex items-center gap-1 ml-auto">
          <Star class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          {{ avgRating > 0 ? avgRating.toFixed(1) : '—' }}
        </span>
      </div>

      <div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span class="text-xs text-gray-400">
          {{ new Date(route.created_at).toLocaleDateString('en-GB') }}
        </span>
        <div class="flex items-center gap-2">
          <button
            class="text-xs text-gray-400 hover:text-emerald-600 transition-colors flex items-center gap-1"
            @click.stop="copyShare"
          >
            <Share2 class="w-3.5 h-3.5" />
            Share
          </button>
          <a
            :href="downloadUrl"
            class="text-xs text-gray-400 hover:text-emerald-600 transition-colors flex items-center gap-1"
            download
            @click.stop
          >
            <Download class="w-3.5 h-3.5" />
            GPX
          </a>
        </div>
      </div>
    </div>

    <div
      v-if="copied"
      class="px-4 pb-3 text-xs text-emerald-600 font-medium"
    >
      Link copied to clipboard!
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Route, TrendingUp, Star, Share2, Download } from 'lucide-vue-next'
import { useRoutesStore } from '@/stores/routes'
import { useReviewsStore } from '@/stores/reviews'
import { difficultyColor } from '@/lib/utils'
import type { Route as RouteType } from '@/types'

const props = defineProps<{ route: RouteType }>()

const routesStore = useRoutesStore()
const reviewsStore = useReviewsStore()

const avgRating = computed(() => reviewsStore.averageRating(props.route.id))
const downloadUrl = computed(() => routesStore.getDownloadUrl(props.route))
const copied = ref(false)

const difficultyBg = computed(() => {
  switch (props.route.difficulty) {
    case 'easy':    return 'bg-green-400'
    case 'moderate': return 'bg-blue-400'
    case 'hard':    return 'bg-orange-400'
    case 'expert':  return 'bg-red-500'
    default:        return 'bg-gray-200'
  }
})

async function copyShare() {
  const url = routesStore.getShareUrl(props.route)
  await navigator.clipboard.writeText(url)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>
