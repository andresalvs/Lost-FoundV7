<template>
  <div
    class="min-h-screen flex flex-col bg-gradient-to-r from-emerald-50 dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 animate-fade-in"
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

    <!-- Main Content -->
    <div class="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div
  class="w-full max-w-sm sm:max-w-2xl bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-6 sm:p-10 space-y-6 sm:space-y-8 transition-colors duration-200"
    >
      <header class="text-center space-y-2">
        <h1 class="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-green-400">Campus Lost &amp; Found Access</h1>
        <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Use your @carsu.edu.ph email to sign in or register.
        </p>
      </header>

      <div class="flex bg-gray-200 dark:bg-gray-800/70 rounded-xl p-1">
        <button :class="tabClass('login')" @click="switchTab('login')">
          Sign In
        </button>
        <button :class="tabClass('register')" @click="switchTab('register')">
          Register
        </button>
      </div>

      <section v-if="activeTab === 'login'" class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div class="space-y-3 sm:space-y-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Login as</label>
            <div class="relative">
              <button
                @click="showRoleDropdown = !showRoleDropdown"
                class="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none transition duration-300 flex items-center justify-between hover:border-yellow-400"
              >
                <span>{{ role === 'university_member' ? 'University Member' : 'Security Staff' }}</span>
                <svg 
                  class="w-5 h-5 transition-transform duration-300" 
                  :class="{ 'rotate-180': showRoleDropdown }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              <div 
                v-if="showRoleDropdown"
                class="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border-2 border-yellow-400 rounded-xl shadow-lg z-50"
                @click.stop
              >
                <button
                  @click="role = 'university_member'; showRoleDropdown = false"
                  :class="{ 'bg-yellow-400 text-black': role === 'university_member' }"
                  class="w-full text-left px-4 py-3 text-gray-900 dark:text-white hover:bg-yellow-400 hover:text-black transition-colors first:rounded-t-xl font-medium"
                >
                  University Member
                </button>
                <button
                  @click="role = 'security'; showRoleDropdown = false"
                  :class="{ 'bg-yellow-400 text-black': role === 'security' }"
                  class="w-full text-left px-4 py-3 text-gray-900 dark:text-white hover:bg-yellow-400 hover:text-black transition-colors last:rounded-b-xl font-medium border-t border-gray-200 dark:border-gray-700"
                >
                  Security Staff
                </button>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Email</label>
            <input
              v-model="loginEmail"
              type="email"
              autocomplete="username"
              placeholder="your.name@carsu.edu.ph"
              class="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none transition duration-300"
            />
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Password</label>
            <div class="relative">
              <input
                v-model="loginPassword"
                :type="showLoginPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Enter password"
                class="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none transition duration-300 pr-12"
              />
              <button type="button" @click="showLoginPassword = !showLoginPassword" class="absolute inset-y-0 right-2 flex items-center text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400">
                <svg v-if="showLoginPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.99 9.99 0 012.192-5.877" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.6 6.6L17.4 17.4" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                </svg>
              </button>
            </div>
          </div>

          <button
            @click="handleManualLogin"
            class="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-800 transition duration-300"
          >
            Sign In Manually
          </button>
        </div>

        <div
          class="flex flex-col justify-between bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5 transition-colors duration-200"
        >
          <div>
            <p class="font-semibold text-gray-900 dark:text-gray-100 text-lg">Sign in with Google</p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
              Use your CarSU email. Choose your role first so we can send you to the right dashboard.
            </p>
          </div>

          <div class="relative py-2">
            <div id="googleButton" class="w-full flex justify-center"></div>
            <div
              v-if="!role"
              class="absolute inset-0 bg-transparent cursor-not-allowed"
              @click="showRoleError"
            ></div>
          </div>

          <ul class="text-xs text-gray-600 dark:text-gray-500 space-y-2 pt-2">
            <li>• University members are redirected to their dashboard.</li>
            <li>• Security staff will see the security dashboard.</li>
          </ul>
        </div>
      </section>

      <section v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div class="space-y-3 sm:space-y-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Email</label>
            <input
              v-model="registerEmail"
              type="email"
              autocomplete="email"
              placeholder="your.name@carsu.edu.ph"
              class="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none transition duration-300"
            />
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Password</label>
            <div class="relative">
              <input
                v-model="registerPassword"
                :type="showRegisterPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Create a password"
                class="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none transition duration-300 pr-12"
              />
              <button type="button" @click="showRegisterPassword = !showRegisterPassword" class="absolute inset-y-0 right-2 flex items-center text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400">
                <svg v-if="showRegisterPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.99 9.99 0 012.192-5.877" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.6 6.6L17.4 17.4" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Confirm Password</label>
            <div class="relative">
              <input
                v-model="registerConfirmPassword"
                :type="showRegisterConfirm ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Re-enter your password"
                class="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none transition duration-300 pr-12"
              />
              <button type="button" @click="showRegisterConfirm = !showRegisterConfirm" class="absolute inset-y-0 right-2 flex items-center text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400">
                <svg v-if="showRegisterConfirm" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.99 9.99 0 012.192-5.877" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.6 6.6L17.4 17.4" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex items-start space-x-3">
            <input
              id="terms"
              type="checkbox"
              v-model="acceptedTerms"
              class="mt-1 w-4 h-4 accent-yellow-400"
            />
            <label for="terms" class="text-sm text-gray-700 dark:text-gray-300 leading-tight">
              I agree to the platform’s Terms, Privacy Policy, and confirm this
              email is mine.
            </label>
          </div>

          <button
            @click="handleManualRegister"
            class="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-500 transition duration-300 disabled:opacity-60"
            :disabled="!acceptedTerms"
          >
            Register Manually
          </button>
        </div>

        <div
          class="flex flex-col justify-between bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5 transition-colors duration-200"
        >
          <div>
            <p class="font-semibold text-gray-900 dark:text-gray-100 text-lg">Register with Google</p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
              Google registration also creates a University Member account.
              Please accept the terms first.
            </p>
          </div>

          <div class="relative py-2">
            <div id="googleButtonRegister" class="w-full flex justify-center"></div>
            <div
              v-if="!acceptedTerms"
              class="absolute inset-0 bg-transparent cursor-not-allowed"
              @click="showTermsError"
            ></div>
          </div>

          <p class="text-xs text-gray-600 dark:text-gray-500 pt-2">
            Need a security staff account? Request one from an administrator so
            they can register it for you.
          </p>
        </div>
      </section>

      <div class="space-y-2">
        <p v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400 text-center">
          {{ errorMessage }}
        </p>
        <p v-if="successMessage" class="text-sm text-green-600 dark:text-green-400 text-center">
          {{ successMessage }}
        </p>
      </div>

      <div class="flex flex-col items-center space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <router-link to="/admin-login" class="text-gray-800 dark:text-yellow-400 hover:underline">
          Administrator? Sign in here.
        </router-link>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
