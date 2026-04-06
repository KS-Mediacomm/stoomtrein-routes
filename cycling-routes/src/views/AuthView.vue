<template>
  <main class="max-w-sm mx-auto px-4 py-16">
    <div class="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <Bike class="w-6 h-6 text-emerald-600" />
        </div>
        <h1 class="text-xl font-bold text-gray-900">Sign in</h1>
        <p class="text-sm text-gray-500 mt-1">We'll send a magic link to your email</p>
      </div>

      <div v-if="sent" class="text-center">
        <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <Mail class="w-6 h-6 text-emerald-600" />
        </div>
        <p class="font-medium text-gray-800">Check your email!</p>
        <p class="text-sm text-gray-500 mt-1">We sent a magic link to <strong>{{ email }}</strong></p>
      </div>

      <form v-else @submit.prevent="submit" class="flex flex-col gap-4">
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">Email address</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@example.com"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {{ loading ? 'Sending…' : 'Send magic link' }}
        </button>

        <p v-if="error" class="text-sm text-red-500 text-center">{{ error }}</p>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Bike, Mail } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref<string | null>(null)

async function submit() {
  loading.value = true
  error.value = null
  try {
    await authStore.signInWithEmail(email.value)
    sent.value = true
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
</script>
