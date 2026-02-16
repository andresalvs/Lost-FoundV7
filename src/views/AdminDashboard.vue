<template>
  <div>
    <!-- Email Changed Modal -->
    <transition name="fade">
      <div v-if="showEmailChangedModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div class="bg-white dark:bg-gray-900 border border-emerald-500 rounded-2xl shadow-xl p-8 max-w-md w-full text-center transition-colors duration-200">
          <div class="flex flex-col items-center space-y-4">
            <svg class="h-12 w-12 text-emerald-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <h2 class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Admin Account Changed</h2>
            <p class="text-gray-600 dark:text-gray-300">Your admin email or role has been updated.<br>Please log in again to continue.</p>
            <button @click="logoutToLogin" class="mt-4 px-6 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition duration-300">Go to Login</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Role Change Confirmation Modal -->
    <transition name="fade">
      <div v-if="isRoleChangeModalOpen" class="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-70">
        <div class="bg-white dark:bg-gray-900 border border-emerald-500 rounded-2xl shadow-xl p-8 max-w-md w-full transition-colors duration-200">
          <div class="flex flex-col items-center space-y-4">
            <h2 class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Confirm Role Change</h2>
            <div class="flex items-center space-x-4 mb-4">
              <div v-if="selectedRoleChangeUser?.profile_picture" class="w-20 h-20 rounded-full overflow-hidden">
                <img :src="`${API_BASE_URL}${selectedRoleChangeUser.profile_picture}`" 
                     :alt="selectedRoleChangeUser.full_name"
                     class="w-full h-full object-cover">
              </div>
              <div v-else class="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center">
                <span class="text-2xl text-white font-bold">
                  {{ selectedRoleChangeUser?.full_name?.[0]?.toUpperCase() || '?' }}
                </span>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-300 text-center">{{ roleChangeMessage }}</p>
            <div class="flex space-x-4">
              <button @click="confirmRoleChange" 
                      class="px-6 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition duration-300">
                Confirm
              </button>
              <button @click="cancelRoleChange" 
                      class="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition duration-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete User Confirmation Modal -->
    <transition name="fade">
      <div v-if="userDeleteConfirmation" class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70">
        <div class="bg-white dark:bg-gray-900 border border-red-500 rounded-2xl shadow-xl p-8 max-w-md w-full transition-colors duration-200">
          <div class="flex flex-col items-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-red-600">Delete User</h2>
            <div class="flex items-center space-x-4 mb-4">
              <div v-if="selectedUserToDelete?.profile_picture" class="w-20 h-20 rounded-full overflow-hidden">
                <img :src="`${API_BASE_URL}${selectedUserToDelete.profile_picture}`" 
                     :alt="selectedUserToDelete.full_name"
                     class="w-full h-full object-cover">
              </div>
              <div v-else class="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center">
                <span class="text-2xl text-white font-bold">
                  {{ selectedUserToDelete?.full_name?.[0]?.toUpperCase() || '?' }}
                </span>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-300 text-center mb-2">Are you sure you want to delete this user?</p>
            <p class="text-gray-400 text-sm text-center mb-4">This action cannot be undone.</p>
            <div class="flex space-x-4">
              <button @click="deleteUserConfirmed" 
                      class="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-300">
                Delete
              </button>
              <button @click="cancelUserDelete" 
                      class="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition duration-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Item Details Modal -->
    <transition name="fade">
      <div v-if="selectedItem && !deleteConfirmation" class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 p-4">
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 md:p-8 max-w-5xl w-full max-h-[95vh] overflow-y-auto">
          <div class="flex justify-between items-start mb-6">
            <h2 class="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
              {{ activeReportTab === 'Lost Reports' ? (selectedItem && selectedItem.category === 'id' ? 'Lost ID Details' : 'Lost Item Details') : activeReportTab === 'Found Reports' ? (selectedItem && selectedItem.category === 'id' ? 'Found ID Details' : 'Found Item Details') : 'Item Details' }}
            </h2>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex-shrink-0">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-1">
              <div class="border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 sticky top-0">
                <img v-if="selectedItem.image_url && !imageError" 
                     :src="`${API_BASE_URL}${selectedItem.image_url}`"
                     :alt="selectedItem.name"
                     class="w-full h-80 md:h-96 object-cover">
                <div v-else class="w-full h-80 md:h-96 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span class="text-gray-500 dark:text-gray-400 text-center px-4">No image available</span>
                </div>
              </div>
            </div>

            <div class="md:col-span-2 space-y-6">
              <div>
                <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b-2 border-emerald-500">Item Information</h3>
                <div class="space-y-4">
                  <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Name</p>
                    <p class="text-lg font-bold text-gray-900 dark:text-white mt-1">{{ selectedItem.name }}</p>
                  </div>
                  <!-- For general items: show Brand and Color -->
                  <div v-if="selectedItem.category === 'general'" class="grid grid-cols-2 gap-4">
                    <div class="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                      <p class="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wide">Brand</p>
                      <p class="text-base font-bold text-gray-900 dark:text-white mt-1">{{ selectedItem.brand || 'N/A' }}</p>
                    </div>
                    <div class="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                      <p class="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wide">Color</p>
                      <p class="text-base font-bold text-gray-900 dark:text-white mt-1">{{ selectedItem.color || 'N/A' }}</p>
                    </div>
                  </div>
                  <!-- For ID items: show Student ID, Department, Course/Program -->
                  <div v-else-if="selectedItem.category === 'id'" class="grid grid-cols-1 gap-4">
                    <div class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50">
                      <p class="text-xs text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide">Student ID</p>
                      <p class="text-base font-bold text-gray-900 dark:text-white mt-1">{{ selectedItem.student_id || 'N/A' }}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                        <p class="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wide">Department</p>
                        <p class="text-base font-bold text-gray-900 dark:text-white mt-1">{{ selectedItem.department || 'N/A' }}</p>
                      </div>
                      <div class="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                        <p class="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wide">Course</p>
                        <p class="text-base font-bold text-gray-900 dark:text-white mt-1 text-sm">{{ selectedItem.course_program || selectedItem.course || 'N/A' }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Status</p>
                    <span :class="formatStatus(selectedItem.status).class + ' inline-block px-4 py-2 rounded-full text-sm font-bold mt-2'">
                      {{ formatStatus(selectedItem.status).text }}
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                      <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">{{ activeReportTab === 'Lost Reports' ? 'Location Lost' : 'Location Found' }}</p>
                      <p class="text-base font-bold text-gray-900 dark:text-white mt-1">{{ selectedItem.location || 'N/A' }}</p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                      <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Date & Time</p>
                      <p class="text-base font-bold text-gray-900 dark:text-white mt-1 text-sm">{{ formatDate(selectedItem.datetime) }}</p>
                    </div>
                  </div>
                  <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide mb-2">Description</p>
                    <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{{ selectedItem.description }}</p>
                  </div>
                </div>
              </div>

              <div class="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
                <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b-2 border-emerald-500">Reporter Information</h3>
                <div class="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl flex gap-4">
                  <div class="flex-shrink-0">
                    <div class="w-16 h-16 rounded-full overflow-hidden border-3 border-emerald-500">
                      <img v-if="selectedItem.reporter?.profile_picture && !reporterImageError" 
                           :src="`${API_BASE_URL}${selectedItem.reporter.profile_picture}`"
                           @error="reporterImageError = true"
                           class="w-full h-full object-cover"
                           :alt="selectedItem.reporter.full_name">
                      <div v-else class="w-full h-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                        {{ selectedItem.reporter?.full_name?.[0]?.toUpperCase() || '?' }}
                      </div>
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Name</p>
                    <p class="text-lg font-bold text-gray-900 dark:text-white">{{ selectedItem.reporter?.full_name || 'Anonymous' }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide mt-3">Email</p>
                    <p class="text-base font-semibold text-gray-900 dark:text-white break-all">{{ selectedItem.reporter?.email || 'N/A' }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide mt-3">Contact</p>
                    <p class="text-base font-semibold text-gray-900 dark:text-white">{{ selectedItem.reporter?.contact_number || 'N/A' }}</p>
                    <button
                      v-if="selectedItem.reporter?.id"
                      @click="router.push(`/view-profile/${selectedItem.reporter.id}`)"
                      class="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all font-semibold shadow-md hover:shadow-lg text-sm"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-8 flex justify-end gap-3">
            <button @click="closeModal"
                    class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold">
              Close
            </button>
            <button v-if="activeReportTab === 'Returned History' && selectedItem"
                    @click="confirmDelete(selectedItem)"
                    class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Confirmation Modal (within Item Details) -->
    <transition name="fade">
      <div v-if="deleteConfirmation && selectedItem" class="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-70">
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md w-full transition-colors duration-200 relative">
          <!-- Logo at top-left corner -->
          <div class="absolute top-3 left-3">
            <img src="/lostfound.jpg" alt="Logo" class="h-10 w-10 object-cover rounded">
          </div>

          <div class="flex flex-col items-center space-y-4">
            <!-- Item Image - Enlarged -->
            <div class="mt-4">
              <div v-if="selectedItem.image_url && !selectedItem.imageError" class="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 mx-auto">
                <img :src="`${API_BASE_URL}${selectedItem.image_url}`"
                     @error="selectedItem.imageError = true"
                     :alt="selectedItem.name"
                     class="w-full h-full object-cover">
              </div>
              <div v-else class="w-32 h-32 rounded-lg bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500 flex-shrink-0 mx-auto">
                <span class="text-xs">No Image</span>
              </div>
            </div>

            <!-- Item Name -->
            <div class="text-center">
              <p class="font-semibold text-lg text-gray-900 dark:text-white">{{ selectedItem.name }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedItem.category || 'Unknown Category' }}</p>
            </div>

            <!-- Claimant Information -->
            <div class="flex items-center space-x-4 mb-4 w-full border-t pt-4">
              <div v-if="selectedItem.claimant_profile_picture && !selectedItem.claimantImageError" class="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <img :src="`${API_BASE_URL}${selectedItem.claimant_profile_picture}`"
                     @error="selectedItem.claimantImageError = true"
                     :alt="selectedItem.claimant_name"
                     class="w-full h-full object-cover">
              </div>
              <div v-else class="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                <span class="text-xl text-white font-bold">
                  {{ selectedItem.claimant_name ? selectedItem.claimant_name[0].toUpperCase() : '?' }}
                </span>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-600 dark:text-gray-400">Claimant</p>
                <p class="font-semibold text-gray-900 dark:text-white">{{ selectedItem.claimant_name || 'Unknown' }}</p>
                <p v-if="selectedItem.claimant_email" class="text-xs text-gray-600 dark:text-gray-400">{{ selectedItem.claimant_email }}</p>
              </div>
            </div>

            <!-- Warning Message -->
            <p class="text-gray-600 dark:text-gray-300 text-center mb-2">Are you sure you want to delete this claimed report from the returned history?</p>
            <p class="text-gray-400 text-sm text-center mb-4">This action cannot be undone.</p>

            <!-- Action Buttons -->
            <div class="flex space-x-4 w-full">
              <button @click="deleteReportConfirmed" 
                      class="flex-1 px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-300">
                Delete
              </button>
              <button @click="cancelDelete" 
                      class="flex-1 px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition duration-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Success Message -->
    <transition name="fade">
      <div v-if="deleteSuccessMessage" class="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
        Report deleted from the returned history.
      </div>
    </transition>

    <!-- User Details Modal -->
    <transition name="fade">
      <div v-if="userModal && selectedUser" class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 p-4">
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm md:max-w-2xl w-full max-h-[95vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex justify-between items-start mb-6">
            <h2 class="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">User Details</h2>
            <button @click="closeUserModal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Mobile: Stacked Layout, Desktop: Side by Side -->
          <div class="flex flex-col md:flex-row md:items-start md:space-x-6 gap-6 md:gap-0">
            <!-- Profile Image -->
            <div class="flex-shrink-0 mx-auto md:mx-0">
              <div class="w-40 h-40 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-800 shadow-md">
                <img
                  v-if="selectedUser.profile_picture"
                  :src="`${API_BASE_URL}${selectedUser.profile_picture}`"
                  class="w-full h-full object-cover"
                  :alt="selectedUser.full_name"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-5xl md:text-4xl font-bold"
                >
                  {{ selectedUser.full_name ? selectedUser.full_name[0].toUpperCase() : '?' }}
                </div>
              </div>
            </div>

            <!-- User Info -->
            <div class="flex-grow space-y-4">
              <div class="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-emerald-100 dark:border-emerald-800">
                <label class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Full Name</label>
                <p class="text-gray-900 dark:text-white text-lg font-semibold mt-1">{{ selectedUser.full_name || 'Not provided' }}</p>
              </div>

              <div>
                <label class="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Email</label>
                <p class="text-gray-900 dark:text-white font-medium mt-1 break-all text-sm">{{ selectedUser.email }}</p>
              </div>

              <div>
                <label class="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Role</label>
                <p class="text-gray-900 dark:text-white capitalize mt-1">
                  <span v-if="selectedUser.role === 'security'" class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold rounded-full text-sm inline-block">Security Staff</span>
                  <span v-else-if="selectedUser.role === 'admin'" class="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold rounded-full text-sm inline-block">Administrator</span>
                  <span v-else class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-semibold rounded-full text-sm inline-block">University Member</span>
                </p>
              </div>

              <div v-if="selectedUser.id_number">
                <label class="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">ID Number</label>
                <p class="text-gray-900 dark:text-white font-medium mt-1">{{ selectedUser.id_number }}</p>
              </div>

              <div v-if="selectedUser.department">
                <label class="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Department</label>
                <p class="text-gray-900 dark:text-white font-medium mt-1">{{ selectedUser.department }}</p>
              </div>

              <div v-if="selectedUser.course_program">
                <label class="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Course/Program</label>
                <p class="text-gray-900 dark:text-white font-medium mt-1">{{ selectedUser.course_program }}</p>
              </div>

              <div v-if="selectedUser.created_at">
                <label class="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Member Since</label>
                <p class="text-gray-900 dark:text-white font-medium mt-1">{{ new Date(selectedUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
              </div>
            </div>
          </div>

          <!-- Mobile Action Buttons -->
          <div class="mt-8 md:hidden flex flex-col gap-3">
            <button
              v-if="selectedUser.role === 'university_member'"
              @click="changeUserRole(selectedUser, 'security')"
              class="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition font-semibold shadow-md"
            >
              Assign Security
            </button>
            <button
              v-else-if="selectedUser.role === 'security'"
              @click="changeUserRole(selectedUser, 'university_member')"
              class="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition font-semibold shadow-md"
            >
              Revert Role
            </button>
          </div>

          <!-- Close Button -->
          <div class="mt-8 flex justify-center md:hidden">
            <button
              @click="closeUserModal"
              class="px-8 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>

    <div class="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <!-- Sidebar -->
      <AdminSidebar ref="sidebarRef" @select-page="handleSidebarSelect" />
      
      <!-- Main Content -->
      <div class="flex-1 flex flex-col">
        <!-- Navbar -->
        <AdminNavbar @toggle-sidebar="toggleSidebar" />
        
        <main class="p-4 md:p-8 overflow-y-auto flex-1 bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <!-- Dashboard Overview -->
          <div v-if="activePage === 'dashboard'">
            <div class="mb-8">
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
              <p class="text-xs md:text-base text-gray-600 dark:text-gray-400">Overview of lost and found items and system statistics</p>
            </div>

            <!-- Reports Statistics -->
            <div class="mb-8">
              <h2 class="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">Reports Overview</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard title="Total Reports" :count="totalReports" 
                class="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-gray-800 to-white dark:to-gray-700" />
                <DashboardCard title="Resolved Items" :count="resolvedCount" 
                class="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-gray-800 to-white dark:to-gray-700" />
                <DashboardCard title="Pending Items" :count="pendingCount" 
                class="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-gray-800 to-white dark:to-gray-700" />
              </div>
            </div>

            <!-- User Statistics -->
            <div>
              <h2 class="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">User Statistics</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard title="Security Staff" :count="totalSecurityStaff" 
                class="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-gray-800 to-white dark:to-gray-900" />
                <DashboardCard title="University Members" :count="totalUniversityMembers" 
                class="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-gray-800 to-white dark:to-gray-900" />
              </div>
            </div>
          </div>

          <!-- REPORTED ITEMS SECTION -->
          <div v-if="activePage === 'reported-items'">
            <div class="mb-8">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reported Items</h1>
              <p class="text-gray-600 dark:text-gray-400">Manage all lost and found item reports</p>
            </div>

            <!-- Tabs -->
            <div class="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                v-for="tab in reportTabs"
                :key="tab"
                @click="activeReportTab = tab"
                class="px-4 py-3 font-medium transition relative"
                :class="activeReportTab === tab
                  ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'"
              >
                {{ tab }}
                <span
                  v-if="getUnreadCount(tab) > 0"
                  class="ml-2 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full font-semibold"
                >
                  {{ getUnreadCount(tab) }}
                </span>
              </button>
            </div>

            <!-- improved filter/search layout - conditional based on active tab -->
            <div class="mb-6 flex flex-col gap-4" :class="activeReportTab === 'Returned History' ? 'sm:flex-row sm:items-center sm:justify-end' : 'sm:flex-row sm:items-center sm:justify-between'">
              <!-- Lost/Found Reports search -->
              <input
                v-if="activeReportTab !== 'Returned History'"
                v-model="reportSearch"
                @input="reportSearch = formatStudentId(reportSearch)"
                type="text"
                placeholder="Search by name, item, or student ID..."
                class="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1"
              />
              <!-- Returned History search -->
              <input
                v-else
                v-model="returnedSearch"
                @input="returnedSearch = formatStudentId(returnedSearch)"
                type="text"
                placeholder="Search by Item Name or Student ID"
                class="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1"
              />
              <div class="flex gap-2 justify-center sm:justify-end" :class="activeReportTab === 'Found Reports' ? 'sm:justify-start' : ''">
                <!-- Lost/Found Reports category filter -->
                <div v-if="activeReportTab !== 'Returned History'" class="relative" @click.stop>
                  <button
                    @click.stop="showCategoryDropdown = !showCategoryDropdown"
                    class="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer flex items-center gap-2 min-w-[140px]"
                  >
                    {{ categoryFilter === 'id' ? 'ID Items' : categoryFilter === 'general' ? 'General Items' : 'All Categories' }}
                    <svg class="w-5 h-5 transition-transform" :class="{ 'rotate-180': showCategoryDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <div
                    v-if="showCategoryDropdown"
                    class="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border-2 border-emerald-600 rounded-xl shadow-lg z-50"
                    @click.stop
                  >
                    <button
                      @click.stop="categoryFilter = ''; showCategoryDropdown = false"
                      :class="{ 'bg-emerald-600 text-white': categoryFilter === '' }"
                      class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors first:rounded-t-xl"
                    >
                      All Categories
                    </button>
                    <button
                      @click.stop="categoryFilter = 'id'; showCategoryDropdown = false"
                      :class="{ 'bg-emerald-600 text-white': categoryFilter === 'id' }"
                      class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700"
                    >
                      ID Items
                    </button>
                    <button
                      @click.stop="categoryFilter = 'general'; showCategoryDropdown = false"
                      :class="{ 'bg-emerald-600 text-white': categoryFilter === 'general' }"
                      class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700 last:rounded-b-xl"
                    >
                      General Items
                    </button>
                  </div>
                </div>
                <!-- Returned History category filter -->
                <div v-else class="relative" @click.stop>
                  <button
                    @click.stop="showReturnedCategoryDropdown = !showReturnedCategoryDropdown"
                    class="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer flex items-center gap-2 min-w-[140px]"
                  >
                    {{ returnedCategoryFilter === 'id' ? 'ID Items' : returnedCategoryFilter === 'general' ? 'General Items' : 'All Categories' }}
                    <svg class="w-5 h-5 transition-transform" :class="{ 'rotate-180': showReturnedCategoryDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <div
                    v-if="showReturnedCategoryDropdown"
                    class="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border-2 border-emerald-600 rounded-xl shadow-lg z-50"
                    @click.stop
                  >
                    <button
                      @click.stop="returnedCategoryFilter = ''; showReturnedCategoryDropdown = false"
                      :class="{ 'bg-emerald-600 text-white': returnedCategoryFilter === '' }"
                      class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors first:rounded-t-xl"
                    >
                      All Categories
                    </button>
                    <button
                      @click.stop="returnedCategoryFilter = 'id'; showReturnedCategoryDropdown = false"
                      :class="{ 'bg-emerald-600 text-white': returnedCategoryFilter === 'id' }"
                      class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700"
                    >
                      ID Items
                    </button>
                    <button
                      @click.stop="returnedCategoryFilter = 'general'; showReturnedCategoryDropdown = false"
                      :class="{ 'bg-emerald-600 text-white': returnedCategoryFilter === 'general' }"
                      class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700 last:rounded-b-xl"
                    >
                      General Items
                    </button>
                  </div>
                </div>
                <!-- Returned History Download All Button -->
                <button
                  v-if="activeReportTab === 'Returned History' && filteredReturnedHistory.length > 0"
                  @click="openDownloadModal"
                  :disabled="isDownloadingAll || isDownloadingExcel"
                  class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium transition-colors shadow-md whitespace-nowrap"
                  :title="`Download all ${filteredReturnedHistory.length} returned items as PDF`"
                >
                  <svg v-if="!isDownloadingAll" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 10.5L12 15m0 0l4.5-4.5M12 15V3" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 animate-spin">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.995-1.039M9.687 16.464l3.181-3.183" />
                  </svg>
                  <span>{{ isDownloadingAll ? 'Generating...' : `Download All` }}</span>
                </button>
                <div v-if="activeReportTab === 'Found Reports'" class="relative" @click.stop>
                  <button
                    @click.stop="showStatusDropdown = !showStatusDropdown"
                    class="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer flex items-center gap-2 min-w-[140px]"
                  >
                    {{ statusFilter === 'claimed' ? 'Claimed' : statusFilter === 'returned' ? 'Returned' : 'All Status' }}
                    <svg class="w-5 h-5 transition-transform" :class="{ 'rotate-180': showStatusDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <div
                    v-if="showStatusDropdown"
                    class="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border-2 border-emerald-600 rounded-xl shadow-lg z-50"
                    @click.stop
                  >
                    <button
                      @click.stop="statusFilter = ''; showStatusDropdown = false"
                      :class="{ 'bg-emerald-600 text-white': statusFilter === '' }"
                      class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors first:rounded-t-xl"
                    >
                      All Status
                    </button>
                    <button
                      @click.stop="statusFilter = 'pending'; showStatusDropdown = false"
                      :class="{ 'bg-emerald-600 text-white': statusFilter === 'pending' }"
                      class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700"
                    >
                      Pending
                    </button>
                    <button
                      @click.stop="statusFilter = 'in_security_custody'; showStatusDropdown = false"
                      :class="{ 'bg-emerald-600 text-white': statusFilter === 'in_security_custody' }"
                      class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700 last:rounded-b-xl"
                    >
                      In Security Custody
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- improved table styling with better contrast -->
            <div v-if="activeReportTab !== 'Returned History'" class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table class="min-w-full bg-white dark:bg-gray-900 text-left text-sm text-gray-900 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                <thead class="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 transition-colors">
                  <tr>
                    <th class="px-4 py-2">Image</th>
                    <th class="px-4 py-2">Name</th>
                    <th class="hidden md:table-cell px-4 py-2">Category</th>
                    <th class="hidden md:table-cell px-4 py-2">Location</th>
                    <th class="hidden md:table-cell px-4 py-2 whitespace-nowrap">Date & Time</th>
                    <th class="hidden md:table-cell px-4 py-2">Status</th>
                    <th class="hidden md:table-cell px-4 py-2">Reported By</th>
                    <th class="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in pagedReportItems"
                    :key="item.id"
                    class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td class="px-4 py-2">
                      <div v-if="item.image_url && item.image_url !== 'null' && item.image_url.trim() !== '' && !item.imageError" class="w-12 h-12 rounded overflow-hidden">
                        <img
                          :src="`${API_BASE_URL}${item.image_url}`"
                          @error="item.imageError = true"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <div v-else-if="item.category === 'id'" class="w-12 h-12 rounded bg-emerald-500 flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54h3.01l-3.01 4.17h5.1l-2.35-4.17 3.01-3.54z"/>
                        </svg>
                      </div>
                      <div v-else class="w-12 h-12 rounded bg-amber-500 flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </td>
                    <td class="px-4 py-2">{{ item.name || 'N/A' }}</td>
                    <td class="hidden md:table-cell px-4 py-2">{{ item.category === 'id' ? 'ID' : 'Item' }}</td>
                    <td class="hidden md:table-cell px-4 py-2">{{ item.location || 'N/A' }}</td>
                    <td class="hidden md:table-cell px-4 py-2 text-xs">{{ formatDate(item.datetime) }}</td>
                    <td class="hidden md:table-cell px-4 py-2">
                      <span :class="formatStatus(item.status).class">
                        {{ formatStatus(item.status).text }}
                      </span>
                    </td>
                    <td class="hidden md:table-cell px-4 py-2">
                      <div class="flex items-center space-x-2">
                        <img
                          v-if="item.reporter_profile_picture && !item.reporterImageError"
                          :src="`${API_BASE_URL}${item.reporter_profile_picture}`"
                          @error="item.reporterImageError = true"
                          class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                        />
                        <div
                          v-else
                          class="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold"
                        >
                          {{ item.reporter_name ? item.reporter_name[0].toUpperCase() : '?' }}
                        </div>
                        <span class="text-gray-900 dark:text-white">{{ item.reporter_name || 'Anonymous' }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-2 space-x-2">
                      <button
                        @click="viewItem(item)"
                        class="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition text-s font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination for Lost/Found Reports -->
            <div v-if="activeReportTab !== 'Returned History'" class="flex items-center justify-between mt-4 mb-6">
              <div class="text-sm text-gray-600 dark:text-gray-300">
                Showing {{ reportShowingRange.start }} to {{ reportShowingRange.end }} of {{ reportTotal }} results
              </div>
              <div class="flex items-center gap-2">
                <button @click="prevReportPage" :disabled="reportPage === 1" class="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50">
                  Prev
                </button>
                <button @click="nextReportPage" :disabled="reportPage * reportLimit >= reportTotal" class="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>

            <!-- RETURNED HISTORY SECTION (enhanced with search, filter, and PDF/Print) -->
            <div v-if="activeReportTab === 'Returned History'">
              <div
                v-if="filteredReturnedHistory.length === 0"
                class="border border-gray-200 dark:border-gray-700 rounded-lg h-32 flex items-center justify-center text-gray-600 dark:text-gray-400 italic bg-white dark:bg-gray-900 mb-6 transition-colors"
              >
                No returned items yet.
              </div>

              <div v-else class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table class="min-w-full bg-white dark:bg-gray-900 text-left text-sm text-gray-900 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                  <thead>
                    <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 transition-colors">
                      <th class="px-4 py-2">Image</th>
                      <th class="px-4 py-2">Name</th>
                      <th class="hidden md:table-cell px-4 py-2">Category</th>
                      <th class="hidden md:table-cell px-4 py-2">Return Date</th>
                      <th class="hidden md:table-cell px-4 py-2">Status</th>
                      <th class="hidden md:table-cell px-4 py-2">Claimed By</th>
                      <th class="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in pagedReturnedHistory"
                      :key="item.id"
                      class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td class="px-4 py-2">
                        <div v-if="item.image_url && item.image_url !== 'null' && item.image_url.trim() !== '' && !item.imageError" class="w-12 h-12 rounded overflow-hidden">
                          <img
                            :src="`${API_BASE_URL}${item.image_url}`"
                            @error="item.imageError = true"
                            class="w-full h-full object-cover"
                          />
                        </div>
                        <div v-else-if="item.category === 'id'" class="w-12 h-12 rounded bg-emerald-500 flex items-center justify-center">
                          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54h3.01l-3.01 4.17h5.1l-2.35-4.17 3.01-3.54z"/>
                          </svg>
                        </div>
                        <div v-else class="w-12 h-12 rounded bg-amber-500 flex items-center justify-center">
                          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </td>
                      <td class="px-4 py-2">{{ item.name }}</td>
                      <td class="hidden md:table-cell px-4 py-2">{{ item.category === 'id' ? 'ID' : 'Item' }}</td>
                      <td class="hidden md:table-cell px-4 py-2">{{ formatDate(item.return_date) }}</td>
                      <td class="hidden md:table-cell px-4 py-2">{{ formatStatus(item.status).text }}</td>
                      <td class="hidden md:table-cell px-4 py-2">
                        <div class="flex items-center space-x-2">
                          <img
                            v-if="item.claimant_profile_picture && !item.claimantImageError"
                            :src="`${API_BASE_URL}${item.claimant_profile_picture}`"
                            @error="item.claimantImageError = true"
                            class="w-8 h-8 rounded-full object-cover border border-gray-600"
                            :alt="item.claimant_name || 'Claimant'"
                          />
                          <div
                            v-else
                            class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold"
                          >
                            {{ item.claimant_name ? item.claimant_name[0].toUpperCase() : '?' }}
                          </div>
                          <span class="text-gray-900 dark:text-white text-sm">{{ item.claimant_name || 'Anonymous' }}</span>
                        </div>
                      </td>
                      <td class="px-4 py-2">
                        <div class="flex items-center gap-1">
                        <button
  @click="downloadReturnReport(item)"
  class="flex items-center justify-center gap-1 px-2 md:px-2 py-1 bg-green-500 text-white rounded hover:bg-green-700 text-sm font-medium transition whitespace-nowrap"
  title="Download PDF"
>
  <svg xmlns="http://www.w3.org/2000/svg" 
       fill="none" 
       viewBox="0 0 24 24" 
       stroke-width="1.5" 
       stroke="currentColor" 
       class="w-5 h-5">
    <path stroke-linecap="round" stroke-linejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 10.5L12 15m0 0l4.5-4.5M12 15V3" />
  </svg>
  <span class="hidden md:inline">Download</span>
</button>

                          <button
                            @click="printReturnReport(item)"
                            class="px-2 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600 text-sm font-medium transition whitespace-nowrap"
                            title="Open printable view"
                          >
                            <span class="md:hidden">View</span>
                            <span class="hidden md:inline">View PDF</span>
                          </button>
                          <button
                            @click="confirmDelete(item)"
                            class="flex items-center justify-center px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                            title="Delete item"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination for Returned History -->
              <div class="flex items-center justify-between mt-4 mb-6">
                <div class="text-sm text-gray-600 dark:text-gray-300">
                  Showing {{ returnedShowingRange.start }} to {{ returnedShowingRange.end }} of {{ returnedTotal }} results
                </div>
                <div class="flex items-center gap-2">
                  <button @click="prevReturnedPage" :disabled="returnedPage === 1" class="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50">
                    Prev
                  </button>
                  <button @click="nextReturnedPage" :disabled="returnedPage * returnedLimit >= returnedTotal" class="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Download Modal for Returned History -->
          <div v-if="showDownloadModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
            <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-2xl w-full border border-gray-200 dark:border-gray-700 max-h-[85vh] flex flex-col">
              <!-- Header -->
              <div class="flex justify-between items-center mb-6">
                <div>
                  <h2 class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">Download Returned Reports</h2>
                  <p class="text-gray-600 dark:text-gray-400">Select time period(s) to download</p>
                </div>
                <button
                  @click="showDownloadModal = false"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Time Period Options -->
              <div class="space-y-3 mb-6 max-h-64 overflow-y-auto flex-1">
                <!-- All Time Option -->
                <label class="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-emerald-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  :class="{ 'bg-emerald-50 dark:bg-gray-800 border-emerald-300 dark:border-emerald-600': selectedMonths.has('all-time') }">
                  <input
                    type="checkbox"
                    :checked="selectedMonths.has('all-time')"
                    @change="toggleMonthSelection('all-time')"
                    class="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div class="ml-4 flex-1">
                    <p class="font-semibold text-gray-900 dark:text-white">All Time</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ availableMonthData.allTimeCount }} reports</p>
                  </div>
                </label>

                <!-- Current Month -->
                <label v-if="availableMonthData.currentMonth" 
                  class="flex items-center p-3 border rounded-xl transition-colors"
                  :class="availableMonthData.currentMonth.count === 0 
                    ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-gray-800 cursor-pointer'">
                  <input
                    type="checkbox"
                    :checked="selectedMonths.has(availableMonthData.currentMonth.key)"
                    @change="toggleMonthSelection(availableMonthData.currentMonth.key)"
                    :disabled="availableMonthData.currentMonth.count === 0"
                    class="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="availableMonthData.currentMonth.count > 0 ? 'cursor-pointer' : 'cursor-not-allowed'"
                  />
                  <div class="ml-4 flex-1">
                    <p :class="availableMonthData.currentMonth.count === 0 ? 'text-gray-500 dark:text-gray-600' : 'text-gray-900 dark:text-white'" class="font-semibold">
                      {{ availableMonthData.currentMonth.label }}
                    </p>
                    <p class="text-sm" :class="availableMonthData.currentMonth.count === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'">
                      {{ availableMonthData.currentMonth.count === 0 ? 'No reports' : `${availableMonthData.currentMonth.count} report${availableMonthData.currentMonth.count > 1 ? 's' : ''}` }}
                    </p>
                  </div>
                </label>

                <!-- Previous Months Header -->
                <div v-if="availableMonthData.previousMonths.length > 0" class="pt-4">
                  <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Previous Months</h3>
                </div>

                <!-- Previous Months Options -->
                <label v-for="month in availableMonthData.previousMonths" :key="month.key"
                  class="flex items-center p-3 border rounded-xl cursor-pointer transition-colors"
                  :class="month.count === 0 
                    ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-gray-800'">
                  <input
                    type="checkbox"
                    :checked="selectedMonths.has(month.key)"
                    @change="toggleMonthSelection(month.key)"
                    :disabled="month.count === 0"
                    class="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div class="ml-4 flex-1">
                    <p class="font-semibold" :class="month.count === 0 ? 'text-gray-500 dark:text-gray-600' : 'text-gray-900 dark:text-white'">
                      {{ month.label }}
                    </p>
                    <p class="text-sm" :class="month.count === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'">
                      {{ month.count === 0 ? 'No reports' : `${month.count} report${month.count > 1 ? 's' : ''}` }}
                    </p>
                  </div>
                </label>
              </div>

              <!-- Download Complete Message -->
              <div v-if="showDownloadComplete" class="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-emerald-600 dark:text-emerald-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="font-semibold text-emerald-900 dark:text-emerald-200">Download Complete!</p>
                  <p class="text-sm text-emerald-800 dark:text-emerald-300">Your report PDF is ready. Closing in a moment...</p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div v-if="!showDownloadComplete" class="flex gap-3 justify-end mt-6">
                <button
                  @click="showDownloadModal = false"
                  class="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  @click="executeDownloadByMonth"
                  :disabled="selectedMonths.size === 0 || isDownloadingAll || isDownloadingExcel"
                  class="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium transition-colors flex items-center gap-2"
                >
                  <svg v-if="!isDownloadingAll" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 10.5L12 15m0 0l4.5-4.5M12 15V3" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 animate-spin">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.995-1.039M9.687 16.464l3.181-3.183" />
                  </svg>
                  {{ isDownloadingAll ? 'Generating...' : 'PDF' }}
                </button>

                <button
                  @click="executeExcelDownload"
                  :disabled="selectedMonths.size === 0 || isDownloadingAll || isDownloadingExcel"
                  class="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition-colors flex items-center gap-2"
                >
                  <svg v-if="!isDownloadingExcel" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 10.5L12 15m0 0l4.5-4.5M12 15V3" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 animate-spin">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.995-1.039M9.687 16.464l3.181-3.183" />
                  </svg>
                  {{ isDownloadingExcel ? 'Generating...' : 'Excel' }}
                </button>
              </div>
            </div>
          </div>

          <!-- USERS MANAGEMENT SECTION -->
          <div v-if="activePage === 'users'">
            <div class="mb-8">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management</h1>
              <p class="text-gray-600 dark:text-gray-400">Manage system users and their roles</p>
            </div>

            <!-- Users Table -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Users</h3>
              
              <!-- improved filter section -->
              <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <input
                  v-model="userSearch"
                  type="text"
                  placeholder="Search by name or email..."
                  class="flex-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div class="relative flex justify-center sm:justify-end" @click.stop>
                  <button
                    @click.stop="showUserRoleDropdown = !showUserRoleDropdown"
                    class="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer flex items-center gap-2 min-w-[140px]"
                  >
                    {{ userRoleFilter === 'university_member' ? 'University Member' : userRoleFilter === 'security' ? 'Security Staff' : userRoleFilter === 'admin' ? 'Administrator' : 'All Roles' }}
                    <svg class="w-5 h-5 transition-transform" :class="{ 'rotate-180': showUserRoleDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <div
                    v-if="showUserRoleDropdown"
                    class="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border-2 border-emerald-600 rounded-xl shadow-lg z-50 sm:right-0"
                    @click.stop
                  >
                    <button
                      @click.stop="userRoleFilter = ''; showUserRoleDropdown = false"
                      :class="{ 'bg-emerald-600 text-white': userRoleFilter === '' }"
                      class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors first:rounded-t-xl"
                    >
                      All Roles
                    </button>
                    <button
                      @click.stop="userRoleFilter = 'university_member'; showUserRoleDropdown = false"
                      :class="{ 'bg-emerald-600 text-white': userRoleFilter === 'university_member' }"
                      class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700"
                    >
                      University Member
                    </button>
                    <button
                      @click.stop="userRoleFilter = 'security'; showUserRoleDropdown = false"
                      :class="{ 'bg-emerald-600 text-white': userRoleFilter === 'security' }"
                      class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700"
                    >
                      Security Staff
                    </button>
                    <button
                      @click.stop="userRoleFilter = 'admin'; showUserRoleDropdown = false"
                      :class="{ 'bg-emerald-600 text-white': userRoleFilter === 'admin' }"
                      class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700 last:rounded-b-xl"
                    >
                      Administrator
                    </button>
                  </div>
                </div>
              </div>

              <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Profile</th>
                      <th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Name</th>
                      <th class="hidden md:table-cell px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Email</th>
                      <th class="hidden md:table-cell px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Role</th>
                      <th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="user in pagedUsers"
                      :key="user.id"
                      class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <td class="px-6 py-4">
                        <img
                          v-if="user.profile_picture"
                          :src="`${API_BASE_URL}${user.profile_picture}`"
                          class="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                        />
                        <div
                          v-else
                          class="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm"
                        >
                          {{ user.full_name ? user.full_name[0].toUpperCase() : '?' }}
                        </div>
    
                      </td>
                      <td class="px-6 py-4 text-gray-900 dark:text-white font-medium">{{ user.full_name || 'N/A' }}</td>
                      <td class="hidden md:table-cell px-6 py-4 text-gray-700 dark:text-gray-300">{{ user.email || 'N/A' }}</td>
                      <td class="hidden md:table-cell px-6 py-4">
                        <span v-if="user.role === 'security'" 
                       
                        class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">Security Staff</span>
                        <span v-else-if="user.role === 'admin'" 
                        class="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-full text-xs font-semibold">Administrator</span>
                        <span v-else class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs font-semibold">University Member</span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex gap-2">
                          <button
                            @click="viewUser(user)"
                            class="px-3 py-1 bg-emerald-400 text-white rounded hover:bg-emerald-700 transition text-s font-medium"
                          >
                            View
                          </button>
                          <button
                            v-if="user.role === 'university_member'"
                            @click="changeUserRole(user, 'security')"
                            class="hidden md:inline-block px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-s font-medium whitespace-nowrap"
                          >
                            Assign Security
                          </button>
                          <button
                            v-else-if="user.role === 'security'"
                            @click="changeUserRole(user, 'university_member')"
                            class="hidden md:inline-block px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition text-s font-medium whitespace-nowrap"
                          >
                            Revert Role
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination for Users -->
              <div class="flex items-center justify-between mt-4 mb-6">
                <div class="text-sm text-gray-600 dark:text-gray-300">
                  Showing {{ userShowingRange.start }} to {{ userShowingRange.end }} of {{ userTotal }} users
                </div>
                <div class="flex items-center gap-2">
                  <button @click="prevUserPage" :disabled="userPage === 1" class="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50">
                    Prev
                  </button>
                  <button @click="nextUserPage" :disabled="userPage * userLimit >= userTotal" class="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50">
                    Next
                  </button>
                </div>
              </div>
            </div>

            <!-- Admin Account Update Section -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Admin Account</h2>
                  <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">Update your admin credentials and security settings</p>
                </div>
                <button @click="showAdminUpdate = !showAdminUpdate" class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium">
                  {{ showAdminUpdate ? 'Hide' : 'Update Account' }}
                </button>
              </div>

              <div v-if="showAdminUpdate" class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <form @submit.prevent="updateAdminAccount" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">New Email Address</label>
                      <input
                        v-model="profileForm.email"
                        type="email"
                        placeholder="admin@carsu.edu.ph"
                        class="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Current Password</label>
                      <div class="relative">
                        <input
                          v-model="profileForm.oldPassword"
                          :type="showOldPassword ? 'text' : 'password'"
                          required
                          placeholder="Enter your current password"
                          class="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                        />
                        <button
                          type="button"
                          @click="showOldPassword = !showOldPassword"
                          class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <svg v-if="showOldPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">New Password</label>
                      <div class="relative">
                        <input
                          v-model="profileForm.newPassword"
                          :type="showNewPassword ? 'text' : 'password'"
                          placeholder="Enter new password"
                          class="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                        />
                        <button
                          type="button"
                          @click="showNewPassword = !showNewPassword"
                          class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <svg v-if="showNewPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
                      <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Confirm New Password</label>
                      <div class="relative">
                        <input
                          v-model="profileForm.confirmNewPassword"
                          :type="showConfirmPassword ? 'text' : 'password'"
                          placeholder="Re-enter new password"
                          class="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                        />
                        <button
                          type="button"
                          @click="showConfirmPassword = !showConfirmPassword"
                          class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
                  </div>

                  <div class="flex gap-3">
                    <button
                      type="submit"
                      :disabled="profileFormLoading"
                      class="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {{ profileFormLoading ? 'Updating...' : 'Update Account' }}
                    </button>
                  </div>

                  <div v-if="profileFormError" class="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-sm">
                    {{ profileFormError }}
                  </div>
                  <div v-if="profileFormSuccess" class="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm">
                    {{ profileFormSuccess }}
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- OFFICE HOURS MANAGEMENT SECTION -->
          <div v-if="activePage === 'office-hours'">
            <EditableOfficeHours />
          </div>

          <!-- SETTINGS SECTION -->
          <div v-if="activePage === 'settings'">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Settings</h1>
            
            <div class="max-w-2xl mx-auto">
              <!-- Data Retention Card -->
              <div class="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg mb-6 relative z-10">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">Data Retention</h3>
                </div>

                <div class="space-y-6">
                  <!-- Automatic Deletion Toggle -->
                  <div 
                    @click="settingsStore.toggleRetentionEnabled()"
                    class="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div class="flex-1 text-left">
                      <h4 class="font-bold text-gray-900 dark:text-white">Auto-Delete Returned Reports</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Automatically remove reports from history after they have been returned for the period set below.</p>
                    </div>
                    <button 
                      type="button"
                      :class="[
                        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer',
                        settingsStore.retentionEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                      ]"
                    >
                      <span 
                        :class="[
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                          settingsStore.retentionEnabled ? 'translate-x-6' : 'translate-x-1'
                        ]"
                      />
                    </button>
                  </div>

                  <!-- Retention Period Control -->
                  <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex-1 text-left">
                        <h4 class="font-bold text-gray-900 dark:text-white">Retention Duration</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Number of months to keep records in the returned history.</p>
                      </div>
                      <div class="flex items-center gap-2" v-if="!settingsStore.isTestMode">
                        <input 
                          type="number" 
                          min="1" 
                          max="120"
                          :value="settingsStore.retentionMonths"
                          @input="settingsStore.setRetentionMonths($event.target.value)"
                          class="w-20 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-center font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">Months</span>
                      </div>
                      <div v-else class="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg font-bold text-sm">
                        2 Minutes (Test Mode)
                      </div>
                    </div>

                    <div 
                      class="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700 cursor-pointer"
                      @click="settingsStore.toggleTestMode()"
                    >
                      <input 
                        type="checkbox" 
                        id="testMode"
                        :checked="settingsStore.isTestMode"
                        readonly
                        class="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer pointer-events-none"
                      />
                      <label for="testMode" class="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer">
                        Enable 2-Minute Test Mode
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Privacy Settings Card -->
              <div class="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg relative z-10">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">Privacy Controls</h3>
                </div>

                <div class="space-y-6">
                  <!-- Global Search Blur -->
                  <div 
                    @click="settingsStore.togglePrivacyBlur()"
                    class="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div class="flex-1 text-left">
                      <h4 class="font-bold text-gray-900 dark:text-white">Search Page Image Privacy Blur</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Blur item images in search results and claim modals for all users.</p>
                    </div>
                    <button 
                      type="button"
                      :class="[
                        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer',
                        settingsStore.privacyBlur ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                      ]"
                    >
                      <span 
                        :class="[
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                          settingsStore.privacyBlur ? 'translate-x-6' : 'translate-x-1'
                        ]"
                      />
                    </button>
                  </div>

                  <!-- Match Results Blur -->
                  <div 
                    @click="settingsStore.toggleMatchResultsBlur()"
                    class="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div class="flex-1 text-left">
                      <h4 class="font-bold text-gray-900 dark:text-white">Match Results Privacy Blur</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Blur images specifically when a user views their Match Result details.</p>
                    </div>
                    <button 
                      type="button"
                      :class="[
                        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer',
                        settingsStore.matchResultsBlur ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                      ]"
                    >
                      <span 
                        :class="[
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                          settingsStore.matchResultsBlur ? 'translate-x-6' : 'translate-x-1'
                        ]"
                      />
                    </button>
                  </div>
                  
                  <div class="flex items-start gap-3 text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                    <span class="text-lg">💡</span>
                    <p>When <strong>ON</strong>, all university viewers will see blurred images. This helps protect identity and sensitive information on IDs or lost items.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable no-unused-vars */
