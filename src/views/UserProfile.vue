<template>
  <div class="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8">
    <!-- Moved notification to always be rendered but hidden with opacity -->
    <div
      :class="[
        'fixed top-4 sm:top-8 left-1/2 -translate-x-1/2 bg-emerald-500 dark:bg-emerald-600 text-white px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 z-50 border border-emerald-300 dark:border-emerald-400 transition-all duration-300 max-w-sm sm:max-w-none',
        showSuccess ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      ]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5 sm:mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span class="font-semibold text-xs sm:text-base break-words">{{ successMessageText }}</span>
    </div>

    <!-- Main Container -->
    <div class="max-w-4xl mx-auto">
      <!-- Updated card styling with responsive padding and borders -->
      <div class="bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 rounded-xl sm:rounded-2xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden ">
        
        <!-- Profile Header with Image -->
        <div class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-emerald-900/20 to-white dark:to-gray-700">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            <!-- Profile Image -->
            <div class="relative flex-shrink-0">
              <!-- If profile photo exists, show it -->
              <img
                v-if="profilePhoto && profilePhoto !== 'https://via.placeholder.com/150'"
                :src="profilePhoto"
                alt="Profile Photo"
                class="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-emerald-400 dark:border-emerald-400 object-cover shadow-lg"
              />
              <!-- If no profile photo, show placeholder icon -->
              <div v-else class="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-emerald-400 dark:border-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 shadow-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" />
                  <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM7 12a5 5 0 1110 0 5 5 0 01-10 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <button
                v-if="editMode"
                @click="showCropper = true"
                class="absolute bottom-0 right-0 bg-emerald-500 text-white rounded-full p-2 sm:p-3 hover:bg-emerald-400 transition duration-300 shadow-lg border-4 border-white dark:border-gray-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22a2 2 0 001.664.89H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            <!-- Profile Info -->
            <div class="flex-1 text-center sm:text-left">
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-emerald-400 mb-1">{{ name || 'Unnamed User' }}</h1>
              <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">{{ email }}</p>
            </div>
          </div>
        </div>

        <!-- Image Cropper Modal -->
        <div
          v-show="showCropper"
          class="fixed inset-0 bg-black/80 dark:bg-black/90 flex flex-col items-center justify-center z-50 p-4"
        >
          <div class="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-800">
            <!-- Header -->
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-emerald-600 dark:text-emerald-400 font-semibold text-lg">Change profile picture</h2>
              <button @click="cancelCrop" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Circular preview or placeholder -->
            <div class="mb-8 flex justify-center">
              <!-- If tempPhoto is set, show cropper preview -->
              <div v-if="tempPhoto" class="relative w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <Cropper
                  ref="cropperRef"
                  :src="tempPhoto"
                  class="w-full h-full"
                  :stencil-props="{
                    aspectRatio: 1,
                    movable: true,
                    resizable: true,
                    handlers: true,
                    lines: true,
                    aspectRatioLocked: true
                  }"
                  :stencil-size="{ width: 200, height: 200 }"
                  :auto-zoom="true"
                  image-restriction="stencil"
                />
              </div>
              <!-- If no tempPhoto but profilePhoto exists, show current profile picture -->
              <div v-else-if="profilePhoto && profilePhoto !== 'https://via.placeholder.com/150'" class="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex items-center justify-center">
                <img :src="profilePhoto" alt="Current profile" class="w-full h-full object-cover" />
              </div>
              <!-- If no tempPhoto and no current profile picture, show placeholder icon -->
              <div v-else class="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-gray-400 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" />
                  <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM7 12a5 5 0 1110 0 5 5 0 01-10 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <!-- Buttons below preview/placeholder -->
            <div class="flex justify-center">
              <!-- Upload from Device -->
              <label class="flex flex-col items-center cursor-pointer group">
                <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </div>
                <span class="mt-3 text-center font-semibold text-gray-900 dark:text-white text-sm">Upload from<br />Device</span>
                <input type="file" accept="image/*" @change="handleFileUpload" class="hidden" />
              </label>
            </div>

            <!-- Action buttons (show when tempPhoto is set) -->
            <div v-if="tempPhoto" class="flex flex-col sm:flex-row justify-center gap-3 mt-8">
              <button @click="saveCroppedImage" class="px-6 py-2 sm:py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-400 transition duration-300 text-sm sm:text-base">
                Save
              </button>
              <button @click="cancelCrop" class="px-6 py-2 sm:py-3 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300 font-semibold text-sm sm:text-base">
                Cancel
              </button>
            </div>

            <!-- Close button (show when no tempPhoto) -->
            <div v-else class="mt-8">
              <button @click="cancelCrop" class="w-full px-6 py-2 sm:py-3 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300 font-semibold text-sm sm:text-base">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Personal Details Section -->
        <div class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 border-b border-gray-200 dark:border-gray-800">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-emerald-400 mb-6">Personal Details</h2>

          <div v-if="!editMode" class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <!-- Full Name -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">Full Name</label>
              <div class="bg-gray-50 dark:bg-gray-800/50 border-l-4 border-emerald-600 text-gray-900 dark:text-white px-4 sm:px-5 py-3 sm:py-3 rounded text-sm sm:text-base font-medium shadow-sm">{{ name || 'Not set' }}</div>
            </div>

            <!-- Email -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">Email</label>
              <div class="bg-gray-50 dark:bg-gray-800/50 border-l-4 border-emerald-600 text-gray-900 dark:text-white px-4 sm:px-5 py-3 sm:py-3 rounded text-sm sm:text-base font-medium shadow-sm">{{ email || 'Not set' }}</div>
            </div>

            <!-- Department -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">Department</label>
              <div class="bg-gray-50 dark:bg-gray-800/50 border-l-4 border-emerald-600 text-gray-900 dark:text-white px-4 sm:px-5 py-3 sm:py-3 rounded text-sm sm:text-base font-medium shadow-sm">{{ department || 'Not set' }}</div>
            </div>

            <!-- Course/Program -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">Course/Program</label>
              <div class="bg-gray-50 dark:bg-gray-800/50 border-l-4 border-emerald-600 text-gray-900 dark:text-white px-4 sm:px-5 py-3 sm:py-3 rounded text-sm sm:text-base font-medium shadow-sm">{{ program || 'Not set' }}</div>
            </div>

            

            <!-- Phone Number -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">Phone Number</label>
              <div class="bg-gray-50 dark:bg-gray-800/50 border-l-4 border-emerald-600 text-gray-900 dark:text-white px-4 sm:px-5 py-3 sm:py-3 rounded text-sm sm:text-base font-medium shadow-sm">{{ contactNumber || 'Not set' }}</div>
            </div>

            <!-- ID Number -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">ID Number</label>
              <div class="bg-gray-50 dark:bg-gray-800/50 border-l-4 border-emerald-600 text-gray-900 dark:text-white px-4 sm:px-5 py-3 sm:py-3 rounded text-sm sm:text-base font-medium shadow-sm">{{ idNumber || 'Not set' }}</div>
            </div>

            <!-- User Type -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">User Type</label>
              <div class="bg-gray-50 dark:bg-gray-800/50 border-l-4 border-emerald-600 text-gray-900 dark:text-white px-4 sm:px-5 py-3 sm:py-3 rounded text-sm sm:text-base font-medium shadow-sm">{{ userType }}</div>
            </div>

            <!-- Member Since -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">Member Since</label>
              <div class="bg-gray-50 dark:bg-gray-800/50 border-l-4 border-emerald-600 text-gray-900 dark:text-white px-4 sm:px-5 py-3 sm:py-3 rounded text-sm sm:text-base font-medium shadow-sm">{{ createdAt }}</div>
            </div>
          </div>

          <!-- Edit Mode Form -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <!-- Full Name -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">Full Name</label>
              <input 
                v-model="editableName" 
                type="text" 
                placeholder="Full Name" 
                class="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-900 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>

            <!-- Department -->
            <div ref="departmentSuggestionsRef" :class="['relative', showDepartmentSuggestions ? 'z-50' : 'z-10']">
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">Department</label>
              <input 
                v-model="editableDepartment" 
                type="text" 
                placeholder="Department / Office" 
                @input="filterDepartmentSuggestions"
                @focus="openDepartmentSuggestions"
                class="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-900 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
              <div
                v-if="showDepartmentSuggestions"
                class="absolute left-0 right-0 z-50 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
              >
                <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-emerald-600 text-white rounded-t-lg">
                  <span class="text-sm font-semibold">DEPARTMENT</span>
                  <button
                    @click="closeDepartmentSuggestions"
                    class="text-white hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                <div class="max-h-48 overflow-y-auto">
                  <div
                    v-for="d in filteredDepartmentSuggestions"
                    :key="d"
                    @click="selectDepartmentSuggestion(d)"
                    class="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {{ d }}
                  </div>
                  <div v-if="filteredDepartmentSuggestions.length === 0" class="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                    No departments found
                  </div>
                </div>
              </div>
            </div>

            <!-- Course/Program -->
            <div ref="courseSuggestionsRef" :class="['relative', showCourseSuggestions ? 'z-50' : 'z-10']">
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">Course/Program</label>
              <input 
                v-model="editableProgram" 
                type="text" 
                placeholder="Course / Program" 
                @input="filterCourseSuggestions"
                @focus="openCourseSuggestions"
                class="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-900 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
              <div
                v-if="showCourseSuggestions"
                class="absolute left-0 right-0 z-50 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
              >
                <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-emerald-600 text-white rounded-t-lg">
                  <span class="text-sm font-semibold">COURSE/PROGRAM</span>
                  <button
                    @click="closeCourseSuggestions"
                    class="text-white hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                <div class="max-h-48 overflow-y-auto">
                  <div
                    v-for="c in filteredCourseSuggestions"
                    :key="c"
                    @click="selectCourseSuggestion(c)"
                    class="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {{ c }}
                  </div>
                  <div v-if="filteredCourseSuggestions.length === 0" class="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                    No programs found
                  </div>
                </div>
              </div>
            </div>

            <!-- Phone Number -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">Phone Number</label>
              <input 
                v-model="editableContactNumber" 
                type="tel" 
                placeholder="Contact Number (11 digits)" 
                maxlength="11"
                @input="onContactInput"
                class="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-900 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
              <p v-if="contactError" class="text-sm text-red-600 mt-1">{{ contactError }}</p>
            </div>

            <!-- ID Number -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 block">ID Number</label>
              <input 
                v-model="editableIdNumber" 
                type="text" 
                placeholder="ID Number (XXX-XXXXX)" 
                maxlength="9"
                @input="onIdNumberInput"
                class="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-900 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
              <p v-if="idNumberError" class="text-sm text-red-600 mt-1">{{ idNumberError }}</p>
            </div>
           
          </div>
        </div>

    

    
        <!-- Action Buttons -->
        <div class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col sm:flex-row gap-3 items-center justify-center sm:justify-end">
          <button
            v-if="!editMode"
            @click="toggleEdit"
            class="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition duration-300 shadow-sm text-sm sm:text-base"
          >
            Edit Profile
          </button>

           

          <template v-else>
            <button 
              @click="saveProfile"
              :disabled="isSaving"
              class="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded border-l-4 border-emerald-600 bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition duration-300 shadow-sm text-sm sm:text-base"
            >
              <span v-if="!isSaving">Save Changes</span>
              <span v-else class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            </button>
            <button 
              @click="cancelEdit"
              :disabled="isSaving"
              class="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 text-sm sm:text-base"
            >
              Cancel
            </button>
          </template>
        </div>

        <!-- Back to Dashboard -->
        <div class="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-gray-200 dark:border-gray-800 flex justify-center">
          <button
            @click="goBack"
            class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition duration-300 font-semibold text-sm sm:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m0-8H5m4 0h10" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { Cropper } from "vue-advanced-cropper";
