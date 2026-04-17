<template>
  <RouterView />
  <LanguageToggle />
  <XJTLUBird />
</template>

<script setup>
import { RouterView } from 'vue-router'
import LanguageToggle from '@/components/LanguageToggle.vue'
import XJTLUBird from '@/components/XJTLUBird.vue'
import { useLanguageStore } from './stores/language'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
authStore.hydrate()

const languageStore = useLanguageStore()
languageStore.hydrate()
</script>
