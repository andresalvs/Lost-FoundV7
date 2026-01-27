<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center mb-32 py-10 px-4 space-y-10 transition-colors duration-200">
    <!-- Page Title -->
    <h1 class="text-3xl font-bold text-gray-900 dark:text-emerald-400 mb-6">Your ID has been found!</h1>

    <!-- Loading State -->
    <div v-if="loading" class="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center text-gray-900 dark:text-white">
      <p>Loading item details...</p>
    </div>

    <!-- Already Claimed Message -->
    <div v-else-if="alreadyClaimed" class="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
      <div class="mb-6 flex justify-center">
        <div class="w-24 h-24 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
      <div class="text-2xl font-semibold text-yellow-600 dark:text-yellow-400 mb-4 text-center">You already submitted a Claim Request</div>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">You can pick up your ID from the Security Office. Security staff will verify if this is your ID.</p>
      
      <!-- Office Availability Status -->
      <div v-if="officeHours" :class="[
        'p-4 rounded border-l-4 mb-6',
        isOfficeOpenToday 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400'
          : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-400'
      ]">
        <h3 class="font-semibold mb-3 flex items-center gap-2" :class="[
          isOfficeOpenToday 
            ? 'text-green-900 dark:text-green-100'
            : 'text-emerald-900 dark:text-emerald-100'
        ]">
          <svg v-if="isOfficeOpenToday" class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.002v6a3 3 0 01-.709 1.938l-5.854 7.381a3 3 0 01-4.474 0L3.172 10.938A3 3 0 012.5 9V3.457a3.066 3.066 0 012.767-3.002z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          {{ isOfficeOpenToday ? '✓ Office is Open Today!' : '⚠ Office is Closed Today' }}
        </h3>
        
        <!-- Today's Hours -->
        <div class="p-3 bg-white dark:bg-gray-800 rounded border" :class="[
          isOfficeOpenToday
            ? 'border-green-200 dark:border-green-700'
            : 'border-emerald-200 dark:border-emerald-700'
        ]">
          <p class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Today ({{ todayName }}):</p>
          <div v-if="isOfficeOpenToday" class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <p class="text-sm font-bold text-green-700 dark:text-green-300">
              {{ officeHours.today.open }} - {{ officeHours.today.close }}
            </p>
            <span class="text-xs bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded font-semibold">OPEN</span>
          </div>
          <div v-else class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <p class="text-sm font-semibold text-red-700 dark:text-red-300">Closed Today</p>
          </div>
        </div>
      </div>
      
      <button @click="goBack" class="w-full px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition">
        Back to Dashboard
      </button>
    </div>

    <!-- Not My ID Message -->
    <div v-else-if="isNotMyID" class="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 text-center">
      <div class="mb-6 flex justify-center">
        <div class="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
      <div class="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">You already confirmed this is not your ID</div>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">This appears to be a previous notification for a false ID match. If you need help, contact the Security Office.</p>
      <button @click="goBack" class="w-full px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition">
        Back to Dashboard
      </button>
    </div>

    <!-- Item Not Found -->
    <div v-else-if="!foundItem" class="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 text-center">
      <div class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">Item Not Found</div>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">We couldn't find the details for this item. It may have been removed.</p>
      <button @click="goBack" class="px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition">
        Back to Dashboard
      </button>
    </div>

    <!-- Found Item Details Card - Only show if NOT already claimed -->
    <template v-else>
      <div class="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4 md:p-8 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
        <!-- Item Image -->
        <div class="w-full flex justify-center mb-6">
          <img
            v-if="foundItem.image_url"
            :src="foundItem.image_url"
            alt="Found ID"
            class="w-64 sm:w-80 h-64 sm:h-80 object-cover rounded-xl border-4 border-emerald-500 shadow-md"
            @error="handleImageError"
          />
          <div
            v-else
            class="w-64 sm:w-80 h-64 sm:h-80 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-xl border-4 border-emerald-500"
          >
            <span class="text-center">
              <div class="text-4xl mb-2">📷</div>
              <p>No Image Available</p>
            </span>
          </div>
        </div>

        <!-- Student Information Section -->
        <div class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">Student Information</h2>
          
          <div class="space-y-3">
            <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Student Name</p>
              <p class="text-sm md:text-base font-semibold text-gray-900 dark:text-white mt-1">{{ foundItem.name || 'Not provided' }}</p>
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800/50">
              <p class="text-xs md:text-sm text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide">Student ID</p>
              <p class="text-sm md:text-base font-bold text-gray-900 dark:text-white mt-1 font-mono">{{ foundItem.student_id || 'N/A' }}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                <p class="text-xs md:text-sm text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wide">Department</p>
                <p class="text-sm md:text-base font-semibold text-gray-900 dark:text-white mt-1">{{ foundItem.department || foundItem.dept || foundItem.department_name || 'Not specified' }}</p>
              </div>
              <div class="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                <p class="text-xs md:text-sm text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wide">Course</p>
                <p class="text-sm md:text-base font-semibold text-gray-900 dark:text-white mt-1">{{ foundItem.course || foundItem.program || foundItem.course_program || 'Not specified' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ID Details Section -->
        <div class="mb-6">
          <h2 class="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">ID Details</h2>
          
          <div class="space-y-3">
            <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Location Found</p>
              <p class="text-sm md:text-base font-semibold text-gray-900 dark:text-white mt-1">📍 {{ foundItem.location || 'Not specified' }}</p>
            </div>

            <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Date & Time Found</p>
              <p class="text-sm md:text-base font-semibold text-gray-900 dark:text-white mt-1">{{ formatDateTime(foundItem.created_at) }}</p>
            </div>

            <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Status</p>
              <span
                :class="getStatusBadgeClass(foundItem.status)"
                class="inline-block px-4 py-2 rounded-full font-semibold text-sm mt-1"
              >
                {{ formatStatus(foundItem.status) }}
              </span>
            </div>

            <div v-if="foundItem.description" class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide mb-2">Description</p>
              <p class="text-sm md:text-base text-gray-900 dark:text-white whitespace-pre-wrap">{{ foundItem.description }}</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="markNotMyID"
            class="flex-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm md:text-base"
          >
            This is not my ID
          </button>
          <button
            v-if="foundItem.status !== 'received'"
            @click="showClaimModal = true"
            class="flex-1 px-4 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition text-sm md:text-base"
          >
            I want to Claim this ID
          </button>
        </div>
      </div>
    </template>

    <!-- Claim Modal -->
    <teleport to="body">
      <div v-if="showClaimModal" class="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
        <!-- Success Screen -->
        <div v-if="isClaimSuccess" class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
          <div class="mb-4 flex justify-center">
            <div class="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 class="text-2xl font-bold mb-2 text-center text-green-600 dark:text-green-400">Claim Submitted!</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">Your claim request has been successfully submitted. Please visit the Security Office for verification.</p>
          
          <!-- Office Availability Status -->
          <div v-if="officeHours" :class="[
            'p-4 rounded border-l-4 mb-6',
            isOfficeOpenToday 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400'
              : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-400'
          ]">
            <h3 class="font-semibold mb-3 flex items-center gap-2" :class="[
              isOfficeOpenToday 
                ? 'text-green-900 dark:text-green-100'
                : 'text-emerald-900 dark:text-emerald-100'
            ]">
              <svg v-if="isOfficeOpenToday" class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.002v6a3 3 0 01-.709 1.938l-5.854 7.381a3 3 0 01-4.474 0L3.172 10.938A3 3 0 012.5 9V3.457a3.066 3.066 0 012.767-3.002z" clip-rule="evenodd" />
              </svg>
              <svg v-else class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {{ isOfficeOpenToday ? '✓ Office is Open Today!' : '⚠ Office is Closed Today' }}
            </h3>
            
            <!-- Today's Hours -->
            <div class="p-3 bg-white dark:bg-gray-800 rounded border" :class="[
              isOfficeOpenToday
                ? 'border-green-200 dark:border-green-700'
                : 'border-emerald-200 dark:border-emerald-700'
            ]">
              <p class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Today ({{ todayName }}):</p>
              <div v-if="isOfficeOpenToday" class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <p class="text-sm font-bold text-green-700 dark:text-green-300">
                  {{ officeHours.today.open }} - {{ officeHours.today.close }}
                </p>
                <span class="text-xs bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded font-semibold">OPEN</span>
              </div>
              <div v-else class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <p class="text-sm font-semibold text-red-700 dark:text-red-300">Closed Today</p>
              </div>
            </div>
          </div>
          
          <button
            @click="$router.push('/userdashboard')"
            class="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
          >
            Back to Dashboard
          </button>
        </div>
        
        <!-- Loading Screen -->
        <div v-else-if="isLoadingClaim" class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
          <div class="mb-4">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
          </div>
          <p class="text-lg font-semibold text-center">Processing your claim...</p>
        </div>
        
        <!-- Normal Modal -->
        <div v-else class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 max-w-md w-full mx-4 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold mb-4 mt-0">Add Claim Details</h2>
          <textarea
            v-model="claimMessage"
            rows="4"
            placeholder="Optional: Add details to help security verify your claim."
            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 text-gray-900 dark:text-white bg-white dark:bg-gray-900 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          ></textarea>
          <div class="flex gap-3">
            <button
              @click="showClaimModal = false"
              class="flex-1 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Back
            </button>
            <button
              @click="submitIDClaim"
              class="flex-1 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