import { jwtDecode } from "jwt-decode";
import { onMounted, ref, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";

// 🟢 ESLint fix
// eslint-disable-next-line no-unused-vars, no-undef
const __google_used = () => google;

const router = useRouter();
const route = useRoute();
const isMenuOpen = ref(false);

const activeTab = ref("login");
const role = ref("university_member");
const showRoleDropdown = ref(false);
const loginEmail = ref("");
const loginPassword = ref("");
const registerEmail = ref("");
const registerPassword = ref("");
const registerConfirmPassword = ref("");
const acceptedTerms = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showLoginPassword = ref(false);
const showRegisterPassword = ref(false);
const showRegisterConfirm = ref(false);

let clientId = "";
let googleScriptLoaded = false;
let googleInitialized = false;

// === Google Script Loading ===
const loadGoogleScript = () => {
  if (window.google) return Promise.resolve();
  if (googleScriptLoaded) {
    return new Promise((resolve) => {
      const check = () => window.google ? resolve() : setTimeout(check, 50);
      check();
    });
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src^="https://accounts.google.com/gsi/client"]');
    if (existing) {
      googleScriptLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleScriptLoaded = true;
      resolve();
    };
    script.onerror = (err) => {
      console.error("Failed to load Google Identity script", err);
      reject(err);
    };
    document.head.appendChild(script);
  });
};

