<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 pb-28">
    <div v-if="notification" class="max-w-2xl mx-auto">
      <!-- Green Header Section -->
      <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-t-2xl px-8 py-8 text-center border-b border-green-200 dark:border-green-700/50">
        <svg class="w-16 h-16 mx-auto mb-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h1>
        <p class="text-gray-700 dark:text-gray-200">Your report has been acknowledged</p>
      </div>

      <!-- Main Content Card -->
      <div class="bg-white dark:bg-gray-800 rounded-b-2xl shadow-lg px-8 py-8 space-y-6">
        <!-- Item Image or Icon -->
        <div class="flex justify-center mb-6">
          <div v-if="imageSrc" class="w-40 h-40 rounded-lg overflow-hidden shadow-md">
            <img :src="imageSrc" :alt="notification.display_name || 'Item'" class="w-full h-full object-cover">
          </div>
          <div v-else :class="notification.item_category === 'id' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'" class="w-40 h-40 rounded-lg flex items-center justify-center shadow-md">
            <svg v-if="notification.item_category === 'id'" class="w-20 h-20 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 6H5a2 2 0 00-2 2v10a2 2 0 002 2h5M10 6l4 4m0 0l4-4m-4 4v10m0 0H9m11 0h5a2 2 0 002-2V8a2 2 0 00-2-2h-5m0 0l-4-4m4 4l4-4" />
            </svg>
            <svg v-else class="w-20 h-20 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <!-- Item Information -->
        <div class="border-l-4 border-green-500 pl-4">
          <p class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ notification.item_category === 'id' ? 'ID Information' : 'Item Information' }}</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ notification.display_name || 'Unknown Item' }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">{{ formattedDate }}</p>
        </div>

        <!-- Notification Message -->
        <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
          <p class="text-gray-800 dark:text-gray-200 leading-relaxed">{{ notification.message }}</p>
        </div>

        <!-- Additional Details Grid -->
        <div v-if="notification.display_student_id" class="grid grid-cols-1 gap-4">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
            <p class="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">ID Number</p>
            <p class="text-lg font-bold text-gray-900 dark:text-white mt-2">{{ notification.display_student_id }}</p>
          </div>
        </div>

        <!-- Thank You Section -->
        <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-700/50">
          <p class="font-semibold text-gray-900 dark:text-white text-lg">Your contribution matters</p>
          <p class="text-sm text-gray-700 dark:text-gray-300 mt-2">Your report played an important role in making the recovery process smooth and efficient. Thank you for supporting our Lost and Found system!</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4">
          <button 
            @click="$router.push('/userdashboard')" 
            class="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="text-gray-600 dark:text-gray-400 text-lg font-medium">No acknowledgement to show</p>
        <button 
          @click="$router.push('/userdashboard')" 
          class="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition duration-200"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Acknowledge',
  data() {
    return {
      notification: null,
      // no confirm flow here — this page is a simple thank-you/details view
    };
  },
  computed: {
    formattedDate() {
      if (!this.notification || !this.notification.created_at) return '';
      try {
        return new Date(this.notification.created_at).toLocaleString();
      } catch (e) {
        return this.notification.created_at;
      }
    },
    imageSrc() {
      if (!this.notification) return null;
      const API_BASE_URL = 'http://localhost:5000';
      const candidates = [
        this.notification.display_image,
        this.notification.item_image_url,
        this.notification.image_url,
        this.notification.image,
        this.notification.photo,
        this.notification.imagePath,
        this.notification.image_path
      ];
      const raw = candidates.find(Boolean);
      if (!raw) return null;
      if (/^https?:\/\//i.test(raw)) return raw;
      if (raw.startsWith('/')) return `${API_BASE_URL}${raw}`;
      return `${API_BASE_URL}/uploads/items/${raw}`;
    }
  },
  mounted() {
    try {
      const raw = localStorage.getItem('acknowledge_notification');
      if (raw) this.notification = JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to load acknowledge notification:', e);
      this.notification = null;
    }
  },
  methods: {
    async deleteAndGoBack() {
      if (!this.notification) {
        this.$router.push('/userdashboard');
        return;
      }

      try {
        const notificationId = this.notification.notification_id || this.notification.id;
        const matchId = this.notification.match_id;
        const user = JSON.parse(localStorage.getItem('user')) || {};
        const API_BASE = 'http://localhost:5000';

        if (notificationId) {
          // Delete the notification
          await fetch(`${API_BASE}/api/notifications/${encodeURIComponent(notificationId)}/clear`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
          });
        } else if (matchId) {
          // Clear the synthesized match notification
          await fetch(`${API_BASE}/api/notifications/match/${encodeURIComponent(matchId)}/clear`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id }),
          });
        }

        // Clear localStorage
        try { localStorage.removeItem('acknowledge_notification'); } catch (e) { /* ignore */ }

        // Redirect back to dashboard
        this.$router.push('/userdashboard');
      } catch (e) {
        console.error('Failed to delete notification:', e);
        alert('Failed to delete notification. Please try again.');
      }
    }
  }
};
</script>

<style scoped>
/* keep styles simple — rely on Tailwind, but allow small local overrides */
</style>
