<template>
  <main class="max-w-2xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Upload a Route</h1>

    <form @submit.prevent="submit" class="flex flex-col gap-5">
      <!-- GPX upload -->
      <GPXUploader @parsed="onParsed" @cleared="onCleared" />

      <!-- Name -->
      <div>
        <label class="text-sm font-medium text-gray-700 mb-1 block">Route name *</label>
        <input
          v-model="form.name"
          type="text"
          required
          placeholder="Sunday morning ride"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <!-- Description -->
      <div>
        <label class="text-sm font-medium text-gray-700 mb-1 block">Description</label>
        <textarea
          v-model="form.description"
          rows="3"
          placeholder="A scenic route through the countryside…"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      <!-- Difficulty -->
      <div>
        <label class="text-sm font-medium text-gray-700 mb-1 block">Difficulty</label>
        <select
          v-model="form.difficulty"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          <option value="">Select difficulty</option>
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      <!-- Preview map -->
      <RouteMap v-if="parsedTrack" :track="parsedTrack" height="300px" />

      <!-- Submit -->
      <div class="flex items-center gap-3">
        <button
          type="submit"
          :disabled="!gpxFile || !form.name || uploading"
          class="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ uploading ? 'Uploading…' : 'Upload Route' }}
        </button>
        <span v-if="error" class="text-sm text-red-500">{{ error }}</span>
      </div>
    </form>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRoutesStore } from '@/stores/routes'
import GPXUploader from '@/components/GPXUploader.vue'
import RouteMap from '@/components/RouteMap.vue'
import type { GpxTrack, Difficulty } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const routesStore = useRoutesStore()

const gpxFile = ref<File | null>(null)
const parsedTrack = ref<GpxTrack | null>(null)
const uploading = ref(false)
const error = ref<string | null>(null)

const form = ref({
  name: '',
  description: '',
  difficulty: '' as Difficulty | '',
})

function onParsed(track: GpxTrack, file: File) {
  parsedTrack.value = track
  gpxFile.value = file
  if (!form.value.name) form.value.name = track.name
}

function onCleared() {
  parsedTrack.value = null
  gpxFile.value = null
}

async function submit() {
  if (!gpxFile.value || !authStore.user) return
  uploading.value = true
  error.value = null
  try {
    const route = await routesStore.uploadRoute(gpxFile.value, {
      name: form.value.name,
      description: form.value.description,
      difficulty: form.value.difficulty || null,
      distanceKm: parsedTrack.value?.distanceKm ?? 0,
      elevationGain: parsedTrack.value?.elevationGain ?? 0,
      userId: authStore.user.id,
    })
    router.push(`/routes/${route.id}`)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    uploading.value = false
  }
}
</script>
