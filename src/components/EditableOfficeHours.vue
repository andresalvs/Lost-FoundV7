<template>
  <div class="editable-office-hours p-6 bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <svg class="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
        </svg>
        Office Hours Management
      </h3>
      <div class="flex gap-2">
        <button
          v-if="!isEditing"
          @click="enableEdit"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Hours
        </button>
        <button
          v-else
          @click="cancelEdit"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
        >
          Cancel
        </button>
      </div>
    </div>

      <!-- Display Mode -->
    <div v-if="!isEditing" class="space-y-4">
      <!-- Current Status with Date/Time -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-gray-800 to-white dark:to-gray-700 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400 uppercase font-semibold">Current Status</p>
            <p class="text-lg text-gray-900 dark:text-white font-bold mt-1">{{ officeStatusDisplay }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">
              📅 {{ currentDateDisplay }} | 🕐 {{ currentTimeDisplay }}
            </p>
          </div>
          <div
            :class="[
              'w-4 h-4 rounded-full animate-pulse',
              isCurrentlyOpen ? 'bg-green-500' : 'bg-red-500'
            ]"
          />
        </div>
      </div>

      <!-- Weekly Hours Display -->
      <div>
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Weekly Schedule</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            v-for="day in displayHours"
            :key="day.day_of_week"
            :class="[
              'p-4 rounded-lg border-2 text-center transition-all',
              isToday(day.day_of_week)
                ? 'border-emerald-400 bg-emeral-50 dark:bg-emerald-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
            ]"
          >
            <p class="font-semibold text-gray-900 dark:text-white">{{ day.day.substring(0, 3) }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ getShortDayName(day.day_of_week) }}</p>
            <p v-if="day.is_open" class="text-sm text-gray-700 dark:text-gray-300 mt-2 font-medium">
              {{ formatTimeRange(day.opening_time, day.closing_time) }}
            </p>
            <p v-else class="text-sm text-red-600 dark:text-red-400 font-semibold mt-2">
              Closed
            </p>
          </div>
        </div>
      </div>
    </div>    <!-- Edit Mode -->
    <div v-else class="space-y-6">
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p class="text-sm text-blue-700 dark:text-blue-400">
          <strong>Note:</strong> Default configuration: Saturday & Sunday are closed, Monday-Friday 8:00 AM to 5:00 PM.
        </p>
      </div>

      <!-- Daily Configuration -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Configure Each Day</h4>
        
        <div v-for="day in editableHours" :key="day.day_of_week" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <label class="font-semibold text-gray-900 dark:text-white text-lg">{{ day.day }}</label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="day.is_open"
                type="checkbox"
                class="w-5 h-5 rounded accent-yellow-500"
              />
              <span class="text-sm text-gray-600 dark:text-gray-400">Open</span>
            </label>
          </div>

          <div v-if="day.is_open" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Opening Time</label>
              <input
                v-model="day.opening_time"
                type="time"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none transition"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Closing Time</label>
              <input
                v-model="day.closing_time"
                type="time"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none transition"
              />
            </div>
          </div>

          <div v-else class="text-center text-red-600 dark:text-red-400 font-semibold py-2">
            This day is closed
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="space-y-2">
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h4>
        <div class="grid grid-cols-2 gap-3">
          <button
            @click="applyDefaultHours"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
          >
            Apply Default Hours (8 AM - 5 PM, Closed Sat/Sun)
          </button>
          <button
            @click="openAllDays"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
          >
            Open All Days
          </button>
          <button
            @click="closeAllDays"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
          >
            Close All Days
          </button>
        </div>
      </div>

      <!-- Save/Discard Actions -->
      <div class="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="saveHours"
          :disabled="isSaving"
          class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg v-if="!isSaving" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span v-if="isSaving" class="inline-block animate-spin">⏳</span>
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <transition name="fade">
      <div
        v-if="successMessage"
        class="mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        {{ successMessage }}
      </div>
    </transition>

    <transition name="fade">
      <div
        v-if="errorMessage"
        class="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM8 8a1 1 0 000 2h6a1 1 0 000-2H8z" clip-rule="evenodd" />
        </svg>
        {{ errorMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

const API_BASE_URL = "http://localhost:5000";

const isEditing = ref(false);
const isSaving = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const displayHours = ref([]);
const editableHours = ref([]);
const isCurrentlyOpen = ref(false);
const currentTime = ref("");
const currentDate = ref("");

// Helper to get short day name
const getShortDayName = (dayOfWeek) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayOfWeek];
};

