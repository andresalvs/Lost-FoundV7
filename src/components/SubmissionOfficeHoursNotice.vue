<template>
  <div v-if="show" class="mt-6 animate-fade-in">
    <!-- Success Message with Office Hours Status -->
    <div :class="[
      'p-6 rounded-lg border-l-4 shadow-lg',
      officeIsOpen
        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400'
        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-400'
    ]">
      <!-- Main Message -->
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 text-3xl">
          {{ officeIsOpen ? '✅' : '⏰' }}
        </div>
        <div class="flex-1">
          <!-- Header -->
          <h3 :class="[
            'text-lg font-bold mb-2',
            officeIsOpen
              ? 'text-green-900 dark:text-green-200'
              : 'text-amber-900 dark:text-amber-200'
          ]">
            {{ submissionType }} Submitted Successfully!
          </h3>

          <!-- Status Message -->
          <p :class="[
            'text-sm mb-4',
            officeIsOpen
              ? 'text-green-800 dark:text-green-300'
              : 'text-amber-800 dark:text-amber-300'
          ]">
            {{ statusMessage }}
          </p>

          <!-- Office Hours Details -->
          <div v-if="!officeIsOpen" :class="[
            'p-4 rounded-lg mb-4',
            'bg-white dark:bg-gray-800',
            'border border-amber-200 dark:border-amber-700'
          ]">
            <p class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              📅 When to Visit the Security Office:
            </p>
            <ul class="space-y-2">
              <li v-for="day in nextOpenDays" :key="day.day_of_week" class="text-sm">
                <span class="font-semibold text-gray-900 dark:text-white">{{ day.dayName }}:</span>
                <span class="text-gray-700 dark:text-gray-300">
                  {{ formatTime(day.opening_time) }} - {{ formatTime(day.closing_time) }}
                </span>
                <span v-if="day.isNextOpen" class="ml-2 px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200 text-xs rounded font-semibold">
                  Next Open
                </span>
              </li>
            </ul>
          </div>

          <!-- Current Office Status -->
          <div v-if="officeIsOpen" :class="[
            'p-4 rounded-lg mb-4',
            'bg-white dark:bg-gray-800',
            'border border-green-200 dark:border-green-700'
          ]">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <p class="text-sm font-semibold text-green-900 dark:text-green-200">
                Security Office is OPEN NOW
              </p>
            </div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              📍 Today ({{ todayName }}): {{ formatTime(todayHours.opening_time) }} - {{ formatTime(todayHours.closing_time) }}
            </p>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">
              You can visit the security office today to complete your verification or delivery.
            </p>
          </div>

          <!-- Important Notes -->
          <div :class="[
            'p-4 rounded-lg',
            'bg-blue-50 dark:bg-blue-900/20',
            'border border-blue-200 dark:border-blue-700'
          ]">
            <p class="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">
              💡 Important Notes:
            </p>
            <ul class="text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <li>✓ Your {{ submissionType.toLowerCase() }} ID: <span class="font-mono font-bold">{{ submissionId }}</span></li>
              <li>✓ Please bring a valid ID when visiting the security office</li>
              <li>✓ The office is closed on Saturday and Sunday</li>
              <li>✓ If you need special arrangements, contact the security office first</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 mt-6">
        <button
          @click="handleClose"
          class="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition font-medium text-sm"
        >
          Close
        </button>
        <button
          @click="handleViewSchedule"
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
        >
          View Full Schedule
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  submissionType: {
    type: String,
    enum: ["Report", "Claim Request"],
    required: true
  },
  submissionId: {
    type: String,
    required: true
  },
  onClose: {
    type: Function,
    default: () => {}
  }
});

const API_BASE_URL = "http://localhost:5000";

const officeIsOpen = ref(false);
const todayHours = ref(null);
const todayName = ref("");
const allWeekHours = ref([]);
const nextOpenDays = ref([]);

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

// Get today's name
const getTodayName = () => {
  return dayNames[new Date().getDay()];
};

// Compute the status message
const statusMessage = computed(() => {
  if (officeIsOpen.value) {
    return `Your ${props.submissionType.toLowerCase()} has been received. The security office is currently open. You can visit them today to complete the verification or item delivery process.`;
  } else {
    return `Your ${props.submissionType.toLowerCase()} has been received. The security office is currently closed. Please visit them during office hours (Monday-Friday, 8 AM - 5 PM) to complete the verification or item delivery process.`;
  }
});

// Fetch office hours and determine next open days
const fetchAndProcessOfficeHours = async () => {
  try {
    // Fetch week schedule
    const weekResponse = await fetch(`${API_BASE_URL}/api/office-hours/week`);
    if (!weekResponse.ok) throw new Error("Failed to fetch office hours");
    allWeekHours.value = await weekResponse.json();

    // Fetch current status
    const statusResponse = await fetch(`${API_BASE_URL}/api/office-hours/status`);
    if (!statusResponse.ok) throw new Error("Failed to fetch office status");
    const status = await statusResponse.json();
    officeIsOpen.value = status.is_open;

    // Get today's hours
    const today = new Date().getDay();
    todayHours.value = allWeekHours.value.find((d) => d.day_of_week === today) || null;
    todayName.value = getTodayName();

    // Calculate next open days
    calculateNextOpenDays();
  } catch (error) {
    console.error("❌ Error fetching office hours:", error);
  }
};

// Calculate which days are next open
const calculateNextOpenDays = () => {
  const today = new Date().getDay();
  const openDays = [];

  // If office is open today, show today first
  if (todayHours.value && todayHours.value.is_open) {
    openDays.push({
      day_of_week: today,
      dayName: todayName.value,
      opening_time: todayHours.value.opening_time,
      closing_time: todayHours.value.closing_time,
      isNextOpen: false
    });
  }

  // Add next 3 open days
  let daysChecked = 0;
  let currentDay = (today + 1) % 7;
  let isFirst = !todayHours.value?.is_open;

  while (openDays.length < 3 && daysChecked < 7) {
    const dayData = allWeekHours.value.find((d) => d.day_of_week === currentDay);
    if (dayData && dayData.is_open) {
      openDays.push({
        day_of_week: currentDay,
        dayName: dayNames[currentDay],
        opening_time: dayData.opening_time,
        closing_time: dayData.closing_time,
        isNextOpen: isFirst
      });
      isFirst = false;
    }
    currentDay = (currentDay + 1) % 7;
    daysChecked++;
  }

  nextOpenDays.value = openDays;
};

// Handle close button
const handleClose = () => {
  props.onClose();
};

// Handle view schedule button
const handleViewSchedule = () => {
  // This could navigate to office hours page or open a modal
  console.log("View full schedule clicked");
};

onMounted(() => {
  if (props.show) {
    fetchAndProcessOfficeHours();
  }
});
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
