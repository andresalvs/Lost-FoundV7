<template>
  <div class="admin-office-hours p-6">
    <h3 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Office Hours Management</h3>

    <!-- Edit Regular Hours -->
    <div class="mb-8 bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950  rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h4 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📅 Weekly Schedule</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div
          v-for="day in weekDays"
          :key="day.day_of_week"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <label class="font-semibold text-gray-900 dark:text-white">{{ day.day }}</label>
            <input
              v-model="day.is_open"
              type="checkbox"
              class="w-4 h-4 rounded"
            />
          </div>
          
          <div v-if="day.is_open" class="space-y-2">
            <div>
              <label class="text-xs text-gray-600 dark:text-gray-400">Opening Time</label>
              <input
                v-model="day.opening_time"
                type="time"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label class="text-xs text-gray-600 dark:text-gray-400">Closing Time</label>
              <input
                v-model="day.closing_time"
                type="time"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
          <div v-else class="text-center text-sm text-red-600 dark:text-red-400 font-semibold">Closed</div>
        </div>
      </div>

      <button
        @click="saveWeeklyHours"
        class="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium"
      >
        Save Weekly Schedule
      </button>
    </div>

    <!-- Add Special Closure -->
    <div class="mb-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h4 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">➕ Add Special Closure/Holiday</h4>
      
      <form @submit.prevent="addClosure" class="space-y-4 mb-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-1">Event Name *</label>
            <input
              v-model="newClosure.event_name"
              type="text"
              placeholder="e.g., Christmas Holiday"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-1">Closure Date *</label>
            <input
              v-model="newClosure.closure_date"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-1">Reason</label>
            <select
              v-model="newClosure.reason"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a reason</option>
              <option value="Holiday">Holiday</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Special Event">Special Event</option>
              <option value="Training">Training</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              <input v-model="newClosure.is_all_day" type="checkbox" class="mr-2" />
              All Day
            </label>
          </div>
        </div>

        <div v-if="!newClosure.is_all_day" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-1">Start Time</label>
            <input
              v-model="newClosure.closure_start_time"
              type="time"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-1">End Time</label>
            <input
              v-model="newClosure.closure_end_time"
              type="time"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-900 dark:text-white mb-1">Notes</label>
          <textarea
            v-model="newClosure.notes"
            placeholder="Additional details for users"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows="2"
          />
        </div>

        <button
          type="submit"
          class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
        >
          Add Closure
        </button>
      </form>
    </div>

    <!-- Upcoming Closures List -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h4 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📋 Upcoming Closures</h4>
      
      <div v-if="upcomingClosures.length === 0" class="text-center text-gray-600 dark:text-gray-400 py-8">
        No upcoming closures scheduled.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="closure in upcomingClosures"
          :key="closure.id"
          class="border border-orange-200 dark:border-orange-900/50 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/10 flex justify-between items-start"
        >
          <div>
            <p class="font-semibold text-gray-900 dark:text-white">{{ closure.event_name }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatDate(closure.closure_date) }}</p>
            <p v-if="closure.reason" class="text-sm text-gray-600 dark:text-gray-400">{{ closure.reason }}</p>
            <p v-if="closure.notes" class="text-sm text-gray-600 dark:text-gray-400 italic mt-1">{{ closure.notes }}</p>
            <p v-if="!closure.is_all_day" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {{ closure.closure_start_time }} - {{ closure.closure_end_time }}
            </p>
          </div>
          <button
            @click="deleteClosure(closure.id)"
            class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const API_BASE_URL = "http://localhost:5000";

const weekDays = ref([]);
const upcomingClosures = ref([]);

const newClosure = ref({
  event_name: "",
  closure_date: "",
  closure_start_time: "09:00",
  closure_end_time: "17:00",
  reason: "",
  notes: "",
  is_all_day: true,
});

const fetchWeeklyHours = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/office-hours/week`);
    const data = await response.json();
    weekDays.value = data;
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

const saveWeeklyHours = async () => {
  try {
    for (const day of weekDays.value) {
      await fetch(`${API_BASE_URL}/api/office-hours/${day.day_of_week}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opening_time: day.opening_time,
          closing_time: day.closing_time,
          is_open: day.is_open,
        }),
      });
    }
    alert("✅ Weekly schedule updated successfully!");
  } catch (error) {
    console.error("❌ Error saving weekly hours:", error);
    alert("Failed to save weekly schedule");
  }
};

const addClosure = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/office-hours/closure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClosure.value),
    });

    if (response.ok) {
      alert("✅ Closure added successfully!");
      newClosure.value = {
        event_name: "",
        closure_date: "",
        closure_start_time: "09:00",
        closure_end_time: "17:00",
        reason: "",
        notes: "",
        is_all_day: true,
      };
      await fetchUpcomingClosures();
    } else {
      const error = await response.json();
      alert(`❌ ${error.message}`);
    }
  } catch (error) {
    console.error("❌ Error adding closure:", error);
    alert("Failed to add closure");
  }
};

const deleteClosure = async (closureId) => {
  if (!confirm("Are you sure you want to delete this closure?")) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/office-hours/closure/${closureId}`,
      { method: "DELETE" }
    );

    if (response.ok) {
      alert("✅ Closure deleted successfully!");
      await fetchUpcomingClosures();
    } else {
      alert("Failed to delete closure");
    }
  } catch (error) {
    console.error("❌ Error deleting closure:", error);
    alert("Failed to delete closure");
  }
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

onMounted(() => {
  fetchWeeklyHours();
  fetchUpcomingClosures();
});
</script>

<style scoped>
.admin-office-hours {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
