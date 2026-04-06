<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <h3 class="font-semibold text-gray-800 mb-3">Leave a Review</h3>

    <div v-if="!user" class="text-sm text-gray-500">
      <RouterLink to="/auth" class="text-emerald-600 hover:underline">Sign in</RouterLink>
      to leave a review.
    </div>

    <form v-else @submit.prevent="submit" class="flex flex-col gap-3">
      <div>
        <label class="text-sm font-medium text-gray-700 mb-1 block">Rating</label>
        <StarRating v-model="rating" />
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700 mb-1 block">Comment</label>
        <textarea
          v-model="comment"
          rows="3"
          placeholder="Share your experience…"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      <div class="flex items-center gap-3">
        <button
          type="submit"
          :disabled="rating === 0 || submitting"
          class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ submitting ? 'Submitting…' : 'Submit Review' }}
        </button>
        <span v-if="success" class="text-sm text-emerald-600 font-medium">Review posted!</span>
        <span v-if="err" class="text-sm text-red-500">{{ err }}</span>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useReviewsStore } from '@/stores/reviews'
import StarRating from '@/components/StarRating.vue'

const props = defineProps<{ routeId: string }>()

const authStore = useAuthStore()
const reviewsStore = useReviewsStore()

const user = computed(() => authStore.user)
const rating = ref(0)
const comment = ref('')
const submitting = ref(false)
const success = ref(false)
const err = ref<string | null>(null)

async function submit() {
  if (!user.value || rating.value === 0) return
  submitting.value = true
  err.value = null
  try {
    await reviewsStore.addReview(props.routeId, user.value.id, rating.value, comment.value)
    rating.value = 0
    comment.value = ''
    success.value = true
    setTimeout(() => { success.value = false }, 3000)
  } catch (e) {
    err.value = (e as Error).message
  } finally {
    submitting.value = false
  }
}
</script>