export default {
  name: "IDMatchDetails",
  data() {
    return {
      foundItem: null,
      loading: true,
      claimingInProgress: false,
      alreadyClaimed: false,
      isNotMyID: false,
      showClaimModal: false,
      claimMessage: "I want to claim this ID",
      isLoadingClaim: false,
      isClaimSuccess: false,
      weekSchedule: [],
      isOfficeOpenToday: false,
      todayName: "",
      officeHours: null
    };
  },
  mounted() {
    this.loadItemDetails();
    this.loadOfficeHours();
  },
  methods: {
    async loadItemDetails() {
      this.loading = true;
      try {
        // Get the item ID from route params or localStorage
        let itemId = this.$route.params.id || this.$route.query.item_id;

        // Check if user already rejected this ID (check early before loading)
        const rejectedIds = JSON.parse(localStorage.getItem("rejectedIDMatches") || "[]");
        if (itemId && rejectedIds.includes(itemId)) {
          this.isNotMyID = true;
          this.loading = false;
          return;
        }

        // If no ID in route, try to get from localStorage (passed from notification click)
        if (!itemId) {
          const storedData = localStorage.getItem("idMatchItemData");
          if (storedData) {
            const data = JSON.parse(storedData);
            itemId = data.id;
            
            // Check again with the stored ID
            if (rejectedIds.includes(itemId)) {
              this.isNotMyID = true;
              this.loading = false;
              localStorage.removeItem("idMatchItemData");
              return;
            }
            
            // Check if user already claimed this item FIRST - BEFORE setting foundItem
            await this.checkIfAlreadyClaimed(data.id);
            
            // Only set foundItem if not already claimed
            if (!this.alreadyClaimed) {
              this.foundItem = data;
              
              // Ensure image_url is properly formatted
              if (this.foundItem.image_url && !this.foundItem.image_url.startsWith('http')) {
                // If it's a relative path, prepend the backend URL
                const backendUrl = process.env.VUE_APP_API_URL || 'http://localhost:5000';
                this.foundItem.image_url = backendUrl + this.foundItem.image_url;
              }
            }
            
            localStorage.removeItem("idMatchItemData");
            this.loading = false;
            return;
          }
        }

        if (!itemId) {
          console.error("No item ID provided");
          this.loading = false;
          return;
        }

        // Fetch item details from backend
        const response = await fetch(`/api/items/${itemId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const item = await response.json();
          
          // Check if user already claimed this item FIRST - BEFORE setting foundItem
          await this.checkIfAlreadyClaimed(itemId);
          
          // Only set foundItem if not already claimed
          if (!this.alreadyClaimed) {
            this.foundItem = item;
            
            // Ensure image_url is properly formatted
            if (this.foundItem.image_url && !this.foundItem.image_url.startsWith('http')) {
              const backendUrl = process.env.VUE_APP_API_URL || 'http://localhost:5000';
              this.foundItem.image_url = backendUrl + this.foundItem.image_url;
            }
          }
        } else {
          console.error("Failed to fetch item details:", response.status);
        }
      } catch (error) {
        console.error("Error loading item details:", error);
      } finally {
        this.loading = false;
      }
    },

    async checkIfAlreadyClaimed(itemId) {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;

        const user = JSON.parse(userStr);
        const userId = user.id;

        // Check if user has a claim for this item
        const response = await fetch(`/api/claims?user_id=${userId}&item_id=${itemId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const claims = await response.json();
          
          // Check if there's any claim from this user for this item
          if (claims && (Array.isArray(claims) ? claims.length > 0 : claims.user_id === userId)) {
            this.alreadyClaimed = true;
          }
        }
      } catch (error) {
        console.warn("Error checking claims:", error);
        // Continue anyway - if we can't check, just allow claiming
      }
    },

    formatDateTime(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },

    formatStatus(status) {
      if (!status) return "Unknown";
      return status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },

    getStatusBadgeClass(status) {
      const baseClass = "inline-block px-4 py-2 rounded-full font-semibold text-sm";
      switch (status) {
        case "in_security_custody":
          return baseClass + " bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
        case "received":
          return baseClass + " bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
        case "returned":
          return baseClass + " bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
        case "pending":
          return baseClass + " bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
        default:
          return baseClass + " bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
      }
    },

    handleImageError(event) {
      console.error("Failed to load image:", event);
      // Image will show the fallback div automatically
    },

    goBack() {
      this.$router.push("/userdashboard");
    },

    markNotMyID() {
      // Store the rejected ID match
      const rejectedIds = JSON.parse(localStorage.getItem("rejectedIDMatches") || "[]");
      if (this.foundItem && this.foundItem.id && !rejectedIds.includes(this.foundItem.id)) {
        rejectedIds.push(this.foundItem.id);
        localStorage.setItem("rejectedIDMatches", JSON.stringify(rejectedIds));
      }
      this.isNotMyID = true;
    },

    async submitIDClaim() {
      if (!this.foundItem || !this.foundItem.id) {
        alert("Unable to process claim. Item information is missing.");
        return;
      }

      // Show loading screen for 2 seconds
      this.isLoadingClaim = true;
      
      try {
        // Get the current user info
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          alert("Please log in to claim this item.");
          this.isLoadingClaim = false;
          return;
        }

        const user = JSON.parse(userStr);
        const user_id = user.id;

        // Wait 2 seconds before making the request
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Make the claim request
        const response = await fetch("/api/claims", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            user_id: user_id,
            item_id: this.foundItem.id,
            message: this.claimMessage || `I am claiming this ID card with Student ID: ${this.foundItem.student_id}`,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Show success screen - STOP loading state
          this.isLoadingClaim = false;
          this.isClaimSuccess = true;
          this.claimMessage = "";
        } else if (response.status === 409) {
          this.isLoadingClaim = false;
          alert("You have already submitted a claim for this item or a related item.");
          this.showClaimModal = false;
        } else {
          this.isLoadingClaim = false;
          alert(`Failed to submit claim: ${data.message || "Unknown error"}`);
          this.showClaimModal = false;
        }
      } catch (error) {
        this.isLoadingClaim = false;
        console.error("Error claiming item:", error);
        alert("An error occurred while processing your claim. Please try again.");
        this.showClaimModal = false;
      }
    },

    formatTime(timeStr) {
      if (!timeStr) return "N/A";
      try {
        const [hours, minutes] = timeStr.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      } catch {
        return timeStr;
      }
    },

    async loadOfficeHours() {
      try {
        const response = await fetch("http://localhost:5000/api/office-hours/week");
        if (!response.ok) throw new Error("Failed to fetch office hours");

        this.weekSchedule = await response.json();

        // Check if office is open today
        const today = new Date();
        const todayIndex = today.getDay();
        const todayData = this.weekSchedule[todayIndex];
        this.isOfficeOpenToday = todayData?.is_open || false;

        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        this.todayName = dayNames[todayIndex];

        // Set officeHours for template
        this.officeHours = {
          today: {
            open: this.isOfficeOpenToday ? this.formatTime(todayData.opening_time) : "Closed",
            close: this.isOfficeOpenToday ? this.formatTime(todayData.closing_time) : "-",
          }
        };
      } catch (error) {
        console.error("Error loading office hours:", error);
      }
    },

    async claimThisID() {
      if (!this.foundItem || !this.foundItem.id) {
        alert("Unable to process claim. Item information is missing.");
        return;
      }

      this.claimingInProgress = true;

      try {
        // Get the current user info
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          alert("Please log in to claim this item.");
          this.claimingInProgress = false;
          return;
        }

        const user = JSON.parse(userStr);
        const user_id = user.id;

        // Make the claim request
        const response = await fetch("/api/claims", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            user_id: user_id,
            item_id: this.foundItem.id,
            message: `I am claiming this ID card with Student ID: ${this.foundItem.student_id}`,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store item details for the claim submitted page
          try {
            const claimData = {
              student_id: this.foundItem.student_id,
              location: this.foundItem.location,
              name: this.foundItem.name,
            };
            localStorage.setItem("claimSubmittedData", JSON.stringify(claimData));
          } catch (e) {
            console.warn("Failed to store claim data:", e);
          }

          // Navigate to claim submitted success page
          this.$router.push({ name: "ClaimSubmitted" });
        } else if (response.status === 409) {
          // Duplicate claim
          alert("You have already submitted a claim for this item or a related item.");
        } else {
          alert(`Failed to submit claim: ${data.message || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error claiming item:", error);
        alert("An error occurred while processing your claim. Please try again.");
      } finally {
        this.claimingInProgress = false;
      }
    },
  },
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
