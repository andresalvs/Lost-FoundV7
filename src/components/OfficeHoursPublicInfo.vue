<template>
  <div class="office-hours-info bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-lg p-6 mb-6">
    <!-- Header -->
    <div class="flex items-start gap-4">
      <div class="flex-shrink-0">
        <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
        </svg>
      </div>

      <div class="flex-1">
        <!-- Title and Current Status -->
        <div class="mb-4">
          <h3 class="text-lg font-bold text-blue-900 dark:text-blue-200 mb-1">Security Office Hours</h3>
          <div class="flex items-center gap-2">
            <div
              :class="[
                'w-3 h-3 rounded-full animate-pulse',
                isOfficeOpen ? 'bg-green-500' : 'bg-red-500'
              ]"
            />
            <p :class="[
              'font-semibold',
              isOfficeOpen 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-red-700 dark:text-red-300'
            ]">
              {{ isOfficeOpen ? '✓ OPEN NOW' : '✗ CLOSED' }}
            </p>
          </div>
        </div>

        <!-- Current Status Message -->
        <div class="mb-4 p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700">
          <p class="text-sm text-gray-700 dark:text-gray-300 mb-1">
            <strong>Today ({{ todayName }}):</strong>
          </p>
          <p v-if="todayHours && todayHours.is_open" class="text-sm font-semibold text-blue-700 dark:text-blue-300">
            🕐 {{ formatTime(todayHours.opening_time) }} - {{ formatTime(todayHours.closing_time) }}
          </p>
          <p v-else class="text-sm font-semibold text-red-700 dark:text-red-300">
            🚫 Closed Today
          </p>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">
            📅 Current: {{ currentDateTime }}
          </p>
        </div>

        <!-- Weekly Schedule Compact View -->
        <div class="mb-4">
          <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">This Week's Schedule</p>
          <div class="grid grid-cols-7 gap-1">
            <div
              v-for="day in weekSchedule"
              :key="day.day_of_week"
              :class="[
                'p-2 rounded text-xs text-center',
                isToday(day.day_of_week)
                  ? 'bg-blue-500 text-white font-bold'
                  : day.is_open
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
              ]"
            >
              <p class="font-semibold">{{ day.day.substring(0, 1) }}</p>
              <p v-if="day.is_open" class="text-[10px] leading-tight">
                {{ formatTimeCompact(day.opening_time, day.closing_time) }}
              </p>
              <p v-else class="text-[10px] leading-tight font-semibold">Closed</p>
            </div>
          </div>
        </div>

        <!-- Important Notice -->
        <div class="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded">
          <p class="text-xs text-amber-800 dark:text-amber-200 mb-2">
            <strong>📌 Important:</strong>
          </p>
          <ul class="text-xs text-amber-700 dark:text-amber-300 space-y-1">
            <li>✓ Please visit during office hours to claim or deliver items</li>
            <li>✓ The security office is closed on Saturday and Sunday</li>
            <li>✓ Operating hours: Monday to Friday, 8:00 AM - 5:00 PM</li>
            <li>✓ If you need to visit outside these hours, please contact the security office first</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const API_BASE_URL = "http://localhost:5000";

const weekSchedule = ref([]);
const todayHours = ref(null);
const isOfficeOpen = ref(false);
const currentDateTime = ref("");
const todayName = ref("");

// Helper function to format time
const formatTime = (timeStr) => {
  try {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
};

// Helper function to format time range compactly
const formatTimeCompact = (opening, closing) => {
  try {
    const openHour = parseInt(opening.split(":")[0]);
    const closeHour = parseInt(closing.split(":")[0]);
    const displayOpenHour = openHour % 12 || 12;
    const displayCloseHour = closeHour % 12 || 12;
    return `${displayOpenHour}-${displayCloseHour}`;
  } catch {
    return "N/A";
  }
};

// Check if it's today
const isToday = (dayOfWeek) => {
  return new Date().getDay() === dayOfWeek;
};

// Get today's name
const getTodayName = () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
};

// Update current date/time display
const updateDateTime = () => {
  const now = new Date();
  currentDateTime.value = now.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

// Fetch office hours
const fetchOfficeHours = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/office-hours/week`);
    if (!response.ok) throw new Error("Failed to fetch office hours");

    const data = await response.json();
    weekSchedule.value = data;

    // Get today's hours
    const today = new Date().getDay();
    todayHours.value = data.find((d) => d.day_of_week === today) || null;
    todayName.value = getTodayName();
  } catch (error) {
    console.error("❌ Error fetching office hours:", error);
  }
};

// Fetch current office status
const fetchOfficeStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/office-hours/status`);
    if (!response.ok) throw new Error("Failed to fetch office status");

    const data = await response.json();
    isOfficeOpen.value = data.is_open;
  } catch (error) {
    console.error("❌ Error fetching office status:", error);
  }
};

onMounted(() => {
  fetchOfficeHours();
  fetchOfficeStatus();
  updateDateTime();

  // Update date/time every second
  setInterval(updateDateTime, 1000);

  // Refresh status every minute
  setInterval(fetchOfficeStatus, 60000);
});
</script>

<style scoped>
/* Smooth animations */
div {
  transition: all 0.3s ease;
}
</style>
