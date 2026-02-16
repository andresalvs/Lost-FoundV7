<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center mb-32 py-10 px-4 space-y-10 transition-colors duration-200">
    <!-- Page Title -->
    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-emerald-400 mb-6 text-center">
      {{ isIdItem ? 'Your ID has been found!' : 'Your Item has been found!' }}
    </h1>

    <!-- Loading State -->
    <div v-if="isLoading" class="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center text-gray-900 dark:text-white">
      <p>Loading item details...</p>
    </div>

    <!-- Already Claimed Message -->
    <div v-else-if="isAlreadyClaimed" class="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 text-center">
      <div class="text-2xl font-semibold text-green-700 dark:text-green-300 mb-4">You already claimed this item</div>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">This appears to be a previous notification for an item you already claimed. If you need help, contact the Security Office.</p>
      <button @click="$router.push('/userdashboard')" class="px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold">Back to Dashboard</button>
    </div>

    <!-- Match Details -->
    <template v-else-if="!isAlreadyClaimed && !isNotMyItem && !hasExistingClaim">
      <!-- Found Item Details Card (styled like Found ID Details) -->
      <div class="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
        <!-- Item Image -->
        <div class="w-full flex justify-center mb-6">
          <img
            v-if="match.foundItem?.preview"
            :src="match.foundItem.preview"
            alt="Found Item"
            :class="['w-80 h-80 object-cover rounded-lg border-4 border-emerald-500 shadow-md transition-all duration-300', { 'blur-md': settingsStore.matchResultsBlur }]"
          />
          <div
            v-else
            class="w-80 h-80 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-lg border-4 border-emerald-500"
          >
            <span class="text-center">
              <div class="text-4xl mb-2">📷</div>
              <p>No Image Available</p>
            </span>
          </div>
        </div>

        <!-- Item Information Section -->
        <div class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">{{ isIdItem ? 'Student Information' : 'Item Information' }}</h2>

          <div class="space-y-3">
            <!-- For ID Items -->
            <template v-if="isIdItem">
              <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Student Name</p>
                <p class="text-sm md:text-base font-semibold text-gray-900 dark:text-white mt-1">{{ match.foundItem?.name || 'Not provided' }}</p>
              </div>

              <div class="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800/50">
                <p class="text-xs md:text-sm text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide">Student ID</p>
                <p class="text-sm md:text-base font-bold text-gray-900 dark:text-white mt-1 font-mono">{{ match.foundItem?.studentId || match.foundItem?.student_id || 'N/A' }}</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                  <p class="text-xs md:text-sm text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wide">Department</p>
                  <p class="text-sm md:text-base font-semibold text-gray-900 dark:text-white mt-1">{{ match.foundItem?.department || match.foundItem?.dept || match.foundItem?.department_name || 'Not specified' }}</p>
                </div>
                <div class="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                  <p class="text-xs md:text-sm text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wide">Course</p>
                  <p class="text-sm md:text-base font-semibold text-gray-900 dark:text-white mt-1">{{ match.foundItem?.course || match.foundItem?.program || match.foundItem?.course_program || 'Not specified' }}</p>
                </div>
              </div>
            </template>

            <!-- For Regular Items -->
            <template v-else>
              <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Item Name</p>
                <p class="text-sm md:text-base font-semibold text-gray-900 dark:text-white mt-1">{{ match.foundItem?.name || 'Not provided' }}</p>
              </div>

              <div class="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-200 dark:border-purple-800/50">
                <p class="text-xs md:text-sm text-purple-700 dark:text-purple-400 font-semibold uppercase tracking-wide">Brand</p>
                <p class="text-sm md:text-base font-semibold text-gray-900 dark:text-white mt-1">{{ match.foundItem?.brand || 'Not specified' }}</p>
              </div>

              <div class="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-200 dark:border-purple-800/50">
                <p class="text-xs md:text-sm text-purple-700 dark:text-purple-400 font-semibold uppercase tracking-wide">Color</p>
                <p class="text-sm md:text-base font-semibold text-gray-900 dark:text-white mt-1">{{ match.foundItem?.color || 'Not specified' }}</p>
              </div>

              <div v-if="match.foundItem?.ownerName" class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Owner Name</p>
                <p class="text-sm md:text-base font-semibold text-gray-900 dark:text-white mt-1">{{ match.foundItem.ownerName }}</p>
              </div>
            </template>
          </div>
        </div>

        <!-- Item Details Section -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">Item Details</h2>

          <div class="space-y-3">
            <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Location Found</p>
              <p class="text-sm md:text-base font-semibold text-gray-900 dark:text-white mt-1">📍 {{ match.foundItem?.location || 'Not specified' }}</p>
            </div>

            <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Date & Time Found</p>
              <p class="text-sm md:text-base font-semibold text-gray-900 dark:text-white mt-1">{{ formatDateTime(match.foundItem?.date) }}</p>
            </div>

            <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Status</p>
              <div class="mt-2">
                <span :class="getStatusBadgeClass(match.foundItem?.status)">
                  {{ formatStatus(match.foundItem?.status) }}
                </span>
              </div>
            </div>

            <div v-if="match.foundItem?.description" class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Description</p>
              <p class="text-sm md:text-base text-gray-900 dark:text-white mt-2 whitespace-pre-wrap leading-relaxed">{{ match.foundItem.description }}</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="markNotMyItem"
            class="flex-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-sm md:text-base hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            This is not my Item
          </button>
          <button
            v-if="match.foundItem?.status !== 'received'"
            @click="checkForExistingClaim(); showClaimModal = true"
            class="flex-1 px-4 py-3 rounded-lg bg-emerald-600 text-white font-semibold text-sm md:text-base hover:bg-emerald-700 transition"
          >
            I want to Claim this Item
          </button>
        </div>
      </div>

    </template>

    <!-- Not My Item Message -->
    <div v-if="isNotMyItem" class="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 text-center mt-6">
      <div class="mb-6 flex justify-center">
        <div class="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
      <div class="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">You already confirmed this is not your item</div>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">This appears to be a previous notification for a false item match. If you need help, contact the Security Office.</p>
      <button @click="$router.push('/userdashboard')" class="w-full px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition">
        Back to Dashboard
      </button>
    </div>

    <!-- Existing Claim Message -->
    <div v-else-if="hasExistingClaim" class="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 text-center mt-6">
      <div class="mb-6 flex justify-center">
        <div class="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
      <div class="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Claim Request Submitted</div>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">You have submitted a claim request. Please go to the Security Office for verification and claiming.</p>
      <button @click="$router.push('/userdashboard')" class="w-full px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition">
        Back to Dashboard
      </button>
    </div>

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
        
        <!-- Existing Claim Message -->
        <div v-else-if="hasExistingClaim" class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
          <div class="mb-4 flex justify-center">
            <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <h2 class="text-2xl font-bold mb-2 text-center text-emerald-600 dark:text-emerald-400">Claim Already Submitted</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">You have already submitted a claim for this item. Please wait for the staff to review and approve your request.</p>
          
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

            <!-- View Full Schedule Button -->
            <button 
              @click="showScheduleModal = true"
              class="mt-4 w-full flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline bg-emerald-50 dark:bg-emerald-900/40 p-2 rounded-lg transition border border-emerald-100 dark:border-emerald-800"
            >
              <i class="fas fa-calendar-alt"></i>
              View Full Schedule
            </button>
          </div>
          
          <button
            @click="$router.push('/userdashboard')"
            class="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
          >
            Back to Dashboard
          </button>
        </div>
        
        <!-- Normal Modal -->
        <div v-else-if="!isLoadingClaim && !isClaimSuccess" class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 max-w-md w-full mx-4 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-bold mb-4 mt-0">Add Claim Details</h2>
          <textarea
            v-model="claimMessage"
            rows="4"
            placeholder="Optional: Add details to help security verify your claim."
            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 text-gray-900 dark:text-white bg-white dark:bg-gray-900 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          ></textarea>
          <div v-if="claimResultMessage" class="text-green-600 dark:text-green-400 mb-4 text-center">{{ claimResultMessage }}</div>
          <div class="flex gap-3">
            <button
              @click="showClaimModal = false"
              class="flex-1 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Back
            </button>
            <button
              @click="submitClaim"
              :disabled="claiming"
              class="flex-1 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {{ claiming ? 'Submitting...' : 'Confirm' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modern Schedule Modal -->
      <transition 
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="showScheduleModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showScheduleModal = false"></div>
          
          <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-800">
            <!-- Modal Header -->
            <div class="bg-emerald-600 p-4 text-white flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="fas fa-clock text-xl"></i>
                <h3 class="font-bold text-lg">Office Weekly Schedule</h3>
              </div>
              <button @click="showScheduleModal = false" class="hover:bg-white/20 p-1 rounded-full transition">
                <i class="fas fa-times w-6 h-6 flex items-center justify-center"></i>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-4 max-h-[70vh] overflow-y-auto">
              <div class="space-y-3">
                <div v-for="day in weekDays" :key="day.name" 
                  class="flex items-center justify-between p-3 rounded-xl border transition"
                  :class="[
                    day.name === todayName 
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 ring-1 ring-emerald-500' 
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800'
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-700 dark:text-gray-300 w-24">{{ day.name }}</span>
                    <span v-if="day.name === todayName" class="text-[10px] bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Today</span>
                  </div>
                  
                  <div class="text-right">
                    <div v-if="day.isOpen" class="flex flex-col">
                      <span class="text-sm font-bold text-gray-900 dark:text-white">{{ day.open }} - {{ day.close }}</span>
                      <span class="text-[10px] text-green-600 dark:text-green-400 font-semibold">Open Access</span>
                    </div>
                    <span v-else class="text-sm font-semibold text-red-500 dark:text-red-400 italic">Office Closed</span>
                  </div>
                </div>
              </div>

              <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 flex gap-3">
                <i class="fas fa-info-circle text-blue-500 mt-1"></i>
                <p class="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                   Please visit the security office during these hours to claim your item. Bring your ID for verification.
                </p>
              </div>
            </div>

            <div class="p-4 border-t border-gray-100 dark:border-gray-800">
              <button 
                @click="showScheduleModal = false"
                class="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition"
              >
                Close Schedule
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script>
import { settingsStore } from '../../stores/settings';