import { disconnectSocket } from "../socket";
import "vue-advanced-cropper/dist/style.css";

const router = useRouter();
const route = useRoute();
const API_URL = "http://localhost:5000/api/profile";

const redirectToLogin = () => {
  disconnectSocket();
  localStorage.clear();
  router.push("/login");
};

// Navigate back to appropriate dashboard based on user role
const goBack = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?.role === "security") {
      router.push("/security-dashboard");
    } else {
      router.push("/userdashboard");
    }
  } catch (err) {
    console.error("Failed to determine user role:", err);
    router.push("/userdashboard");
  }
  // Scroll to top of page
  window.scrollTo(0, 0);
};

// Profile state
const name = ref("");
const email = ref("");
const userType = ref("");
const userRole = ref("");
const department = ref("");
const program = ref("");
const contactNumber = ref("");
const idNumber = ref("");
const birthday = ref(""); // ← will show formatted date
const createdAt = ref("");
const profilePhoto = ref("https://via.placeholder.com/150");

// Editable state
const editableName = ref("");
// editableUserType removed: role is managed server-side; users cannot change role here
const editableDepartment = ref("");
const editableProgram = ref("");
const editableContactNumber = ref("");
const editableIdNumber = ref("");
const editableBirthday = ref(""); // ← raw YYYY-MM-DD for input
const selectedFile = ref(null);

