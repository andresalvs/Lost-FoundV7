<template>
  <div
    class="theme-toggle"
    :class="{ on: isDark }"
    role="switch"
    :aria-checked="isDark"
    tabindex="0"
    @click="toggle"
    @keydown.enter.prevent="toggle"
    @keydown.space.prevent="toggle"
    :title="isDark ? 'Switch to Light' : 'Switch to Dark'"
  >
    <div class="knob">
      <svg v-if="!isDark" class="knob-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 3v1M12 20v1M4.2 4.2l.7.7M18.1 18.1l.7.7M3 12h1M20 12h1M4.2 19.8l.7-.7M18.1 5.9l.7-.7M12 7a5 5 0 100 10 5 5 0 000-10z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-else class="knob-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { themeStore } from '@/stores/theme.js'

const emit = defineEmits(["change"]);

const isDark = computed(() => themeStore.darkMode)
function toggle() {
  try {
    themeStore.toggleTheme()
    // notify parent components that theme changed
    emit('change', themeStore.darkMode)
  } catch (e) {
    console.warn('ThemeToggle: failed to toggle theme', e)
  }
}
</script>

<style scoped>
.theme-toggle {
  width: 46px;
  height: 26px;
  border-radius: 9999px;
  padding: 3px;
  background-color: #e5e7eb;
  display: inline-flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  transition: background-color 0.25s ease, box-shadow 0.2s ease;
}
.theme-toggle.on {
  background-color: #059669;
  box-shadow: 0 2px 6px rgba(5,150,105,0.25);
}
.theme-toggle .knob {
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
  transition: transform 0.22s cubic-bezier(.2,.9,.2,1), background-color 0.2s ease;
  transform: translateX(0);
}
.theme-toggle.on .knob {
  transform: translateX(20px);
}
.knob-icon {
  width: 14px;
  height: 14px;
}
</style>
