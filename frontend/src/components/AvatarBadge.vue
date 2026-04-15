<template>
  <div class="avatar-badge" :class="`size-${size}`">
    <img class="avatar-image" :src="avatarSrc" :alt="avatarAlt" loading="lazy">
  </div>
</template>

<script setup>
import { computed } from 'vue'
import avatarBird from '@/assets/avatars/avatar-bird.jpg'
import avatarCat from '@/assets/avatars/avatar-cat.jpg'
import avatarCheetah from '@/assets/avatars/avatar-cheetah.jpg'
import avatarDog from '@/assets/avatars/avatar-dog.jpg'

const props = defineProps({
  avatar: {
    type: Object,
    default: null,
  },
  size: {
    type: String,
    default: 'md',
  },
})

const avatarImages = {
  'north-star': avatarCheetah,
  'sunrise-note': avatarDog,
  'forest-spark': avatarCat,
  'midnight-wave': avatarBird,
}

function resolveAvatarKey(avatar) {
  const directKey = avatar?.presetKey || avatar?.avatarPreset
  if (directKey && avatarImages[directKey]) {
    return directKey
  }

  if (avatar?.hatStyle === 'cap') return 'north-star'
  if (avatar?.glassesStyle === 'round') return 'sunrise-note'
  if (avatar?.glassesStyle === 'square') return 'forest-spark'
  if (avatar?.hatStyle === 'beret' || avatar?.hairStyle === 'bob') return 'midnight-wave'
  if (avatar?.glasses && avatar?.hairStyle === 'long') return 'sunrise-note'
  if (avatar?.glasses) return 'forest-spark'

  return 'north-star'
}

const avatarKey = computed(() => resolveAvatarKey(props.avatar))
const avatarSrc = computed(() => avatarImages[avatarKey.value] || avatarCheetah)
const avatarAlt = computed(() => props.avatar?.label || 'Avatar')
</script>

<style scoped>
.avatar-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background: #f8fafc;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
}

.avatar-badge::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.78);
  pointer-events: none;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.size-sm {
  width: 40px;
  height: 40px;
}

.size-md {
  width: 56px;
  height: 56px;
}

.size-lg {
  width: 84px;
  height: 84px;
}
</style>
