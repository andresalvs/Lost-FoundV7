<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
    <div class="max-w-xl w-full p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
      <!-- Status Icon -->
      <div class="flex justify-center mb-6">
        <div v-if="status === 'checking'" class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 dark:border-emerald-400"></div>
        <div v-else-if="status === 'success'" class="bg-green-100/80 dark:bg-green-900/30 p-4 rounded-full">
          <svg class="h-8 w-8 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div v-else-if="status === 'failed'" class="bg-red-100/80 dark:bg-red-900/30 p-4 rounded-full">
          <svg class="h-8 w-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
      </div>

      <!-- Title and Message -->
      <h2 class="text-2xl font-bold text-center mb-4 text-emerald-600 dark:text-emerald-400">Email Verification</h2>
      <div class="text-center mb-8">
        <p v-if="status === 'checking'" class="text-gray-700 dark:text-gray-300 text-lg">
          Verifying your email address<span class="animate-pulse">...</span>
        </p>
        <div v-else-if="status === 'success'" class="space-y-2">
          <p class="text-green-600 dark:text-green-400 text-lg font-medium">Verification Successful!</p>
          <p class="text-gray-600 dark:text-gray-400">Your email has been verified. You can now proceed to login.</p>
          <p v-if="countdown > 0" class="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to login in {{ countdown }} seconds...
          </p>
        </div>
        <div v-else-if="status === 'failed'" class="space-y-2">
          <p class="text-red-600 dark:text-red-400 text-lg font-medium">Verification Failed</p>
          <p class="text-gray-600 dark:text-gray-400">The verification link has expired or is invalid.</p>
          <p class="text-gray-600 dark:text-gray-400">Please request a new verification email.</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-3">
        <!-- Show appropriate login link based on role decoded from token -->
        <router-link
          v-if="loginPath"
          :to="loginPath"
          class="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-xl text-center transition duration-300"
        >
          Go to Login
        </router-link>
        <router-link 
          to="/" 
          class="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300 font-medium rounded-xl text-center transition duration-300">
          Return to Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  beforeUnmount() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  },
  name: 'VerifyEmail',
  data() {
    return {
      status: 'checking',
      countdown: 5, // 5 second countdown before auto-redirect
      countdownTimer: null,
      loginPath: null,
    };
  },
  async mounted() {
    const token = this.$route.query.token;
    const statusFromQuery = this.$route.query.status;
    const roleFromQuery = this.$route.query.role;

    // Determine login target: prefer decoding the token (most reliable),
    // otherwise fall back to a role query param provided by the server.
    let decoded = null;
    if (token) {
      decoded = this.decodeJwtPayload(token);
      if (decoded?.role) {
        this.loginPath = decoded.role === 'admin' ? '/admin-login' : '/login';
      } else {
        this.loginPath = '/login';
      }
    } else if (roleFromQuery) {
      // backend redirects after registration with ?status=success&role=xyz
      this.loginPath = roleFromQuery === 'admin' ? '/admin-login' : '/login';
    } else {
      this.loginPath = '/login';
    }

    // If redirected from server with status query param (e.g. after email change)
    if (statusFromQuery === 'success') {
      this.status = 'success';

      // Start countdown when either a token or role is present so the page
      // behaves consistently for admin email-changes and registration flows
      if (token || roleFromQuery) {
        this.startCountdown();
      }

      return;
    }

    // Otherwise, call the backend verify endpoint (registration flows)
    if (!token) {
      this.status = 'failed';
      return;
    }

    try {
      const resp = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (resp.ok) {
        this.status = 'success';

        // Start countdown for redirection to the appropriate login (user or admin)
        this.startCountdown();
      } else {
        this.status = 'failed';
      }
    } catch (err) {
      console.error('Verification request failed', err);
      this.status = 'failed';
    }
  },
  methods: {
    // Decode JWT payload without verifying signature (safe for client-side routing decisions only)
    decodeJwtPayload(token) {
      try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        // base64url to base64
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        // pad
        while (base64.length % 4) base64 += '=';
        const json = atob(base64);
        return JSON.parse(json);
      } catch (e) {
        console.warn('Failed to decode token payload', e);
        return null;
      }
    },
    startCountdown() {
      this.countdownTimer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          clearInterval(this.countdownTimer);
          // Redirect based on decoded loginPath (default to user login)
          const target = this.loginPath || '/login';
          this.$router.push(target);
        }
      }, 1000);
    },
  },
};
</script>

<style scoped>
/* minimal styling; project uses Tailwind so this may not be necessary */
</style>
