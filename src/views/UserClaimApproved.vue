<template>
  <div class="min-h-screen w-full bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-4 py-10 pb-32">
    <!-- Success Container -->
    <div class="w-full max-w-2xl">
      <!-- Success Icon and Message -->
      <div class="text-center mb-10">
        <div class="flex justify-center mb-6">
          <div class="w-24 h-24 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-3">{{ (notification?.category === 'id' || notification?.category === 'id_number_match') ? 'ID Returned!' : 'Item Returned!' }}</h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">{{ (notification?.category === 'id' || notification?.category === 'id_number_match') ? 'Your ID has been successfully returned' : 'Your item has been successfully returned' }}</p>
      </div>

      <!-- Item Details Card -->
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Return Details</h2>
        
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
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">{{ notification.display_name || ((notification?.category === 'id' || notification?.category === 'id_number_match') ? 'ID' : 'Item') }}</h3>
              <div class="space-y-2 text-sm">
                <p v-if="notification.display_student_id" class="text-gray-600 dark:text-gray-400"><span class="font-semibold">Student ID:</span> {{ notification.display_student_id }}</p>
                <p v-if="notification.display_description" class="text-gray-600 dark:text-gray-400">{{ notification.display_description }}</p>
                <p v-if="notification.created_at" class="text-xs text-gray-500 dark:text-gray-500">Notified: {{ notification.created_at }}</p>
              </div>
            </div>
          </div>

          <!-- Report Details Section -->
          <div>
            <p class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Report Details</p>
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
              <div v-if="notification.message" class="py-2 border-b border-gray-200 dark:border-gray-700">
                <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Message</p>
                <p class="text-gray-900 dark:text-white">{{ notification.message }}</p>
              </div>
              <div v-if="notification.matched_location" class="py-2 border-b border-gray-200 dark:border-gray-700">
                <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Location</p>
                <p class="text-gray-900 dark:text-white">{{ notification.matched_location }}</p>
              </div>
              <div v-if="notification.claimant_name" class="py-2 border-b border-gray-200 dark:border-gray-700">
                <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Returned To</p>
                <p class="text-gray-900 dark:text-white font-semibold">{{ notification.claimant_name }}</p>
              </div>
              <div v-if="notification.claim_status" class="py-2">
                <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Status</p>
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-gray-900 dark:text-white font-semibold capitalize">{{ notification.claim_status }}</span>
                </div>
              </div>
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
  name: "UserClaimApproved",
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
        const raw = localStorage.getItem("claim_approved_notification") || localStorage.getItem("acknowledge_notification");
        if (!raw) return;
        const parsed = JSON.parse(raw);
        this.notification = parsed;

        // Try to fetch the item if an id is present
        const id = parsed.found_item_id || parsed.item_id || parsed.matched_item_id || null;
        if (id) {
          try {
            const res = await fetch(`${this.apiBaseUrl}/api/items/${id}`);
            if (res.ok) {
              this.item = await res.json();
            }
          } catch (e) {
            console.warn('Failed to fetch item details:', e);
          }
        }

        // Resolve image candidate
        const rawImage = (this.item && (this.item.image_url || this.item.image || this.item.photo)) || parsed.display_image || null;
        if (rawImage) {
          if (rawImage.startsWith("/")) {
            this.imageSrc = `${this.apiBaseUrl}${rawImage}`;
          } else {
            this.imageSrc = rawImage;
          }
        }
      } catch (e) {
        console.error('Error loading claim approved data:', e);
      }
    },
    // no download/open controls as requested
  },
  mounted() {
    this.loadNotification();
  }
};
</script>

<style scoped>
.filter-blur {
  filter: blur(6px);
}
</style>