import { ref, reactive, computed, onMounted, watch, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import * as XLSX from "xlsx";
import initSocket from "../socket";
import AdminSidebar from '../components/AdminSidebar.vue';
import AdminNavbar from '../components/AdminNavbar.vue';
import DashboardCard from '../components/DashboardCard.vue';
import EditableOfficeHours from '../components/EditableOfficeHours.vue';
import { settingsStore } from '../stores/settings';

const API_BASE_URL = "http://localhost:5000";
const router = useRouter();
const route = useRoute();
const currentUser = ref(JSON.parse(localStorage.getItem('user') || 'null'));

// Sidebar toggle
const sidebarRef = ref(null);
const toggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.isSidebarOpen = !sidebarRef.value.isSidebarOpen;
  }
};

// Item details modal state
const selectedItem = ref(null);
const imageError = ref(false);
const reporterImageError = ref(false);

// Email change modal state
const showEmailChangedModal = ref(false);
const emailChangedTimer = ref(null);

// Modal for selecting time period before bulk download
const showDownloadModal = ref(false);
const selectedMonths = ref(new Set()); // Track selected month keys (e.g., '2026-01', '2025-12')
const isDownloadingAll = ref(false);
const isDownloadingExcel = ref(false);
const showDownloadComplete = ref(false);

