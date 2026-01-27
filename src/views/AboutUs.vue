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
              :class="$route.path === '/how-it-works' ? 'bg-emerald-600 text-white' : 'text-gray-700 dark:text-gray-300'"
            >
              <span class="relative z-10 transition duration-300">How It Works</span>
              <span
                v-if="$route.path !== '/how-it-works'"
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
        <span class="text-2xl sm:text-3xl lg:text-6xl">👥</span>
      </div>

      <!-- Title -->
      <h2 class="text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 sm:mb-3 lg:mb-4 animate-slide-up leading-tight">
        <span class="bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-400 dark:to-yellow-400 bg-clip-text text-transparent">
          Our Story
        </span>
      </h2>

      <!-- Subtitle -->
      <p
        class="text-xs sm:text-sm lg:text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed mb-8 sm:mb-10 lg:mb-12 animate-slide-up animation-delay-1"
      >
        Building a better campus community through technology and care
      </p>
    </main>

    <!-- Story Section -->
    <section class="relative px-4 sm:px-6 py-10 sm:py-14 lg:py-16 bg-white dark:bg-slate-900/50">
      <div class="max-w-3xl mx-auto space-y-6 sm:space-y-8 lg:space-y-10">
        <!-- Story Card 1 -->
        <div class="p-5 sm:p-6 lg:p-8 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-800/30 dark:to-slate-900/30 hover:shadow-lg transition-shadow animate-slide-up animation-delay-1">
          <div class="flex items-start gap-4 sm:gap-5">
            <div class="text-3xl sm:text-4xl lg:text-5xl flex-shrink-0">😞</div>
            <div class="text-left">
              <h3 class="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-2 sm:mb-3">The Problem We Faced</h3>
              <p class="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                As students of Caraga State University, we've all experienced that sinking feeling—losing an important item on campus. Whether it's a wallet, phone, keys, or laptop, the anxiety of not knowing where your belongings went is overwhelming. We searched through lost-and-found departments, posted on social media, and asked around, but there was no organized way to find our items. The process was chaotic, time-consuming, and often unsuccessful.
              </p>
            </div>
          </div>
        </div>

        <!-- Story Card 2 -->
        <div class="p-5 sm:p-6 lg:p-8 rounded-xl border border-yellow-200 dark:border-yellow-900/30 bg-gradient-to-br from-yellow-50/50 to-white dark:from-slate-800/20 dark:to-slate-900/30 hover:shadow-lg transition-shadow animate-slide-up animation-delay-2">
          <div class="flex items-start gap-4 sm:gap-5">
            <div class="text-3xl sm:text-4xl lg:text-5xl flex-shrink-0">💡</div>
            <div class="text-left">
              <h3 class="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-2 sm:mb-3">The Solution</h3>
              <p class="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                That's when we realized CSU needed a centralized platform—a digital hub where lost and found items could be reported and matched efficiently. We envisioned a system powered by modern technology that could reunite students with their belongings quickly and securely. Our mission became clear: create a solution that makes finding lost items as easy as a few clicks.
              </p>
            </div>
          </div>
        </div>

        <!-- Story Card 3 -->
        <div class="p-5 sm:p-6 lg:p-8 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-800/30 dark:to-slate-900/30 hover:shadow-lg transition-shadow animate-slide-up animation-delay-3">
          <div class="flex items-start gap-4 sm:gap-5">
            <div class="text-3xl sm:text-4xl lg:text-5xl flex-shrink-0">🚀</div>
            <div class="text-left">
              <h3 class="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-2 sm:mb-3">CSU Lost & Found System</h3>
              <p class="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Today, we're proud to present the CSU Lost & Found System—a comprehensive digital platform designed specifically for our Caraga State University community. Powered by AI-driven image recognition and intelligent matching, our system ensures accurate identification and secure transactions. We're committed to making campus life better, safer, and more connected for every CSU student and staff member.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Vision Section -->
    <section class="relative px-4 sm:px-6 py-10 sm:py-14 lg:py-16 bg-gradient-to-b from-emerald-50 to-white dark:from-slate-900/50 dark:to-slate-900/20">
      <div class="max-w-3xl mx-auto text-center">
        <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-5 sm:mb-6 lg:mb-8 text-emerald-900 dark:text-emerald-300 animate-slide-up">Our Vision</h3>
        
        <div class="p-5 sm:p-6 lg:p-8 rounded-xl border-2 border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 to-yellow-50 dark:from-slate-800/50 dark:to-slate-900/50 animate-slide-up animation-delay-1">
          <p class="text-sm sm:text-base lg:text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
            "To create a thriving, connected Caraga State University community where no student worries about lost belongings—where technology serves compassion, and every item finds its way home."
          </p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative px-4 sm:px-6 py-10 sm:py-14 lg:py-16 bg-white dark:bg-slate-900 border-t border-emerald-200 dark:border-emerald-900">
      <div class="max-w-2xl mx-auto text-center">
        <h3 class="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 lg:mb-6 text-emerald-900 dark:text-emerald-300 animate-slide-up">Be Part of Our Mission</h3>
        <p class="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed animate-slide-up animation-delay-1">
          Whether you're looking for a lost item or want to help reunite belongings with their owners, join thousands of CSU students and staff already using our platform.
        </p>
        
        <router-link
          to="/login"
          class="inline-block px-6 sm:px-8 py-2.5 sm:py-3 lg:py-3.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg animate-slide-up animation-delay-2 active:scale-95 text-sm sm:text-base whitespace-nowrap"
        >
          🚀 Get Started Now
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
