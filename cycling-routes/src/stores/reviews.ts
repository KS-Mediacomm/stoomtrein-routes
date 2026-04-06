import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Review } from '@/types'

export const useReviewsStore = defineStore('reviews', () => {
  const reviewsByRoute = ref<Record<string, Review[]>>({})
  const loading = ref(false)

  async function fetchReviews(routeId: string) {
    loading.value = true
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('route_id', routeId)
      .order('created_at', { ascending: false })

    if (!error) {
      reviewsByRoute.value[routeId] = data as Review[]
    }
    loading.value = false
  }

  async function addReview(routeId: string, userId: string, rating: number, comment: string) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({ route_id: routeId, user_id: userId, rating, comment: comment || null })
      .select()
      .single()

    if (error) throw new Error(error.message)

    if (!reviewsByRoute.value[routeId]) {
      reviewsByRoute.value[routeId] = []
    }
    reviewsByRoute.value[routeId].unshift(data as Review)
  }

  function averageRating(routeId: string): number {
    const reviews = reviewsByRoute.value[routeId] ?? []
    if (!reviews.length) return 0
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  }

  return { reviewsByRoute, loading, fetchReviews, addReview, averageRating }
})
