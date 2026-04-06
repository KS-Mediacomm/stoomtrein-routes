<template>
  <div
    :class="[
      'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
      isDragging ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-emerald-300 hover:bg-gray-50',
    ]"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
    @click="fileInput?.click()"
  >
    <input
      ref="fileInput"
      type="file"
      accept=".gpx"
      class="hidden"
      @change="onFileChange"
    />

    <div v-if="!parsedTrack" class="flex flex-col items-center gap-3">
      <div class="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
        <Upload class="w-6 h-6 text-emerald-600" />
      </div>
      <div>
        <p class="font-medium text-gray-700">Drop your GPX file here</p>
        <p class="text-sm text-gray-400 mt-1">or click to browse</p>
      </div>
    </div>

    <div v-else class="flex flex-col items-center gap-2">
      <div class="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
        <CheckCircle class="w-6 h-6 text-emerald-600" />
      </div>
      <p class="font-medium text-gray-800">{{ parsedTrack.name }}</p>
      <div class="flex gap-4 text-sm text-gray-500">
        <span>{{ parsedTrack.distanceKm }} km</span>
        <span>{{ parsedTrack.elevationGain }} m gain</span>
      </div>
      <button
        class="mt-1 text-xs text-red-500 hover:underline"
        @click.stop="clearFile"
      >
        Remove
      </button>
    </div>

    <p v-if="parseError" class="mt-3 text-sm text-red-500">{{ parseError }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload, CheckCircle } from 'lucide-vue-next'
import { parseGpx } from '@/lib/gpx'
import type { GpxTrack } from '@/types'

const emit = defineEmits<{
  parsed: [track: GpxTrack, file: File]
  cleared: []
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const parsedTrack = ref<GpxTrack | null>(null)
const parseError = ref<string | null>(null)

async function handleFile(file: File) {
  parseError.value = null
  if (!file.name.endsWith('.gpx')) {
    parseError.value = 'Please select a .gpx file'
    return
  }
  try {
    const text = await file.text()
    parsedTrack.value = parseGpx(text)
    emit('parsed', parsedTrack.value, file)
  } catch (e) {
    parseError.value = `Could not parse GPX: ${(e as Error).message}`
  }
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}

function clearFile() {
  parsedTrack.value = null
  parseError.value = null
  if (fileInput.value) fileInput.value.value = ''
  emit('cleared')
}
</script>