// Logout helper function
const logoutToLogin = () => {
  localStorage.removeItem('token');
  router.push('/admin-login');
};

// ====================
// Persisted Page State
// ====================
const activePage = ref(localStorage.getItem('admin-active-page') || 'dashboard');
const activeReportTab = ref(localStorage.getItem('admin-active-report-tab') || 'Lost Reports');
watch(activePage, (newPage) => {
  localStorage.setItem('admin-active-page', newPage);
});
watch(activeReportTab, (newTab) => {
  localStorage.setItem('admin-active-report-tab', newTab);
});

// ====================
// Static Data
// ====================
const reportTabs = ["Lost Reports", "Found Reports", "Returned History"];



const handleSidebarSelect = (page) => {
  if (page === 'profile') {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.id) {
      router.push(`/profile/${user.id}`);
    } else {
      router.push('/profile');
    }
    return;
  }
  activePage.value = page;
};

watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/admin-dashboard') {
      activePage.value = 'dashboard';
    }
  },
  { immediate: true }
);

// ====================
// Reported Items
// ====================
const lostItems = ref([]);
const foundItems = ref([]);
const returnedHistory = ref([]);
const reportSearch = ref("");
const categoryFilter = ref("");
const statusFilter = ref("");
const showCategoryDropdown = ref(false);
const showStatusDropdown = ref(false);

