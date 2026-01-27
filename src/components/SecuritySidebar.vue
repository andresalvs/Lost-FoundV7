<template>
  <!-- Mobile Overlay -->
  <div
    v-if="sidebarOpen"
    @click="sidebarOpen = false"
    class="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
  ></div>

  <!-- Sidebar -->
  <aside
    :class="[
      'w-64 bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950',
      'p-6 flex flex-col space-y-6 text-gray-900 dark:text-white h-screen overflow-y-auto',
      'fixed left-0 top-16 border-r border-gray-200 dark:border-gray-800',
      'transition-transform duration-300 ease-in-out z-40',
      'md:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
   

    <!-- Navigation Buttons -->
    <nav class="flex flex-col space-y-3 pt-3">
      <!-- Report Item (Mobile Only) -->
      <button
        @click="reportItem"
        class="md:hidden w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
      >
        <span class="text-lg">➕</span>
        <span class="font-medium">Report Item</span>
      </button>

      <button
        @click="selectPage('dashboard')"
        :class="navButtonClass('dashboard')"
      >
        <span class="text-lg">📊</span>
        <span class="font-medium">Dashboard</span>
        <span v-if="activePage === 'dashboard'" class="ml-auto w-1 h-6 bg-emerald-600 rounded-r"></span>
      </button>

      <div class="pt-2 border-t border-gray-200 dark:border-gray-800">
        <button
          @click="selectPage('lost-reports')"
          :class="navButtonClass('lost-reports')"
        >
          <span class="text-lg">📌</span>
          <span class="font-medium">Lost Reports</span>
          <span v-if="unreadLost > 0" class="ml-auto text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-bold">{{ unreadLost }}</span>
          <span v-if="activePage === 'lost-reports'" class="ml-auto w-1 h-6 bg-emerald-600 rounded-r"></span>
        </button>
        <button
          @click="selectPage('found-reports')"
          :class="navButtonClass('found-reports')"
        >
          <span class="text-lg">📦</span>
          <span class="font-medium">Found Reports</span>
          <span v-if="unreadFound > 0" class="ml-auto text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-bold">{{ unreadFound }}</span>
          <span v-if="activePage === 'found-reports'" class="ml-auto w-1 h-6 bg-emerald-600 rounded-r"></span>
        </button>
        <button
          @click="selectPage('returned-history')"
          :class="navButtonClass('returned-history')"
        >
          <span class="text-lg">✅</span>
          <span class="font-medium">Returned History</span>
          <span v-if="unreadReturned > 0" class="ml-auto text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-bold">{{ unreadReturned }}</span>
          <span v-if="activePage === 'returned-history'" class="ml-auto w-1 h-6 bg-emerald-600 rounded-r"></span>
        </button>
      </div>

      <div class="pt-2 border-t border-gray-200 dark:border-gray-800">
        <button
          @click="selectPage('claim-requests')"
          :class="navButtonClass('claim-requests')"
        >
          <span class="text-lg">🤝</span>
          <span class="font-medium">Claim Requests</span>
          <span v-if="pendingClaims > 0" class="ml-auto text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-bold">{{ pendingClaims }}</span>
          <span v-if="activePage === 'claim-requests'" class="ml-auto w-1 h-6 bg-emerald-600 rounded-r"></span>
        </button>
      </div>

      <div class="pt-2 border-t border-gray-200 dark:border-gray-800">
        <button
          @click="selectPage('office-hours')"
          :class="navButtonClass('office-hours')"
        >
          <span class="text-lg">⏰</span>
          <span class="font-medium">Office Hours</span>
          <span v-if="activePage === 'office-hours'" class="ml-auto w-1 h-6 bg-emerald-600 rounded-r"></span>
        </button>
      </div>

      <div class="pt-2 border-t border-gray-200 dark:border-gray-800">
        <button
          @click="goToProfile"
          :class="navButtonClass('profile')"
        >
          <span class="text-lg">👤</span>
          <span class="font-medium">My Profile</span>
          <span v-if="activePage === 'profile'" class="ml-auto w-1 h-6 bg-emerald-600 rounded-r"></span>
        </button>
      </div>
    </nav>

    
  </aside>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Props to receive unread counts from parent
defineProps({
  unreadLost: {
    type: Number,
    default: 0
  },
  unreadFound: {
    type: Number,
    default: 0
  },
  unreadReturned: {
    type: Number,
    default: 0
  },
  pendingClaims: {
    type: Number,
    default: 0
  }
});

// Sidebar visibility state
const sidebarOpen = ref(false);

// Track active page - load from localStorage to persist across page refreshes
const activePage = ref(localStorage.getItem('security-current-page') || 'dashboard');
const securityUser = ref(null);

onMounted(() => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser?.role === "security") {
      securityUser.value = storedUser;
    }
  } catch (err) {
    console.error("Failed to parse security user from storage:", err);
    securityUser.value = null;
  }
  
  // Sync with localStorage when component mounts
  const savedPage = localStorage.getItem('security-current-page');
  if (savedPage) {
    activePage.value = savedPage;
  }
});

// Emit event to parent when page is selected
const emit = defineEmits(["select-page", "toggle-sidebar"]);

const selectPage = (page) => {
  activePage.value = page;
  localStorage.setItem('security-current-page', page);
  emit("select-page", page);
  // Close sidebar on mobile after selecting
  sidebarOpen.value = false;
};

// Expose sidebar toggle for parent
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

// Watch for changes to activePage and save to localStorage
watch(activePage, (newPage) => {
  localStorage.setItem('security-current-page', newPage);
});

// Dynamic button styling
const navButtonClass = (page) => {
  const isActive = activePage.value === page;
  return [
    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-sm relative group hover:bg-emerald-300 hover:scale-[1.05]",
    isActive
      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
      : "text-foreground hover:bg-muted dark:hover:bg-slate-800"
  ];
};

// Logout removed from sidebar; other components/pages still provide logout if needed.

const goToProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user && user.id) {
    router.push(`/profile/${user.id}`);
  } else {
    router.push('/profile');
  }
};

const reportItem = () => {
  // Close sidebar on mobile after selecting
  sidebarOpen.value = false;
  // Navigate to report item page with security mode (same as desktop)
  router.push("/report?mode=security");
};

// Expose toggleSidebar to parent via emit
defineExpose({
  toggleSidebar
});
</script>

<style scoped>
button {
  transition: all 0.2s ease;
}

aside {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}
</style>
