<template>
  <div
    class="min-h-screen flex flex-col bg-gradient-to-b from-gray-100 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 animate-fade-in"
  >
    <!-- Navigation Bar -->
    <nav class="bg-white dark:bg-gray-900 border-b p-3 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-b border-emerald-200 dark:border-emerald-900 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
            <div
              class="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0"
            >
              <span class="text-emerald-900 text-lg sm:text-2xl">🔍</span>
            </div>
            <h1 class="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-300 group-hover:text-emerald-700 dark:group-hover:text-yellow-400 transition-colors">CSU Lost & Found</h1>
          </router-link>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-1">
            <router-link
              to="/login"
              class="relative px-4 py-2 font-medium transition-all duration-300 rounded-full overflow-hidden group"
              :class="$route.path === '/login' && $route.query.tab !== 'register' ? 'bg-emerald-600 text-white' : 'text-gray-700 dark:text-gray-300'"
            >
              <span class="relative z-10 transition duration-300">Login</span>
              <span
                v-if="!($route.path === '/login' && $route.query.tab !== 'register')"
                class="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 group-hover:animate-emerald-slide transition-all duration-500"
              ></span>
            </router-link>

            <router-link
              to="/register"
              class="relative px-4 py-2 font-medium transition-all duration-300 rounded-full overflow-hidden group"
              :class="$route.query.tab === 'register' ? 'bg-emerald-600 text-white' : 'text-gray-700 dark:text-gray-300'"
            >
              <span class="relative z-10 transition duration-300">Register</span>
              <span
                v-if="$route.query.tab !== 'register'"
                class="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 group-hover:animate-emerald-slide transition-all duration-500"
              ></span>
            </router-link>

            <router-link
              to="/how-it-works"
              class="relative px-4 py-2 font-medium transition-all duration-300 rounded-full overflow-hidden group"
              :class="$route.path.toLowerCase() === '/how-it-works' ? 'bg-emerald-600 text-white' : 'text-gray-700 dark:text-gray-300'"
            >
              <span class="relative z-10 transition duration-300">How It Works</span>
              <span
                v-if="$route.path.toLowerCase() !== '/how-it-works'"
                class="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 group-hover:animate-emerald-slide transition-all duration-500"
              ></span>
            </router-link>

            <router-link
              to="/AboutUs"
              class="relative px-4 py-2 font-medium transition-all duration-300 rounded-full overflow-hidden group"
              :class="$route.path.toLowerCase() === '/aboutus' ? 'bg-emerald-600 text-white' : 'text-gray-700 dark:text-gray-300'"
            >
              <span class="relative z-10 transition duration-300">About Us</span>
              <span
                v-if="$route.path.toLowerCase() !== '/aboutus'"
                class="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 group-hover:animate-emerald-slide transition-all duration-500"
              ></span>
            </router-link>
          </div>

          <!-- Mobile Hamburger Menu Button -->
          <div class="md:hidden">
            <button
              @click="isMenuOpen = !isMenuOpen"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition duration-200"
            >
              <svg
                v-if="!isMenuOpen"
                class="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                v-else
                class="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation Menu -->
        <div
          v-show="isMenuOpen"
          class="md:hidden bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 py-2 space-y-1"
        >
          <router-link
            to="/login"
            class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition duration-200 font-medium"
            @click="isMenuOpen = false"
          >
            Login
          </router-link>
          <router-link
            to="/register"
            class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition duration-200 font-medium"
            @click="isMenuOpen = false"
          >
            Register
          </router-link>
          <router-link
            to="/how-it-works"
            class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition duration-200 font-medium"
            @click="isMenuOpen = false"
          >
            How It Works
          </router-link>
          <router-link
            to="/AboutUs"
            class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition duration-200 font-medium"
            @click="isMenuOpen = false"
          >
            About Us
          </router-link>
        </div>
      </div>
    </nav>

    <div class="flex-1 flex flex-col items-center justify-center p-6">
      <h1 class="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-gray-100">
        Register
      </h1>

      <!-- Note box -->
    <div
      class="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm p-3 rounded-md mb-6 border-l-4 border-yellow-500 dark:border-yellow-400 max-w-sm w-full shadow-sm"
    >
      <p class="font-semibold">Note:</p>
      <p class="mt-1">
        All new users are registered as
        <span class="text-yellow-600 dark:text-yellow-400 font-semibold">University Members</span> by
        default.
      </p>
    </div>

    <!-- Terms and Conditions Checkbox -->
    <div class="flex items-start space-x-2 max-w-sm mb-4 text-gray-700 dark:text-gray-300 text-sm">
      <input
        id="terms"
        type="checkbox"
        v-model="acceptedTerms"
        class="mt-1 w-4 h-4 accent-yellow-400"
      />
      <label for="terms" class="leading-tight">
        I agree to the
        <button
          type="button"
          @click="showModal = true"
          class="text-yellow-600 dark:text-yellow-400 hover:underline font-semibold"
        >
          Terms and Conditions
        </button>
        and Privacy Policy.
      </label>
    </div>

    <!-- Google Sign-Up Button -->
    <div
      id="googleSignUpButton"
      class="w-full max-w-sm transition-opacity"
      :class="{ 'opacity-40 pointer-events-none': !acceptedTerms }"
    ></div>

    <!-- Warning -->
    <p
      v-if="!acceptedTerms"
      class="mt-2 text-xs text-red-400 text-center max-w-sm"
    >
      Please accept the Terms and Conditions before signing up.
    </p>

    <!-- Already have an account -->
    <p class="mt-4 text-gray-600 dark:text-gray-400 text-sm">
      Already have an account?
      <router-link to="/login" class="text-yellow-600 dark:text-yellow-400 hover:underline">
        Sign In
      </router-link>
    </p>

    <!-- Loading text -->
    <p v-if="loading" class="mt-4 text-yellow-600 dark:text-yellow-400 text-sm animate-pulse">
      Setting up Google Sign-Up...
    </p>

    <!-- Modal -->
    <transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 flex items-center justify-center z-50 p-4"
      >
        <div
          class="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-2xl shadow-lg max-w-lg w-full p-6 relative border border-gray-200 dark:border-yellow-500/20"
        >
          <h2 class="text-xl font-semibold text-yellow-600 dark:text-yellow-400 mb-3">
            Terms and Conditions
          </h2>
          <div class="text-sm space-y-3 max-h-80 overflow-y-auto pr-2">
            <p>
              Welcome to the <span class="font-semibold">AI-Powered Campus Lost and Found System</span>.
              By creating an account, you agree to the responsible use of this platform for reporting
              and retrieving lost items within the Caraga State University community.
            </p>

            <p>
              This system uses <span class="text-yellow-600 dark:text-yellow-400">AI image recognition</span> to match
              found items with reported lost ones. Your data (including uploaded images and contact
              information) will be securely processed and stored in accordance with our privacy
              policy.
            </p>

            <p>
              Users must not upload inappropriate content or impersonate others. Any abuse of the
              system may result in account suspension or permanent ban.
            </p>

            <p>
              By continuing, you consent to the use of your information for improving system accuracy,
              research purposes, and record-keeping under Caraga State University’s data policies.
            </p>
          </div>

          <!-- Close Button -->
          <div class="mt-5 flex justify-end">
            <button
              @click="showModal = false"
              class="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>
    </div>
  </div>