// ====================
// Returned History Search & Filter
// ====================
const returnedSearch = ref("");
const returnedCategoryFilter = ref("");
const showReturnedCategoryDropdown = ref(false);

// ====================
// Users
// ====================
const users = ref([]);
const userSearch = ref("");
const userRoleFilter = ref("");
const showUserRoleDropdown = ref(false);
const selectedUser = ref(null);
const userModal = ref(false);
// ✅ Removed staffForm — no longer needed

// ====================
// Admin Profile Form ✅
// ====================
const profileForm = reactive({
  email: "",
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: "",
});
const profileFormError = ref("");
const profileFormSuccess = ref("");
const profileFormLoading = ref(false);
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// ====================
// Role & Delete Modal State
// ====================
const isRoleChangeModalOpen = ref(false);
const selectedRoleChangeUser = ref(null);
const targetRole = ref('');
const roleChangeMessage = ref('');
const userDeleteConfirmation = ref(false);
const selectedUserToDelete = ref(null);
const deleteConfirmation = ref(false);
const deleteSuccessMessage = ref(false);

// ====================
// Socket
// ====================
const socket = initSocket();
const autoDeletedIds = new Set();

// ====================
// Fetching
// ====================
const fetchItems = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/items`);
    const rawData = Array.isArray(res.data) ? res.data : [];
    const nextLost = [];
    const nextFound = [];
    const nextReturned = [];
    for (const record of rawData) {
      const item = { ...record, imageError: false, reporterImageError: false, claimantImageError: false };
      const removed = await maybeAutoDeleteReturnedLost(item);
      if (removed) continue;
      // Treat 'marked_returned' (lost items marked returned by staff) as returned
      if (item.type === "lost" && item.status !== "marked_returned") nextLost.push(item);
      if (item.type === "found" && item.status !== "returned") nextFound.push(item);
      // Include all claimed/returned statuses in returned history (both lost and found items)
      const claimedStatuses = ["returned", "claimed", "confirmed_claim", "delivered", "marked_returned"];
      if (claimedStatuses.includes(item.status)) {
        // Normalize return_date for returned items so UI shows a timestamp instead of N/A
        if (!item.return_date) {
          item.return_date = item.return_date || item.returnDate || item.updated_at || item.datetime || item.created_at || null;
          if (!item.return_date) {
            item.return_date = new Date().toISOString();
          }
        }
        nextReturned.push(item);
      }
    }
    lostItems.value = nextLost;
    foundItems.value = nextFound;
    returnedHistory.value = nextReturned;
    
    // Fetch claimant profile data for returned items
    for (const item of returnedHistory.value) {
      await ensureClaimantForItem(item);
    }
  } catch (err) {
    console.error("Error fetching items:", err);
  }
};

const fetchUsers = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/user`);
    const toRole = (role) => {
      if (!role) return "university_member";
      if (role === "security_staff") return "security";
      return role;
    };
    users.value = res.data.map((u) => ({ ...u, role: toRole(u.role) }));
  } catch (err) {
    console.error("Error fetching users:", err);
    alert("Failed to fetch users. Please refresh the page.");
  }
};

const ensureClaimantForItem = async (item) => {
  if (!item) return;
  try {
    // If name exists AND at least one contact/photo field exists, skip fetch
    const hasName = Boolean(item.claimant_name || item.transaction_claimant_name);
    const hasContact = Boolean(item.claimant_email || item.claimant_contact || item.claimant_profile_picture || item.transaction_claimant_email || item.transaction_claimant_contact);
    if (hasName && hasContact) return;

    const claimantId = item.claimant_id || item.transaction_claimant_id || null;
    if (!claimantId) return;

    const profile = await fetchProfileById(claimantId);
    if (profile) {
      // Attach claimant fields expected by templates
      item.claimant_name = item.claimant_name || item.transaction_claimant_name || profile.full_name || profile.name || profile.display_name || item.claimant_name;
      item.claimant_profile_picture = item.claimant_profile_picture || profile.profile_picture || profile.avatar || item.claimant_profile_picture;
      item.claimant_email = item.claimant_email || profile.email || profile.user_email || item.claimant_email;
      // Accept various phone/contact column names: contact_number, contact, phone, mobile
      item.claimant_contact = item.claimant_contact || profile.contact_number || profile.contact || profile.phone || profile.mobile || item.claimant_contact;
    }
  } catch (e) {
    // swallow errors - non-critical UI enhancement
    console.warn('ensureClaimantForItem error', e);
  }
};

const fetchProfileById = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/user/${userId}`);
    return res.data || null;
  } catch (err) {
    console.warn(`Error fetching profile for user ${userId}:`, err);
    return null;
  }
};

// ====================
// Users Management
// ====================
// User statistics
const totalSecurityStaff = computed(() => 
  users.value.filter(u => u.role === 'security').length
);

const totalUniversityMembers = computed(() => 
  users.value.filter(u => u.role === 'university_member').length
);

const filteredUsers = computed(() => {
  const search = userSearch.value?.trim().toLowerCase();
  const role = userRoleFilter.value;

  return users.value.filter(u => {
    // Role filter
    if (role) {
      // normalize roles used in UI: 'security' | 'admin' | 'university_member'
      if (u.role !== role) return false;
    }

    // Search filter
    if (!search) return true;
    return (
      u.full_name?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search)
    );
  });
});

const viewUser = (user) => {
  selectedUser.value = user;
  userModal.value = true;
};

const closeUserModal = () => {
  userModal.value = false;
  selectedUser.value = null;
};

const confirmUserDelete = (user) => {
  selectedUserToDelete.value = user;
  userDeleteConfirmation.value = true;
};

const cancelUserDelete = () => {
  userDeleteConfirmation.value = false;
  selectedUserToDelete.value = null;
};

const deleteUserConfirmed = async () => {
  try {
    const user = selectedUserToDelete.value;
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Missing authentication token. Unable to delete user.");
      alert("Authentication required. Please log in again.");
      return;
    }

    // Check if trying to delete yourself
    if (user.id === currentUser.value?.id) {
      alert("You cannot delete your own account.");
      userDeleteConfirmation.value = false;
      selectedUserToDelete.value = null;
      return;
    }

    // Check if trying to delete another admin
    if (user.role === 'admin') {
      alert("Cannot delete an admin account.");
      userDeleteConfirmation.value = false;
      selectedUserToDelete.value = null;
      return;
    }

    await axios.delete(`${API_BASE_URL}/api/user/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Remove user from the list
    users.value = users.value.filter(u => u.id !== user.id);
    
    // Reset modal state
    userDeleteConfirmation.value = false;
    selectedUserToDelete.value = null;
    
    alert("User deleted successfully.");

  } catch (err) {
    console.error("Error deleting user:", err);
    alert(err.response?.data?.message || "Failed to delete user. Please try again.");
    userDeleteConfirmation.value = false;
    selectedUserToDelete.value = null;
  }
};

