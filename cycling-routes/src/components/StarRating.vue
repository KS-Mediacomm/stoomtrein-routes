<template>
  <div class="flex gap-1">
    <button
      v-for="n in 5"
      :key="n"
      type="button"
      :class="['transition-colors', readonly ? 'cursor-default' : 'hover:scale-110 cursor-pointer']"
      @click="!readonly && emit('update:modelValue', n)"
      @mouseover="!readonly && (hovered = n)"
      @mouseleave="!readonly && (hovered = 0)"
    >
      <Star
        :class="[
          'w-5 h-5',
          n <= (hovered || modelValue) ? 'text-amber-400 fill-amber-400' : 'text-gray-300',
        ]"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Star } from 'lucide-vue-next'

withDefaults(
  defineProps<{ modelValue: number; readonly?: boolean }>(),
  { readonly: false },
)
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
const hovered = ref(0)
</script>
