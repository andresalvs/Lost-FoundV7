<template>
  <div
    class="min-h-screen flex flex-col justify-between bg-gradient-to-b from-emerald-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-gray-900 dark:text-white transition-colors duration-500 overflow-hidden"
  >
    <!-- Header -->
    <header class="relative flex justify-between items-center p-4 sm:p-6 sticky top-0 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-b border-emerald-200 dark:border-emerald-900 z-50 animate-slide-down">
      <router-link to="/" class="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
        <div
          class="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0"
        >
          <span class="text-emerald-900 text-lg sm:text-2xl">🔍</span>
        </div>
        <h1 class="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-300 group-hover:text-emerald-700 dark:group-hover:text-yellow-400 transition-colors">CSU Lost & Found</h1>
      </router-link>
    </header>

    <!-- Main Content -->
    <main class="flex-1 px-4 sm:px-6 py-8 sm:py-10">
      <div class="max-w-4xl mx-auto">
       
        <!-- Back Button -->
        <button
          @click="goBack"
          class="flex items-center gap-2 text-emerald-700 dark:text-emerald-300  hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors font-medium mb-6 sm:mb-8 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        <!-- Profile Header Card -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-emerald-200 dark:border-emerald-900 overflow-hidden mb-6 sm:mb-8 animate-slide-up">
          <!-- Updated header background with emerald gradient -->
          <div class="h-32 sm:h-40 bg-gradient-to-r from-emerald-50 dark:from-emerald-900/20 to-white dark:to-gray-800"></div>

          <!-- Profile Info Section -->
          <div class="px-6 sm:px-8 pb-8 sm:pb-10">
            <!-- Responsive flex layout for profile photo and info -->
            <div class="flex flex-col sm:flex-row gap-6 sm:gap-8 -mt-16 mb-8">
              <!-- Profile Photo -->
              <div class="flex-shrink-0 flex justify-center sm:justify-start">
                <img
                  :src="profilePhoto || 'https://via.placeholder.com/140'"
                  alt="Profile Photo"
                  class="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-slate-900 shadow-lg object-cover hover:shadow-xl transition-shadow"
                />
              </div>

              <!-- Primary Info -->
              <div class="flex-1 pt-0 sm:pt-6 text-center sm:text-left">
                <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-900 dark:text-emerald-300 mb-1 leading-tight">
                  {{ name || 'N/A' }}
                </h1>
                <p class="text-lg sm:text-xl text-yellow-600 dark:text-yellow-400 font-semibold mb-3 sm:mb-4">
                  {{ userType || 'N/A' }}
                </p>
                <p class="text-gray-700 dark:text-gray-300 mb-2">{{ department || 'N/A' }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Member since {{ createdAt || 'N/A' }}</p>
              </div>
            </div>

            <!-- Modern grid layout for contact information -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-emerald-200 dark:border-emerald-900">
              <!-- Email -->
              <div class="text-center sm:text-left">
                <label class="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">Email Address</label>
                <p class="text-base sm:text-lg text-emerald-900 dark:text-emerald-100 font-medium break-all">{{ email || 'N/A' }}</p>
              </div>

              <!-- Contact -->
              <div class="text-center sm:text-left">
                <label class="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">Contact Number</label>
                <p class="text-base sm:text-lg text-emerald-900 dark:text-emerald-100 font-medium">{{ contactNumber || 'N/A' }}</p>
              </div>

              <!-- Birthday -->
              <div class="text-center sm:text-left">
                <label class="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">Date of Birth</label>
                <p class="text-base sm:text-lg text-emerald-900 dark:text-emerald-100 font-medium">{{ birthday || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Staff View Badge positioned inside main content -->
        <div class="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium border border-emerald-300 dark:border-emerald-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1C6.48 1 2 5.48 2 11s4.48 10 10 10 10-4.48 10-10S17.52 1 12 1zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
            Staff View
          </span>
          <span class="text-sm text-gray-600 dark:text-gray-400">Viewed on {{ currentDate }}</span>
        </div>

        <!-- Action Footer -->
      
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative text-center py-3 sm:py-4 lg:py-6 text-gray-600 dark:text-gray-400 text-xs sm:text-sm border-t border-emerald-200 dark:border-emerald-900 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
      © {{ currentYear }} Caraga State University • Lost & Found System
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router"; // ✅ Import useRouter
import axios from "axios";

const route = useRoute();
const router = useRouter(); // ✅ Initialize router
const API_URL = "http://localhost:5000/api/profile";

// Profile state
const name = ref("");
const email = ref("");
const userType = ref("");
const department = ref("");
const contactNumber = ref("");
const birthday = ref("");
const createdAt = ref("");
const profilePhoto = ref("");

// Computed property for current date
const currentDate = computed(() => {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Fetch profile by user ID
const fetchProfile = async () => {
  try {
    const userId = route.params.id;
    const res = await axios.get(`${API_URL}/${userId}`);
    const data = res.data;

    name.value = data.full_name;
    email.value = data.email;
    // Derive role display from stored role value
    if (data.role) {
      if (data.role === 'admin') userType.value = 'Administrator';
      else if (data.role === 'security') userType.value = 'Security Staff';
      else if (data.role === 'university_member') userType.value = 'University Member';
      else userType.value = data.role;
    } else {
      userType.value = '';
    }
    department.value = data.department;
    contactNumber.value = data.contact_number;

    if (data.birthday) {
      birthday.value = new Date(data.birthday).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    createdAt.value = new Date(data.created_at || data.updated_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });

    profilePhoto.value = data.profile_picture
      ? `http://localhost:5000${data.profile_picture.replace(/^\/?uploads\//, "/uploads/")}`
      : "";
  } catch (err) {
    console.error("Failed to fetch profile:", err.message);
  }
};

// ✅ Go back to previous page (Admin or Security Dashboard)
const goBack = () => {
  router.go(-1); // Navigate back in browser history
};

onMounted(fetchProfile);
</script>



<style scoped>
button {
  transition: all 0.2s ease-in-out;
}

button:active {
  transform: scale(0.98);
}
</style>