// ====================
// Role Change Logic
// ====================
const changeUserRole = (user, newRole) => {
  selectedRoleChangeUser.value = user;
  targetRole.value = newRole;
  isRoleChangeModalOpen.value = true;
  const roleName = newRole === 'security' ? 'Security Staff' : 'University Member';
  roleChangeMessage.value = `Are you sure you want to assign ${user.full_name || user.email} as ${roleName}?`;
};

const confirmRoleChange = async () => {
  try {
    const user = selectedRoleChangeUser.value;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token missing. Please log in again.");
      return;
    }

    const response = await axios.put(
      `${API_BASE_URL}/api/user/${user.id}/assign-role`,
      { role: targetRole.value },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    const updatedUser = response.data.user;
    const index = users.value.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users.value.splice(index, 1, updatedUser);
    }
    
    isRoleChangeModalOpen.value = false;
    selectedRoleChangeUser.value = null;
    const roleName = targetRole.value === 'security' ? 'Security Staff' : 'University Member';
    alert(`${user.full_name || user.email} has been updated to ${roleName}.`);
    targetRole.value = '';
  } catch (error) {
    if (error.response?.status === 401) {
      alert("Your session has expired. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      alert("You don't have permission to change user roles. Admin access required.");
    } else {
      alert("Failed to change user role. Please try again.");
    }
  }
};

const cancelRoleChange = () => {
  isRoleChangeModalOpen.value = false;
  selectedRoleChangeUser.value = null;
  targetRole.value = '';
};

// ====================
// ✅ Admin Account Update Function
// ====================
const updateAdminAccount = async () => {
  profileFormError.value = "";
  profileFormSuccess.value = "";
  const token = localStorage.getItem("token");
  if (!token) {
    profileFormError.value = "Authentication expired. Please sign in again.";
    setTimeout(() => { profileFormError.value = ""; }, 4000);
    return;
  }
  if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmNewPassword) {
    profileFormError.value = "New passwords do not match.";
    setTimeout(() => { profileFormError.value = ""; }, 4000);
    return;
  }
  profileFormLoading.value = true;
    try {
      const payload = {};
      if (profileForm.email) payload.email = profileForm.email.trim();
      if (profileForm.oldPassword) payload.oldPassword = profileForm.oldPassword;
      if (profileForm.newPassword) {
        payload.newPassword = profileForm.newPassword;
        // backend expects 'confirmPassword' for confirmation
        payload.confirmPassword = profileForm.confirmNewPassword;
      }

      const response = await axios.patch(
        `${API_BASE_URL}/api/user/profile`,
        payload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      // Reset form
      profileForm.email = "";
      profileForm.oldPassword = "";
      profileForm.newPassword = "";
      profileForm.confirmNewPassword = "";

      // If backend indicated verification required (email change), show message and keep session
      if (response.data?.needsVerification) {
        profileFormSuccess.value = response.data.message || 'Verification email sent. Please check your new email to confirm the change.';
        setTimeout(() => { profileFormSuccess.value = ""; }, 8000);
        return;
      }

      // For password changes (or other immediate updates), force re-login
      alert("Account updated. Please sign in again with your new credentials.");
      localStorage.removeItem('token');
      router.push('/admin-login');
    } catch (err) {
      const message = err.response?.data?.error || "Failed to update account.";
      profileFormError.value = message;
      console.error("Error updating admin account:", err);
      setTimeout(() => { profileFormError.value = ""; }, 5000);
    } finally {
      profileFormLoading.value = false;
    }
};
const showAdminUpdate = ref(false);

// ====================
// Rest of logic (item management, stats, socket, etc.) remains unchanged
// ====================
const viewReporterProfile = (reporterId) => {
  if (reporterId) router.push(`/view-profile/${reporterId}`);
};

// Open the logged-in user's profile page (include id if available)
const openProfile = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    if (stored && stored.id) {
      router.push(`/profile/${stored.id}`);
      return;
    }
  } catch (err) {
    // fall back to profile route without id
  }
  router.push('/profile');
};

// Format Student ID as XXX-XXXXX (3 digits + dash + 5 digits)
const formatStudentId = (value) => {
  if (!value) return '';
  // Remove any dashes first
  const cleaned = value.replace(/-/g, '');
  
  // Check if all characters are digits (only add dash for all-digit inputs)
  const isAllDigits = /^\d+$/.test(cleaned);
  
  if (isAllDigits && cleaned.length > 3) {
    // All digits and more than 3 chars - apply XXX-XXXXX formatting
    return cleaned.slice(0, 3) + '-' + cleaned.slice(3);
  }
  
  // Contains non-digits or 3 chars or less - just return without formatting
  return cleaned;
};

const filteredReportItems = computed(() => {
  let items = [];
  if (activeReportTab.value === "Lost Reports") items = lostItems.value;
  else if (activeReportTab.value === "Found Reports") items = foundItems.value;
  else if (activeReportTab.value === "Returned History") items = returnedHistory.value;
  if (reportSearch.value) {
    const searchLower = reportSearch.value.toLowerCase();
    items = items.filter(i =>
      i.name?.toLowerCase().includes(searchLower) ||
      (i.student_id && i.student_id.toLowerCase().includes(searchLower)) ||
      (i.brand && i.brand.toLowerCase().includes(searchLower)) ||
      (i.color && i.color.toLowerCase().includes(searchLower)) ||
      (i.department && i.department.toLowerCase().includes(searchLower)) ||
      (i.course && i.course.toLowerCase().includes(searchLower)) ||
      (i.course_program && i.course_program.toLowerCase().includes(searchLower))
    );
  }
  if (categoryFilter.value) items = items.filter(i => i.category === categoryFilter.value);
  if (statusFilter.value && activeReportTab.value === "Found Reports") {
    items = items.filter(i => i.status === statusFilter.value);
  }
  return items;
});

// ====================
// Returned History Filtering
// ====================
const filteredReturnedHistory = computed(() => {
  let items = returnedHistory.value;
  if (returnedSearch.value) {
    const searchLower = returnedSearch.value.toLowerCase();
    items = items.filter(
      (i) =>
        i.name?.toLowerCase().includes(searchLower) ||
        (i.student_id && i.student_id.toLowerCase().includes(searchLower)) ||
        (i.brand && i.brand.toLowerCase().includes(searchLower)) ||
        (i.color && i.color.toLowerCase().includes(searchLower)) ||
        (i.department && i.department.toLowerCase().includes(searchLower)) ||
        (i.course && i.course.toLowerCase().includes(searchLower)) ||
        (i.course_program && i.course_program.toLowerCase().includes(searchLower)) ||
        (i.claimant_name && i.claimant_name.toLowerCase().includes(searchLower)) ||
        (i.transaction_claimant_name && i.transaction_claimant_name.toLowerCase().includes(searchLower)) ||
        (i.reporter_name && i.reporter_name.toLowerCase().includes(searchLower))
    );
  }
  if (returnedCategoryFilter.value)
    items = items.filter((i) => i.category === returnedCategoryFilter.value);
  return items;
});

// ====================
// Pagination: Reports (Lost/Found), Returned History, and Users
// ====================
// Reports (Lost/Found)
const reportPage = ref(1);
const reportLimit = ref(10);
const reportTotal = computed(() => filteredReportItems.value.length);
const pagedReportItems = computed(() => {
  const start = (reportPage.value - 1) * reportLimit.value;
  return filteredReportItems.value.slice(start, start + reportLimit.value);
});
const reportShowingRange = computed(() => {
  const total = reportTotal.value;
  if (total === 0) return { start: 0, end: 0 };
  const start = (reportPage.value - 1) * reportLimit.value + 1;
  const end = Math.min(total, reportPage.value * reportLimit.value);
  return { start, end };
});
const prevReportPage = () => { if (reportPage.value > 1) reportPage.value -= 1; };
const nextReportPage = () => { if (reportPage.value * reportLimit.value < reportTotal.value) reportPage.value += 1; };
watch([filteredReportItems, () => activeReportTab.value], () => { reportPage.value = 1; });

// Returned History pagination
const returnedPage = ref(1);
const returnedLimit = ref(10);
const returnedTotal = computed(() => filteredReturnedHistory.value.length);
const pagedReturnedHistory = computed(() => {
  const start = (returnedPage.value - 1) * returnedLimit.value;
  return filteredReturnedHistory.value.slice(start, start + returnedLimit.value);
});
const returnedShowingRange = computed(() => {
  const total = returnedTotal.value;
  if (total === 0) return { start: 0, end: 0 };
  const start = (returnedPage.value - 1) * returnedLimit.value + 1;
  const end = Math.min(total, returnedPage.value * returnedLimit.value);
  return { start, end };
});
const prevReturnedPage = () => { if (returnedPage.value > 1) returnedPage.value -= 1; };
const nextReturnedPage = () => { if (returnedPage.value * returnedLimit.value < returnedTotal.value) returnedPage.value += 1; };
watch(filteredReturnedHistory, () => { returnedPage.value = 1; });

// Users pagination
const userPage = ref(1);
const userLimit = ref(10);
const userTotal = computed(() => filteredUsers.value.length);
const pagedUsers = computed(() => {
  const start = (userPage.value - 1) * userLimit.value;
  return filteredUsers.value.slice(start, start + userLimit.value);
});
const userShowingRange = computed(() => {
  const total = userTotal.value;
  if (total === 0) return { start: 0, end: 0 };
  const start = (userPage.value - 1) * userLimit.value + 1;
  const end = Math.min(total, userPage.value * userLimit.value);
  return { start, end };
});
const prevUserPage = () => { if (userPage.value > 1) userPage.value -= 1; };
const nextUserPage = () => { if (userPage.value * userLimit.value < userTotal.value) userPage.value += 1; };
watch(filteredUsers, () => { userPage.value = 1; });