// === Render Google Buttons Safely ===
const renderGoogleButton = (id, options) => {
  const container = document.getElementById(id);
  if (!container || !window.google) return;

  container.innerHTML = "";
  try {
    window.google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      width: 280,
      ...options,
    });
  } catch (err) {
    console.warn(`Failed to render Google button (${id}):`, err);
  }
};

const renderGoogleButtons = () => {
  nextTick(() => {
    setTimeout(() => {
      if (activeTab.value === "login") {
        renderGoogleButton("googleButton", { text: "continue_with" });
      } else {
        renderGoogleButton("googleButtonRegister", { text: "signup_with" });
      }
    }, 100);
  });
};

// === Initialize Google Identity Services ===
const initializeGoogle = () => {
  if (!window.google || googleInitialized) return;

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      const mode = activeTab.value === "register" ? "register" : "login";
      handleGoogleCredential(response, mode);
    },
  });

  googleInitialized = true;
  renderGoogleButtons();
};

// === Fetch Client ID & Initialize ===
const initGoogle = async () => {
  try {
    const res = await fetch("/api/auth/google-client-id");
    const data = await res.json();
    clientId = data.clientId;

    await loadGoogleScript();
    initializeGoogle();
  } catch (err) {
    console.error("Failed to initialize Google Sign-In:", err);
    errorMessage.value = "Failed to load Google Sign-In.";
  }
};

// === Tab Logic ===
const setTabFromQuery = () => {
  const tabQuery = String(route.query.tab || "").toLowerCase();
  activeTab.value = tabQuery === "register" ? "register" : "login";
};

const switchTab = (tab) => {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  errorMessage.value = "";
  successMessage.value = "";
  const query = tab === "register" ? { tab: "register" } : {};
  router.replace({ query }).catch(() => {});
};

const tabClass = (tab) => {
  const base = "flex-1 text-sm md:text-base font-semibold py-3 rounded-xl transition";
  if (activeTab.value === tab) {
    return `${base} bg-emerald-400 text-black`;
  }
  return `${base} text-gray-500 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400`;
};

// === Error Helpers ===
const showRoleError = () => {
  errorMessage.value = "Select your role before using Google sign-in.";
};

const showTermsError = () => {
  errorMessage.value = "Please accept the terms before continuing.";
};

// === Auth Handlers ===
const handleManualLogin = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  const email = loginEmail.value.trim().toLowerCase();
  if (!email.endsWith("@carsu.edu.ph")) {
    errorMessage.value = "Login email must end with @carsu.edu.ph.";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/simple-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: loginPassword.value,
        role: role.value,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      errorMessage.value = data.error || "Manual login failed.";
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    // After login, if user is a university member, check profile completeness
    if (data.user?.role === 'university_member') {
      const incomplete = await checkProfileIncomplete(data.token);
      if (incomplete) {
        successMessage.value = 'Please complete your profile information before continuing.';
        // Redirect to profile editor with next back to dashboard
        setTimeout(() => {
          try { router.push({ path: '/profile', query: { next: '/userdashboard' } }); } catch (e) { /* ignore */ }
        }, 700);
        return;
      }
    }

    successMessage.value = "Login successful! Redirecting...";
    redirectByRole(data.user?.role);
  } catch (err) {
    console.error("Manual login error:", err);
    errorMessage.value = "Unable to login right now.";
  }
};

