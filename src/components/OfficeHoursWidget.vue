<template>
  <div class="office-hours-widget bg-gradient-to-r from-emerald-50 dark:from-gray-800 dark:to-gray-900 border border-emerald-200 dark:border-emerald-900/30 rounded-lg p-4 mb-6 shadow-md">
    <!-- Main Status Section -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <!-- Status Indicator -->
        <div class="flex items-center gap-2">
          <div
            :class="[
              'w-4 h-4 rounded-full animate-pulse',
              officeStatus.is_open
                ? 'bg-green-500'
                : 'bg-red-500'
            ]"
          />
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">
            Security Office Hours
          </h3>
        </div>
      </div>

      <!-- Status Badge -->
      <div class="flex items-center gap-2">
        <span
          :class="[
            'px-4 py-1 rounded-full font-bold text-sm',
            officeStatus.is_open
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          ]"
        >
          {{ officeStatus.is_open ? '✓ OPEN' : '✗ CLOSED' }}
        </span>
      </div>
    </div>

    <!-- Current Status Details -->
    <div v-if="officeStatus" class="mb-4 pb-4 border-b border-emerald-200 dark:border-gray-700">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p class="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Day</p>
          <p class="font-semibold text-gray-900 dark:text-white">{{ officeStatus.day || getDayName() }}</p>
        </div>
        <div>
          <p class="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Time</p>
          <p class="font-semibold text-gray-900 dark:text-white">{{ getCurrentTime() }}</p>
        </div>
        <div v-if="officeStatus.opening_time">
          <p class="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Hours Today</p>
          <p class="font-semibold text-gray-900 dark:text-white">
            {{ officeStatus.opening_time }} - {{ officeStatus.closing_time }}
          </p>
        </div>
      </div>

      <!-- Special Closure Notice -->
      <div v-if="specialClosure" class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
        <p class="text-sm font-semibold text-red-700 dark:text-red-400">⚠️ {{ specialClosure.event_name }}</p>
        <p class="text-xs text-red-600 dark:text-red-400 mt-1">{{ specialClosure.reason }}</p>
        <p v-if="specialClosure.notes" class="text-xs text-red-600 dark:text-red-400 mt-1 italic">{{ specialClosure.notes }}</p>
      </div>
    </div>

    <!-- Weekly Hours Section -->
    <div v-if="!showFullDetails" class="mb-3">
      <button
        @click="showFullDetails = true"
        class="text-sm text-yellow-700 dark:text-yellow-400 hover:underline font-medium flex items-center gap-1"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        View Full Schedule
      </button>
    </div>

    <!-- Full Details Section -->
    <div v-if="showFullDetails" class="space-y-3">
      <!-- Weekly Schedule -->
      <div>
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Weekly Schedule</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div
            v-for="day in weekHours"
            :key="day.day_of_week"
            :class="[
              'p-2 rounded-lg text-xs text-center border',
              isToday(day.day_of_week)
                ? 'bg-emerald-200 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-600'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            ]"
          >
            <p class="font-semibold text-gray-900 dark:text-white">{{ day.day.substring(0, 3) }}</p>
            <p v-if="day.is_open" class="text-gray-700 dark:text-gray-300">{{ day.opening_time }}-{{ day.closing_time }}</p>
            <p v-else class="text-red-600 dark:text-red-400 font-semibold">Closed</p>
          </div>
        </div>
      </div>

      <!-- Upcoming Closures -->
      <div v-if="upcomingClosures.length > 0">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">📅 Upcoming Closures</h4>
        <div class="space-y-2">
          <div
            v-for="closure in upcomingClosures"
            :key="closure.id"
            class="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900 rounded-lg"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold text-orange-700 dark:text-orange-400 text-sm">{{ closure.event_name }}</p>
                <p class="text-xs text-orange-600 dark:text-orange-400 mt-0.5">{{ formatDate(closure.closure_date) }}</p>
                <p v-if="closure.reason" class="text-xs text-orange-600 dark:text-orange-400">{{ closure.reason }}</p>
                <p v-if="closure.notes" class="text-xs text-orange-600 dark:text-orange-400 italic mt-1">{{ closure.notes }}</p>
              </div>
              <div v-if="!closure.is_all_day" class="text-right text-xs">
                <p class="text-orange-600 dark:text-orange-400">{{ closure.closure_start_time }} - {{ closure.closure_end_time }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Helpful Message -->
      <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg text-xs text-blue-700 dark:text-blue-400">
        <p><strong>💡 Pro Tip:</strong> Please visit during office hours to deliver found items or verify claims. Contact us if you need special arrangements.</p>
      </div>

      <button
        @click="showFullDetails = false"
        class="text-sm text-yellow-700 dark:text-yellow-400 hover:underline font-medium"
      >
        Hide Details
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const API_BASE_URL = "http://localhost:5000";

const officeStatus = ref({
  is_open: false,
  status: "closed",
  day: "",
  opening_time: "",
  closing_time: "",
  current_time: "",
});

const specialClosure = ref(null);
const weekHours = ref([]);
const upcomingClosures = ref([]);
const showFullDetails = ref(false);

const fetchOfficeStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/office-hours/status`);
    const data = await response.json();
    officeStatus.value = data;

    // Check for special closure on today's date
    const todayResponse = await fetch(`${API_BASE_URL}/api/office-hours/today`);
    const todayData = await todayResponse.json();
    if (todayData.closures && todayData.closures.length > 0) {
      specialClosure.value = todayData.closures[0];
    }
  } catch (error) {
    console.error("❌ Error fetching office status:", error);
  }
};

const fetchWeeklyHours = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/office-hours/week`);
    const data = await response.json();
    weekHours.value = data.map((hour) => ({
      ...hour,
      day: getDayName(hour.day_of_week),
    }));
  } catch (error) {
    console.error("❌ Error fetching weekly hours:", error);
  }
};

const fetchUpcomingClosures = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/office-hours/closures`);
    const data = await response.json();
    upcomingClosures.value = data;
  } catch (error) {
    console.error("❌ Error fetching closures:", error);
  }
};

const getDayName = (dayOfWeek = null) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  if (dayOfWeek !== null) {
    return days[dayOfWeek];
  }
  return days[new Date().getDay()];
};

const isToday = (dayOfWeek) => {
  return dayOfWeek === new Date().getDay();
};

const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Refresh time every minute
const startClockUpdate = () => {
  setInterval(() => {
    // Refresh office status every minute to check for status changes
    fetchOfficeStatus();
  }, 60000); // Every minute
};

onMounted(() => {
  fetchOfficeStatus();
  fetchWeeklyHours();
  fetchUpcomingClosures();
  startClockUpdate();
});
</script>

<style scoped>
.office-hours-widget {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

@media (prefers-reduced-motion: no-preference) {
  .office-hours-widget {
    animation: slideInDown 0.5s ease-out;
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
