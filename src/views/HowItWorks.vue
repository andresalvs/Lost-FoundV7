<template>
  <div
    class="min-h-screen flex flex-col justify-between bg-gradient-to-b from-emerald-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-gray-900 dark:text-white transition-colors duration-500 overflow-hidden"
  >
    <!-- Header -->
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
    <main class="relative flex flex-col items-center justify-center text-center px-4 sm:px-6 py-8 sm:py-16 lg:py-20">
      <!-- Hero Icon -->
      <div
        class="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center mb-4 sm:mb-5 lg:mb-6 shadow-lg animate-bounce-slow flex-shrink-0"
      >
        <span class="text-2xl sm:text-3xl lg:text-6xl">⚙️</span>
      </div>

      <!-- Title -->
      <h2 class="text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 sm:mb-3 lg:mb-4 animate-slide-up leading-tight">
        <span class="bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-400 dark:to-yellow-400 bg-clip-text text-transparent">
          How It Works
        </span>
      </h2>

      <!-- Subtitle -->
      <p
        class="text-xs sm:text-sm lg:text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed mb-8 sm:mb-10 lg:mb-12 animate-slide-up animation-delay-1"
      >
        Three simple steps to reunite with your lost belongings
      </p>
    </main>

    <!-- Process Steps Section -->
    <section class="relative px-4 sm:px-6 py-10 sm:py-14 lg:py-16 bg-white dark:bg-slate-900/50">
      <div class="max-w-4xl mx-auto">
        <!-- Step 1: Report -->
        <div class="mb-8 sm:mb-10 lg:mb-12 animate-slide-up animation-delay-1">
          <div class="flex flex-col lg:flex-row lg:items-center lg:gap-8">
            <!-- Step Number -->
            <div class="flex-shrink-0 mb-4 lg:mb-0">
              <div
                class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg mx-auto lg:mx-0"
              >
                <span class="text-2xl sm:text-3xl">📸</span>
              </div>
            </div>
            <!-- Content -->
            <div class="flex-1 text-left">
              <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-900 dark:text-emerald-300 mb-2 sm:mb-3">
                Step 1: Report
              </h3>
              <p class="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-2 sm:mb-3">
                Upload photos of your lost item
              </p>
              <p class="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Quickly report your lost item by uploading clear photos and providing details such as the item description, location where it was lost, and contact information. The more details you provide, the better our matching system can help you.
              </p>
            </div>
          </div>
          <!-- Connecting Line -->
          <div class="hidden lg:flex justify-center my-6">
            <div class="h-12 w-1 bg-gradient-to-b from-emerald-400 to-yellow-400"></div>
          </div>
        </div>

        <!-- Step 2: Match -->
        <div class="mb-8 sm:mb-10 lg:mb-12 animate-slide-up animation-delay-2">
          <div class="flex flex-col lg:flex-row lg:items-center lg:gap-8">
            <!-- Step Number -->
            <div class="flex-shrink-0 mb-4 lg:mb-0">
              <div
                class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg mx-auto lg:mx-0"
              >
                <span class="text-2xl sm:text-3xl">🤖</span>
              </div>
            </div>
            <!-- Content -->
            <div class="flex-1 text-left">
              <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-900 dark:text-emerald-300 mb-2 sm:mb-3">
                Step 2: Match
              </h3>
              <p class="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-2 sm:mb-3">
                AI finds items that match your report
              </p>
              <p class="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Our system automatically checks all reported found items and compares them with your lost item report. It looks at photos, descriptions, and details to find the closest match for you.
              </p>
            </div>
          </div>
          <!-- Connecting Line -->
          <div class="hidden lg:flex justify-center my-6">
            <div class="h-12 w-1 bg-gradient-to-b from-yellow-400 to-emerald-400"></div>
          </div>
        </div>

        <!-- Step 3: Claim -->
        <div class="animate-slide-up animation-delay-3">
          <div class="flex flex-col lg:flex-row lg:items-center lg:gap-8">
            <!-- Step Number -->
            <div class="flex-shrink-0 mb-4 lg:mb-0">
              <div
                class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg mx-auto lg:mx-0"
              >
                <span class="text-2xl sm:text-3xl">✅</span>
              </div>
            </div>
            <!-- Content -->
            <div class="flex-1 text-left">
              <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-900 dark:text-emerald-300 mb-2 sm:mb-3">
                Step 3: Claim
              </h3>
              <p class="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-2 sm:mb-3">
                Verify and reclaim your belongings
              </p>
              <p class="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Once a match is found, you'll be notified immediately. Simply verify if it’s your item and proceed to the security office for pickup. Our platform guarantees a safe and verified handover for both parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why It Works Section -->
    <section class="relative px-4 sm:px-6 py-10 sm:py-14 lg:py-16 bg-gradient-to-b from-emerald-50 to-white dark:from-slate-900/50 dark:to-slate-900/20">
      <div class="max-w-3xl mx-auto">
        <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-8 sm:mb-10 text-center text-emerald-900 dark:text-emerald-300 animate-slide-up">Why Our System Works</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <!-- Feature 1 -->
          <div class="p-5 sm:p-6 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-800/30 dark:to-slate-900/30 hover:shadow-lg transition-shadow animate-slide-up animation-delay-1">
            <div class="text-2xl sm:text-3xl mb-3">⚡</div>
            <h4 class="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2">Fast & Efficient</h4>
            <p class="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Automated matching saves hours of searching and calling around campus.</p>
          </div>

          <!-- Feature 2 -->
          <div class="p-5 sm:p-6 rounded-xl border border-yellow-200 dark:border-yellow-900/30 bg-gradient-to-br from-yellow-50/50 to-white dark:from-slate-800/20 dark:to-slate-900/30 hover:shadow-lg transition-shadow animate-slide-up animation-delay-2">
            <div class="text-2xl sm:text-3xl mb-3">🔒</div>
            <h4 class="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2">Secure & Safe</h4>
            <p class="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Verified identities and secure transactions protect both finders and owners.</p>
          </div>

          <!-- Feature 3 -->
          <div class="p-5 sm:p-6 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-800/30 dark:to-slate-900/30 hover:shadow-lg transition-shadow animate-slide-up animation-delay-3">
            <div class="text-2xl sm:text-3xl mb-3">🎯</div>
            <h4 class="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2">Accurate Matching</h4>
            <p class="text-xs sm:text-sm text-gray-700 dark:text-gray-300">AI technology ensures you find the right item with high accuracy.</p>
          </div>

          <!-- Feature 4 -->
          <div class="p-5 sm:p-6 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-800/30 dark:to-slate-900/30 hover:shadow-lg transition-shadow animate-slide-up animation-delay-4">
            <div class="text-2xl sm:text-3xl mb-3">🌐</div>
            <h4 class="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2">Community Powered</h4>
            <p class="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Join thousands of CSU students and staff helping each other daily.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative px-4 sm:px-6 py-10 sm:py-14 lg:py-16 bg-white dark:bg-slate-900 border-t border-emerald-200 dark:border-emerald-900">
      <div class="max-w-2xl mx-auto text-center">
        <h3 class="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 lg:mb-6 text-emerald-900 dark:text-emerald-300 animate-slide-up">Ready to Get Started?</h3>
        <p class="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed animate-slide-up animation-delay-1">
          Start your journey to finding your lost belongings today. It's simple, fast, and secure.
        </p>
        
        <router-link
          to="/login"
          class="inline-block px-6 sm:px-8 py-2.5 sm:py-3 lg:py-3.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg animate-slide-up animation-delay-2 active:scale-95 text-sm sm:text-base whitespace-nowrap"
        >
          🚀 Report Lost Item
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative text-center py-3 sm:py-4 lg:py-6 text-gray-500 dark:text-gray-400 text-xs sm:text-xs lg:text-sm border-t border-emerald-200 dark:border-emerald-900 animate-fade-in z-10">
      © {{ currentYear }} Caraga State University • Lost & Found System
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const currentYear = new Date().getFullYear()
const isMenuOpen = ref(false)
</script>

<style scoped>
@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-slide-down {
  animation: slide-down 0.6s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.6s ease-out forwards;
  opacity: 0;
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

.animation-delay-1 { animation-delay: 0.15s; }
.animation-delay-2 { animation-delay: 0.3s; }
.animation-delay-3 { animation-delay: 0.45s; }
.animation-delay-4 { animation-delay: 0.6s; }
.animation-delay-5 { animation-delay: 0.75s; }
</style>