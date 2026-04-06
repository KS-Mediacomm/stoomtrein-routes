<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">Elevation Profile</h3>
    <Line :data="chartData" :options="chartOptions" class="max-h-40" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const props = defineProps<{ elevations: number[]; distanceKm: number }>()

const chartData = computed(() => {
  // Sample down to max 200 points for performance
  const elevs = props.elevations
  const step = Math.max(1, Math.floor(elevs.length / 200))
  const sampled = elevs.filter((_, i) => i % step === 0)
  const segDist = props.distanceKm / sampled.length

  return {
    labels: sampled.map((_, i) => `${(i * segDist).toFixed(1)}`),
    datasets: [
      {
        data: sampled,
        fill: true,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.15)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false }, tooltip: { mode: 'index' as const, intersect: false } },
  scales: {
    x: {
      ticks: { maxTicksLimit: 6, font: { size: 11 } },
      title: { display: true, text: 'km', font: { size: 11 } },
    },
    y: {
      ticks: { font: { size: 11 } },
      title: { display: true, text: 'm', font: { size: 11 } },
    },
  },
}
</script>