// Compute available months for download modal
const availableMonthData = computed(() => {
  const monthMap = new Map(); // key: 'YYYY-MM', value: count
  
  // Count reports by month based on return_date
  for (const item of filteredReturnedHistory.value) {
    const returnDate = item.return_date ? new Date(item.return_date) : null;
    if (returnDate && !isNaN(returnDate.getTime())) {
      const year = returnDate.getFullYear();
      const month = String(returnDate.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      monthMap.set(key, (monthMap.get(key) || 0) + 1);
    }
  }

  const allTimeCount = filteredReturnedHistory.value.length;
  
  // Current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentMonthKey = `${currentYear}-${currentMonth}`;
  
  // Build month options
  const months = [];
  const seen = new Set();
  
  // Add current month
  const currentMonthName = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  months.push({
    key: currentMonthKey,
    label: currentMonthName,
    count: monthMap.get(currentMonthKey) || 0
  });
  seen.add(currentMonthKey);
  
  // Add previous months (24 months back)
  for (let i = 1; i <= 24; i++) {
    const date = new Date(currentYear, currentMonth - 1 - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}`;
    
    if (!seen.has(key)) {
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      months.push({
        key,
        label: monthName,
        count: monthMap.get(key) || 0
      });
      seen.add(key);
    }
  }
  
  return {
    allTimeCount,
    currentMonth: months[0],
    previousMonths: months.slice(1)
  };
});

// ====================
// Report Generation Functions
// ====================
const formatDate = (datetime) => {
  if (!datetime) return 'N/A';
  const parsed = new Date(datetime);
  if (Number.isNaN(parsed.getTime())) return 'N/A';

  return parsed.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatStatus = (status) => {
  if (!status) return { text: 'N/A', class: 'text-gray-600 dark:text-gray-400' };
  const statusMap = {
    'in_security_custody': { text: 'In Custody of the Security Office', class: 'px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs text-center font-semibold' },
    'In Security Custody': { text: 'In Custody of the Security Office', class: 'px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs text-center font-semibold' },
    'returned': { text: 'Returned', class: 'text-green-600 dark:text-green-400' },
    'pending': { text: 'Pending', class: 'px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs font-semibold' },
    'lost': { text: 'Lost', class: 'text-red-600 dark:text-red-400' }
  };
  const mapped = statusMap[status];
  if (mapped) return mapped;
  return {
    text: status.charAt(0).toUpperCase() + status.slice(1),
    class: 'text-gray-600 dark:text-gray-400'
  };
};

// Build a full URL for images/APIs: return absolute URL, fixing common misconfigurations
const getFullUrl = (path) => {
  if (!path) return "";
  try {
    const s = String(path);
    if (s.startsWith('http://') || s.startsWith('https://')) return s;

    let base = String(API_BASE_URL || '').trim();
    if (!base) base = window.location.origin || '';
    if (/^:\d+/.test(base)) {
      const origin = window.location.protocol + '//' + window.location.hostname;
      base = origin + base;
      console.warn('getFullUrl: normalized port-only API_BASE_URL to', base);
    }
    if (base.startsWith('//')) base = window.location.protocol + base;
    if (!/^https?:\/\//.test(base)) {
      const origin = window.location.origin || (window.location.protocol + '//' + window.location.hostname);
      base = origin.replace(/\/$/, '') + '/' + base.replace(/^\//, '');
    }
    const combined = base.replace(/\/$/, '') + '/' + s.replace(/^\//, '');
    return combined;
  } catch (e) {
    console.warn('getFullUrl error', e);
    return '';
  }
};

const generateReturnReport = async (item, { download = true, forceType = null } = {}) => {
  if (!item) return;

  // Ensure we have freshest data from backend for this item (fetch by id when possible)
  try {
    const id = item.id || item.item_id || item._id || item.itemId;
    if (id) {
      try {
        const sid = String(id || '');
        const looksLikeNumeric = /^[0-9]+$/.test(sid);
        const looksLikeUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(sid);
        if (!sid.startsWith('txn-') && (looksLikeNumeric || looksLikeUUID)) {
          try {
            const res = await axios.get(`${API_BASE_URL}/api/items/${encodeURIComponent(id)}`);
            if (res && res.data) {
              item = Object.assign({}, item, res.data);
            }
          } catch (e) {
            console.warn('generateReturnReport: failed to fetch fresh item from backend', e?.message || e);
          }
        } else {
          console.debug('generateReturnReport: skipping backend fetch for synthetic/non-numeric id', id);
        }
      } catch (e) { /* ignore */ }
    }
  } catch (e) { /* ignore */ }

  const universityName = 'CARAGA STATE UNIVERSITY';
  const officeName = 'OFFICE OF THE CAMPUS SAFETY AND SECURITY';
  const reportLine3 = 'ACKNOWLEDGEMENT RECEIPT';
  const reportLine4 = 'OF LOST AND FOUND ITEMS';
  const reportDate = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

  const itemDescParts = [];
  if (item.category) itemDescParts.push(item.category);
  if (item.brand) itemDescParts.push(item.brand);
  if (item.color) itemDescParts.push(item.color);
  if (item.condition) itemDescParts.push(item.condition);
  const itemDescription = itemDescParts.length ? itemDescParts.join(', ') : (item.name || 'N/A');

  const foundLocation = item.location || item.found_location || 'N/A';
  const serial = item.serial_number || item.student_id || item.item_serial || 'N/A';
  const returnDate = item.return_date || new Date().toISOString();

  const claimantName = item.claimant_name || item.transaction_claimant_name || item.reporter_name || 'N/A';
  const claimantEmail = item.claimant_email || item.transaction_claimant_email || 'N/A';
  const claimantPhone = item.claimant_contact || item.claimant_phone || item.transaction_claimant_contact || item.transaction_claimant_phone || item.reporter_contact || item.reporter_phone || 'N/A';
  const claimantStudentId = (item.user_claim_status === 'confirmed_claim' && item.transaction_claimant_student_id)
    ? item.transaction_claimant_student_id
    : (item.claimant_student_id || item.transaction_claimant_student_id || item.student_id || item.studentId || 'N/A');

  const reporterName = item.reporter_name || item.reporter?.full_name || 'N/A';
  const reporterEmail = item.reporter_email || item.reporter?.email || 'N/A';
  let reporterStudentId = item.reporter_student_id || item.reporter?.id_number || item.reporter?.student_id || 'N/A';
  const reporterPhone = item.reporter_contact || item.reporter?.contact_number || 'N/A';

  if ((reporterStudentId === 'N/A' || !reporterStudentId) && item.reporter_user_id) {
    try {
      const profileResp = await axios.get(`${API_BASE_URL}/api/profile/${encodeURIComponent(item.reporter_user_id)}`);
      if (profileResp?.data?.id_number) reporterStudentId = profileResp.data.id_number;
    } catch (e) { /* ignore */ }
  }

  const verificationDate = returnDate;
  const verificationOfficer = currentUser.value?.full_name || 'Administrator';
  const returnMethod = item.return_method || 'In-person pickup';

  try {
    const jsPDFModule = await import('jspdf');
    const { jsPDF } = jsPDFModule;
    try { await import('jspdf-autotable'); } catch (e) { console.warn('jspdf-autotable not available'); }

    const doc = new jsPDF();
    // helper to load an image URL (or array of candidate paths) and convert to dataURL (base64) for jsPDF
    const loadImageAsDataURL = async (candidates) => {
      if (!candidates) return null;
      const list = Array.isArray(candidates) ? candidates : [candidates];
      const tryPrefixes = [ API_BASE_URL, (process.env.VUE_APP_API_URL || '') ];
      for (const u of list) {
        if (!u) continue;
        const attempts = [];
        try {
          const full = getFullUrl(u) || u;
          attempts.push(full);
          tryPrefixes.forEach(p => {
            try {
              if (p && !String(full).startsWith('http')) {
                const merged = p.replace(/\/$/, '') + '/' + String(u).replace(/^\//, '');
                attempts.push(merged);
              }
            } catch (e) { /* ignore */ }
          });

          for (const fullAttempt of attempts) {
            try { console.debug('loadImageAsDataURL: trying', fullAttempt); } catch (e) { console.warn('console.debug failed', e); }
            const resp = await fetch(fullAttempt);
            if (!resp.ok) continue;
            const blob = await resp.blob();
            const dataUrl = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            if (dataUrl) return dataUrl;
          }
        } catch (e) {
          continue;
        }
      }
      return null;
    };

    // attempt to fetch item and claimant images as data URLs for embedding (try multiple fields)
    // Prefer item-specific image fields for the top/right image
    const itemImageCandidates = [
      item.image_url, item.image, item.photo, item.imagePath, item.image_path,
      item.item_image, item.item_photo, item.display_image, item.displayImage,
      item.item_image_url, item.item_image_path
    ];
    // Claimant/reporter-specific candidates used only for claimant area
    const claimantImageCandidates = [
      item.claimant_profile_picture, item.transaction_claimant_profile_picture, item.transaction_claimant_picture,
      (item.type === 'found' && item.claimant_name) ? null : item.reporter_profile_picture,
      (item.type === 'found' && item.claimant_name) ? null : (item.reporter && item.reporter.profile_picture)
    ];
    const itemImageData = await loadImageAsDataURL(itemImageCandidates);
    const claimantImageData = await loadImageAsDataURL(claimantImageCandidates);

    if (!itemImageData && !claimantImageData) {
      try { console.warn('generateReturnReport: no image data found. tried candidates', { itemImageCandidates, claimantImageCandidates }); } catch (e) { console.warn('generateReturnReport warn failed', e); }
    }

    // Debug log to help map runtime fields when images or ID detection fail
    try {
      console.log('generateReturnReport debug', {
        source: 'AdminDashboard',
        itemKeys: item ? Object.keys(item) : null,
        itemSample: item,
        itemImageCandidates,
        claimantImageCandidates,
        itemImageDataExists: !!itemImageData,
        claimantImageDataExists: !!claimantImageData
      });
    } catch (e) { /* ignore console errors */ }

    let y = 14;
    // Header: three lines (university, office, report title)
    doc.setFontSize(16);
    doc.text(universityName, 14, y);
    y += 8;
    doc.setFontSize(14);
    doc.text(officeName, 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(reportLine3, 14, y);
    y += 7;
    doc.setFontSize(12);
    doc.text(reportLine4, 14, y);
    // place item image on the right if available (detect mime); otherwise draw placeholder box
    if (itemImageData) {
      try {
        const fmt = itemImageData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        doc.addImage(itemImageData, fmt, 150, 8, 40, 40);
      } catch (e) { /* ignore image embed errors */ }
    } else {
      try {
        doc.setDrawColor(200);
        doc.rect(150, 8, 40, 40);
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text('No image', 170, 28, { align: 'center' });
      } catch (e) { /* ignore placeholder draw errors */ }
    }
    // Reset to black so subsequent text is not greyed out
    try { doc.setTextColor(0, 0, 0); } catch (e) { /* ignore */ }
    y += 8;
    // removed redundant subtitle; header lines above are used instead
    doc.setFontSize(10);
    doc.text(`Date of Report: ${reportDate}`, 14, y);

    y += 8;

    // Ensure claimant/profile fields exist by trying to fetch claimant profile
    try { await ensureClaimantForItem(item); } catch (e) { console.warn('ensureClaimantForItem failed', e); }

    // Determine if this record is an ID (student ID) or a generic Item
    // Prefer an explicit indicator from caller, then fall back to any claim_approved notification
    let explicitIsId = null;
    try {
      if (forceType === 'id') explicitIsId = true;
      if (forceType === 'item') explicitIsId = false;
      if (explicitIsId === null) {
        const raw = localStorage.getItem('claim_approved_notification') || localStorage.getItem('acknowledge_notification');
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && (parsed.category === 'id' || parsed.category === 'id_number_match')) explicitIsId = true;
            if (parsed && parsed.category === 'item') explicitIsId = false;
          } catch (e) { /* ignore parse errors */ }
        }
      }
    } catch (e) { /* ignore localStorage errors */ }
    let isId = (() => {
      try {
        const t = ((item.type || item.item_type || item.category || item.item_category || '')).toString().toLowerCase();
        const name = (item.name || item.display_name || item.item_name || '').toString().toLowerCase();
        const sid = (item.student_id || item.item_student_id || item.studentId || item.display_student_id || '').toString().toLowerCase();
        if (item.is_id || item.is_student_id || item.isStudentId) return true;
        // If item name exactly matches claimant/display name, treat as ID (common for returned IDs)
        const claimantNames = [item.claimant_name, item.transaction_claimant_name, item.reporter_name, item.display_name, item.reporter?.full_name].filter(Boolean).map(s => String(s).trim().toLowerCase());
        if (item.name && claimantNames.includes(String(item.name).trim().toLowerCase())) return true;
        // Heuristic: if name looks like a person (contains a space) and there is no brand/color/description, treat as ID when claimant exists
        const looksLikePerson = item.name && /\w+\s+\w+/.test(String(item.name));
        const hasItemProperties = item.brand || item.color || item.description || item.item_brand || item.item_color || item.item_description;
        if (looksLikePerson && !hasItemProperties && (item.claimant_name || item.transaction_claimant_name || item.reporter_name)) return true;
        if (sid) return true;
        if (t.includes('id') || t.includes('student id') || t.includes('student_id')) return true;
        if (/^\d{4,}$/.test(name.replace(/[^0-9]/g, ''))) return true;
        if (name.includes('student id') || name.includes('(id)') || name.includes(' id')) return true;
      } catch (e) {
        // ignore and treat as item
      }
      return false;
    })();

    if (explicitIsId !== null) {
      try { isId = Boolean(explicitIsId); console.log('generateReturnReport: explicitIsId override ->', isId); } catch (e) { console.warn('generateReturnReport explicitIsId override failed', e); }
    }

    // Update the earlier debug log with the isId result
    try { console.log('generateReturnReport debug post-detect', { source: 'AdminDashboard', isId, itemName: item && (item.name || item.display_name) }); } catch (e) { console.warn('generateReturnReport post-detect log failed', e); }

    // Build specific rows depending on whether this is an ID or Item
    let rows = [];
    if (isId) {
      rows = [
        ['Student Name', item.student_name || item.reporter_name || item.reporter?.full_name || item.user_name || item.display_name || item.name || 'N/A'],
        ['Student ID', claimantStudentId],
        ['Department', item.department || item.student_department || item.reporter_department || item.claimant_department || 'N/A'],
        ['Course/Program', item.course || item.program || item.course_program || item.student_program || 'N/A'],
        ['Found Location', foundLocation],
        ['Return Date', formatDate(returnDate)]
      ];
    } else {
      rows = [
        ['Item Name', item.name || item.item_name || item.display_name || 'N/A'],
        ['Brand', item.brand || item.item_brand || 'N/A'],
        ['Color', item.color || item.item_color || 'N/A'],
        ['Description', item.description || item.notes || itemDescription || 'N/A'],
        ['Found Location', foundLocation],
        ['Return Date', formatDate(returnDate)]
      ];
    }

    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: y,
        head: [['Field', 'Value']],
        body: rows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 }
      });
      y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : y + (rows.length * 6) + 8;
    } else {
      doc.setFontSize(12);
      doc.text(isId ? 'ID Return Details' : 'Item Return Details', 14, y);
      y += 8;
      doc.setFontSize(10);
      rows.forEach(([k, v]) => {
        doc.text(`${k}: ${v}`, 14, y);
        y += 6;
        if (y > 270) { doc.addPage(); y = 14; }
      });
    }
    y += 10;
    // Add Claimant Information block
    doc.setFontSize(12);
    doc.text('Claimant Information', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Name: ${claimantName}`, 14, y);
    // claimant image to the right of claimant section label (or placeholder)
    if (claimantImageData) {
      try {
        const fmtC = claimantImageData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        doc.addImage(claimantImageData, fmtC, 150, y - 6, 36, 36);
      } catch (e) { /* ignore */ }
    } else {
      try {
        doc.setDrawColor(200);
        doc.rect(150, y - 6, 36, 36);
        doc.setFontSize(7);
        doc.setTextColor(120);
        doc.text('No image', 150 + 18, y + 12, { align: 'center' });
      } catch (e) { /* ignore */ }
    }
    // Ensure text color and font size are reset so claimant info text is consistent
    try { doc.setTextColor(0, 0, 0); doc.setFontSize(10); } catch (e) { /* ignore */ }
    y += 6;
    doc.text(`Email: ${claimantEmail}`, 14, y);
    y += 6;
    doc.text(`Student ID: ${claimantStudentId}`, 14, y);
    y += 6;
    doc.text(`Phone: ${claimantPhone}`, 14, y);
    y += 10;

    doc.setFontSize(12);
    doc.text('Verification and Return Process', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Claim Verification Date: ${formatDate(verificationDate)}`, 14, y);
    y += 6;
    doc.text(`Verification Officer: ${verificationOfficer}`, 14, y);
    y += 6;
    doc.text(`Return Method: ${returnMethod}`, 14, y);
    y += 10;

    // Reporter Information (no profile picture)
    doc.setFontSize(12);
    doc.text('Reporter Information', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Name: ${reporterName}`, 14, y);
    y += 6;
    doc.text(`Email: ${reporterEmail}`, 14, y);
    y += 6;
    doc.text(`Student ID: ${reporterStudentId}`, 14, y);
    y += 6;
    doc.text(`Phone: ${reporterPhone}`, 14, y);
    y += 10;

    doc.text('Report Prepared By:', 14, y);
    y += 6;
    doc.text(`${verificationOfficer}`, 14, y);
    y += 6;
    doc.text(`${currentUser.value?.email || 'admin@carsu.edu.ph'}`, 14, y);

    const filename = `CSU_Return_Report_${(item.name || item.id || 'item').toString().replace(/\s+/g,'_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    if (download) {
      doc.save(filename);
      return;
    } else {
      try {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        return;
      } catch (e) {
        doc.save(filename);
        return;
      }
    }
  } catch (err) {
    console.warn('jsPDF not available or error generating PDF, falling back to printable HTML', err);
  }

  try {
    const printScript = download ? '' : 'window.print()';
    // Try a set of image candidate fields for the printable HTML view
    const itemImgCandidatesHtml = [
      item.image_url, item.image, item.photo, item.imagePath, item.image_path,
      item.item_image, item.item_photo, item.display_image, item.displayImage,
      item.item_image_url, item.item_image_path
    ];
    let itemImgUrl = '';
    try {
      for (const c of itemImgCandidatesHtml) {
        const f = getFullUrl(c);
        if (f) { itemImgUrl = f; break; }
      }
    } catch (e) { itemImgUrl = getFullUrl(item.image_url) || ''; }
    const isIdHtml = (() => {
      try {
        const t = (item.type || item.item_type || '').toString().toLowerCase();
        const name = (item.name || '').toString().toLowerCase();
        const sid = (item.student_id || item.item_student_id || item.studentId || '').toString().toLowerCase();
        if (sid) return true;
        if (t.includes('id') || t.includes('student id')) return true;
        if (/^\d{4,}$/.test(name.replace(/[^0-9]/g, ''))) return true;
        if (name.includes('student id') || name.includes('(id)') || name.includes(' id')) return true;
      } catch (e) { /* ignore errors while detecting type */ }
      return false;
    })();

    const html = `
      <html><head><title>Return Report</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111} h1,h2{color:#222}</style>
      </head><body>
      <h1>${universityName} - ${officeName}</h1>
      <!-- subtitle removed to match SecurityDashboard header -->
      <p><strong>Date of Report:</strong> ${reportDate}</p>
      <h3>${isIdHtml ? 'ID Return Details' : 'Item Return Details'}</h3>
      ${itemImgUrl ? `<p><img src="${itemImgUrl}" style="max-width:220px;border:1px solid #ddd;padding:6px;margin:6px 0;"/></p>` : `<div style="width:220px;height:140px;border:1px solid #ddd;padding:6px;margin:6px 0;display:flex;align-items:center;justify-content:center;color:#888;background:#fafafa">No image</div>`}
      ${isIdHtml ? `
        <p><strong>Student Name:</strong> ${item.student_name || item.name || 'N/A'}</p>
        <p><strong>Student ID:</strong> ${item.student_id || item.item_student_id || item.studentId || 'N/A'}</p>
        <p><strong>Department:</strong> ${item.department || item.student_department || item.claimant_department || 'N/A'}</p>
        <p><strong>Course/Program:</strong> ${item.course || item.program || item.course_program || 'N/A'}</p>
      ` : `
        <p><strong>Item Name:</strong> ${item.name || 'N/A'}</p>
        <p><strong>Brand:</strong> ${item.brand || 'N/A'}</p>
        <p><strong>Color:</strong> ${item.color || 'N/A'}</p>
        <p><strong>Description:</strong> ${item.description || 'N/A'}</p>
      `}
      <p><strong>Found Location:</strong> ${foundLocation}</p>
      <p><strong>Return Date:</strong> ${formatDate(returnDate)}</p>

      <h3>Claimant Information</h3>
      <p><strong>Name:</strong> ${claimantName}</p>
      <p><strong>Email:</strong> ${claimantEmail}</p>
      <p><strong>Student ID:</strong> ${claimantStudentId}</p>
      <p><strong>Phone:</strong> ${claimantPhone}</p>
      <h3>Verification and Return Process</h3>
      <p><strong>Claim Verification Date:</strong> ${formatDate(verificationDate)}</p>
      <p><strong>Verification Officer:</strong> ${verificationOfficer}</p>
      <p><strong>Return Method:</strong> ${returnMethod}</p>
      
      <h3>Reporter Information</h3>
      <p><strong>Name:</strong> ${reporterName}</p>
      <p><strong>Email:</strong> ${reporterEmail}</p>
      <p><strong>Student ID:</strong> ${reporterStudentId}</p>
      <p><strong>Phone:</strong> ${reporterPhone}</p>

      <h3>Report Prepared By:</h3>
      <p>${verificationOfficer}<br/>${currentUser.value?.email || 'admin@carsu.edu.ph'}</p>
      <script>${printScript}</" + "script>
      </body></html>`;

    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
    } else {
      alert('Unable to open report window. Please allow popups or try again.');
    }
  } catch (e) {
    console.error('Fallback print failed', e);
    alert('Failed to generate report.');
  }
};

const downloadReturnReport = async (item) => {
  if (!item) return;
  await generateReturnReport(item, { download: true });
};

const printReturnReport = async (item) => {
  if (!item) return;
  await generateReturnReport(item, { download: false });
};

// Toggle month selection
const toggleMonthSelection = (monthKey) => {
  // Check if month has reports (skip check for all-time)
  if (monthKey !== 'all-time') {
    let monthData = null;
    if (monthKey === availableMonthData.value.currentMonth?.key) {
      monthData = availableMonthData.value.currentMonth;
    } else {
      monthData = availableMonthData.value.previousMonths?.find(m => m.key === monthKey);
    }
    // Don't allow selecting months with 0 reports
    if (monthData && monthData.count === 0) {
      return;
    }
  }
  
  if (monthKey === 'all-time') {
    if (selectedMonths.value.has('all-time')) {
      selectedMonths.value.delete('all-time');
    } else {
      selectedMonths.value.clear();
      selectedMonths.value.add('all-time');
    }
  } else {
    // Deselect all-time if selecting specific months
    selectedMonths.value.delete('all-time');
    
    if (selectedMonths.value.has(monthKey)) {
      selectedMonths.value.delete(monthKey);
    } else {
      selectedMonths.value.add(monthKey);
    }
  }
};

// Open download modal and reset selections
const openDownloadModal = () => {
  selectedMonths.value.clear();
  showDownloadModal.value = true;
};

// Filter items by selected months and download
const executeDownloadByMonth = async () => {
  if (selectedMonths.value.size === 0 || isDownloadingAll.value) return;
  
  isDownloadingAll.value = true;
  try {
    let itemsToDownload = [];
    
    if (selectedMonths.value.has('all-time')) {
      // Download all filtered items
      itemsToDownload = filteredReturnedHistory.value;
    } else {
      // Filter items by selected months
      itemsToDownload = filteredReturnedHistory.value.filter(item => {
        const returnDate = item.return_date ? new Date(item.return_date) : null;
        if (!returnDate || isNaN(returnDate.getTime())) return false;
        
        const year = returnDate.getFullYear();
        const month = String(returnDate.getMonth() + 1).padStart(2, '0');
        const itemMonthKey = `${year}-${month}`;
        
        return selectedMonths.value.has(itemMonthKey);
      });
    }
    
    // Call the download function with filtered items
    await downloadAllReturnedReportsWithItems(itemsToDownload);
    
    // Show completion message
    showDownloadComplete.value = true;
    
    // Auto-close modal and message after 2 seconds
    setTimeout(() => {
      showDownloadModal.value = false;
      showDownloadComplete.value = false;
    }, 2000);
    
  } finally {
    isDownloadingAll.value = false;
  }
};

// Excel Download Function
const executeExcelDownload = async () => {
  if (selectedMonths.value.size === 0 || isDownloadingExcel.value) return;
  
  isDownloadingExcel.value = true;
  try {
    let itemsToDownload = [];
    
    if (selectedMonths.value.has('all-time')) {
      itemsToDownload = filteredReturnedHistory.value;
    } else {
      itemsToDownload = filteredReturnedHistory.value.filter(item => {
        const returnDate = item.return_date ? new Date(item.return_date) : null;
        if (!returnDate || isNaN(returnDate.getTime())) return false;
        
        const year = returnDate.getFullYear();
        const month = String(returnDate.getMonth() + 1).padStart(2, '0');
        const itemMonthKey = `${year}-${month}`;
        
        return selectedMonths.value.has(itemMonthKey);
      });
    }
    
    if (!itemsToDownload || itemsToDownload.length === 0) {
      alert('No reports to download for the selected period.');
      return;
    }

    // Helper to format date
    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (e) { return 'N/A'; }
    };

    // Separate and map data
    const idData = [];
    const itemData = [];

    // Use a for-loop for async/await fetching of profile data
    for (let i = 0; i < itemsToDownload.length; i++) {
      let item = itemsToDownload[i];
      
      // Fetch fresh data and ensure claimant info for accurate Student IDs
      try {
        const id = item.id || item.item_id || item._id || item.itemId;
        if (id && !String(id).startsWith('txn-')) {
          const res = await axios.get(`${API_BASE_URL}/api/items/${encodeURIComponent(id)}`);
          if (res && res.data) {
            item = Object.assign({}, item, res.data);
          }
        }
      } catch (e) { /* fallback to existing item data */ }
      
      await ensureClaimantForItem(item).catch(() => {});

      const isId = (item.category === 'id' || item.is_id || item.student_id);
      
      // Compute the claimant student ID based on user requirement
      // Support multiple naming conventions from different stages of the data pipeline
      const finalClaimantStudentId = item.claimant_student_id || item.claimantStudentId || item.claimant_profile_id_number || item.transaction_claimant_student_id || 'N/A';
      const finalContactNumber = item.claimant_phone_number || item.claimantPhoneNumber || item.claimant_contact || item.transaction_claimant_contact || 'N/A';
      const finalClaimantName = item.claimant_name || item.claimantName || item.transaction_claimant_name || item.reporter_name || 'N/A';

      if (isId) {
        idData.push({
          'Student Name': item.name || 'N/A',
          'Student ID #': item.student_id || 'N/A',
          'Department': item.department || 'N/A',
          'Course/Program': item.course || 'N/A',
          'Status': item.status || 'Returned',
          'Claimant Name': finalClaimantName,
          'Claimant Student ID #': finalClaimantStudentId,
          'Contact Number': finalContactNumber,
          'Return Date': formatDate(item.return_date)
        });
      } else {
        itemData.push({
          'Item Name': item.name || 'N/A',
          'Brand': item.brand || 'N/A',
          'Color': item.color || 'N/A',
          'Description': item.description || 'N/A',
          'Status': item.status || 'Returned',
          'Claimant Name': finalClaimantName,
          'Claimant Student ID #': finalClaimantStudentId,
          'Contact Number': finalContactNumber,
          'Return Date': formatDate(item.return_date)
        });
      }
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add ID Sheet if data exists
    if (idData.length > 0) {
      const idWorksheet = XLSX.utils.json_to_sheet(idData);
      // Auto-size columns
      const id_max_width = idData.reduce((w, r) => Math.max(w, ...Object.values(r).map(v => String(v).length)), 15);
      idWorksheet['!cols'] = Object.keys(idData[0]).map(() => ({ wch: id_max_width + 2 }));
      XLSX.utils.book_append_sheet(workbook, idWorksheet, "Returned IDs");
    }

    // Add Item Sheet if data exists
    if (itemData.length > 0) {
      const itemWorksheet = XLSX.utils.json_to_sheet(itemData);
      // Auto-size columns
      const item_max_width = itemData.reduce((w, r) => Math.max(w, ...Object.values(r).map(v => String(v).length)), 15);
      itemWorksheet['!cols'] = Object.keys(itemData[0]).map(() => ({ wch: item_max_width + 2 }));
      XLSX.utils.book_append_sheet(workbook, itemWorksheet, "Returned Items");
    }

    // If both are empty (shouldn't happen due to check above), add a placeholder
    if (idData.length === 0 && itemData.length === 0) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{ Message: 'No data' }]), "Empty");
    }

    // Export file
    const fileName = `Returned_Reports_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    // Show completion message
    showDownloadComplete.value = true;
    
    // Auto-close modal after 2 seconds
    setTimeout(() => {
      showDownloadModal.value = false;
      showDownloadComplete.value = false;
    }, 2000);
    
  } catch (error) {
    console.error('Excel Export Error:', error);
    alert('Failed to generate Excel file.');
  } finally {
    isDownloadingExcel.value = false;
  }
};

// Download all returned history items as a single combined PDF
// Download all returned history items as a single combined PDF (respects current filters)
const downloadAllReturnedReportsWithItems = async (itemsToDownload) => {
  if (!itemsToDownload || itemsToDownload.length === 0) {
    alert('No reports to download for the selected period.');
    return;
  }

  try {
    const totalItems = itemsToDownload.length;

    // Use jsPDF to create a single merged PDF
    const jsPDFModule = await import('jspdf');
    const { jsPDF } = jsPDFModule;

    // Try to load autotable plugin
    try { await import('jspdf-autotable'); } catch (e) { console.debug('autotable not available'); }

    // Create the merged document
    const mergedDoc = new jsPDF();
    let isFirstPage = true;

    for (let i = 0; i < totalItems; i++) {
      let item = itemsToDownload[i];
      try {
        // Try to fetch freshest item data from backend
        try {
          const id = item.id || item.item_id || item._id || item.itemId;
          if (id) {
            const sid = String(id || '');
            const looksLikeNumeric = /^[0-9]+$/.test(sid);
            const looksLikeUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(sid);
            if (!sid.startsWith('txn-') && (looksLikeNumeric || looksLikeUUID)) {
              try {
                const res = await axios.get(`${API_BASE_URL}/api/items/${encodeURIComponent(id)}`);
                if (res && res.data) {
                  item = Object.assign({}, item, res.data);
                }
              } catch (e) { /* ignore fetch errors */ }
            }
          }
        } catch (e) { /* ignore fetch prep errors */ }

        // Ensure claimant data
        await ensureClaimantForItem(item).catch(() => {});

        // Add page break before each item (except first)
        if (!isFirstPage) {
          mergedDoc.addPage();
        }
        isFirstPage = false;

        // Generate report content for this item
        const universityName = 'CARAGA STATE UNIVERSITY';
        const officeName = 'OFFICE OF THE CAMPUS SAFETY AND SECURITY';
        const reportLine3 = 'ACKNOWLEDGEMENT RECEIPT';
        const reportLine4 = 'OF LOST AND FOUND ITEMS';
        const reportDate = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

        const itemDescParts = [];
        if (item.category) itemDescParts.push(item.category);
        if (item.brand) itemDescParts.push(item.brand);
        if (item.color) itemDescParts.push(item.color);
        if (item.condition) itemDescParts.push(item.condition);
        const itemDescription = itemDescParts.length ? itemDescParts.join(', ') : (item.name || 'N/A');

        const foundLocation = item.location || item.found_location || 'N/A';
        const returnDate = item.returned_at || item.return_date || new Date().toISOString();
        const claimantName = item.claimant_name || item.transaction_claimant_name || item.reporter_name || 'N/A';
        const claimantEmail = item.claimant_email || item.transaction_claimant_email || 'N/A';
        const claimantStudentId = (item.user_claim_status === 'confirmed_claim' && item.transaction_claimant_student_id)
          ? item.transaction_claimant_student_id
          : (item.claimant_student_id || item.transaction_claimant_student_id || item.student_id || item.studentId || 'N/A');
        const claimantPhone = item.claimant_phone_number || item.claimant_contact || item.transaction_claimant_contact || 'N/A';
        
        const reporterName = item.reporter_name || item.reporter?.full_name || 'N/A';
        const reporterEmail = item.reporter_email || item.reporter?.email || 'N/A';
        let reporterStudentId = item.reporter_student_id || item.reporter?.id_number || item.reporter?.student_id || 'N/A';
        const reporterPhone = item.reporter_contact || item.reporter?.contact_number || 'N/A';

        if ((reporterStudentId === 'N/A' || !reporterStudentId) && item.reporter_user_id) {
          try {
            const profileResp = await axios.get(`${API_BASE_URL}/api/profile/${encodeURIComponent(item.reporter_user_id)}`);
            if (profileResp?.data?.id_number) reporterStudentId = profileResp.data.id_number;
          } catch (e) { /* ignore */ }
        }

        const verificationDate = item.returned_at || returnDate;
        const verificationOfficer = currentUser.value?.full_name || 'Administrator';
        const returnMethod = item.return_method || 'In-person pickup';

        let y = 14;
        mergedDoc.setFontSize(16);
        mergedDoc.text(universityName, 14, y);
        y += 8;
        mergedDoc.setFontSize(14);
        mergedDoc.text(officeName, 14, y);
        y += 8;
        mergedDoc.setFontSize(12);
        mergedDoc.text(reportLine3, 14, y);
        y += 7;
        mergedDoc.setFontSize(12);
        mergedDoc.text(reportLine4, 14, y);
        
        // Load images
        const loadImageAsDataURL = async (candidates) => {
          if (!candidates) return null;
          const list = Array.isArray(candidates) ? candidates : [candidates];
          for (const u of list) {
            if (!u) continue;
            try {
              const full = getFullUrl(u) || u;
              const resp = await fetch(full);
              if (!resp.ok) continue;
              const blob = await resp.blob();
              return await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            } catch (e) { continue; }
          }
          return null;
        };

        const itemImageData = await loadImageAsDataURL([item.image_url, item.image, item.photo]);
        const claimantImageData = await loadImageAsDataURL([item.claimant_profile_picture, item.transaction_claimant_profile_picture]);

        if (itemImageData) {
          try {
            const fmt = itemImageData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
            mergedDoc.addImage(itemImageData, fmt, 150, 8, 40, 40);
          } catch (e) { /* ignore */ }
        }

        y += 18;
        mergedDoc.setFontSize(10);
        mergedDoc.text(`Date of Report: ${reportDate}`, 14, y);
        y += 8;
        mergedDoc.setFontSize(9);
        mergedDoc.text(`Item ${i + 1} of ${totalItems}`, 14, y);
        y += 10;

        // Detect if ID or item
        const isIdItem = (() => {
          const name = (item.name || '').toLowerCase();
          if (item.is_id || name.includes(' id') || name.includes('student id')) return true;
          return false;
        })();

        let rows = [];
        if (isIdItem) {
          rows = [
            ['Student Name', item.student_name || item.name || 'N/A'],
            ['Student ID', claimantStudentId],
            ['Department', item.department || 'N/A'],
            ['Found Location', foundLocation],
            ['Return Date', formatDate(returnDate)]
          ];
        } else {
          rows = [
            ['Item Name', item.name || 'N/A'],
            ['Brand', item.brand || 'N/A'],
            ['Color', item.color || 'N/A'],
            ['Description', itemDescription],
            ['Found Location', foundLocation],
            ['Return Date', formatDate(returnDate)]
          ];
        }

        if (typeof mergedDoc.autoTable === 'function') {
          mergedDoc.autoTable({
            startY: y,
            head: [['Field', 'Value']],
            body: rows,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 }
          });
          y = mergedDoc.lastAutoTable ? mergedDoc.lastAutoTable.finalY + 8 : y + 40;
        }

        y += 8;
        mergedDoc.setFontSize(12);
        mergedDoc.text('Claimant Information', 14, y);
        y += 8;
        mergedDoc.setFontSize(10);
        mergedDoc.text(`Name: ${claimantName}`, 14, y);
        
        if (claimantImageData) {
          try {
            const fmtC = claimantImageData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
            mergedDoc.addImage(claimantImageData, fmtC, 150, y - 6, 36, 36);
          } catch (e) { /* ignore */ }
        }
        
        y += 6;
        mergedDoc.text(`Email: ${claimantEmail}`, 14, y);
        y += 6;
        mergedDoc.text(`Student ID: ${claimantStudentId}`, 14, y);
        y += 6;
        mergedDoc.text(`Phone: ${claimantPhone}`, 14, y);
        y += 10;

        mergedDoc.setFontSize(12);
        mergedDoc.text('Verification and Return Process', 14, y);
        y += 8;
        mergedDoc.setFontSize(10);
        mergedDoc.text(`Claim Verification Date: ${formatDate(verificationDate)}`, 14, y);
        y += 6;
        mergedDoc.text(`Verification Officer: ${verificationOfficer}`, 14, y);
        y += 6;
        mergedDoc.text(`Return Method: ${returnMethod}`, 14, y);

        y += 12;
        mergedDoc.setFontSize(10);
        mergedDoc.text('Received by:', 14, y);
        mergedDoc.text('Date:', 120, y);
        y += 12;
        mergedDoc.line(14, y, 110, y);
        mergedDoc.line(120, y, 190, y);
        mergedDoc.setFontSize(8);
        mergedDoc.text('Owner with Signature', 20, y + 4);

      } catch (itemError) {
        console.error(`Error processing item ${i + 1}:`, itemError);
      }
    }

    mergedDoc.save(`Returned_Items_Report_${new Date().toISOString().split('T')[0]}.pdf`);

  } catch (error) {
    console.error('Error downloading reports:', error);
    alert('Failed to download reports.');
  }
};


