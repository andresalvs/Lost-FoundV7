<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-4 transition-colors duration-200">
    <!-- Success Container -->
    <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
      <!-- Success Icon -->
      <div class="mb-6 flex justify-center">
        <div class="w-24 h-24 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>

      <!-- Main Message -->
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Claim Submitted Successfully!
      </h1>

      <!-- Details -->
      <p class="text-lg text-gray-600 dark:text-gray-400 mb-6">
        The Security Staff will review your claim request and get back to you soon.
      </p>

      <!-- Item Info -->
      <div v-if="itemDetails" class="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-4 mb-6 text-left">
        <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
          <strong>Student ID:</strong> {{ itemDetails.student_id }}
        </p>
        <p class="text-sm text-gray-700 dark:text-gray-300">
          <strong>Location Found:</strong> {{ itemDetails.location }}
        </p>
      </div>

      <!-- Info Box -->
      <div class="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 mb-6 text-left">
        <p class="text-sm text-blue-800 dark:text-blue-200">
          <strong>What happens next?</strong>
        </p>
        <ul class="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
          <li>You can pick up your ID from the Security Office</li>
          <li>Security staff will verify if this is your ID</li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-3">
        <button
          @click="goToDashboard"
          class="w-full px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
        >
          Back to Dashboard
        </button>
        <button
          @click="goToHome"
          class="w-full px-6 py-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Go to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ClaimSubmitted",
  data() {
    return {
      itemDetails: null,
    };
  },
  mounted() {
    // Get item details from route params or localStorage
    try {
      const storedData = localStorage.getItem("claimSubmittedData");
      if (storedData) {
        this.itemDetails = JSON.parse(storedData);
        localStorage.removeItem("claimSubmittedData");
      }
    } catch (error) {
      console.error("Error loading claim submitted data:", error);
    }
  },
  methods: {
    goToDashboard() {
      this.$router.push("/userdashboard");
    },
    goToHome() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
