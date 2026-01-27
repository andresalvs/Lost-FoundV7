<template>
  <div class="min-h-screen w-full bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-4 py-10 pb-32">
    <!-- Rejection Container -->
    <div class="w-full max-w-2xl">
      <!-- Rejection Icon and Message -->
      <div class="text-center mb-10">
        <div class="flex justify-center mb-6">
          <div class="w-24 h-24 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-3">Claim Rejected</h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">Your claim request has been rejected</p>
      </div>

      <!-- Item Details Card -->
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Rejection Details</h2>
        
        <div v-if="!notification" class="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <p class="text-sm text-yellow-800 dark:text-yellow-200">No claim information found. Please return to the dashboard and try again.</p>
        </div>

        <div v-else class="space-y-6">
          <!-- Item Image and Info -->
          <div class="flex gap-6">
            <div class="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
              <img v-if="imageSrc" :src="imageSrc" alt="item image" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">No image</div>
            </div>

            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">{{ notification.display_name || 'Item' }}</h3>
              <div class="space-y-2 text-sm">
                <p v-if="notification.display_student_id" class="text-gray-600 dark:text-gray-400"><span class="font-semibold">Student ID:</span> {{ notification.display_student_id }}</p>
                <p v-if="notification.created_at" class="text-xs text-gray-500 dark:text-gray-500">Notified: {{ notification.created_at }}</p>
              </div>
            </div>
          </div>

          <!-- Rejection Reason Section -->
          <div>
            <p class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Reason</p>
            <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
              <p class="text-gray-900 dark:text-white">{{ notification.message }}</p>
            </div>
          </div>

          <!-- Next Steps -->
          <div>
            <p class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Next Steps</p>
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <p class="text-gray-900 dark:text-white text-sm">You can try to claim this item again or contact us for more information about why your claim was rejected.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="flex justify-center">
        <button
          @click="$router.back()"
          class="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserClaimRejected",
  data() {
    return {
      notification: null,
      item: null,
      imageSrc: null,
      apiBaseUrl: "http://localhost:5000",
    };
  },
  methods: {
    async loadNotification() {
      try {
        const cachedNotif = localStorage.getItem('claim_rejected_notification');
        if (cachedNotif) {
          this.notification = JSON.parse(cachedNotif);
          
          // Load the image if available
          if (this.notification.display_image) {
            this.imageSrc = this.apiBaseUrl + this.notification.display_image;
          }

          // Clear the cache
          localStorage.removeItem('claim_rejected_notification');
        }
      } catch (e) {
        console.error('Error loading claim rejected notification:', e);
      }
    },
  },
  mounted() {
    this.loadNotification();
  },
};
</script>
