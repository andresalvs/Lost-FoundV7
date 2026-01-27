<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
      <!-- Header with Success Icon -->
      <div class="bg-gradient-to-r from-emerald-500 to-green-500 p-8 text-center">
        <div class="text-6xl mb-4">✅</div>
        <h2 class="text-2xl font-bold text-white">Item Received!</h2>
      </div>

      <!-- Message Content -->
      <div class="p-8">
        <p class="text-gray-700 dark:text-gray-300 text-center mb-6">
          The item you delivered or turned over to the security office has been <strong>received successfully</strong>. 
        </p>

        <!-- Item Details -->
        <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 mb-6 border border-emerald-200 dark:border-emerald-700">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <strong>Item:</strong> {{ itemName || 'Your Item' }}
          </p>
          <p v-if="itemId" class="text-sm text-gray-600 dark:text-gray-400">
            <strong>ID:</strong> {{ itemId }}
          </p>
        </div>

        <!-- Thank You Message -->
        <p class="text-center text-gray-600 dark:text-gray-400 text-sm mb-8">
          Thank you for your cooperation!
        </p>

        <!-- OK Button -->
        <button
          @click="close"
          class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ItemReceivedModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    itemName: {
      type: String,
      default: null
    },
    itemId: {
      type: String,
      default: null
    }
  },
  emits: ['close'],
  methods: {
    close() {
      this.$emit('close');
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
      } else {
        // Restore body scroll when modal is closed
        document.body.style.overflow = '';
      }
    }
  },
  beforeUnmount() {
    // Restore body scroll on component unmount
    document.body.style.overflow = '';
  }
};
</script>

<style scoped>
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}
</style>