const contactError = ref("");
const idNumberError = ref("");

// Department options (same as ReportPage)
const departmentOptions = [
  "CHASS",
  "CMNS",
  "CCIS",
  "COFES",
  "CED",
  "CAA",
  "CEGS"
];

// Course/Program options (from ReportPage)
const courseOptions = [
  "BACHELOR OF ARTS IN SOCIOLOGY (AB-SOCIO)",
  "BACHELOR OF ELEMENTARY EDUCATION (BEED)",
  "BACHELOR OF SCIENCE IN AGRICULTURAL AND BIOSYSTEMS ENGINEERING (BSABE)",
  "BACHELOR OF SCIENCE IN AGRICULTURE (BSA)",
  "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN AGRIBUSINESS MANAGEMENT (BSA-AGRI)",
  "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN AGRICULTURAL ECONOMICS (BSA-AGECON)",
  "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN AGRONOMY (BSA-AGRON)",
  "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN ANIMAL SCIENCE (BSA-ANSCI)",
  "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN CROP PROTECTION (BSA-CROPPROT)",
  "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN HORTICULTURE (BSA-HORTI)",
  "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN SOIL SCIENCE (BSA-SOILSCI)",
  "BACHELOR OF SCIENCE IN AGROFORESTRY (BSAF)",
  "BACHELOR OF SCIENCE IN APPLIED MATHEMATICS (BSAM)",
  "BACHELOR OF SCIENCE IN BIOLOGY (BSBIO)",
  "BACHELOR OF SCIENCE IN BIOLOGY MAJOR IN BIODIVERSITY CONSERVATION (BSBIO BIOCON)",
  "BACHELOR OF SCIENCE IN BIOLOGY MAJOR IN ENTOMOLOGY (BSBIO-ENT)",
  "BACHELOR OF SCIENCE IN BIOLOGY MAJOR IN MEDICAL BIOLOGY (BSBIO MEDBIO)",
  "BACHELOR OF SCIENCE IN BIOLOGY MAJOR IN MICROBIOLOGY (BSBIO MICRO)",
  "BACHELOR OF SCIENCE IN BIOLOGY MAJOR IN PLANT BIOLOGY (BSBIO PLANTBIO)",
  "BACHELOR OF SCIENCE IN CHEMISTRY (BSCHEM)",
  "BACHELOR OF SCIENCE IN CIVIL ENGINEERING (BSCE)",
  "BACHELOR OF SCIENCE IN CIVIL ENGINEERING WITH SPECIALIZATION IN STRUCTURAL ENGINEERING (BSCE-SE)",
  "BACHELOR OF SCIENCE IN COMPUTER SCIENCE (BSCS)",
  "BACHELOR OF SCIENCE IN ELECTRONICS ENGINEERING (BSEcE)",
  "BACHELOR OF SCIENCE IN ENVIRONMENTAL SCIENCE (BSES)",
  "BACHELOR OF SCIENCE IN FORESTRY (BSF)",
  "BACHELOR OF SCIENCE IN GEODETIC ENGINEERING (BSGE)",
  "BACHELOR OF SCIENCE IN GEOLOGY (BSGeol)",
  "BACHELOR OF SCIENCE IN INFORMATION SYSTEM (BSIS)",
  "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY (BSIT)",
  "BACHELOR OF SCIENCE IN MARINE BIOLOGY (BS Marine Bio)",
  "BACHELOR OF SCIENCE IN MATHEMATICS (BSMATH)",
  "BACHELOR OF SCIENCE IN MINING ENGINEERING (BSEM)",
  "BACHELOR OF SCIENCE IN PHYSICS (BS-PHYS)",
  "BACHELOR OF SCIENCE IN PSYCHOLOGY (BS PSYCH)",
  "BACHELOR OF SCIENCE IN SOCIAL WORK (BSSW)",
  "BACHELOR OF SECONDARY EDUCATION MAJOR IN ENGLISH (BSED ENG)",
  "BACHELOR OF SECONDARY EDUCATION MAJOR IN FILIPINO (BSED FIL)",
  "BACHELOR OF SECONDARY EDUCATION MAJOR IN MATHEMATICS (BSED-MATH)",
  "BACHELOR OF SECONDARY EDUCATION MAJOR IN SCIENCE (BSED SCI)",
  "TEACHERS CERTIFICATE PROGRAM (TCP)"
];

