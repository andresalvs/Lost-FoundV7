<template>

  <div class="min-h-screen flex flex-col bg-white dark:bg-brand-black text-gray-900 dark:text-white transition-colors duration-200">
    <router-view class="flex-1" />
    <Navbar v-if="showNavbar" />
  </div>

  <!-- Floating Theme Toggle -->
  <button
    v-if="route && route.meta && route.meta.showThemeToggle !== false"
    @click="themeStore.toggleTheme"
    class="fixed bottom-4 right-4 p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white shadow-lg"
    aria-label="Toggle theme"
  >
    <span v-if="themeStore.darkMode">☀️</span>
    <span v-else>🌙</span>
  </button>

</template>

<script setup>
 import { themeStore } from '@/stores/theme.js'
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import Navbar from "@/components/AppNavbar.vue";
import eventBus from "@/eventBus.js";

const route = useRoute();
const hideNavbarForDeliveryNotice = ref(false);

onMounted(() => {
  eventBus.on("hideNavbar", (value) => {
    hideNavbarForDeliveryNotice.value = value;
  });
});

onUnmounted(() => {
  eventBus.off("hideNavbar");
});

const showNavbar = computed(() => {
  // Hide if delivery notice is shown
  if (hideNavbarForDeliveryNotice.value) return false;
  
  const path = route.path.toLowerCase();
  
  // Hide navbar for admin-login
  if (path === "/admin-login") return false;
  
  // Hide navbar for user profile (matches /profile and /profile/:id)
  if (path.startsWith("/profile")) return false;
  
  // Hide navbar on public info pages (how-it-works, aboutus)
  if (path === "/how-it-works" || path === "/aboutus") return false;
  
  // Hide navbar on report page only if user is admin or security staff
  if (path === "/report") {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const role = user?.role;
    // Hide navbar for admin and security, but show for university members
    return role !== "admin" && role !== "security";
  }
  
  return true;
});

// Note: theme toggle visibility is read directly from route.meta in the template
</script>