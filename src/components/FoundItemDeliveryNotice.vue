<template>
  <div class="w-full space-y-4 sm:space-y-6 pt-6 sm:pt-8">
    <!-- Success Message Card -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 sm:p-8 border border-emerald-200 dark:border-emerald-800 shadow-sm">
      <div class="absolute -right-8 -top-8 w-24 h-24 bg-emerald-200 dark:bg-emerald-900/40 rounded-full opacity-30"></div>
      <div class="relative text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-800 mb-4 shadow-md border-2 border-emerald-300 dark:border-emerald-700">
          <svg class="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2 class="text-3xl sm:text-4xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">Report Submitted!</h2>
        <p class="text-sm sm:text-base text-emerald-600 dark:text-emerald-400">Proceed to the Security Office as soon as possible</p>
      </div>
    </div>

    <!-- Delivery Instructions Card -->
    <div class="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 sm:p-8 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-500/20 dark:bg-blue-500/30">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Delivery Instructions</h3>
          <p class="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            Please deliver this found item to the <span class="font-semibold">Security Office</span> as soon as possible for secure storage and processing.
          </p>
        </div>
      </div>
    </div>

    <!-- Office Availability Card -->
    <div v-if="officeHours" :class="[
      'rounded-2xl p-6 sm:p-8 border shadow-sm hover:shadow-md transition-all duration-300',
      isOfficeOpenToday 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
        : 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800'
    ]">
      <!-- Status Header -->
      <div class="flex items-center gap-3 mb-6">
        <div :class="[
          'h-4 w-4 rounded-full animate-pulse',
          isOfficeOpenToday ? 'bg-green-500' : 'bg-orange-500'
        ]"></div>
        <h3 :class="[
          'text-lg sm:text-xl font-bold',
          isOfficeOpenToday 
            ? 'text-green-700 dark:text-green-300'
            : 'text-orange-700 dark:text-orange-300'
        ]">
          {{ isOfficeOpenToday ? '✓ Office is Open Today' : '⏰ Office is Closed Today' }}
        </h3>
      </div>

      <!-- Today's Hours Card -->
      <div :class="[
        'rounded-xl p-4 sm:p-5 mb-6 backdrop-blur-sm',
        isOfficeOpenToday
          ? 'bg-white/50 dark:bg-gray-800/30 border border-green-200 dark:border-green-700'
          : 'bg-white/50 dark:bg-gray-800/30 border border-orange-200 dark:border-orange-700'
      ]">
        <p :class="[
          'text-xs font-semibold uppercase tracking-wider mb-3 opacity-75',
          isOfficeOpenToday 
            ? 'text-green-600 dark:text-green-400'
            : 'text-orange-600 dark:text-orange-400'
        ]">
          Today ({{ todayName }})
        </p>
        <div v-if="isOfficeOpenToday" class="flex items-center justify-between">
          <p class="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-300">
            {{ officeHours.today.open }} - {{ officeHours.today.close }}
          </p>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 dark:bg-green-500/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
            OPEN
          </span>
        </div>
        <div v-else class="text-xl sm:text-2xl font-bold text-orange-700 dark:text-orange-300">
          Closed Today
        </div>
      </div>

      <!-- Action Button or Weekly Schedule -->
      <div v-if="isOfficeOpenToday" class="flex flex-col sm:flex-row gap-3">
        <button 
          @click="showScheduleModal = true"
          class="flex-1 py-3 sm:py-4 px-6 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-gray-900 font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
        >
          <span class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
            </svg>
            View Full Schedule
          </span>
        </button>
      </div>
      <div v-else class="rounded-xl bg-white/50 dark:bg-gray-800/30 p-4 border border-orange-200 dark:border-orange-700">
        <details class="cursor-pointer group">
          <summary class="text-sm sm:text-base font-semibold text-orange-700 dark:text-orange-300 hover:text-orange-900 dark:hover:text-orange-200 transition-colors select-none flex items-center gap-2">
            <svg class="w-5 h-5 transform group-open:rotate-90 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            View Full Weekly Schedule
          </summary>
          <div class="mt-4 space-y-2">
            <div v-for="day in weekDays" :key="day.name" class="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-100 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-600 transition-colors">
              <span class="font-semibold text-gray-900 dark:text-white">{{ day.name }}</span>
              <span v-if="day.isOpen" class="text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">{{ day.open }} - {{ day.close }}</span>
              <span v-else class="text-red-600 dark:text-red-400 font-semibold text-sm">Closed</span>
            </div>
          </div>
        </details>
      </div>
    </div>

    <!-- Done Button -->
    <button
      @click="$emit('done')"
      class="w-full py-3 sm:py-4 px-6 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base sm:text-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
    >
      Done
    </button>

    <!-- Modern Schedule Modal -->
    <transition name="modal-fade">
      <div v-if="showScheduleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <transition name="modal-slide">
          <div class="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800">
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-700 dark:via-teal-700 dark:to-cyan-700 p-4 sm:p-6 flex justify-between items-start flex-shrink-0 relative overflow-hidden">
              <div class="absolute -right-12 -top-12 w-32 h-32 bg-white/10 rounded-full"></div>
              <div class="relative z-10">
                <h2 class="text-xl sm:text-2xl font-bold text-white mb-0.5">Security Office Hours</h2>
                <p class="text-xs sm:text-sm text-emerald-50 opacity-90">Complete weekly schedule</p>
              </div>
              <button
                @click="showScheduleModal = false"
                class="relative z-10 flex-shrink-0 text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200 w-10 h-10 flex items-center justify-center"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Content -->
            <div class="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5">
              <!-- Weekly Schedule -->
              <div>
                <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg class="w-6 h-6 text-teal-600 dark:text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 2a1 1 0 00-1 1v2H4a2 2 0 00-2 2v2h16V7a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v2H7V3a1 1 0 00-1-1zm0 5H4v9a2 2 0 002 2h12a2 2 0 002-2V7h-2v2a1 1 0 11-2 0V7H8v2a1 1 0 11-2 0V7z" />
                  </svg>
                  This Week's Hours
                </h3>
                <div class="space-y-3">
                  <div v-for="day in weekDays" :key="day.name" :class="[
                    'rounded-lg p-3 border-2 transition-all duration-300 hover:shadow-md',
                    day.isOpen
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-300 dark:border-gray-600'
                  ]">
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2.5">
                        <div :class="[
                          'w-3 h-3 rounded-full flex-shrink-0',
                          day.isOpen ? 'bg-green-500' : 'bg-gray-400'
                        ]"></div>
                        <p class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{{ day.name }}</p>
                      </div>
                      <p :class="[
                        'text-sm sm:text-base font-semibold text-right',
                        day.isOpen
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-gray-600 dark:text-gray-400'
                      ]">
                        {{ day.isOpen ? `${day.open} - ${day.close}` : 'Closed' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Info Section -->
              <div class="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3.5 sm:p-4">
                <p class="text-sm sm:text-base text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd" />
                  </svg>
                  <span>Bring this item during office hours. Our team will verify and process your report immediately.</span>
                </p>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script>
import eventBus from '@/eventBus.js';

export default {
  name: "FoundItemDeliveryNotice",
  props: {
    itemType: {
      type: String,
      default: "General Item",
      validator: (value) => ["Student ID", "General Item"].includes(value)
    }
  },
  data() {
    return {
      weekSchedule: [],
      isOfficeOpenToday: false,
      todayName: "",
      currentDateTime: "",
      nextOpenDay: null,
      showScheduleModal: false,
    };
  },
  computed: {
    officeHours() {
      if (this.weekSchedule.length === 0) return null;

      const today = new Date();
      const todayIndex = today.getDay();

      const todaySchedule = this.weekSchedule[todayIndex] || {};
      const isOpen = todaySchedule.is_open;

      return {
        today: {
          open: isOpen ? this.formatTime(todaySchedule.opening_time) : "Closed",
          close: isOpen ? this.formatTime(todaySchedule.closing_time) : "-",
        }
      };
    },
    weekDays() {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return this.weekSchedule.map((day, index) => ({
        name: dayNames[index],
        isOpen: day.is_open,
        open: day.is_open ? this.formatTime(day.opening_time) : "Closed",
        close: day.is_open ? this.formatTime(day.closing_time) : "-",
      }));
    }
  },
  methods: {
    formatTime(timeStr) {
      if (!timeStr) return "N/A";
      try {
        const [hours, minutes] = timeStr.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      } catch {
        return timeStr;
      }
    },

    async loadOfficeHours() {
      try {
        const response = await fetch("http://localhost:5000/api/office-hours/week");
        if (!response.ok) throw new Error("Failed to fetch office hours");

        this.weekSchedule = await response.json();

        // Check if office is open today
        const today = new Date();
        const todayIndex = today.getDay();
        const todayData = this.weekSchedule[todayIndex];
        this.isOfficeOpenToday = todayData?.is_open || false;

        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        this.todayName = dayNames[todayIndex];

        // Find next open day
        this.findNextOpenDay();

        // Update current time
        this.updateCurrentDateTime();
      } catch (error) {
        console.error("❌ Error loading office hours:", error);
      }
    },

    findNextOpenDay() {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const today = new Date();
      let currentDay = today.getDay();

      // Check next 7 days
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (currentDay + i) % 7;
        const nextDayData = this.weekSchedule[nextDayIndex];

        if (nextDayData?.is_open) {
          const nextDate = new Date(today);
          nextDate.setDate(nextDate.getDate() + i);

          this.nextOpenDay = {
            name: dayNames[nextDayIndex],
            date: nextDate.toLocaleDateString(),
            open: this.formatTime(nextDayData.opening_time),
            close: this.formatTime(nextDayData.closing_time),
          };
          break;
        }
      }
    },

    updateCurrentDateTime() {
      const now = new Date();
      this.currentDateTime = now.toLocaleString();
    },
  },
  mounted() {
    this.loadOfficeHours();
    // Hide navbar when delivery notice is shown
    eventBus.emit('hideNavbar', true);
  },
  unmounted() {
    // Show navbar when delivery notice is hidden
    eventBus.emit('hideNavbar', false);
  }
};
</script>

<style scoped>
details > summary {
  list-style: none;
}

details > summary::-webkit-details-marker {
  display: none;
}

/* Modal animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-slide-enter-from {
  transform: scale(0.95);
  opacity: 0;
}

.modal-slide-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
