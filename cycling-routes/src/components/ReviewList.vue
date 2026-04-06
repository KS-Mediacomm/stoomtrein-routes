<template>
  <div>
    <div v-if="loading" class="text-sm text-gray-400 py-4 text-center">Loading reviews…</div>

    <div v-else-if="!reviews.length" class="text-sm text-gray-400 py-4 text-center">
      No reviews yet. Be the first!
    </div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="bg-white rounded-xl border border-gray-200 p-4"
      >
        <div class="flex items-center justify-between mb-1">
          <StarRating :model-value="review.rating" readonly />
          <span class="text-xs text-gray-400">
            {{ new Date(review.created_at).toLocaleDateString('en-GB') }}
          </span>
        </div>
        <p v-if="review.comment" class="text-sm text-gray-700 mt-1">{{ review.comment }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useReviewsStore } from '@/stores/reviews'
import StarRating from '@/components/StarRating.vue'

const props = defineProps<{ routeId: string }>()
const reviewsStore = useReviewsStore()

const reviews = computed(() => reviewsStore.reviewsByRoute[props.routeId] ?? [])
const loading = computed(() => reviewsStore.loading)
</script>