const filteredDepartmentSuggestions = ref([]);
const filteredCourseSuggestions = ref([]);
const showDepartmentSuggestions = ref(false);
const showCourseSuggestions = ref(false);
const departmentSuggestionsRef = ref(null);
const courseSuggestionsRef = ref(null);

const editMode = ref(false);
const showCropper = ref(false);
const showSuccess = ref(false);
const isSaving = ref(false);
const tempPhoto = ref(null);
const cropperRef = ref(null);
const successMessageText = ref("Profile updated successfully!");

// ✅ Fetch profile safely with backend base URL
const fetchProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found");
      return redirectToLogin();
    }

    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data;

    console.log("📥 Profile data received:", JSON.stringify(data, null, 2));
    name.value = data.full_name;
    email.value = data.email;
    // Derive a displayable role from the stored role field
    if (data.role) {
      if (data.role === 'admin') userType.value = 'Administrator';
      else if (data.role === 'security') userType.value = 'Security Staff';
      else if (data.role === 'university_member') userType.value = 'University Member';
      else userType.value = data.role;
    } else {
      userType.value = '';
    }
    // store raw role for conditional UI logic
    userRole.value = data.role || '';
    department.value = data.department;
    program.value = data.program;
    contactNumber.value = data.contact_number;
    idNumber.value = data.id_number;

    // ✅ Format birthday for display (e.g., "April 18, 2003")
    if (data.birthday) {
      const date = new Date(data.birthday);
      birthday.value = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else {
      birthday.value = "Not set";
    }

    createdAt.value = new Date(data.created_at || data.updated_at).toLocaleDateString();

    // ✅ Profile photo
    if (data.profile_picture) {
      const normalizedPath = data.profile_picture.replace(/^\/?uploads\//, "/uploads/");
      profilePhoto.value = `http://localhost:5000${normalizedPath}`;
    } else {
      profilePhoto.value = "https://via.placeholder.com/150";
    }

    // Editable fields
    editableName.value = name.value;
    editableDepartment.value = department.value;
    editableProgram.value = program.value || "";
    editableContactNumber.value = contactNumber.value;
    editableIdNumber.value = idNumber.value || "";
    // Keep raw value for date input (YYYY-MM-DD)
    editableBirthday.value = data.birthday ? new Date(data.birthday).toISOString().split("T")[0] : "";

    // If user was redirected here to complete profile, open edit mode automatically
    try {
      const nextPath = route.query?.next;
      const isIncomplete = !data.full_name || !data.department || !data.contact_number || !data.birthday || !data.profile_picture;
      if (nextPath && isIncomplete) {
        editMode.value = true;
      }
    } catch (err) {
      // ignore
    }

  } catch (err) {
    console.error("Failed to fetch profile:", err.message);
    if (err.response?.status === 401) {
      redirectToLogin();
    }
  }
};

