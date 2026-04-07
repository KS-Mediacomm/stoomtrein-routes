<template>
  <nav class="border-b bg-white sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
      <RouterLink to="/" class="flex items-center gap-2 font-bold text-lg text-gray-900">
        <Bike class="w-5 h-5 text-emerald-600" />
        WTC STOOMTREIN
      </RouterLink>

      <div class="flex items-center gap-1">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          active-class="text-emerald-600 bg-emerald-50"
        >
          {{ link.label }}
        </RouterLink>

        <RouterLink
          v-if="!user"
          to="/auth"
          class="ml-2 px-3 py-1.5 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
        >
          Sign in
        </RouterLink>

        <button
          v-else
          @click="authStore.signOut()"
          class="ml-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Bike } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const navLinks = [
  { to: '/routes', label: 'Routes' },
  { to: '/map', label: 'All on Map' },
  { to: '/upload', label: 'Upload' },
]
</script>