</template>

<script setup>
/* global google */
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const isMenuOpen = ref(false);

const router = useRouter();
const loading = ref(true);
const acceptedTerms = ref(false);
const showModal = ref(false);

const handleCredentialResponse = async (response) => {
  if (!acceptedTerms.value) {
    alert("Please agree to the Terms and Conditions first.");
    return;
  }

  const token = response.credential;
  const role = "university_member"; // default role

  try {
    const res = await fetch("http://localhost:5000/api/auth/google-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, role }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    router.push("/userdashboard");
  } catch (err) {
    console.error("Registration error:", err);
    alert(err.message || "Registration failed. Please try again.");
  }
};

onMounted(async () => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/google-client-id");
    const data = await res.json();
    const clientId = data.clientId;

    const initGoogleButton = () => {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });
      google.accounts.id.renderButton(
        document.getElementById("googleSignUpButton"),
        {
          theme: "outline",
          size: "large",
          width: "300",
          text: "signup_with",
        }
      );
      loading.value = false;
    };

    if (
      !document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
    ) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogleButton;
      document.head.appendChild(script);
    } else {
      initGoogleButton();
    }
  } catch (err) {
    console.error("Failed to initialize Google Sign-Up:", err);
    alert("Failed to load Google Sign-Up. Please try again later.");
    loading.value = false;
  }
});
</script>

<style scoped>
#googleSignUpButton {
  display: flex;
  justify-content: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
