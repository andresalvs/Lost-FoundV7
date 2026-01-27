<template>
  <!-- Navbar will NOT show on login or register pages -->
  <nav v-if="showNavbar"
       class="fixed bottom-6 left-1/2 -translate-x-1/2 
         bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 
           flex justify-around w-[90%] max-w-md 
           rounded-2xl py-3 shadow-lg z-50 transition-colors duration-200 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
    <RouterLink v-for="item in nav" :key="item.to" 
      :to="item.to"
            class="flex flex-col items-center text-sm transition-all text-gray-700 dark:text-gray-400
              hover:text-yellow-600 dark:hover:text-yellow-400 relative"
            :class="{ 'text-yellow-600 dark:text-yellow-400': isActive(item) }">
      <component :is="item.icon" class="w-6 h-6 mb-1" />
      <!-- Notification badge for Alerts -->
            <span v-if="item.label === 'Alerts' && unreadNotificationCount > 0" 
            class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold">
        {{ unreadNotificationCount }}
      </span>
      {{ item.label }}
    </RouterLink>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { Home, Search, Bell, User, PlusSquare } from "lucide-vue-next";

const route = useRoute();

const isActive = (item) => {
  try {
    // Compare base path and, when present, match query params.
    // This ensures /userdashboard?show_notifications=1 highlights Alerts
    // while /userdashboard highlights Home only.
    const parts = (item.to || '').split('?');
    const base = parts[0] || '';
    const routePathMatches = route.path === base || route.path.startsWith(base + '/');
    if (!routePathMatches) return false;

    // If the nav item includes a querystring, require those params to be present
    // in the current route's query to consider it active.
    if (parts[1]) {
      const params = new URLSearchParams(parts[1]);
      for (const [k, v] of params) {
        const rq = route.query?.[k];
        if (rq === undefined) return false;
        if (String(rq) !== String(v)) return false;
      }
      return true;
    }

    // Nav item has no query. If the route currently has the show_notifications
    // flag set, prefer the Alerts item (which includes that query), so
    // non-query nav items should not be active when show_notifications is present.
    if (route.query && (route.query.show_notifications === '1' || route.query.show_notifications === 'true')) {
      return false;
    }

    return true;
  } catch (e) {
    return route.path === item.to;
  }
};
const userRole = ref('');
const unreadNotificationCount = ref(0);

onMounted(() => {
  // Get user role from localStorage on component mount
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    userRole.value = user?.role || '';
  } catch (err) {
    console.error('Error getting user role:', err);
  }
  
  // Load initial notification count
  loadNotificationCount();
});

// Watch for route changes to refresh notification count
watch(() => route.path, () => {
  loadNotificationCount();
});

const loadNotificationCount = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user?.id) return;
    
    const res = await fetch(`http://localhost:5000/api/notifications/${user.id}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    
    const data = await res.json();
    // Count unread notifications of all types
    unreadNotificationCount.value = Array.isArray(data) 
      ? data.filter(n => !n.is_read).length 
      : 0;
  } catch (err) {
    console.error('Failed to load notification count:', err);
  }
};

const nav = [
  { to: "/userdashboard", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/report", label: "Report", icon: PlusSquare },
  // Alerts should open the dashboard notifications in full-screen
  { to: "/userdashboard?show_notifications=1", label: "Alerts", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
];

// Hide navbar on login & register pages and hide on profile for admin/security
const showNavbar = computed(() => {
  // Check if current route is profile and user is admin/security
  if (route.path.startsWith('/profile') && (userRole.value === 'admin' || userRole.value === 'security')) {
    return false;
  }
  
  // Check if the current route is neither login nor register
  return route.path !== "/login" && 
         route.path !== "/register" && 
         route.path !== "/" && 
         route.path !== "/admin-dashboard" && 
         route.path !== "/security-dashboard";
});
</script>
