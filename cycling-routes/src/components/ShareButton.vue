<template>
  <button
    @click="copy"
    :class="[
      'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
      copied
        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
        : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-400 hover:text-emerald-700',
    ]"
  >
    <Check v-if="copied" class="w-4 h-4" />
    <Share2 v-else class="w-4 h-4" />
    {{ copied ? 'Link copied!' : 'Share route' }}
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Share2, Check } from 'lucide-vue-next'

const props = defineProps<{ url: string }>()
const copied = ref(false)

async function copy() {
  await navigator.clipboard.writeText(props.url)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2500)
}
</script>