// Cropper functions
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    tempPhoto.value = event.target.result;
  };
  reader.readAsDataURL(file);
};

const cancelCrop = () => {
  tempPhoto.value = null;
  showCropper.value = false;
};

const saveCroppedImage = () => {
  const { canvas } = cropperRef.value.getResult();
  if (canvas) {
    canvas.toBlob((blob) => {
      selectedFile.value = new File([blob], "profile.png", { type: "image/png" });
      profilePhoto.value = URL.createObjectURL(selectedFile.value);
      showCropper.value = false;
    }, "image/png");
  }
};

// ✅ Save profile safely
const saveProfile = async () => {
  try {
    isSaving.value = true;
    const token = localStorage.getItem("token");
    if (!token) return redirectToLogin();

    // Validate contact number is exactly 11 digits
    const digits = (editableContactNumber.value || "").replace(/\D/g, "");
    if (digits.length !== 11) {
      contactError.value = "Contact number must contain exactly 11 digits.";
      isSaving.value = false;
      return;
    }
    contactError.value = "";

    // Validate ID Number format (XXX-XXXXX - 8 digits total)
    const idDigits = (editableIdNumber.value || "").replace(/\D/g, "");
    if (idDigits.length !== 8) {
      idNumberError.value = "ID Number must be complete. Format: XXX-XXXXX (8 digits total)";
      isSaving.value = false;
      return;
    }
    idNumberError.value = "";

    const formData = new FormData();
    formData.append("full_name", editableName.value);
    // role/user_type is not editable via this form (managed by admin)
    formData.append("department", editableDepartment.value);
    formData.append("program", editableProgram.value);
    formData.append("contact_number", digits);
    formData.append("id_number", editableIdNumber.value);
    if (selectedFile.value) formData.append("profile_picture", selectedFile.value);

    console.log("📤 Sending form data with id_number:", editableIdNumber.value);

    const response = await axios.post(`${API_URL}/save`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("📤 Save response:", JSON.stringify(response.data, null, 2));
    const updatedUser = response.data?.user || null;
    if (updatedUser) {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null") || {};

        // Normalize profile_picture to full URL so other pages can use it immediately
        let normalizedProfilePicture = null;
        if (updatedUser.profile_picture) {
          const normalizedPath = updatedUser.profile_picture.replace(/^\/?uploads\//, "/uploads/");
          normalizedProfilePicture = `http://localhost:5000${normalizedPath}`;
          // update local display immediately
          profilePhoto.value = normalizedProfilePicture;
        }

        const nextUser = { ...storedUser, ...updatedUser };
        if (normalizedProfilePicture) nextUser.profile_picture = normalizedProfilePicture;
        localStorage.setItem("user", JSON.stringify(nextUser));
      } catch (err) {
        console.error("Failed to sync updated user in storage:", err);
      }
    }

    showSuccess.value = true;
    editMode.value = false;
    successMessageText.value = 'Your profile information has been successfully updated.';
    fetchProfile();
    setTimeout(() => (showSuccess.value = false), 3000);

    // If user was redirected here to complete their profile, send them back
    // to the original page after successful save.
    try {
      const nextPath = route.query?.next;
      if (nextPath) {
        // remove query from URL then navigate
        router.replace({ path: '/profile' }).catch(() => {});
        router.push(String(nextPath)).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to redirect after profile save:', err);
    }

  } catch (err) {
    console.error("❌ Error saving profile:", err);
    console.error("Response status:", err.response?.status);
    console.error("Response data:", err.response?.data);
    
    if (err.response?.status === 401) {
      redirectToLogin();
    } else if (err.response?.data?.error) {
      alert(`Error saving profile: ${err.response.data.error}`);
    } else {
      alert("Failed to save profile. Please check the console for details.");
    }
  } finally {
    isSaving.value = false;
  }
};

const toggleEdit = () => (editMode.value = true);
const cancelEdit = () => (editMode.value = false);

onMounted(() => {
  fetchProfile();
  
  // Add click-outside handler for dropdowns
  const handleDocClick = (e) => {
    if (departmentSuggestionsRef.value && !departmentSuggestionsRef.value.contains(e.target)) {
      closeDepartmentSuggestions();
    }
    if (courseSuggestionsRef.value && !courseSuggestionsRef.value.contains(e.target)) {
      closeCourseSuggestions();
    }
  };
  document.addEventListener("click", handleDocClick);
  
  // Cleanup on unmount
  return () => {
    document.removeEventListener("click", handleDocClick);
  };
});

const onContactInput = (e) => {
  // keep only digits and limit to 11
  const raw = (e.target.value || "").replace(/\D/g, "");
  editableContactNumber.value = raw.slice(0, 11);
  if (editableContactNumber.value.length === 11) contactError.value = "";
};

// Format ID Number as XXX-XXXXX (3 digits, dash, 5 digits)
const onIdNumberInput = (e) => {
  let input = (e.target.value || "").replace(/\D/g, "");
  
  // Limit to 8 digits total
  input = input.slice(0, 8);
  
  // Auto-format with dash after 3 digits
  if (input.length >= 3) {
    editableIdNumber.value = input.slice(0, 3) + "-" + input.slice(3, 8);
  } else {
    editableIdNumber.value = input;
  }
  
  // Validate
  if (input.length === 8) {
    idNumberError.value = ""; // Complete
  } else if (input.length > 0) {
    idNumberError.value = "ID Number is incomplete. Format: XXX-XXXXX (8 digits total)";
  } else {
    idNumberError.value = "";
  }
};

// Department Dropdown Functions
const filterDepartmentSuggestions = () => {
  const query = (editableDepartment.value || "").toLowerCase();
  filteredDepartmentSuggestions.value = departmentOptions.filter((d) =>
    d.toLowerCase().includes(query)
  );
};

const openDepartmentSuggestions = () => {
  filterDepartmentSuggestions();
  showDepartmentSuggestions.value = true;
};

const closeDepartmentSuggestions = () => {
  showDepartmentSuggestions.value = false;
};

const selectDepartmentSuggestion = (d) => {
  editableDepartment.value = d;
  closeDepartmentSuggestions();
};

// Course/Program Dropdown Functions
const filterCourseSuggestions = () => {
  const query = (editableProgram.value || "").toLowerCase();
  filteredCourseSuggestions.value = courseOptions.filter((c) =>
    c.toLowerCase().includes(query)
  );
};

const openCourseSuggestions = () => {
  filterCourseSuggestions();
  showCourseSuggestions.value = true;
};

const closeCourseSuggestions = () => {
  showCourseSuggestions.value = false;
};

const selectCourseSuggestion = (c) => {
  editableProgram.value = c;
  closeCourseSuggestions();
};
</script>

<style scoped>
.date-input-with-label::-webkit-calendar-picker-indicator {
  cursor: pointer;
}

.date-input-with-label::before {
  content: attr(data-placeholder);
}
</style>