const viewItem = async (item) => {
  imageError.value = false;
  reporterImageError.value = false;
  
  // Always fetch fresh item data from backend to ensure we have all reporter information
  try {
    const response = await axios.get(`${API_BASE_URL}/api/items/${encodeURIComponent(item.id)}`);
    selectedItem.value = response.data;
    
    // Map reporter data from backend response fields to reporter object
    if (selectedItem.value.reporter_name) {
      selectedItem.value.reporter = {
        id: selectedItem.value.reporter_user_id || selectedItem.value.reporter_id,
        full_name: selectedItem.value.reporter_name || 'Unknown',
        email: selectedItem.value.reporter_email || 'N/A',
        contact_number: selectedItem.value.reporter_contact || 'N/A',
        profile_picture: selectedItem.value.reporter_profile_picture || null
      };
    }
  } catch (err) {
    console.error('❌ Error fetching item details:', err);
    selectedItem.value = item;
    selectedItem.value.reporter = {
      full_name: 'Unknown',
      email: 'N/A',
      contact_number: 'N/A'
    };
  }
};

const closeModal = () => {
  selectedItem.value = null;
  imageError.value = false;
  reporterImageError.value = false;
};

const confirmDelete = (item) => {
  selectedItem.value = item;
  deleteConfirmation.value = true;
};