// Helper to format time range
const formatTimeRange = (opening, closing) => {
  try {
    const openTime = new Date(`2000-01-01T${opening}`);
    const closeTime = new Date(`2000-01-01T${closing}`);
    
    return `${openTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} - ${closeTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return `${opening} - ${closing}`;
  }
};

// Update current time and date periodically
const updateCurrentDateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit", 
    second: "2-digit" 
  });
  currentDate.value = now.toLocaleDateString("en-US", { 
    weekday: "long", 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  });
};

// Fetch current office hours
const fetchOfficeHours = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/office-hours/week`);
    if (!response.ok) throw new Error("Failed to fetch office hours");
    
    const data = await response.json();
    displayHours.value = data;
    editableHours.value = JSON.parse(JSON.stringify(data)); // Deep copy
  } catch (error) {
    console.error("❌ Error fetching office hours:", error);
    errorMessage.value = "Failed to load office hours";
    setTimeout(() => (errorMessage.value = ""), 3000);
  }
};

// Check current office status
const fetchOfficeStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/office-hours/status`);
    if (!response.ok) throw new Error("Failed to fetch office status");
    
    const data = await response.json();
    isCurrentlyOpen.value = data.is_open;
  } catch (error) {
    console.error("❌ Error fetching office status:", error);
  }
};

// Save office hours
const saveHours = async () => {
  isSaving.value = true;
  try {
    for (const day of editableHours.value) {
      const response = await fetch(
        `${API_BASE_URL}/api/office-hours/${day.day_of_week}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            opening_time: day.opening_time || "08:00",
            closing_time: day.closing_time || "17:00",
            is_open: day.is_open
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update ${day.day}`);
      }
    }

    successMessage.value = "✅ Office hours updated successfully!";
    displayHours.value = JSON.parse(JSON.stringify(editableHours.value));
    isEditing.value = false;
    
    setTimeout(() => (successMessage.value = ""), 3000);
    
    // Refresh status
    await fetchOfficeStatus();
  } catch (error) {
    console.error("❌ Error saving office hours:", error);
    errorMessage.value = "Failed to save office hours. Please try again.";
    setTimeout(() => (errorMessage.value = ""), 3000);
  } finally {
    isSaving.value = false;
  }
};

// Quick actions
const applyDefaultHours = () => {
  editableHours.value.forEach((day) => {
    // Saturday (6) and Sunday (0) are closed
    if (day.day_of_week === 0 || day.day_of_week === 6) {
      day.is_open = false;
      day.opening_time = "08:00";
      day.closing_time = "17:00";
    } else {
      day.is_open = true;
      day.opening_time = "08:00";
      day.closing_time = "17:00";
    }
  });
};

const openAllDays = () => {
  editableHours.value.forEach((day) => {
    day.is_open = true;
    day.opening_time = day.opening_time || "08:00";
    day.closing_time = day.closing_time || "17:00";
  });
};

const closeAllDays = () => {
  editableHours.value.forEach((day) => {
    day.is_open = false;
  });
};

// UI Functions
const enableEdit = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  editableHours.value = JSON.parse(JSON.stringify(displayHours.value));
  isEditing.value = false;
};

const isToday = (dayOfWeek) => {
  const today = new Date().getDay();
  return today === dayOfWeek;
};

// Computed property for office status display
const officeStatusDisplay = computed(() => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todayHours = displayHours.value.find((d) => d.day_of_week === dayOfWeek);
  
  if (!todayHours || !todayHours.is_open) {
    return "Closed Today";
  }

  const opening = todayHours.opening_time;
  const closing = todayHours.closing_time;

  if (currentTime >= opening && currentTime < closing) {
    return `Open Now (${formatTimeRange(opening, closing)})`;
  } else if (currentTime < opening) {
    return `Opens at ${opening}`;
  } else {
    return `Closed (Opens tomorrow at ${displayHours.value[(dayOfWeek + 1) % 7].opening_time || "N/A"})`;
  }
});

// Computed properties for current date/time display
const currentDateDisplay = computed(() => currentDate.value);
const currentTimeDisplay = computed(() => currentTime.value);

onMounted(() => {
  updateCurrentDateTime();
  fetchOfficeHours();
  fetchOfficeStatus();
  
  // Update date/time every second
  setInterval(updateCurrentDateTime, 1000);
  
  // Refresh status every minute
  setInterval(fetchOfficeStatus, 60000);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
