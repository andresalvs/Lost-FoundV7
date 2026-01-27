<template>
  <div :class="['p-4 rounded-lg shadow-md', bgClass]">
    <h3 class="text-sm font-medium">{{ title }}</h3>
    <p class="text-2xl font-bold">{{ count }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  count: [Number, String],
  color: { type: String, default: 'yellow' }
})

// Map logical color names to concrete Tailwind classes so we can
// provide light-by-default and dark variants without runtime template
// string interpolation (which breaks PurgeCSS/Tailwind scanning).
const bgClass = computed(() => {
  switch (props.color) {
    case 'green':
      return 'bg-green-500 dark:bg-green-600 text-white'
    case 'red':
      return 'bg-red-500 dark:bg-red-600 text-white'
    case 'blue':
      return 'bg-blue-500 dark:bg-blue-600 text-white'
    case 'purple':
      return 'bg-purple-500 dark:bg-purple-600 text-white'
    default:
      // yellow: use darker text for light background, white text in dark mode
      return 'bg-yellow-500 dark:bg-yellow-600 text-black dark:text-white'
  }
})
</script>