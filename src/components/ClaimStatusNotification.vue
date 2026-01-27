<template>
  <div v-if="claimNotifications.length > 0" class="space-y-3 mb-6">
    <div
      v-for="notif in claimNotifications"
      :key="notif.id"
      class="p-4 rounded-lg border-l-4 shadow-md animate-fade-in transition-all duration-300"
      :class="notif.type === 'claim_approved' 
        ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20 dark:border-l-green-400' 
        : 'border-l-red-500 bg-red-50 dark:bg-red-900/20 dark:border-l-red-400'"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3 flex-1">
          <!-- Status Icon -->
          <div
            :class="notif.type === 'claim_approved'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'"
            class="flex-shrink-0 mt-1"
          >
            <svg v-if="notif.type === 'claim_approved'" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>

          <!-- Text Content -->
          <div class="flex-1">
            <h3
              :class="notif.type === 'claim_approved'
                ? 'text-green-900 dark:text-green-100'
                : 'text-red-900 dark:text-red-100'"
              class="font-semibold text-sm mb-1"
            >
              {{ notif.type === 'claim_approved' ? '✅ Claim Approved' : '❌ Claim Rejected' }}
            </h3>
            <p
              :class="notif.type === 'claim_approved'
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'"
              class="text-sm mb-2"
            >
              {{ notif.message }}
            </p>
            <!-- Item info if available -->
            <p v-if="notif.item_name" class="text-xs text-gray-600 dark:text-gray-400">
              Item: <span class="font-medium">{{ notif.item_name }}</span>
            </p>
            <p v-if="notif.created_at" class="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {{ formatDate(notif.created_at) }}
            </p>
          </div>
        </div>

        <!-- Dismiss Button -->
        <button
          @click="dismissNotification(notif.id)"
          class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          title="Dismiss"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Action button for approved claims -->
      <div v-if="notif.type === 'claim_approved'" class="mt-3 flex gap-2">
        <button
          @click="viewItemDetails(notif.item_id)"
          class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition"
        >
          View Item Details
        </button>
      </div>

      <!-- Action button for rejected claims -->
      <div v-if="notif.type === 'claim_rejected'" class="mt-3 flex gap-2">
        <button
          @click="resubmitClaim(notif.item_id)"
          class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
        >
          Review & Resubmit
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ClaimStatusNotification",
  props: {
    notifications: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    claimNotifications() {
      return (this.notifications || []).filter(notif =>
        ["claim_approved", "claim_rejected"].includes(notif.type)
      );
    },
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return "";
      try {
        const date = new Date(dateStr);
        return date.toLocaleString();
      } catch {
        return dateStr;
      }
    },

    dismissNotification(notifId) {
      this.$emit("dismiss", notifId);
    },

    viewItemDetails(itemId) {
      this.$emit("view-item", itemId);
    },

    resubmitClaim(itemId) {
      this.$emit("resubmit-claim", itemId);
    },
  },
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
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