const deleteReportConfirmed = async () => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/items/${selectedItem.value.id}`
    );
    const deletedIds = Array.isArray(response.data?.deleted_ids)
      ? response.data.deleted_ids
      : [selectedItem.value.id];
    deletedIds.forEach((deletedId) => {
      autoDeletedIds.add(deletedId);
      removeItemFromLists(deletedId);
    });
    deleteConfirmation.value = false;
    selectedItem.value = null;
    
    // Show success message for 2 seconds
    deleteSuccessMessage.value = true;
    setTimeout(() => {
      deleteSuccessMessage.value = false;
    }, 2000);
  } catch (err) {
    console.error("Error deleting item:", err);
  }
};

const cancelDelete = () => {
  deleteConfirmation.value = false;
  selectedItem.value = null;
};

const removeItemFromLists = (id) => {
  lostItems.value = lostItems.value.filter(i => i.id !== id);
  foundItems.value = foundItems.value.filter(i => i.id !== id);
  returnedHistory.value = returnedHistory.value.filter(i => i.id !== id);
  if (selectedItem.value?.id === id) selectedItem.value = null;
};

async function maybeAutoDeleteReturnedLost(item) {
  // We've disabled auto-deletion of returned lost items to preserve history and prevent cascading deletes
  return false;
}

const totalReports = computed(() =>
  lostItems.value.length + foundItems.value.length + returnedHistory.value.length
);
const resolvedCount = computed(() =>
  foundItems.value.filter(i => i.status !== "pending").length +
  returnedHistory.value.length
);
const pendingCount = computed(() =>
  lostItems.value.filter(i => i.status === "pending").length +
  foundItems.value.filter(i => i.status === "pending").length
);

const unreadLostCount = ref(0);
const unreadFoundCount = ref(0);
const unreadReturnedCount = ref(0);

const getUnreadCount = (tab) => {
  switch (tab) {
    case "Lost Reports": return unreadLostCount.value;
    case "Found Reports": return unreadFoundCount.value;
    case "Returned History": return unreadReturnedCount.value;
    default: return 0;
  }
};

socket.on("newReport", async (report) => {
  const item = { ...report, imageError: false, reporterImageError: false };
  if (await maybeAutoDeleteReturnedLost(item)) return;
  if (item.status === "returned" || item.status === "marked_returned") {
    // ensure claimant info is present for returned/marked_returned items
    try { await ensureClaimantForItem(item); } catch (e) { /* ignore */ }
    returnedHistory.value.unshift(item);
  } else if (item.type === "lost") lostItems.value.unshift(item);
  else if (item.type === "found") foundItems.value.unshift(item);
});

socket.on("reportUpdated", async (updatedReport) => {
  if (await maybeAutoDeleteReturnedLost(updatedReport)) return;
  const normalized = {
    ...updatedReport,
    imageError: false,
    reporterImageError: false,
  };
  removeItemFromLists(normalized.id);
  if (normalized.status === "returned" || normalized.status === "marked_returned") {
    try { await ensureClaimantForItem(normalized); } catch (e) { /* ignore */ }
    returnedHistory.value.unshift(normalized);
  } else if (normalized.type === "found") foundItems.value.unshift(normalized);
  else lostItems.value.unshift(normalized);
});

socket.on("reportDeleted", ({ id }) => {
  removeItemFromLists(id);
});

onMounted(() => {
  fetchItems();
  fetchUsers();
  settingsStore.fetchSettings();
  // If redirected here after email verification, capture token and show success
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'email-verified') {
      const newToken = params.get('token');
      if (newToken) {
        localStorage.setItem('token', newToken);
        profileFormSuccess.value = 'Email change verified and updated.';
        setTimeout(() => { profileFormSuccess.value = ''; }, 5000);
      }
      // Clean the query string to avoid repeating the message
      if (window.history && window.history.replaceState) {
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, document.title, url.toString());
      }
    }
  } catch (err) {
    // ignore
  }

  // Check for email-changed status in query params
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'email-changed') {
      showEmailChangedModal.value = true;
      // Clean the query string
      if (window.history && window.history.replaceState) {
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, document.title, url.toString());
      }
      // Auto-logout after 7 seconds if user doesn't click
      emailChangedTimer.value = setTimeout(() => {
        if (showEmailChangedModal.value) logoutToLogin();
      }, 7000);
    }
  } catch (err) {
    console.error('Error checking email change status:', err);
  }
});

onUnmounted(() => {
  if (emailChangedTimer.value) {
    clearTimeout(emailChangedTimer.value);
    emailChangedTimer.value = null;
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>