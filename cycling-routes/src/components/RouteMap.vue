<template>
  <div :style="{ height }" class="w-full rounded-xl overflow-hidden border border-gray-200 z-0">
    <LMap
      ref="map"
      :zoom="13"
      :center="center"
      :use-global-leaflet="false"
      class="h-full w-full"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        layer-type="base"
      />
      <LPolyline
        v-if="latLngs.length"
        :lat-lngs="latLngs"
        :color="color"
        :weight="4"
        :opacity="0.85"
      />
      <!-- Start marker -->
      <LCircleMarker
        v-if="startPoint"
        :lat-lng="startPoint"
        :radius="7"
        color="#fff"
        :fill-color="color"
        :fill-opacity="1"
        :weight="2"
      />
    </LMap>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { LMap, LTileLayer, LPolyline, LCircleMarker } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import type { GpxTrack } from '@/types'

const props = withDefaults(
  defineProps<{
    track: GpxTrack | null
    color?: string
    height?: string
  }>(),
  { color: '#10b981', height: '400px' },
)

const map = ref()

// Leaflet uses [lat, lng], our GpxTrack stores [lng, lat]
const latLngs = computed<[number, number][]>(() =>
  props.track?.coordinates.map(([lng, lat]) => [lat, lng]) ?? [],
)

const center = computed<[number, number]>(() => {
  if (!latLngs.value.length) return [51.505, -0.09]
  const mid = Math.floor(latLngs.value.length / 2)
  return latLngs.value[mid]
})

const startPoint = computed(() => latLngs.value[0] ?? null)

function fitBounds() {
  if (!map.value?.leafletObject || !latLngs.value.length) return
  map.value.leafletObject.fitBounds(latLngs.value, { padding: [30, 30] })
}

onMounted(() => {
  setTimeout(fitBounds, 100)
})

watch(() => props.track, () => {
  setTimeout(fitBounds, 100)
})
</script>