const handleManualRegister = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  const email = registerEmail.value.trim().toLowerCase();
  if (!email) {
    errorMessage.value = "Registration email is required.";
    return;
  }
  if (!email.endsWith("@carsu.edu.ph")) {
    errorMessage.value = "Registration email must end with @carsu.edu.ph.";
    return;
  }
  if (!acceptedTerms.value) {
    showTermsError();
    return;
  }
  // Client-side password validation
  const pwd = registerPassword.value;
  const conf = registerConfirmPassword.value;
  const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!pwd) {
    errorMessage.value = "Password is required.";
    return;
  }
  if (pwd !== conf) {
    errorMessage.value = "Passwords do not match.";
    return;
  }
  if (!pwdRegex.test(pwd)) {
    errorMessage.value = "Password must be at least 8 chars and include uppercase, lowercase, number and symbol.";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/simple-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: registerPassword.value, confirmPassword: registerConfirmPassword.value }),
    });

    const data = await res.json();
    if (!res.ok) {
      errorMessage.value = data.error || "Registration failed.";
      return;
    }
  successMessage.value = "Registration pending — a verification email has been sent. Your account will be activated after you verify your email.";
    // Clear inputs and prevent auto-login until verification is confirmed
    registerEmail.value = "";
    registerPassword.value = "";
    registerConfirmPassword.value = "";
    acceptedTerms.value = false;

    // Auto-redirect to login page after a short delay so the user can sign in after verifying
    setTimeout(() => {
      // switch to login tab and route to /login
      try { router.push('/login'); } catch (e) { /* ignore */ }
    }, 3500);
  } catch (err) {
    console.error("Manual registration error:", err);
    errorMessage.value = "Unable to register right now.";
  }
};

const handleGoogleCredential = async (response, mode) => {
  errorMessage.value = "";
  successMessage.value = "";

  if (mode === "register") {
    if (!acceptedTerms.value) {
      showTermsError();
      return;
    }
    await processGoogleRegister(response.credential);
  } else {
    if (!role.value) {
      showRoleError();
      return;
    }
    await processGoogleLogin(response.credential);
  }
};

const processGoogleLogin = async (googleToken) => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: googleToken, role: role.value }),
    });

    const data = await res.json();
    if (!res.ok) {
      errorMessage.value = data.error || "Google sign-in failed.";
      return;
    }

    if (!data.token || !data.user) {
      errorMessage.value = "Invalid response from server.";
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // If university member, check profile completeness before redirecting
    if (data.user?.role === 'university_member') {
      const incomplete = await checkProfileIncomplete(data.token);
      if (incomplete) {
        successMessage.value = 'Please complete your profile information before continuing.';
        setTimeout(() => {
          try { router.push({ path: '/profile', query: { next: '/userdashboard' } }); } catch (e) { /* ignore */ }
        }, 700);
        return;
      }
    }

    redirectByRole(data.user.role);
  } catch (err) {
    console.error("Google login error:", err);
    errorMessage.value = "Login failed. Please try again.";
  }
};

// Helper: return true when profile is incomplete
const checkProfileIncomplete = async (token) => {
  try {
    const resp = await fetch("http://localhost:5000/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return false; // if cannot check, don't block
    const data = await resp.json();
    const isIncomplete = !data.full_name || !data.department || !data.contact_number || !data.birthday || !data.profile_picture;
    return !!isIncomplete;
  } catch (err) {
    console.error('Profile completeness check failed:', err);
    return false;
  }
};

// ✅ UPDATED: processGoogleRegister now shows verification email message
const processGoogleRegister = async (googleToken) => {
  try {
    // Send the Google token to the backend for registration
    const res = await fetch("http://localhost:5000/api/auth/google-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: googleToken, role: "university_member" }),
    });

    const data = await res.json();
    if (!res.ok) {
      errorMessage.value = data.error || "Google registration failed.";
      return;
    }

  // Backend sends verification email. Do NOT auto-login until email is verified.
  successMessage.value = "Registration pending — a verification email has been sent. Your account will be activated after you verify your email.";

  // Auto-redirect to login so user can sign in after verifying their email
  setTimeout(() => {
    try { router.push('/login'); } catch (e) { /* ignore */ }
  }, 3500);
  } catch (err) {
    console.error("Google registration error:", err);
    errorMessage.value = "Google registration failed.";
  }
};

const redirectByRole = (userRole) => {
  setTimeout(() => {
    if (userRole === "university_member") router.push("/userdashboard");
    else if (userRole === "security") router.push("/security-dashboard");
    else if (userRole === "admin") router.push("/admin-dashboard");
    else router.push("/");
  }, 600);
};

// === Lifecycle & Watchers ===
onMounted(() => {
  setTabFromQuery();
  initGoogle();
});

watch(
  () => route.query.tab,
  () => setTabFromQuery(),
  { immediate: true }
);

watch(activeTab, () => {
  renderGoogleButtons();
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>