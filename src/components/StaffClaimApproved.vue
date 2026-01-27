<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[99999] bg-white dark:bg-gray-950 overflow-y-auto">
      <div class="w-full flex flex-col">
        <!-- Green Background Header -->
        <div class="w-full bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 py-8 px-4">
          <!-- Success Icon and Message -->
          <div class="text-center">
            <div class="flex justify-center mb-6">
              <div class="w-24 h-24 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-green-600 dark:text-green-400 claim-success-svg" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-3">{{ data?.item_category === 'id' ? 'ID Returned!' : 'Item Returned!' }}</h1>
            <p class="text-lg text-gray-600 dark:text-gray-700">{{ data?.item_category === 'id' ? 'ID has been returned to the rightful owner' : 'Item has been returned to the rightful owner' }}</p>
          </div>
        </div>

        <!-- Success Container -->
        <div class="w-full flex flex-col items-center px-4 py-10">
          <div class="w-full max-w-2xl">
          <!-- Item Details Card -->
          <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 mb-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Approval Details</h2>
            
            <div class="space-y-6">
              <!-- Item Information -->
              <div>
                <p class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">{{ data?.item_category === 'id' ? 'ID Information' : 'Item Information' }}</p>
                <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <!-- Item Image/Icon -->
                  <div class="mb-4">
                    <div class="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-600 mx-auto">
                      <img v-if="data?.item_image_url" :src="`http://localhost:5000${data.item_image_url}`" :alt="data.item_name" class="w-full h-full object-cover" />
                      <div v-else class="text-center">
                        <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4m0 0L4 7m16 0l-8 4m0 0l-8-4m0 0v10l8 4m0-4l8-4" />
                        </svg>
                        <p class="text-xs text-gray-500">No image</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Item Details -->
                  <div class="space-y-3">
                    <div class="py-2 border-b border-gray-200 dark:border-gray-700">
                      <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{{ data?.item_category === 'id' ? 'Student Name' : 'Item Name' }}</p>
                      <p class="text-gray-900 dark:text-white font-semibold">{{ data?.item_name || (data?.item_category === 'id' ? 'Unknown ID' : 'Unknown Item') }}</p>
                    </div>
                    <div v-if="data?.claimant_name" class="py-2">
                      <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Returned To</p>
                      <p class="text-gray-900 dark:text-white font-semibold">{{ data.claimant_name }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Reporter Notification -->
              <div>
                <p class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Reporter Notification</p>
                <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 p-4 rounded-lg">
                  <div class="flex gap-2 mb-3">
                    <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <p class="text-sm text-emerald-900 dark:text-emerald-100 font-semibold">Notification Sent</p>
                  </div>
                  <p class="text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed">
                    "The <strong>{{ data?.item_name }}</strong> you reported has been successfully claimed by the rightful owner (<strong>{{ data?.claimant_name || 'Unknown claimant' }}</strong>). Thank you for your cooperation and for making our university a better place."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <div class="flex justify-center">
            <button
              @click="backToDashboard"
              class="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg"
            >
              Back to Dashboard
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useRouter } from 'vue-router';

defineProps({
  show: { type: Boolean, required: true },
  data: { type: Object, required: false }
});

const emit = defineEmits(["close"]);
const router = useRouter();
async function backToDashboard() {
  try {
    console.debug('[StaffClaimApproved] backToDashboard clicked');
    // Ask parent to close the modal first (keeps animation consistent)
    emit('close');
  } catch (e) {
    console.warn('[StaffClaimApproved] emit close failed', e);
  }

  try {
    await router.push('/security-dashboard');
  } catch (err) {
    console.error('[StaffClaimApproved] router push failed', err);
  }
}
</script>

<style scoped>
/* Fade + pop-in entrance for the approval modal */
.fade-enter-active, .fade-leave-active {
  transition: opacity 260ms ease, transform 260ms cubic-bezier(.2,.9,.3,1);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Small pop animation for the success SVG */
.claim-success-svg {
  transform-origin: center;
  animation: claim-pop 420ms cubic-bezier(.2,.9,.3,1) both;
}

@keyframes claim-pop {
  0% { transform: scale(.6) rotate(-8deg); opacity: 0; }
  60% { transform: scale(1.06) rotate(3deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
</style>
