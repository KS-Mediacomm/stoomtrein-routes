<template>
  <div :style="{ height }" class="w-full rounded-xl overflow-hidden border border-gray-200 z-0">
    <LMap
      ref="map"
      :zoom="8"
      :center="[51.505, 4.47]"
      :use-global-leaflet="false"
      class="h-full w-full"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        layer-type="base"
      />

      <template v-for="(item, idx) in tracksWithColors" :key="item.route.id">
        <LPolyline
          :lat-lngs="item.latLngs"
          :color="item.color"
          :weight="3"
          :opacity="0.8"
          @click="handleClick(item.route.id, item.route.name)"
        />
        <LCircleMarker
          v-if="item.latLngs[0]"
          :lat-lng="item.latLngs[0]"
          :radius="6"
          color="#fff"
          :fill-color="item.color"
          :fill-opacity="1"
          :weight="2"
          @click="handleClick(item.route.id, item.route.name)"
        />
      </template>

      <LPopup v-if="popup" :lat-lng="popup.latlng">
        <RouterLink :to="`/routes/${popup.id}`" class="font-medium text-emerald-700 hover:underline">
          {{ popup.name }}
        </RouterLink>
      </LPopup>
    </LMap>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { LMap, LTileLayer, LPolyline, LCircleMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import { trackColor } from '@/lib/utils'
import type { Route, GpxTrack } from '@/types'

const props = withDefaults(
  defineProps<{
    tracks: { route: Route; track: GpxTrack }[]
    height?: string
  }>(),
  { height: '500px' },
)

const map = ref()
const popup = ref<{ id: string; name: string; latlng: [number, number] } | null>(null)

const tracksWithColors = computed(() =>
  props.tracks.map((item, idx) => ({
    ...item,
    color: trackColor(idx),
    latLngs: item.track.coordinates.map(([lng, lat]): [number, number] => [lat, lng]),
  })),
)

function handleClick(id: string, name: string) {
  // Find a midpoint coordinate for the popup
  const item = tracksWithColors.value.find((t) => t.route.id === id)
  if (!item?.latLngs.length) return
  const mid = Math.floor(item.latLngs.length / 2)
  popup.value = { id, name, latlng: item.latLngs[mid] }
}

function fitAll() {
  if (!map.value?.leafletObject) return
  const allLatLngs = tracksWithColors.value.flatMap((t) => t.latLngs)
  if (!allLatLngs.length) return
  map.value.leafletObject.fitBounds(allLatLngs, { padding: [40, 40] })
}

onMounted(() => setTimeout(fitAll, 200))
watch(() => props.tracks, () => setTimeout(fitAll, 200))
</script>