export default {
  name: "ItemMatchDetails",
  data() {
    return {
      settingsStore,
      match: {
        lostItem: {},
        foundItem: {}
      },
      claimMessage: "I want to claim this Item",
      claiming: false,
      claimResultMessage: "",
      isNotMyItem: false,
      showClaimModal: false,
      isLoadingClaim: false,
      isClaimSuccess: false,
      showScheduleModal: false,
      hasExistingClaim: false,
      isLoading: true,
      weekSchedule: [],
      isOfficeOpenToday: false,
      todayName: "",
      officeHours: null
    };
  },
  computed: {
    weekDays() {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return this.weekSchedule.map((day, index) => ({
        name: dayNames[index],
        isOpen: day.is_open,
        open: day.is_open ? this.formatTime(day.opening_time) : "Closed",
        close: day.is_open ? this.formatTime(day.closing_time) : "-",
      }));
    },
    isAlreadyClaimed() {
      try {
        const s = (this.match.claim_status || this.match.foundItem?.status || '').toString().toLowerCase();
        const claimedStates = ['claimed', 'confirmed_claim', 'returned', 'returned_to_owner'];
        return claimedStates.includes(s);
      } catch (e) {
        return false;
      }
    },
    isIdItem() {
      try {
        const category = (this.match.foundItem?.category || '').toString().toLowerCase();
        const type = (this.match.foundItem?.type || this.match.foundItem?.item_type || '').toString().toLowerCase();
        const name = (this.match.foundItem?.name || '').toString().toLowerCase();
        const studentId = (this.match.foundItem?.student_id || this.match.foundItem?.studentId || '').toString().toLowerCase();
        
        // Check category field
        if (category === 'id') return true;
        
        // Check type field
        if (type.includes('id') || type === 'student id') return true;
        
        // Check if has student_id
        if (studentId && studentId.length > 0) return true;
        
        // Check name for ID indicators
        if (name.includes('student id') || name.includes('(id)') || name.includes(' id')) return true;
        if (/^\d{4,}$/.test(name.replace(/[^0-9]/g, ''))) return true;
        
        return false;
      } catch (e) {
        return false;
      }
    }
  },
  watch: {
    showClaimModal(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  },
  async mounted() {
    try {
      // Load the selected match from localStorage
      const storedMatch = localStorage.getItem("selectedMatch");
      if (storedMatch) {
        this.match = JSON.parse(storedMatch);
        
        // Get the found item ID to fetch full details from backend
        const foundItemId = this.match.foundItem?.id || this.match.foundItem?.itemId || this.match.found_item_id || this.match.foundItemId || this.match.found_item;
        
        // Check if user already rejected this item
        const rejectedItems = JSON.parse(localStorage.getItem("rejectedItemMatches") || "[]");
        if (foundItemId && rejectedItems.includes(foundItemId)) {
          this.isNotMyItem = true;
          this.isLoading = false;
          return;
        }
        
        // Fetch full item details from backend to get all fields (like department, course)
        if (foundItemId) {
          try {
            const response = await fetch(`/api/items/${foundItemId}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            
            if (response.ok) {
              const fullItemData = await response.json();
              // Merge the backend data with the existing match data
              this.match.foundItem = { ...this.match.foundItem, ...fullItemData };
            }
          } catch (error) {
            console.warn("Failed to fetch full item details from backend:", error);
            // Continue with what we have from localStorage
          }
        }
        
        // Check backend for existing claims - WAIT for completion before rendering details
        await this.checkForExistingClaim();
      }
    } finally {
      this.isLoading = false;
    }
    
    // Load office hours after mounted
    this.loadOfficeHours();
  },
  methods: {
    markNotMyItem() {
      // Store the rejected item match
      const foundItemId = this.match.foundItem?.id || this.match.foundItem?.itemId || this.match.found_item_id || this.match.foundItemId || this.match.found_item;
      if (foundItemId) {
        const rejectedItems = JSON.parse(localStorage.getItem("rejectedItemMatches") || "[]");
        if (!rejectedItems.includes(foundItemId)) {
          rejectedItems.push(foundItemId);
          localStorage.setItem("rejectedItemMatches", JSON.stringify(rejectedItems));
        }
        this.isNotMyItem = true;
      }
    },

    async checkForExistingClaim() {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;

        const user = JSON.parse(userStr);
        const userId = user.id;
        const foundItemId = this.match.foundItem?.id || this.match.foundItem?.itemId || this.match.found_item_id || this.match.foundItemId || this.match.found_item;

        if (!foundItemId) {
          console.warn("No foundItemId found");
          return;
        }

        console.log("Checking for existing claim - userId:", userId, "foundItemId:", foundItemId);

        // Check if user has a claim for this item
        const response = await fetch(`/api/claims?user_id=${userId}&item_id=${foundItemId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const claims = await response.json();
          console.log("Claims response:", claims);
          if (Array.isArray(claims) && claims.length > 0) {
            console.log("Existing claim found!");
            this.hasExistingClaim = true;
          }
        }
      } catch (error) {
        console.warn("Error checking claims:", error);
      }
    },

    async submitClaim() {
      if (this.claiming || this.isAlreadyClaimed) return;
      
      // Show loading screen for 2 seconds
      this.isLoadingClaim = true;
      this.claiming = true;
      this.claimResultMessage = "";
      
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) throw new Error("User not logged in!");
        
        // Try multiple field names to find the found item ID
        const foundItemId =
          this.match.foundItem?.id ||
          this.match.foundItem?.itemId ||
          this.match.found_item_id ||
          this.match.foundItemId ||
          this.match.found_item ||
          null;

        if (!foundItemId) throw new Error("Missing found item ID. (tried multiple fields)");
        
        // Wait 2 seconds before making the request
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Use axios like SearchPage does for consistency
        const API_BASE = "http://localhost:5000";
        const claimRes = await fetch(`${API_BASE}/api/claims`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            item_id: foundItemId,
            notification_id: null,
            message: this.claimMessage || null,
          }),
        });

        let data = null;
        try { data = await claimRes.json(); } catch (e) { data = null; }
        
        if (!claimRes.ok) {
          throw new Error((data && data.message) || "Failed to submit claim request");
        }
        
        // Show success screen - STOP loading state
        this.isLoadingClaim = false;
        this.isClaimSuccess = true;
        this.claimMessage = "";
        this.claimResultMessage = "";
      } catch (err) {
        this.isLoadingClaim = false;
        this.claimResultMessage = `❌ Claim failed: ${err.message}`;
      } finally {
        this.claiming = false;
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
    }
    ,

    formatDateTime(dateString) {
      if (!dateString) return "Not specified";
      try {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      } catch (e) {
        return dateString;
      }
    },

    formatStatus(status) {
      if (!status) return "Pending";
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
    }
  },
};
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: #facc15;
  border-radius: 3px;
}
</style>
