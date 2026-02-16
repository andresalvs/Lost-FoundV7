<template>
  <div class="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
    <!-- Sidebar -->
    <SecuritySidebar 
      ref="sidebarRef"
      :unread-lost="unreadLostCount"
      :unread-found="unreadFoundCount"
      :unread-returned="unreadReturnedCount"
      :pending-claims="sidebarPendingCount"
      @select-page="handleSidebarSelect"
    />

    <!-- Navbar -->
    <nav
      class="fixed top-0 left-0 right-0 bg-white dark:bg-gray-950 shadow-md z-40 flex justify-between items-center px-4 md:px-6 h-20 transition-colors duration-200"
    >
      <div class="flex items-center gap-3">
        <!-- Hamburger Menu Button (mobile only) -->
        <button
          @click="toggleSidebar"
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle navigation"
        >
          <svg class="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Logo Badge -->
        <div class="pl-1 flex items-center gap-3 group cursor-pointer">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0">
            <span class="text-white text-lg">🔍</span>
          </div>
          <!-- Brand Text -->
          <div class="flex-1 min-w-0">
            <h1 class="text-sm font-bold text-foreground truncate">CSU Lost & Found</h1>
            <p class="text-xs text-muted-foreground">Security Portal</p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 md:gap-4" ref="profileMenuRef">
        <!-- Report Item Button (hidden on small mobile) -->
        <button
          @click="goToReportItem"
          title="Report a Found Item"
          class="hidden sm:flex px-3 md:px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden md:inline">Report Item</span>
        </button>

        <!-- Notification (bell) button placed before name/email as requested -->
        <div class="relative" ref="notificationsRef">
          <button
            @click.stop="toggleNotifications"
            title="Notifications"
            class="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span v-if="!notificationsSeen && sidebarPendingCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center">{{ sidebarPendingCount }}</span>
          </button>

          <!-- Minimal Claim Detail Modal - Show only latest claim -->
          <div
            v-if="showNotificationsDropdown && claimNotifications.length > 0"
            class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg shadow-lg border border-emerald-400 dark:border-emerald-600 z-50 p-2.5 transition-colors"
          >
            <!-- Header with close and delete buttons -->
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <h3 class="font-semibold text-xs">New Claim Request</h3>
              </div>
              <div class="flex gap-1">
                <button
                  @click.stop="deleteClaimNotification()"
                  title="Delete this notification"
                  class="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-0.5"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  @click.stop="showNotificationsDropdown = false"
                  class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-0.5"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Latest claim minimal details -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded p-2">
              <!-- Item Image -->
              <div class="mb-2 flex justify-center">
                <img
                  v-if="claimNotifications[0] && (claimNotifications[0].item_image || claimNotifications[0].display_image) && !claimNotifications[0]._modalImageError"
                  :src="getFullUrl(claimNotifications[0].item_image || claimNotifications[0].display_image)"
                  @error="claimNotifications[0]._modalImageError = true"
                  class="h-16 w-16 object-cover rounded-full border-2 border-emerald-500"
                />
                <div v-else class="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400">
                  <span class="text-[9px]">No Image</span>
                </div>
              </div>

              <!-- Item Name -->
              <h4 class="font-semibold text-center text-gray-900 dark:text-white mb-1 text-xs line-clamp-2">
                {{ claimNotifications[0] && claimNotifications[0].item_name || claimNotifications[0] && claimNotifications[0].display_name || 'Unknown Item' }}
              </h4>

              <!-- Claimant Info -->
              <div class="flex items-center gap-1 mb-1.5 p-1 bg-white dark:bg-gray-900 rounded">
                <img
                  v-if="claimNotifications[0] && claimNotifications[0].claimant_profile_picture && !claimNotifications[0]._claimantImageError"
                  :src="getFullUrl(claimNotifications[0].claimant_profile_picture)"
                  @error="claimNotifications[0]._claimantImageError = true"
                  class="w-4 h-4 rounded-full object-cover border border-emerald-500"
                />
                <div v-else class="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold">
                  {{ (claimNotifications[0] && claimNotifications[0].claimant_name || 'U')[0].toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-xs text-gray-900 dark:text-white truncate">{{ claimNotifications[0] && claimNotifications[0].claimant_name || 'Unknown' }}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400 truncate">{{ claimNotifications[0] && claimNotifications[0].claimant_email || 'N/A' }}</p>
                </div>
              </div>

              <!-- Timestamp -->
              <p class="text-[10px] text-gray-600 dark:text-gray-400 text-center mb-1.5">
                {{ formatDate(claimNotifications[0] && claimNotifications[0].created_at) }}
              </p>
            </div>

            <!-- Action Button -->
            <button 
              @click.stop="viewClaimDetails(claimNotifications[0]); showNotificationsDropdown = false"
              class="w-full px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-gray-900 font-medium rounded text-md transition-colors"
            >
              View Details
            </button>
          </div>

          <!-- No Claims Message -->
          <div
            v-if="showNotificationsDropdown && claimNotifications.length === 0"
            class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-4 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">No new claim requests</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">You're all caught up!</p>
              </div>
            </div>
          </div>
        </div>
        <div class="hidden sm:block text-right">
          <p class="font-semibold text-gray-900 dark:text-white">{{ securityDisplayName }}</p>
          <p class="text-xs text-gray-600 dark:text-gray-400">{{ securityDisplayEmail }}</p>
        </div>
        <button
          @click.stop="toggleProfileMenu"
          class="w-10 h-10 rounded-full bg-emerald-500 text-gray-900 flex items-center justify-center font-semibold border-2 border-emerald400 overflow-hidden"
        >
          <img
            v-if="securityAvatar"
            :src="securityAvatar"
            alt="Security Avatar"
            class="w-full h-full object-cover"
          />
          <span v-else>{{ securityInitial }}</span>
        </button>

          <!-- Profile Button -->

        <div
          v-if="showProfileMenu"
          class="absolute right-6 top-14 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 transition-colors"
        >
          <button
            @click="goToProfile"
            class="w-full px-4 py-2 flex items-center gap-2 text-left text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.797.657 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>My Profile</span>
          </button>


<!-- Theme toggle -->

<div class="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center justify-between transition text-gray-900 dark:text-white">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-amber-500 dark:text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 7a5 5 0 100 10 5 5 0 000-10z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>Theme</span>
                </div>

                <div>
                  <ThemeToggle @change="showProfileMenu = false" />
                </div>
              </div>

              <!-- End of Theme toggle -->

          <button
            @click="logout"
            class="w-full px-4 py-2 flex items-center gap-2 text-left text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16 12h4M4 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
    
    <!-- Main Content (responsive padding for sidebar) -->
    <div class="pt-24 md:pl-64 px-4 md:px-6">
      <!-- DASHBOARD -->
      <div v-if="currentPage === 'dashboard'">
        <h2 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Security Dashboard</h2>
        
        <!-- Office Hours Widget -->
        <OfficeHoursWidget />
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-gray-800 to-white dark:to-gray-700 shadow-lg rounded-lg p-4 transition-colors">
            <p class="font-semibold text-gray-900 dark:text-gray-400 text-sm">Lost Reports</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-emerald-400">{{ lostItems.length }}</p>
          </div>
          <div class="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-gray-800 to-white dark:to-gray-700 shadow-lg rounded-lg p-4 transition-colors">
            <p class="font-semibold text-gray-900 dark:text-gray-400 text-sm">Found Reports</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-emerald-400">{{ foundItems.length }}</p>
          </div>
          <div class="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-gray-800 to-white dark:to-gray-700 shadow-lg rounded-lg p-4 transition-colors">
            <p class="font-semibold text-gray-900 dark:text-gray-400 text-sm">Pending Claims</p>
            <p class="text-3xl font-bold text-red-700 dark:text-red-500">{{ pendingClaimsCount }}</p>
          </div>
          <div class="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-gray-800 to-white dark:to-gray-700 shadow-lg rounded-lg p-4 transition-colors">
            <p class="font-semibold text-gray-900 dark:text-gray-400 text-sm">Returned Items</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-green-500">{{ returnedHistory.length }}</p>
          </div>
        </div>
      </div>

      <!-- LOST REPORTS -->
      <div v-if="currentPage === 'lost-reports'">
        <h2 class="text-xl md:text-2xl font-bold mb-4 text-gray-900 dark:text-white">Lost Reports</h2>
        <div class="mb-4 flex flex-col md:flex-row gap-4 md:items-center">
          <input
            v-model="lostSearch"
            @input="lostSearch = formatStudentId(lostSearch)"
            type="text"
            placeholder="Search by Item Name or Student ID"
            class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-full md:flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          />
          <div class="flex justify-center md:justify-start">
            <div class="relative" @click.stop>
              <button
                @click.stop="showLostCategoryDropdown = !showLostCategoryDropdown"
                class="w-auto px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer flex items-center gap-2 min-w-[140px]"
              >
                {{ lostCategoryFilter === 'id' ? 'ID Items' : lostCategoryFilter === 'general' ? 'General Items' : 'All Categories' }}
                <svg class="w-5 h-5 transition-transform" :class="{ 'rotate-180': showLostCategoryDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div
                v-if="showLostCategoryDropdown"
                class="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border-2 border-emerald-600 rounded-xl shadow-lg z-50"
                @click.stop
              >
                <button
                  @click.stop="lostCategoryFilter = ''; showLostCategoryDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': lostCategoryFilter === '' }"
                  class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors first:rounded-t-lg"
                >
                  All Categories
                </button>
                <button
                  @click.stop="lostCategoryFilter = 'id'; showLostCategoryDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': lostCategoryFilter === 'id' }"
                  class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700"
                >
                  ID Items
                </button>
                <button
                  @click.stop="lostCategoryFilter = 'general'; showLostCategoryDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': lostCategoryFilter === 'general' }"
                  class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700 last:rounded-b-lg"
                >
                  General Items
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="filteredLostItems.length === 0"
          class="border border-gray-300 dark:border-gray-700 rounded-lg h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-900 mb-6 transition-colors"
        >
          No lost reports for now.
        </div>

        <!-- Responsive wrapper for table with horizontal scroll on mobile -->
        <div v-else class="mb-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table
            class="w-full bg-white dark:bg-gray-900 text-left text-xs md:text-sm text-gray-900 dark:text-gray-300 transition-colors"
          >
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 transition-colors">
              <th class="px-4 py-2">Image</th>
              <th class="px-4 py-2">Name</th>
              <th class="hidden md:table-cell px-4 py-2">Category</th>
              <th class="hidden md:table-cell px-4 py-2">Details</th>
              <th class="hidden md:table-cell px-4 py-2">Date Lost</th>
              <th class="hidden md:table-cell px-4 py-2">Status</th>
              <th class="hidden md:table-cell px-4 py-2">Reported By</th>
              <th class="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in pagedLostItems"
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
              <td class="hidden md:table-cell px-4 py-2">
                <span
                  v-if="item.category === 'id' && item.student_id"
                  ><strong>Student ID:</strong> {{ item.student_id }}</span
                >
                <span v-else-if="item.brand || item.color">
                  <span v-if="item.brand"><strong>Brand:</strong> {{ item.brand }}</span>
                  <span v-if="item.color" class="ml-2"
                    ><strong>Color:</strong> {{ item.color }}</span
                  >
                </span>
                <span v-else>N/A</span>
              </td>
              <td class="hidden md:table-cell px-4 py-2">{{ formatDate(item.datetime) }}</td>
              <td class="hidden md:table-cell px-4 py-2">
                <span :class="{
                  'px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 rounded-full text-xs text-center font-semibold': item.status === 'returned',
                  'px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs text-center font-semibold': item.status === 'in_security_custody' || item.status === 'In Security Custody',
                  'px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs font-semibold': item.status === 'pending'
                }">
                  {{ formatStatus(item.status) }}
                </span>
              </td>
              <td class="hidden md:table-cell px-4 py-2">
                <div class="flex items-center space-x-2">
                  <img
                    v-if="item.reporter_profile_picture && !item.reporterImageError"
                    :src="`${API_BASE_URL}${item.reporter_profile_picture}`"
                    @error="item.reporterImageError = true"
                    class="w-8 h-8 rounded-full object-cover border border-gray-600"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {{ item.reporter_name ? item.reporter_name.charAt(0).toUpperCase() : '?' }}
                  </div>
                  <span>{{ item.reporter_name || 'Anonymous' }}</span>
                </div>
              </td>
              <td class="px-4 py-2 flex space-x-1 md:space-x-2">
                <button
                  @click="viewItem(item)"
                  class="px-2 md:px-4 py-1 text-xs md:text-sm bg-emerald-500 text-white rounded hover:bg-emerald-600"
                >
                  View
                </button>
                <!-- 'Mark Received' removed from Lost Reports as requested -->
                <template v-if="item.status === 'in_security_custody'">
                  <button
                    @click="openReturnModal(item)"
                    class="px-2 md:px-4 py-1 text-xs md:text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Mark as Returned
                  </button>
                  <button
                    @click="openClaimsModal(item)"
                    class="px-2 md:px-4 py-1 text-xs md:text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    View Claims
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
        <!-- Pagination controls for Lost Reports -->
        <div class="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div class="text-xs md:text-sm text-gray-600 dark:text-gray-300">
            Showing {{ lostShowingRange().start }} to {{ lostShowingRange().end }} of {{ lostTotal }} results
          </div>
          <div class="flex items-center gap-2 w-full md:w-auto">
            <button @click="prevLostPage" :disabled="lostPage === 1" class="flex-1 md:flex-none px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50 text-sm">
              Prev
            </button>
            <button @click="nextLostPage" :disabled="lostPage * lostLimit >= lostTotal" class="flex-1 md:flex-none px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50 text-sm">
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- FOUND REPORTS -->
      <div v-if="currentPage === 'found-reports'">
        <h2 class="text-xl md:text-2xl font-bold mb-4 text-gray-900 dark:text-white">Found Reports</h2>
        <!-- ... (unchanged) ... -->
        <div class="mb-4 flex flex-col md:flex-row gap-4 md:items-center">
          <input
            v-model="foundSearch"
            @input="foundSearch = formatStudentId(foundSearch)"
            type="text"
            placeholder="Search by Item Name or Student ID"
            class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-full md:flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          />
          <div class="flex flex-row gap-2 md:gap-4">
            <div class="relative flex-1 min-w-0" @click.stop>
              <button
                @click.stop="showFoundStatusDropdown = !showFoundStatusDropdown"
                class="w-full px-3 py-2 text-sm md:text-base md:px-4 md:py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer flex items-center gap-2 min-w-[100px]"
              >
                <span class="truncate">{{ foundStatusFilter === 'pending' ? 'Pending' : foundStatusFilter === 'in_security_custody' ? 'In Custody' : foundStatusFilter === 'returned' ? 'Returned' : 'All Status' }}</span>
                <svg class="w-4 h-4 md:w-5 md:h-5 transition-transform flex-shrink-0" :class="{ 'rotate-180': showFoundStatusDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div
                v-if="showFoundStatusDropdown"
                class="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border-2 border-emerald-600 rounded-xl shadow-lg z-50"
                @click.stop
              >
                <button
                  @click.stop="foundStatusFilter = ''; showFoundStatusDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': foundStatusFilter === '' }"
                  class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors first:rounded-t-lg"
                >
                  All Status
                </button>
                <button
                  @click.stop="foundStatusFilter = 'pending'; showFoundStatusDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': foundStatusFilter === 'pending' }"
                  class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700"
                >
                  Pending
                </button>
                <button
                  @click.stop="foundStatusFilter = 'in_security_custody'; showFoundStatusDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': foundStatusFilter === 'in_security_custody' }"
                  class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700"
                >
                  In Security Custody
                </button>
                <button
                  @click.stop="foundStatusFilter = 'returned'; showFoundStatusDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': foundStatusFilter === 'returned' }"
                  class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700 last:rounded-b-lg"
                >
                  Returned
                </button>
              </div>
            </div>
            <div class="relative flex-1" @click.stop>
              <button
                @click.stop="showFoundCategoryDropdown = !showFoundCategoryDropdown"
                class="w-full px-3 py-2 text-sm md:text-base md:px-4 md:py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer flex items-center gap-2"
              >
                <span class="whitespace-nowrap">{{ foundCategoryFilter === 'id' ? 'ID Items' : foundCategoryFilter === 'general' ? 'Items' : 'All Categories' }}</span>
                <svg class="w-4 h-4 md:w-5 md:h-5 transition-transform flex-shrink-0" :class="{ 'rotate-180': showFoundCategoryDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div
                v-if="showFoundCategoryDropdown"
                class="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border-2 border-emerald-600 rounded-xl shadow-lg z-50"
                @click.stop
              >
                <button
                  @click.stop="foundCategoryFilter = ''; showFoundCategoryDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': foundCategoryFilter === '' }"
                  class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors first:rounded-t-lg"
                >
                  All Categories
                </button>
                <button
                  @click.stop="foundCategoryFilter = 'id'; showFoundCategoryDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': foundCategoryFilter === 'id' }"
                  class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700"
                >
                  ID Items
                </button>
                <button
                  @click.stop="foundCategoryFilter = 'general'; showFoundCategoryDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': foundCategoryFilter === 'general' }"
                  class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700 last:rounded-b-lg"
                >
                  General Items
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="filteredFoundItems.length === 0"
          class="border border-gray-300 dark:border-gray-700 rounded-lg h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-900 mb-6 transition-colors"
        >
          No found reports for now.
        </div>

        <!-- Responsive wrapper for table with horizontal scroll on mobile -->
        <div v-else class="mb-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table
            class="w-full bg-white dark:bg-gray-900 text-left text-xs md:text-sm text-gray-900 dark:text-gray-300 transition-colors"
          >
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 transition-colors">
              <th class="px-2 md:px-4 py-2">Image</th>
              <th class="hidden md:table-cell px-4 py-2">Name</th>
              <th class="hidden md:table-cell px-4 py-2">Category</th>
              <th class="px-2 md:px-4 py-2">Details</th>
              <th class="hidden md:table-cell px-4 py-2 whitespace-nowrap">Date Found</th>
              <th class="hidden md:table-cell px-4 py-2 text-center">Status</th>
              <th class="hidden md:table-cell px-4 py-2 whitespace-nowrap">Reported By</th>
              <th class="px-2 md:px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in pagedFoundItems"
              :key="item.id"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <td class="px-2 md:px-4 py-2">
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
              <td class="hidden md:table-cell px-4 py-2">{{ item.name }}</td>
              <td class="hidden md:table-cell px-4 py-2">{{ item.category === 'id' ? 'ID' : item.category === 'general' ? 'Item' : 'General' }}</td>
              <td class="px-2 md:px-4 py-2">
                <span
                  v-if="item.category === 'id' && item.student_id"
                  ><strong>Student ID:</strong> {{ item.student_id }}</span
                >
                <span v-else-if="item.brand || item.color">
                  <span v-if="item.brand"><strong>Brand:</strong> {{ item.brand }}</span>
                  <span v-if="item.color" class="ml-2"
                    ><strong>Color:</strong> {{ item.color }}</span
                  >
                </span>
                <span v-else>N/A</span>
              </td>
              <td class="hidden md:table-cell px-4 py-2">{{ formatDate(item.datetime) }}</td>
              <td class="hidden md:table-cell px-4 py-2">
                <span :class="{
                  'px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 rounded-full text-xs font-semibold': item.status === 'returned',
                  'px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-xs font-semibold': item.status === 'in_security_custody' || item.status === 'In Security Custody',
                  'px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full text-xs font-semibold': item.status === 'pending'
                }">
                  {{ item.status === 'pending' ? 'Found' : item.status === 'in_security_custody' || item.status === 'In Security Custody' ? 'In Custody of the Security Office' : formatStatus(item.status) }}
                </span>
              </td>
              <td class="hidden md:table-cell px-4 py-2">
                <div class="flex items-center space-x-2">
                  <img
                    v-if="item.reporter_profile_picture && !item.reporterImageError"
                    :src="`${API_BASE_URL}${item.reporter_profile_picture}`"
                    @error="item.reporterImageError = true"
                    class="w-8 h-8 rounded-full object-cover border border-gray-600"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {{ item.reporter_name ? item.reporter_name.charAt(0).toUpperCase() : '?' }}
                  </div>
                  <span>{{ item.reporter_name || 'Anonymous' }}</span>
                </div>
              </td>
              <td class="px-2 md:px-4 py-2 flex space-x-1 md:space-x-2">
                <button
                  @click="viewItem(item)"
                  class="px-2 md:px-4 py-1 text-xs md:text-sm bg-emerald-500 text-white rounded hover:bg-emerald-600"
                >
                  View
                </button>
                <button
                  @click="item.status === 'pending' && openReviewModal(item)"
                  :disabled="item.status !== 'pending'"
                  class="px-2 md:px-4 py-1 text-xs md:text-sm rounded font-medium transition"
                  :class="item.status === 'pending' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-400 text-gray-200 cursor-not-allowed'"
                >
                  Accept
                </button>
                <!-- For items already in security custody we intentionally hide the additional action buttons here. Use the item's View button to open details or the Claims modal from within the item detail view. -->
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        <!-- Pagination controls for Found Reports -->
        <div class="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div class="text-xs md:text-sm text-gray-600 dark:text-gray-300">
            Showing {{ foundShowingRange().start }} to {{ foundShowingRange().end }} of {{ foundTotal }} results
          </div>
          <div class="flex items-center gap-2 w-full md:w-auto">
            <button @click="prevFoundPage" :disabled="foundPage === 1" class="flex-1 md:flex-none px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50 text-sm">
              Prev
            </button>
            <button @click="nextFoundPage" :disabled="foundPage * foundLimit >= foundTotal" class="flex-1 md:flex-none px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50 text-sm">
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- CLAIM REQUESTS -->
      <div v-if="currentPage === 'claim-requests'">
        <div class="mb-6">
          <h2 class="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">Claim Requests</h2>
          <p class="text-xs md:text-base text-gray-600 dark:text-gray-400">Review and manage all pending claim requests</p>
        </div>
        <div class="mb-6 flex flex-col md:flex-row gap-4 md:items-center">
          <input
            v-model="claimsSearch"
            type="text"
            placeholder="Search by Item Name, Student ID, or Claimant Name"
            class="px-3 md:px-4 py-2 md:py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm md:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-full md:flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
          />
          <div class="flex flex-row gap-2 md:gap-4">
            <div class="relative flex-1" @click.stop>
              <button
                @click.stop="showClaimsStatusDropdown = !showClaimsStatusDropdown"
                class="w-full px-3 py-2 text-sm md:px-4 md:py-3 md:text-base rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>{{ claimsStatusFilter === 'pending' ? 'Pending' : claimsStatusFilter === 'approved' ? 'Approved' : claimsStatusFilter === 'rejected' ? 'Rejected' : 'All Status' }}</span>
                <svg class="w-4 h-4 md:w-5 md:h-5 transition-transform flex-shrink-0" :class="{ 'rotate-180': showClaimsStatusDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div
                v-if="showClaimsStatusDropdown"
                class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border-2 border-emerald-600 rounded-xl shadow-lg z-50"
                @click.stop
              >
                <button
                  @click.stop="claimsStatusFilter = ''; showClaimsStatusDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': claimsStatusFilter === '' }"
                  class="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors first:rounded-t-lg"
                >
                  All Status
                </button>
                <button
                  @click.stop="claimsStatusFilter = 'pending'; showClaimsStatusDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': claimsStatusFilter === 'pending' }"
                  class="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700"
                >
                  Pending
                </button>
                <button
                  @click.stop="claimsStatusFilter = 'approved'; showClaimsStatusDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': claimsStatusFilter === 'approved' }"
                  class="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700"
                >
                  Approved
                </button>
                <button
                  @click.stop="claimsStatusFilter = 'rejected'; showClaimsStatusDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': claimsStatusFilter === 'rejected' }"
                  class="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700 last:rounded-b-lg"
                >
                  Rejected
                </button>
              </div>
            </div>
            <div class="relative flex-1" @click.stop>
              <button
                @click.stop="showClaimsCategoryDropdown = !showClaimsCategoryDropdown"
                class="w-full px-3 py-2 text-sm md:px-4 md:py-3 md:text-base rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer flex items-center gap-2"
              >
                <span class="whitespace-nowrap">{{ claimsCategoryFilter === 'student' ? 'Student ID' : claimsCategoryFilter === 'general' ? 'General Items' : 'All Categories' }}</span>
                <svg class="w-4 h-4 md:w-5 md:h-5 transition-transform flex-shrink-0" :class="{ 'rotate-180': showClaimsCategoryDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div
                v-if="showClaimsCategoryDropdown"
                class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border-2 border-emerald-600 rounded-xl shadow-lg z-50"
                @click.stop
              >
                <button
                  @click.stop="claimsCategoryFilter = ''; showClaimsCategoryDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': claimsCategoryFilter === '' }"
                  class="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors first:rounded-t-lg"
                >
                  All Categories
                </button>
                <button
                  @click.stop="claimsCategoryFilter = 'student'; showClaimsCategoryDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': claimsCategoryFilter === 'student' }"
                  class="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700"
                >
                  Student ID
                </button>
                <button
                  @click.stop="claimsCategoryFilter = 'general'; showClaimsCategoryDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': claimsCategoryFilter === 'general' }"
                  class="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700 last:rounded-b-lg"
                >
                  General Items
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="filteredClaimRequests.length === 0"
          class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg h-40 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 mb-6 transition-all"
        >
          <svg class="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p class="text-lg font-medium">{{ claimNotifications.length === 0 ? 'No claim requests at the moment.' : 'No matching claim requests found.' }}</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div
            v-for="claim in pagedClaimRequests"
            :key="claim.claim_id"
            :class="{
              'border-yellow-400 dark:border-yellow-500': claim.status === 'pending',
              'border-emerald-400 dark:border-emerald-500': claim.status === 'approved',
              'border-red-400 dark:border-red-500': claim.status === 'rejected'
            }"
            class="bg-white dark:bg-gray-800 border rounded-2xl p-5 hover:border-yellow-400 dark:hover:border-yellow-500 hover:shadow-xl transition-all duration-200 relative group flex flex-col h-full"
          >
            <!-- Delete Button (Top-Right Corner) - For Approved & Rejected Claims -->
            <button
              v-if="claim.status === 'approved' || claim.status === 'rejected'"
              @click="claim.status === 'approved' ? deleteApprovedClaim(claim) : deleteRejectedClaim(claim)"
              class="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all shadow-md hover:shadow-lg opacity-0 group-hover:opacity-100 z-10"
              :title="`Delete ${claim.status} claim`"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div class="flex flex-col gap-4">
              <!-- Item Image -->
              <div class="flex-shrink-0 self-center w-full">
                <div class="w-full h-40 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <img
                    v-if="((claim.item && claim.item.image_url) || claim.item_image || claim.display_image) && !claim.itemImageError"
                    :src="getFullUrl((claim.item && claim.item.image_url) || claim.item_image || claim.display_image)"
                    @error="claim.itemImageError=true"
                    class="w-full h-full object-cover"
                  />
                  <div v-else :class="claim.item && claim.item.category === 'id' ? 'bg-emerald-500' : 'bg-amber-500'" class="w-full h-full flex items-center justify-center">
                    <!-- ID Icon -->
                    <svg v-if="claim.item && claim.item.category === 'id'" class="w-6 md:w-8 h-6 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M9 5a4 4 0 018 0m0 0H5m12 0a4 4 0 01-8 0m0 12H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" />
                    </svg>
                    <!-- Item Icon -->
                    <svg v-else class="w-6 md:w-8 h-6 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Item and Claim Details -->
              <div class="flex-1 min-w-0 flex flex-col">
                <!-- Item Header -->
                <div class="mb-3">
                  <h3 class="text-base md:text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-1">
                    {{ claim.item && claim.item.category === 'id' ? 'ID: ' : 'Item: ' }}{{ claim.item && claim.item.category === 'id' ? (claim.item.student_name || claim.item_name || 'Unknown') : (claim.item.name || claim.item_name || 'Unknown') }}
                  </h3>
                  <p class="text-xs text-gray-500 dark:text-gray-500 truncate font-medium">Item ID: {{ (claim.item && claim.item.id) || claim.item_id || 'N/A' }}</p>
                </div>

                <!-- Item Details Row -->
                <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-3 border border-gray-100 dark:border-gray-700/50">
                  <div>
                    <span class="text-gray-600 dark:text-gray-500 text-xs font-semibold uppercase tracking-wide">Date Found</span>
                    <p class="font-semibold text-gray-900 dark:text-white text-sm mt-1">{{ formatDate((claim.item && claim.item.datetime) || claim.created_at) }}</p>
                  </div>
                </div>

                <!-- Optional: Student ID or Brand/Color -->
                <div class="grid grid-cols-2 gap-2 mb-4" v-if="(claim.item && claim.item.student_id) || (claim.item && claim.item.brand) || (claim.item && claim.item.color)">
                  <div v-if="claim.item && claim.item.student_id" class="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg border border-blue-100 dark:border-blue-800/50">
                    <span class="text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide block">Student ID</span>
                    <p class="font-bold text-gray-900 dark:text-white text-sm mt-1 truncate">{{ claim.item.student_id }}</p>
                  </div>
                  <div v-if="claim.item && claim.item.brand" class="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                    <span class="text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide block">Brand</span>
                    <p class="font-bold text-gray-900 dark:text-white text-sm mt-1 truncate">{{ claim.item.brand }}</p>
                  </div>
                  <div v-if="claim.item && claim.item.color" class="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                    <span class="text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide block">Color</span>
                    <p class="font-bold text-gray-900 dark:text-white text-sm mt-1 truncate">{{ claim.item.color }}</p>
                  </div>
                </div>
                  
                <!-- Claimant info and status badge (moved to bottom) -->
                <div class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-auto">
                  <div class="flex items-center gap-2 mb-3 min-w-0">
                    <img
                      v-if="claim.claimant_profile_picture && !claim._claimantImageError"
                      :src="getFullUrl(claim.claimant_profile_picture)"
                      class="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 flex-shrink-0"
                      @error="claim._claimantImageError = true"
                    />
                    <div v-else class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold border-2 border-emerald-500 flex-shrink-0">
                      {{ (claim.claimant_name || 'U')[0].toUpperCase() }}
                    </div>
                    <div class="text-xs min-w-0">
                      <p class="font-bold text-gray-900 dark:text-white truncate">{{ claim.claimant_name || claim.user_name || 'Unknown' }}</p>
                      <p class="text-gray-600 dark:text-gray-400 text-xs">{{ claim.claimant_email || claim.user_email || 'N/A' }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <span
                      class="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-center border"
                      :class="{
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700': claim.status === 'pending',
                        'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700': claim.status === 'approved',
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700': claim.status === 'rejected'
                      }"
                    >
                      {{ claim.status === 'pending' ? 'PENDING' : claim.status === 'approved' ? 'RETURNED' : 'REJECTED' }}
                    </span>
                    <button
                      @click="viewClaimDetails(claim)"
                      class="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      {{ claim.status === 'pending' ? 'Approve' : 'Details' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination controls for Claim Requests -->
        <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Showing <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ claimsShowingRange().start }}</span> to <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ claimsShowingRange().end }}</span> of <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ claimsTotal }}</span> results
          </div>
          <div class="flex items-center gap-2">
            <button @click="prevClaimsPage" :disabled="claimsPage === 1" class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all shadow-sm">
              ← Prev
            </button>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 px-3">Page {{ claimsPage }}</span>
            <button @click="nextClaimsPage" :disabled="claimsPage * claimsLimit >= claimsTotal" class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all shadow-sm">
              Next →
            </button>
          </div>
        </div>
      </div>

      <!-- RETURNED HISTORY -->
      <div v-if="currentPage === 'returned-history'">
        <h2 class="text-xl md:text-2xl font-bold mb-4 text-gray-900 dark:text-white">Returned History</h2>
        <!-- ... (unchanged) ... -->
        <div class="mb-4 flex flex-col md:flex-row md:items-center md:gap-3 gap-2">
          <input
            v-model="returnedSearch"
            @input="returnedSearch = formatStudentId(returnedSearch)"
            type="text"
            placeholder="Search by Item Name or Student ID"
            class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full md:flex-1 border-2 border-gray-400 dark:border-gray-500 focus:outline-none transition-colors"
          />
          <div class="flex gap-2 justify-center md:justify-end md:flex-shrink-0">
            <div class="relative" @click.stop>
              <button
                @click.stop="showCategoryDropdown = !showCategoryDropdown"
                class="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors cursor-pointer flex items-center justify-between gap-1 text-xs md:text-sm"
              >
                <span class="truncate">{{ categoryDropdownLabel }}</span>
                <svg class="w-4 h-4 md:w-5 md:h-5 transition-transform flex-shrink-0" :class="{ 'rotate-180': showCategoryDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div
                v-if="showCategoryDropdown"
                class="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border-2 border-emerald-600 rounded-xl shadow-lg z-50"
                @click.stop
              >
                <button
                  @click.stop="returnedCategoryFilter = ''; showCategoryDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': returnedCategoryFilter === '' }"
                  class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors first:rounded-t-lg"
                >
                  All Categories
                </button>
                <button
                  @click.stop="returnedCategoryFilter = 'id'; showCategoryDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': returnedCategoryFilter === 'id' }"
                  class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700"
                >
                  ID Items
                </button>
                <button
                  @click.stop="returnedCategoryFilter = 'general'; showCategoryDropdown = false"
                  :class="{ 'bg-emerald-600 text-white': returnedCategoryFilter === 'general' }"
                  class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-colors border-t border-gray-200 dark:border-gray-700 last:rounded-b-lg"
                >
                  General Items
                </button>
              </div>
            </div>
            <button
              v-if="filteredReturnedHistory.length > 0"
              @click="openDownloadModal"
              :disabled="isDownloadingAll"
              class="flex items-center gap-1 px-2 md:px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium transition-colors shadow-md text-xs whitespace-nowrap"
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
          </div>
        </div>

        <div
          v-if="filteredReturnedHistory.length === 0"
          class="border border-gray-200 dark:border-gray-700 rounded-lg h-32 flex items-center justify-center text-gray-600 dark:text-gray-400 italic bg-white dark:bg-gray-900 mb-6 transition-colors"
        >
          No returned items yet.
        </div>

        <!-- Responsive wrapper for table with horizontal scroll on mobile -->
        <div v-else class="mb-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table
            class="w-full bg-white dark:bg-gray-900 text-left text-xs md:text-sm text-gray-900 dark:text-gray-300 transition-colors"
          >
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 transition-colors">
              <th class="px-4 py-2 bg-gray-100 dark:bg-gray-800">Image</th>
              <th class="px-4 py-2">Name</th>
              <th class="hidden md:table-cell px-4 py-2">Category</th>
              <th class="hidden md:table-cell px-4 py-2">Return Date</th>
              <th class="hidden md:table-cell px-4 py-2">Status</th>
              <th class="hidden md:table-cell px-4 py-2">Claimed By</th>
              <th class="px-4 py-2 bg-gray-100 dark:bg-gray-800">Actions</th>
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
              <td class="px-4 py-2 text-xs md:text-sm">{{ item.name }}</td>
              <td class="hidden md:table-cell px-4 py-2">{{ item.category === 'id' ? 'ID' : item.category === 'general' ? 'Item' : 'General' }}</td>
              <td class="hidden md:table-cell px-4 py-2">{{ formatDate(item.return_date) }}</td>
              <td class="hidden md:table-cell px-4 py-2">
                <span class="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 rounded-full text-xs font-semibold">
                  {{ formatStatus(item.status) }}
                </span>
              </td>
              <td class="hidden md:table-cell px-4 py-2">
                <div class="flex items-center space-x-2">
                  <img
                    v-if="(item.claimant_profile_picture || item.transaction_claimant_profile_picture || (item.type === 'found' && item.reporter_profile_picture && !item.claimant_name)) && !item.claimantImageError"
                    :src="`${API_BASE_URL}${item.claimant_profile_picture || item.transaction_claimant_profile_picture || (item.type === 'found' ? item.reporter_profile_picture : '')}`"
                    @error="item.claimantImageError = true"
                    class="w-8 h-8 rounded-full object-cover border border-gray-600"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {{ (item.type === 'found' && item.claimant_name ? item.claimant_name : (item.claimant_name || item.transaction_claimant_name || item.reporter_name)) ? (item.type === 'found' && item.claimant_name ? item.claimant_name : (item.claimant_name || item.transaction_claimant_name || item.reporter_name))[0].toUpperCase() : '?' }}
                  </div>
                  <span>{{ item.type === 'found' && item.claimant_name ? item.claimant_name : (item.claimant_name || item.transaction_claimant_name || item.reporter_name || 'Anonymous') }}</span>
                </div>
              </td>
              <td class="px-4 py-2">
                <div class="flex items-center space-x-1 md:space-x-2">
                  <button
                    @click="downloadReturnReport(item)"
                    class="flex items-center gap-1 px-2 md:px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition text-xs md:text-sm font-medium"
                    title="Download PDF"
                  >
                   <svg xmlns="http://www.w3.org/2000/svg" 
       fill="none" 
       viewBox="0 0 24 24" 
       stroke-width="1.5" 
       stroke="currentColor" 
       class="w-4 h-4">
    <path stroke-linecap="round" stroke-linejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 10.5L12 15m0 0l4.5-4.5M12 15V3" />
  </svg>
                    <span class="hidden md:inline">Download</span>
                  </button>
                  <button
                    @click="printReturnReport(item)"
                    class="flex items-center gap-1 px-2 md:px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 text-xs md:text-sm font-medium whitespace-nowrap"
                    title="Open printable view"
                  >
                    View PDF
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
        <!-- Pagination controls for Returned History yes-->
        <div class="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div class="text-xs md:text-sm text-gray-600 dark:text-gray-300">
            Showing {{ returnedShowingRange().start }} to {{ returnedShowingRange().end }} of {{ returnedTotal }} results
          </div>
          <div class="flex items-center gap-2 w-full md:w-auto">
            <button @click="prevReturnedPage" :disabled="returnedPage === 1" class="flex-1 md:flex-none px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50 text-sm">
              Prev
            </button>
            <button @click="nextReturnedPage" :disabled="returnedPage * returnedLimit >= returnedTotal" class="flex-1 md:flex-none px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50 text-sm">
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Modals (unchanged) -->
      <!-- VIEW MODAL, CLAIMS MODAL, REVIEW MODAL, RETURN MODAL -->
      <!-- ... (keep all modals exactly as they were) ... -->

      <!-- DOWNLOAD TIME PERIOD MODAL (Modern) -->
      <transition name="fade">
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
      </transition>

      <!-- VIEW MODAL yes -->
      <transition name="fade">
        <div v-if="selectedItem" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 md:p-8 max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            <div class="flex justify-between items-start mb-6">
              <h2 class="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {{ currentPage === 'lost-reports' ? (selectedItem && selectedItem.category === 'id' ? 'Lost ID Details' : 'Lost Item Details') : currentPage === 'found-reports' ? (selectedItem && selectedItem.category === 'id' ? 'Found ID Details' : 'Found Item Details') : 'Item Details' }}
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
                      <span :class="{
                        'text-green-600 dark:text-green-400': selectedItem.status === 'returned',
                        'inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-bold mt-2': selectedItem.status === 'in_security_custody' || selectedItem.status === 'In Security Custody',
                        'inline-block px-4 py-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-bold mt-2': selectedItem.status === 'pending'
                      }">
                        {{ formatStatus(selectedItem.status) }}
                      </span>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                        <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">{{ currentPage === 'lost-reports' ? 'Location Lost' : 'Location Found' }}</p>
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

                <!-- Mark as Returned button for Lost Reports -->
                <div v-if="currentPage === 'lost-reports'" class="border-t-2 border-gray-200 dark:border-gray-700 pt-6 mt-6">
                  <button
                    @click="openMarkAsReturnedConfirm(selectedItem)"
                    class="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-semibold shadow-md hover:shadow-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isMarkingAsReturned"
                  >
                    Mark as Returned
                  </button>
                </div>

                <!-- Mark as Returned button for Found Reports -->
                <div v-if="currentPage === 'found-reports'" class="border-t-2 border-gray-200 dark:border-gray-700 pt-6 mt-6">
                  <button
                    @click="openMarkFoundAsReturnedConfirm(selectedItem)"
                    class="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-semibold shadow-md hover:shadow-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isMarkingAsReturned"
                  >
                    Mark as Returned
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- CLAIMS MODAL -->
      <!-- Processing Loading Overlay (for direct claim approval) -->
      <div v-if="isApproving && !showClaimReviewModal" class="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/90 dark:bg-black/80 backdrop-blur-sm">
        <svg class="animate-spin h-16 w-16 text-emerald-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <p class="text-lg font-semibold text-gray-800 dark:text-gray-200">Processing claim approval...</p>
      </div>

      <!-- Processing Loading Overlay (for marking item as returned) -->
      <div v-if="isMarkingAsReturned" class="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/90 dark:bg-black/80 backdrop-blur-sm">
        <svg class="animate-spin h-16 w-16 text-green-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <p class="text-lg font-semibold text-gray-800 dark:text-gray-200">Marking item as returned...</p>
      </div>

      <!-- Mark as Returned Confirmation Modal -->
      <div v-if="showMarkAsReturnedConfirm && itemToMarkAsReturned" class="fixed inset-0 z-[99998] flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
            <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 0a9 9 0 110-18 9 9 0 010 18z" />
            </svg>
          </div>
          <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Mark Item as Returned?
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-center mb-2">
            <strong>{{ itemToMarkAsReturned.name }}</strong>
          </p>
          <p class="text-gray-500 dark:text-gray-500 text-center text-sm mb-6">
            The reporter will be notified that their lost item has been found and returned.
          </p>
          <div class="flex gap-3">
            <button
              @click="closeMarkAsReturnedConfirm"
              class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-semibold"
              :disabled="isMarkingAsReturned"
            >
              Cancel
            </button>
            <button
              @click="confirmMarkAsReturned"
              class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isMarkingAsReturned"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>

      <!-- Claimant Information Modal for Found Items -->
      <div v-if="showClaimantInfoModal && foundItemToMark" class="fixed inset-0 z-[99998] flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full border border-gray-200 dark:border-gray-700">
          <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Mark Item as Returned
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-center text-sm mb-6">
            Please enter the claimant information for: <strong>{{ foundItemToMark.name }}</strong>
          </p>
          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Claimant Name *</label>
              <input
                v-model="claimantInfo.name"
                type="text"
                placeholder="Enter claimant's full name"
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                :disabled="isMarkingAsReturned"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Student ID</label>
              <input
                v-model="claimantInfo.studentId"
                type="text"
                placeholder="Enter student ID"
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                :disabled="isMarkingAsReturned"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
              <input
                v-model="claimantInfo.phoneNumber"
                type="tel"
                placeholder="Enter phone number"
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                :disabled="isMarkingAsReturned"
              />
            </div>
          </div>
          <div class="flex gap-3">
            <button
              @click="closeClaimantInfoModal"
              class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-semibold"
              :disabled="isMarkingAsReturned"
            >
              Cancel
            </button>
            <button
              @click="confirmMarkFoundAsReturned"
              class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isMarkingAsReturned || !claimantInfo.name || !claimantInfo.phoneNumber"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="claimModalItem"
        class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 overflow-y-auto p-4"
      >
        <div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl border border-gray-200 dark:border-gray-700 my-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl transition-colors">
          <!-- Modal Header -->
          <div class="sticky top-0 z-10 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-b border-emerald-200 dark:border-emerald-700 p-6 rounded-t-2xl">
            <h3 class="text-3xl font-bold text-emerald-700 dark:text-emerald-400">Claim Requests - {{ claimModalItem.name }}</h3>
            <p class="text-sm text-emerald-600 dark:text-emerald-300 mt-1">Review and manage claims for this item</p>
          </div>

          <div class="p-6">
            <!-- ITEM DETAILS SECTION (Horizontal - At Top) -->
            <div class="mb-8 pb-8 border-b border-gray-300 dark:border-gray-700">
              <h4 class="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-5">Item Details</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Item Image -->
                <div class="md:col-span-1">
                  <img
                    v-if="claimModalItem.image_url && !claimModalItemImageError"
                    :src="`${API_BASE_URL}${claimModalItem.image_url}`"
                    @error="claimModalItemImageError = true"
                    class="w-full h-56 object-cover rounded-lg border-2 border-emerald-300 dark:border-emerald-500/40 shadow-md"
                  />
                  <div v-else class="w-full h-56 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 text-sm border-2 border-dashed border-gray-300 dark:border-gray-600">
                    No Image Available
                  </div>
                </div>

                <!-- Item Information -->
                <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- For ID Items -->
                  <template v-if="claimModalItem.category === 'id'">
                    <div class="pb-3">
                      <span class="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Category</span>
                      <p class="font-bold text-gray-900 dark:text-white text-base mt-1">ID</p>
                    </div>
                    <div class="pb-3">
                      <span class="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Student Name</span>
                      <p class="font-semibold text-gray-900 dark:text-white mt-1">{{ claimModalItem.name || 'N/A' }}</p>
                    </div>
                    <div v-if="claimModalItem.student_id" class="pb-3">
                      <span class="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Student ID</span>
                      <p class="font-mono font-semibold text-gray-900 dark:text-white mt-1">{{ claimModalItem.student_id }}</p>
                    </div>
                    <div v-if="claimModalItem.department" class="pb-3">
                      <span class="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Department</span>
                      <p class="font-semibold text-gray-900 dark:text-white mt-1">{{ claimModalItem.department }}</p>
                    </div>
                    <div v-if="claimModalItem.course" class="pb-3">
                      <span class="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Course/Program</span>
                      <p class="font-semibold text-gray-900 dark:text-white mt-1">{{ claimModalItem.course }}</p>
                    </div>
                    <div v-if="claimModalItem.course_program" class="pb-3">
                      <span class="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Course/Program</span>
                      <p class="font-semibold text-gray-900 dark:text-white mt-1">{{ claimModalItem.course_program }}</p>
                    </div>
                  </template>

                  <!-- For General Items -->
                  <template v-else>
                    <div class="pb-3">
                      <span class="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Category</span>
                      <p class="font-bold text-gray-900 dark:text-white text-base mt-1">General Item</p>
                    </div>
                    <div class="pb-3">
                      <span class="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Item Name</span>
                      <p class="font-bold text-gray-900 dark:text-white text-base mt-1">{{ claimModalItem.name || 'N/A' }}</p>
                    </div>
                    <div v-if="claimModalItem.brand" class="pb-3">
                      <span class="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Brand</span>
                      <p class="font-semibold text-gray-900 dark:text-white mt-1">{{ claimModalItem.brand }}</p>
                    </div>
                    <div v-if="claimModalItem.color" class="pb-3">
                      <span class="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Color</span>
                      <p class="font-semibold text-gray-900 dark:text-white mt-1">{{ claimModalItem.color }}</p>
                    </div>
                    <div v-if="claimModalItem.description || !claimModalItem.description" class="pb-3 sm:col-span-2">
                      <span class="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Description</span>
                      <p v-if="claimModalItem.description" class="font-semibold text-gray-900 dark:text-white mt-1">{{ claimModalItem.description }}</p>
                      <p v-else class="font-semibold text-yellow-600 dark:text-yellow-400 mt-1">No description provided</p>
                    </div>
                  </template>

                  <!-- Item ID (Always Show) -->
                  <div class="pb-3 sm:col-span-2">
                    <span class="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Item ID</span>
                    <p class="font-mono text-xs text-gray-600 dark:text-gray-400 break-all mt-1 bg-gray-200 dark:bg-gray-800 p-2 rounded">{{ claimModalItem.id || 'N/A' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Main Container: Claims Section (Full Width) -->
            <div class="mb-6">
              <!-- Claims Count Banner -->
              <div v-if="claimRequests.length > 0" class="mb-5 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-l-4 border-emerald-500 rounded-r-lg text-emerald-800 dark:text-emerald-300 shadow-sm">
                <strong class="text-base block">⚠️ {{ claimRequests.length }} Claim Request{{ claimRequests.length > 1 ? 's' : '' }} for This Item</strong>
                <p class="text-sm mt-1 text-emerald-700 dark:text-emerald-400">Review each claim and approve or reject accordingly</p>
              </div>

              <!-- No Claims Message -->
              <div v-if="claimRequests.length === 0" class="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-center text-gray-600 dark:text-gray-400 italic">
                <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p class="text-lg font-medium">No claims submitted for this item</p>
              </div>

              <!-- Claims List -->
              <div v-else class="space-y-4 pr-2">
                <div v-for="claim in claimRequests" :key="claim.claim_id" class="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:shadow-md transition">
                  
                  <!-- Claimant Header -->
                  <div class="flex items-start gap-4 mb-4">
                    <!-- Claimant Profile Photo -->
                    <div class="flex-shrink-0">
                      <img
                        v-if="claim.claimant_profile_picture && !claim._claimantPhotoError"
                        :src="getFullUrl(claim.claimant_profile_picture)"
                        @error="claim._claimantPhotoError = true"
                        class="w-14 h-14 rounded-full object-cover border-3 border-emerald-400 shadow-sm"
                      />
                      <div v-else class="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold border-3 border-emerald-300 text-base shadow-sm">
                        {{ (claim.claimant_name || 'U')[0].toUpperCase() }}
                      </div>
                    </div>

                    <!-- Claimant Info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-3 mb-2">
                        <p class="font-bold text-gray-900 dark:text-white truncate text-base">{{ claim.claimant_name || 'Unknown claimant' }}</p>
                        <span
                          :class="['inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 shadow-sm', claimStatusClass(claim.status)]"
                        >
                          {{ formatClaimStatus(claim.status) }}
                        </span>
                      </div>
                      <p v-if="claim.claimant_email" class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ claim.claimant_email }}</p>
                      <p v-if="claim.claimant_contact" class="text-sm text-gray-600 dark:text-gray-400">{{ claim.claimant_contact }}</p>
                      <p v-if="claim.claimant_department" class="text-sm text-gray-700 dark:text-gray-300">{{ claim.claimant_department }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">📅 Requested: {{ formatDate(claim.created_at) }}</p>
                    </div>
                  </div>

                  <!-- Claimant Message -->
                  <div v-if="claim.message" class="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg text-sm text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 dark:border-blue-400">
                    <strong class="block mb-2 text-blue-700 dark:text-blue-400">💬 Claimant's Message:</strong>
                    <p class="whitespace-pre-line leading-relaxed">{{ claim.message }}</p>
                  </div>

                  <!-- Action Buttons (Below Message) -->
                  <div class="flex gap-3 justify-end pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      @click="openClaimApprovalReview(claim)"
                      :disabled="claim.status === 'approved' || claim.status === 'rejected'"
                      :class="[
                        'px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm hover:shadow-md',
                        claim.status === 'approved' || claim.status === 'rejected'
                          ? 'bg-emerald-600 text-white opacity-50 cursor-not-allowed'
                          : 'bg-emerald-500 text-white hover:bg-emerald-600'
                      ]"
                    >
                      {{ claim.status === 'approved' ? '✓ Approved' : '✓ Approve' }}
                    </button>
                    <button
                      @click="openClaimRejectionReview(claim)"
                      :disabled="claim.status === 'approved' || claim.status === 'rejected'"
                      :class="[
                        'px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm hover:shadow-md',
                        claim.status === 'approved' || claim.status === 'rejected'
                          ? 'bg-red-600 text-white opacity-50 cursor-not-allowed'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      ]"
                    >
                      {{ claim.status === 'rejected' ? '✗ Rejected' : '✗ Reject' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          <!-- Notification details (hidden but still fetched for internal use) -->
          <div v-if="modalNotificationDetails" class="hidden">
            <div class="text-xs text-gray-400 mb-1">Notification</div>
            <div class="flex justify-between items-center">
              <div>
                <div><strong>ID:</strong> <span class="text-sm text-gray-200">{{ modalNotificationDetails.id || '—' }}</span></div>
                <div v-if="modalNotificationDetails.item_id"><strong>Item Ref:</strong> <span class="text-sm text-gray-200">{{ modalNotificationDetails.item_id }}</span></div>
                <div v-if="modalNotificationDetails.matched_item_id"><strong>Matched Item:</strong> <span class="text-sm text-gray-200">{{ modalNotificationDetails.matched_item_id }}</span></div>
              </div>
              <div class="text-xs text-gray-400">(auto-sourced from notification)</div>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="sticky bottom-0 bg-gradient-to-t from-white to-white/95 dark:from-gray-900 dark:to-gray-900/95 border-t border-gray-200 dark:border-gray-700 mt-6 pt-4 flex justify-end gap-3">
            <button
              @click="claimModalItem = null; modalNotificationDetails = null"
              class="px-6 py-2.5 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition font-semibold shadow-sm hover:shadow-md"
            >
              Close Modal
            </button>
          </div>

            </div>
        </div>
      </div>

      <!-- CLAIM REVIEW MODAL (for confirming approve/reject) -->
      <div
        v-if="showClaimReviewModal && claimReviewData"
        class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
        @click.self="closeClaimReviewModal"
      >
        <!-- Full-viewport loading overlay while approval is being processed -->
        <div v-if="isApproving" class="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/80 dark:bg-black/75">
          <svg class="animate-spin h-14 w-14 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <p class="mt-3 text-gray-700 dark:text-gray-200">Processing approval...</p>
        </div>
        <div class="relative bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl">
          <!-- Header -->
          <h2 class="text-2xl font-bold mb-6">
            {{ claimReviewData.action === 'approve' ? 'Review Claim - Approve' : 'Review Claim - Reject' }}
          </h2>

          <!-- Item Information Section -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-emerald-500 dark:text-emerald-400 mb-3">Item Information</h3>
            <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex gap-4">
              <!-- Item Image -->
              <div class="flex-shrink-0">
                <img
                  v-if="claimReviewData.claim.item && claimReviewData.claim.item.image_url && !claimReviewItemImageError"
                  :src="getFullUrl(claimReviewData.claim.item.image_url)"
                  @error="claimReviewItemImageError = true"
                  class="w-24 h-24 object-cover rounded"
                />
                <div v-else class="w-24 h-24 rounded bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 text-xs">No Image</div>
              </div>

              <!-- Item Details -->
              <div class="flex-1">
                <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ (claimReviewItemSafe && claimReviewItemSafe.name) || claimReviewData.claim.item_name || 'Unknown Item' }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">ID: {{ (claimReviewItemSafe && claimReviewItemSafe.id) || claimReviewData.claim.item_id || 'N/A' }}</p>
                
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span class="text-gray-600 dark:text-gray-400">Category:</span>
                    <p class="text-gray-900 dark:text-white font-medium">{{ (claimReviewItemSafe && claimReviewItemSafe.category) || 'General' }}</p>
                  </div>
                  <div>
                    <span class="text-gray-600 dark:text-gray-400">Status:</span>
                    <p class="text-gray-900 dark:text-white font-medium">{{ formatStatus((claimReviewItemSafe && claimReviewItemSafe.status) || '') }}</p>
                  </div>
                  <div v-if="claimReviewItemSafe && claimReviewItemSafe.student_id">
                    <span class="text-gray-600 dark:text-gray-400">Student ID:</span>
                    <p class="text-gray-900 dark:text-white font-medium">{{ claimReviewData.claim.item.student_id }}</p>
                  </div>
                  <div v-if="claimReviewItemSafe && claimReviewItemSafe.brand">
                    <span class="text-gray-600 dark:text-gray-400">Brand:</span>
                    <p class="text-gray-900 dark:text-white font-medium">{{ claimReviewData.claim.item.brand }}</p>
                  </div>
                  <div v-if="claimReviewItemSafe && claimReviewItemSafe.color">
                    <span class="text-gray-600 dark:text-gray-400">Color:</span>
                    <p class="text-gray-900 dark:text-white font-medium">{{ claimReviewData.claim.item.color }}</p>
                  </div>
                  <div>
                    <span class="text-gray-600 dark:text-gray-400">Date Found:</span>
                    <p class="text-gray-900 dark:text-white font-medium">{{ formatDate((claimReviewItemSafe && claimReviewItemSafe.datetime) || claimReviewData.claim.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-gray-300 dark:border-gray-700 my-6"></div>

          <!-- Claimant Information Section -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">Claimant Information</h3>
            <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex gap-4">
              <!-- Claimant Profile Picture -->
              <div class="flex-shrink-0">
                <img
                  v-if="claimReviewData.claim.claimant_profile_picture"
                  :src="getFullUrl(claimReviewData.claim.claimant_profile_picture)"
                  class="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
                />
                <div v-else class="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {{ (claimReviewData.claim.claimant_name || 'U')[0].toUpperCase() }}
                </div>
              </div>

              <!-- Claimant Details -->
              <div class="flex-1">
                <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ claimReviewData.claim.claimant_name || claimReviewData.claim.user_name || 'Unknown' }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ claimReviewData.claim.claimant_email || claimReviewData.claim.user_email || 'N/A' }}</p>
                
                <div class="mt-3 space-y-1 text-sm">
                  <div v-if="claimReviewData.claim.claimant_contact">
                    <span class="text-gray-600 dark:text-gray-400">Contact:</span>
                    <p class="text-gray-900 dark:text-white font-medium">{{ claimReviewData.claim.claimant_contact }}</p>
                  </div>
                  <div v-if="claimReviewData.claim.claimant_department">
                    <span class="text-gray-600 dark:text-gray-400">Department:</span>
                    <p class="text-gray-900 dark:text-white font-medium">{{ claimReviewData.claim.claimant_department }}</p>
                  </div>
                  <div>
                    <span class="text-gray-600 dark:text-gray-400">Requested:</span>
                    <p class="text-gray-900 dark:text-white font-medium">{{ formatDate(claimReviewData.claim.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Claim Message Section -->
          <div v-if="claimReviewData.claim.message" class="mb-6">
            <h3 class="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Claimant's Message</h3>
            <div class="bg-blue-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-blue-500 text-sm text-gray-700 dark:text-gray-300">
              {{ claimReviewData.claim.message }}
            </div>
          </div>

          <!-- Confirmation/Warning Messages -->
          <div class="mb-6 p-4 rounded-lg" :class="claimReviewData.action === 'approve' ? 'bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-500' : 'bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-500'">
            <p v-if="claimReviewData.action === 'approve'" class="text-green-700 dark:text-green-300 text-sm">
              <strong>✓ Approval Confirmation:</strong> By confirming this, you approve that the item is returned to the rightful owner. The claimant will be notified of the approval.
            </p>
            <p v-else class="text-red-700 dark:text-red-300 text-sm">
              <strong>✗ Rejection Notice:</strong> By confirming this, the claim request will be rejected. The claim status will remain pending and the claimant will be notified of the rejection.
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 justify-end pt-4 border-t border-gray-300 dark:border-gray-700">
            <button
              @click="closeClaimReviewModal"
              class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition font-medium"
            >
              Cancel
            </button>
            <button
              v-if="claimReviewData.action === 'approve'"
              @click="confirmClaimApproval(claimReviewData.claim)"
              :disabled="isApproving || claimReviewData.claim.status === 'approved' || claimReviewData.claim.status === 'rejected'"
              class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span v-if="isApproving" class="inline-flex items-center">
                <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Approving...
              </span>
              <span v-else>
                ✓ Confirm Approve
              </span>
            </button>
            <button
              v-else
              @click="confirmClaimRejection(claimReviewData.claim)"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
            >
              ✗ Confirm Reject
            </button>
          </div>
        </div>
      </div>

      <!-- REVIEW MODAL (shows same details as VIEW MODAL plus confirm controls) -->
      <div
        v-if="reviewItem"
        class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      >
        <div class="relative bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl">
          <!-- Header with close button -->
          <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 md:px-8 py-4 flex justify-between items-center">
            <h3 class="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{{ reviewItem.category === 'id' ? 'Accept ID In Custody' : 'Accept Item In Custody' }}</h3>
            <button @click="closeReviewModal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="p-6 md:p-8">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
              <!-- Left Column: Image and Reporter (2 cols) -->
              <div class="md:col-span-2">
                <!-- Item Image -->
                <div class="mb-6">
                  <img
                    v-if="reviewItem.image_url && !imageError"
                    :src="`${API_BASE_URL}${reviewItem.image_url}`"
                    @error="imageError = true"
                    class="w-full h-80 md:h-96 object-cover rounded-xl mb-4 border border-gray-200 dark:border-gray-700 shadow-md"
                  />
                  <div v-else class="w-full h-80 md:h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center rounded-xl mb-4 text-gray-500">
                    <span class="text-lg font-medium">No Image</span>
                  </div>
                </div>

                <!-- Reporter Card - Compact -->
                <div v-if="reviewItem.reporter_name" class="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
                  <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Reported By</h4>
                  <div class="flex items-center space-x-3 mb-3">
                    <img
                      v-if="reviewItem.reporter_profile_picture && !reporterImageError"
                      :src="`${API_BASE_URL}${reviewItem.reporter_profile_picture}`"
                      @error="reporterImageError = true"
                      class="w-12 h-12 rounded-full object-cover border-2 border-emerald-600 shadow-md flex-shrink-0"
                    />
                    <div v-else class="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0">
                      {{ reviewItem.reporter_name[0].toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ reviewItem.reporter_name }}</p>
                      <p class="text-xs text-gray-600 dark:text-gray-400 truncate">{{ reviewItem.reporter_email }}</p>
                    </div>
                  </div>
                  <button @click="viewReporterProfile(reviewItem.reporter_id)" class="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-xs font-semibold">View Profile</button>
                </div>
              </div>

              <!-- Right Column: Item Details (3 cols) -->
              <div class="md:col-span-3">
                <div class="space-y-2">
                  <!-- For ID items, show custom order: name, student_id, department, then rest -->
                  <template v-if="reviewItem.category === 'id'">
                    <!-- Name -->
                    <div v-if="reviewItem.name" class="group">
                      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 py-3 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <span class="font-semibold text-gray-700 dark:text-gray-300 capitalize min-w-[120px] text-left sm:text-left">Name</span>
                        <span class="text-gray-900 dark:text-gray-100 font-medium text-left sm:text-right break-words">{{ reviewItem.name }}</span>
                      </div>
                    </div>
                    <!-- Student ID -->
                    <div v-if="reviewItem.student_id" class="group">
                      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 py-3 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <span class="font-semibold text-gray-700 dark:text-gray-300 capitalize min-w-[120px] text-left sm:text-left">Student ID</span>
                        <span class="text-gray-900 dark:text-gray-100 font-medium text-left sm:text-right break-words">{{ reviewItem.student_id }}</span>
                      </div>
                    </div>
                    <!-- Department -->
                    <div v-if="reviewItem.department" class="group">
                      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 py-3 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <span class="font-semibold text-gray-700 dark:text-gray-300 capitalize min-w-[120px] text-left sm:text-left">Department</span>
                        <span class="text-gray-900 dark:text-gray-100 font-medium text-left sm:text-right break-words">{{ reviewItem.department }}</span>
                      </div>
                    </div>
                    <!-- Rest of fields -->
                    <div v-for="(value, key) in (reviewItem ? Object.fromEntries(Object.entries(reviewItem).filter(([k,v]) => v && !['id','image_url','created_at','imageError','reporter_id','reporter_name','reporter_email','reporter_profile_picture','reporterImageError','type','datetime','category','status','updated_at','name','student_id','department','embedding'].includes(k))) : {})" :key="key" class="group">
                      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 py-3 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <span class="font-semibold text-gray-700 dark:text-gray-300 capitalize min-w-[120px] text-left sm:text-left">{{ key === 'location' ? 'Location Found' : key.replace(/_/g, ' ') }}</span>
                        <span class="text-gray-900 dark:text-gray-100 font-medium text-left sm:text-right break-words">{{ value }}</span>
                      </div>
                    </div>
                  </template>
                  
                  <!-- For non-ID items, show all fields normally -->
                  <template v-else>
                    <div v-for="(value, key) in (reviewItem ? Object.fromEntries(Object.entries(reviewItem).filter(([k,v]) => v && !['id','image_url','created_at','imageError','reporter_id','reporter_name','reporter_email','reporter_profile_picture','reporterImageError','type','datetime','category','status','updated_at','embedding'].includes(k))) : {})" :key="key" class="group">
                      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 py-3 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <span class="font-semibold text-gray-700 dark:text-gray-300 capitalize min-w-[120px] text-left sm:text-left">{{ key === 'location' ? 'Location Found' : key.replace(/_/g, ' ') }}</span>
                        <span class="text-gray-900 dark:text-gray-100 font-medium text-left sm:text-right break-words">{{ value }}</span>
                      </div>
                    </div>
                  </template>
                </div>

                <!-- Action Buttons -->
                <div class="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button 
                    @click="closeReviewModal" 
                    :disabled="isConfirmingReceived" 
                    class="px-6 py-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button 
                    @click="confirmReceived" 
                    :disabled="isConfirmingReceived" 
                    class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
                  >
                    <span v-if="isConfirmingReceived" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {{ isConfirmingReceived ? 'Processing...' : 'Confirm Received' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- LOADING OVERLAY FOR CONFIRM RECEIVED -->
      <div
        v-if="reviewItem && isConfirmingReceived"
        class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]"
      >
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 border-4 border-emerald-500 border-t-white rounded-full animate-spin mb-4"></div>
          <p class="text-white text-lg font-semibold">Processing...</p>
          <p class="text-gray-300 text-sm mt-2">Updating item status...</p>
        </div>
      </div>

      <!-- SUCCESS/FAILURE MODAL -->
      <div
        v-if="showSuccessModal"
        class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[70] p-4"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-bounce-in">
          <!-- Header -->
          <div class="bg-gradient-to-r from-emerald-500 to-green-500 p-6 md:p-8 text-center">
            <div v-if="successMessage.includes('✅')" class="text-6xl mb-4">✅</div>
            <div v-else class="text-6xl mb-4">❌</div>
            <h2 class="text-2xl font-bold text-white">{{ successMessage.includes('✅') ? 'Success!' : 'Error' }}</h2>
          </div>

          <!-- Message -->
          <div class="p-6 md:p-8">
            <p class="text-gray-700 dark:text-gray-300 text-center mb-6 text-sm md:text-base">
              {{ successMessage }}
            </p>

            <!-- OK Button -->
            <button
              @click="showSuccessModal = false"
              class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              OK
            </button>
          </div>
        </div>
      </div>

      <!-- RETURN MODAL -->
      <div
        v-if="returnItem"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-gray-900 text-white rounded-lg p-6 w-96 border border-gray-700">
          <h3 class="text-xl font-semibold mb-4">Return Item to Owner</h3>
          <p><strong>Name:</strong> {{ returnItem.name }}</p>
          <p><strong>Category:</strong> {{ returnItem.category || "General" }}</p>
          <p><strong>Status:</strong> {{ formatStatus(returnItem.status) }}</p>
          <p class="mt-4 text-emerald-400 text-sm">
            ⚠️ This item will be officially marked as
            <strong>returned to the owner</strong>.
          </p>

          <div class="mt-6 flex justify-end space-x-2">
            <button
              @click="returnItem = null"
              class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              @click="confirmReturn"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Confirm Return
            </button>
          </div>
        </div>
      </div>
      <!-- Quick Actions / Help Modal (frontend-only) -->
      <div v-if="showHelpModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-gray-900 text-white rounded-lg p-6 w-96 border border-gray-700">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold">Quick Actions</h3>
            <button @click.stop="toggleHelpModal" class="text-gray-400 hover:text-white">✕</button>
          </div>
          <p class="text-sm text-gray-300 mb-3">This is a frontend-only modal placeholder for quick actions or help. Wire real actions here later.</p>
          <div class="space-y-2">
            <button class="w-full px-3 py-2 bg-emerald-500 text-black rounded">Open Claims Panel</button>
            <button class="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700">View Notifications</button>
            <button class="w-full px-3 py-2 bg-gray-700 text-white rounded">Other Action</button>
          </div>
          <div class="flex justify-end mt-4">
            <button @click.stop="toggleHelpModal" class="px-3 py-1 bg-gray-600 rounded">Close</button>
          </div>
        </div>
      </div>

      <!-- Delete Claim Confirmation Modal -->
      <div v-if="showDeleteConfirmModal && claimToDelete" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg p-6 w-96 border border-gray-300 dark:border-gray-700 shadow-2xl">
          <!-- Header -->
          <h3 class="text-xl font-bold text-red-600 dark:text-red-500 mb-4">Delete Approved Claim</h3>
          
          <!-- Content -->
          <div class="space-y-4 mb-6">
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to permanently delete this approved claim? This action cannot be undone.
            </p>
            
            <!-- Claim Details -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <img
                  v-if="claimToDelete.claimant_profile_picture"
                  :src="getFullUrl(claimToDelete.claimant_profile_picture)"
                  class="w-10 h-10 rounded-full object-cover"
                  @error="$event.target.style.display='none'"
                />
                <div v-else class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {{ (claimToDelete.claimant_name || 'U')[0].toUpperCase() }}
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ claimToDelete.claimant_name || 'Unknown' }}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">{{ claimToDelete.claimant_email || 'N/A' }}</p>
                </div>
              </div>
              
              <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Item:</strong> {{ claimToDelete.item_name || 'Unknown item' }}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Requested:</strong> {{ formatDate(claimToDelete.created_at) }}
                </p>
              </div>
            </div>

            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
              <p class="text-xs text-red-700 dark:text-red-400">
                <strong>⚠️ Warning:</strong> This will permanently remove the claim from the system. The claimant will not receive a notification.
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button
              @click="cancelDeleteApprovedClaim"
              class="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition font-medium text-sm"
            >
              Cancel
            </button>
            <button
              @click="confirmDeleteApprovedClaim"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </div>

      <!-- Claim Approval Success Modal with Reporter Gratitude Message (moved to component) -->
      <StaffClaimApproved :show="showApprovalSuccessModal" :data="approvalSuccessData" @close="onApprovalClosed" />

      <!-- OFFICE HOURS MANAGEMENT PAGE -->
      <div v-if="currentPage === 'office-hours'">
        <EditableOfficeHours />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import * as XLSX from 'xlsx';
import initSocket, { disconnectSocket } from "../socket";
import ThemeToggle from '../components/ThemeToggle.vue';
import SecuritySidebar from "../components/SecuritySidebar.vue";
import StaffClaimApproved from '../components/StaffClaimApproved.vue';
import OfficeHoursWidget from "../components/OfficeHoursWidget.vue";
import EditableOfficeHours from "../components/EditableOfficeHours.vue";

const API_BASE_URL = "http://localhost:5000";
const router = useRouter();

const socket = initSocket();

// Page-based navigation instead of tabs
const currentPage = ref(localStorage.getItem('security-current-page') || 'dashboard');
watch(currentPage, (newPage) => {
  localStorage.setItem('security-current-page', newPage);
});

// Sidebar mobile state
const sidebarRef = ref(null);

const toggleSidebar = () => {
  if (sidebarRef.value && sidebarRef.value.toggleSidebar) {
    sidebarRef.value.toggleSidebar();
  }
};

const handleSidebarSelect = (page) => {
  currentPage.value = page;
  
  // Hide notifications dropdown and mark as seen when sidebar is clicked
  if (showNotificationsDropdown.value) {
    showNotificationsDropdown.value = false;
  }
  notificationsSeen.value = true;
  
  // 🔄 Fetch claims from database when navigating to claim-requests page
  if (page === 'claim-requests') {
    console.log("📋 Navigating to claim-requests, fetching from database...");
    fetchClaimsFromDatabase();
  }
};

const lostItems = ref([]);
const foundItems = ref([]);
// Pagination for found reports (server-authoritative preferred, client-side paging)
const foundLimit = ref(10);
const foundPage = ref(1); // 1-based

// Pagination for lost reports, returned history, and claim requests
const lostLimit = ref(10);
const lostPage = ref(1);

const returnedLimit = ref(10);
const returnedPage = ref(1);

const claimsLimit = ref(9);
const claimsPage = ref(1);

const returnedHistory = ref([]);

// Search / Filter state
const lostSearch = ref("");
const lostCategoryFilter = ref("");
const foundSearch = ref("");
const foundStatusFilter = ref("");
const foundCategoryFilter = ref("");
const returnedSearch = ref("");
const returnedCategoryFilter = ref("");
const showCategoryDropdown = ref(false);
const showFoundStatusDropdown = ref(false);
const showFoundCategoryDropdown = ref(false);
const showLostCategoryDropdown = ref(false);
const showClaimsStatusDropdown = ref(false);
const showClaimsCategoryDropdown = ref(false);
const claimsSearch = ref("");
const claimsStatusFilter = ref("");
const claimsCategoryFilter = ref("");

// Modal and UI state
const claimModalItem = ref(null);
const claimModalItemImageError = ref(false);
const selectedItem = ref(null);
const reviewItem = ref(null);
const returnItem = ref(null);
const imageError = ref(false);
const reporterImageError = ref(false);
const isConfirmingReceived = ref(false);
const showSuccessModal = ref(false);
const successMessage = ref("");
const newItemIds = ref([]);
// Quick actions modal (frontend only)
const showHelpModal = ref(false);
const toggleHelpModal = () => { showHelpModal.value = !showHelpModal.value; };

// Review modal for claim approval/rejection
const showClaimReviewModal = ref(false);
const claimReviewData = ref(null); // Will hold { claim, action: 'approve' | 'reject' }

// Safe accessor for the item inside claimReviewData to avoid optional-chaining in template
const claimReviewItemSafe = computed(() => {
  const data = claimReviewData.value;
  if (!data) return null;
  const c = data.claim || null;
  if (!c) return null;
  return c.item || null;
});
const claimReviewItemImageError = ref(false);

// Delete claim confirmation modal
const showDeleteConfirmModal = ref(false);
const claimToDelete = ref(null);

// Approval success modal for reporter notification
const showApprovalSuccessModal = ref(false);
const approvalSuccessData = ref(null); // Will hold { claimant_name, item_name }
// Loading flag for claim approval flow
const isApproving = ref(false);

// Loading flag for marking item as returned
const isMarkingAsReturned = ref(false);
const showMarkAsReturnedConfirm = ref(false);
const itemToMarkAsReturned = ref(null);

// For Found Items - Claimant info modal
const showClaimantInfoModal = ref(false);
const foundItemToMark = ref(null);
const claimantInfo = ref({
  name: "",
  studentId: "",
  phoneNumber: ""
});

// Loading flag for downloading all returned reports
const isDownloadingAll = ref(false);
const isDownloadingExcel = ref(false);
const showDownloadComplete = ref(false);

// Modal for selecting time period before bulk download
const showDownloadModal = ref(false);
const selectedMonths = ref(new Set()); // Track selected month keys (e.g., '2026-01', '2025-12')

// Unread counters
const unreadLostCount = ref(0);
const unreadFoundCount = ref(0);
const unreadReturnedCount = ref(0);

const securityUser = ref(null);
const showProfileMenu = ref(false);
const profileMenuRef = ref(null);

function onApprovalClosed() {
  // Close the approval modal, also ensure the claim request modal is closed
  try {
    showApprovalSuccessModal.value = false;
  } catch (e) {
    console.warn('[SecurityDashboard] failed to set showApprovalSuccessModal', e);
  }
  try {
    claimModalItem.value = null;
  } catch (e) {
    console.warn('[SecurityDashboard] failed to clear claimModalItem', e);
  }
  try {
    currentPage.value = 'dashboard';
  } catch (e) {
    console.warn('[SecurityDashboard] failed to set currentPage to dashboard', e);
  }
}

const securityDisplayName = computed(() => {
  if (!securityUser.value) return "Security Staff";
  return (
    securityUser.value.full_name ||
    securityUser.value.email?.split("@")[0] ||
    "Security Staff"
  );
});

const securityDisplayEmail = computed(
  () => securityUser.value?.email || "security@example.com"
);

const securityAvatar = computed(() => {
  const path = securityUser.value?.profile_picture;
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
});

const securityInitial = computed(() => securityDisplayName.value.charAt(0).toUpperCase());

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
};

// Sidebar badge should reflect unseen notifications only
const sidebarPendingCount = computed(() => {
  return !notificationsSeen.value && claimNotifications.value.length > 0
    ? claimNotifications.value.length
    : 0;
});

const handleProfileMenuOutside = (event) => {
  if (!profileMenuRef.value) return;
  if (!profileMenuRef.value.contains(event.target)) {
    showProfileMenu.value = false;
  }
};

const handleNotificationsOutside = (event) => {
  if (!notificationsRef.value) return;
  if (!notificationsRef.value.contains(event.target)) {
    showNotificationsDropdown.value = false;
  }
};

const goToProfile = () => {
  showProfileMenu.value = false;
  router.push("/profile");
};

// ✅ Navigate to report item page with security mode
const goToReportItem = () => {
  showProfileMenu.value = false;
  router.push("/report?mode=security");
};

// Fetch items from backend and populate lists
const fetchItems = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/items`);
    const data = Array.isArray(res.data) ? res.data.map(i => ({ ...i, imageError: false, reporterImageError: false })) : [];
    // Normalize return_date for returned items so UI shows a timestamp instead of N/A
    for (const item of data) {
      if ((item.status || '').toString().toLowerCase() === 'returned') {
        if (!item.return_date) {
          // Accept different server naming or fallback to available timestamps
          item.return_date = item.return_date || item.returnDate || item.updated_at || item.datetime || item.created_at || null;
          if (!item.return_date) {
            // As a last resort, set to now so UI doesn't show N/A
            item.return_date = new Date().toISOString();
          }
        }
      }
    }
    lostItems.value = data.filter(i => i.type === "lost" && i.status !== "marked_returned");
    // Include only non-returned found items in Found Reports
    foundItems.value = data.filter(i => i.type === "found" && i.status !== "returned");
    // Keep returned history for: lost items marked as returned OR found items with returned/claimed statuses
    const claimedStatuses = ["claimed", "confirmed_claim", "delivered"];
    returnedHistory.value = data.filter(i => 
      i.status === "marked_returned" || (i.type === "found" && (i.status === "returned" || claimedStatuses.includes(i.status)))
    );

    // Debug logging
    console.log("📊 Fetched items breakdown:", {
      total: data.length,
      lostItems: lostItems.value.length,
      foundItems: foundItems.value.length,
      returnedItems: returnedHistory.value.length,
      returnedStatuses: data.map(i => ({ id: i.id, type: i.type, status: i.status }))
    });

    // Populate claimant display fields for returned items when possible
    for (const it of returnedHistory.value) {
      // Normalize missing return_date
      if (!it.return_date) it.return_date = it.returnDate || it.updated_at || it.datetime || it.created_at || new Date().toISOString();
      // fetch claimant profile if claimant_id present
      await ensureClaimantForItem(it);
    }
  } catch (err) {
    console.error("Error fetching items:", err);
  }
};

const formatDate = (datetime) => {
  if (!datetime) return "N/A";
  const parsed = new Date(datetime);
  if (Number.isNaN(parsed.getTime())) return "N/A";

  return parsed.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatStatus = (status) => {
  if (!status) return "N/A";
  const statusMap = {
    'in_security_custody': 'In Custody of the Security Office',
    'In Security Custody': 'In Custody of the Security Office',
    'returned': 'Returned',
    'marked_returned': 'Marked Returned',
    'pending': 'Lost',
    'lost': 'Lost'
  };
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
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

const formatClaimStatus = (status) => {
  const safe = (status ? String(status) : "pending")
    .replace(/\s+/g, "_")
    .toLowerCase();

  return safe
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || "Pending";
};

const claimStatusClass = (status) => {
  const normalized = (status || "pending").toString().toLowerCase();
  switch (normalized) {
    case "approved":
      return "bg-green-500 border-green-500 text-white";
    case "rejected":
      return "bg-red-500 border-red-500 text-white";
    default:
      return "bg-yellow-500 border-yellow-500 text-white";
  }
};

// 🔸 NEW: Pending claims counter
const pendingClaimsCount = ref(0);

const claimRequests = ref([]);
const modalNotificationDetails = ref(null);

// Database claims are now fetched directly from the server (not from localStorage)
// This ensures we always have the authoritative state from the claims table
const dbClaimRequests = ref([]);
let dbClaimsRefreshInterval = null;

// Fetch all claim requests directly from the database
const fetchClaimsFromDatabase = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/claims/security/all`);
    const allClaims = Array.isArray(res.data) ? res.data : [];
    console.log("📊 Fetched claims from database:", allClaims.length, "claims");
    
    // Normalize and enrich each claim with item data
    const normalizedClaims = await Promise.all(
      allClaims.map(async (rawClaim) => {
        const normalized = normalizeClaim(rawClaim);
        
        // Try to fetch full item data for enrichment
        try {
          const itemId = normalized.claimed_item_id || normalized.item_id;
          if (itemId) {
            const itemRes = await axios.get(`${API_BASE_URL}/api/items/${encodeURIComponent(itemId)}`);
            if (itemRes.data) {
              normalized.item = itemRes.data;
              normalized.item_name = itemRes.data.name;
              normalized.item_image = itemRes.data.image_url;
              normalized.item_category = itemRes.data.category;
              normalized.item_status = itemRes.data.status;
            }
          }
        } catch (err) {
          console.debug(`Could not fetch item data for claim ${normalized.claim_id}:`, err.message);
        }
        
        return normalized;
      })
    );
    
    dbClaimRequests.value = normalizedClaims;
    return normalizedClaims;
  } catch (err) {
    console.error("Failed to fetch claims from database:", err);
    return [];
  }
};

// Persistent claim requests store (DEPRECATED - keeping for backward compatibility only)
const loadClaimRequestsFromStorage = () => {
  try {
    const stored = localStorage.getItem('claimRequestsStore');
    if (stored) return JSON.parse(stored);
  } catch (err) {
    console.error('Failed to load claim requests store from storage:', err);
  }
  return [];
};

const claimRequestsStore = ref(loadClaimRequestsFromStorage());

// Persist claimRequestsStore to localStorage (DEPRECATED)
watch(claimRequestsStore, (newVal) => {
  try {
    localStorage.setItem('claimRequestsStore', JSON.stringify(newVal));
  } catch (err) {
    console.error('Failed to save claim requests store to localStorage:', err);
  }
}, { deep: true });

// Notifications dropdown state (shows claim requests for items in security custody)
const showNotificationsDropdown = ref(false);
const notificationsRef = ref(null);

// Load claimNotifications from localStorage to persist across page refreshes
const loadClaimNotificationsFromStorage = () => {
  try {
    const stored = localStorage.getItem('claimNotifications');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Failed to load claim notifications from storage:', err);
  }
  return [];
};

const claimNotifications = ref(loadClaimNotificationsFromStorage());

// Watch claimNotifications to persist any changes to localStorage
watch(claimNotifications, (newNotifications) => {
  try {
    localStorage.setItem('claimNotifications', JSON.stringify(newNotifications));
  } catch (err) {
    console.error('Failed to save claim notifications to localStorage:', err);
  }
}, { deep: true });

// 🔄 Periodic sync interval (failsafe for missed socket events)
let claimSyncInterval = null;
// separate interval for item (reports) sync when needed
let itemSyncInterval = null;

// Load processedClaimIds from localStorage to prevent reprocessing claims after refresh
const loadProcessedClaimIds = () => {
  try {
    const stored = localStorage.getItem('processedClaimIds');
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (err) {
    console.error('Failed to load processed claim IDs from storage:', err);
  }
  return new Set();
};

let processedClaimIds = loadProcessedClaimIds();

// Whether the user has opened the notification bell and seen current items
const notificationsSeen = ref(false);

// Helper to save processedClaimIds to localStorage
const saveProcessedClaimIds = () => {
  try {
    localStorage.setItem('processedClaimIds', JSON.stringify(Array.from(processedClaimIds)));
  } catch (err) {
    console.error('Failed to save processed claim IDs to storage:', err);
  }
};

const toggleNotifications = () => {
  showNotificationsDropdown.value = !showNotificationsDropdown.value;
  if (showNotificationsDropdown.value) {
    // when opening, mark notifications as seen so the badge hides
    notificationsSeen.value = true;
    // also clear pending badge count locally (backend authoritative count remains)
    pendingClaimsCount.value = 0;
  }
};

// Delete a claim notification (removes it permanently)
const deleteClaimNotification = () => {
  if (claimNotifications.value.length > 0) {
    claimNotifications.value.splice(0, 1);
    showNotificationsDropdown.value = false;
    console.log('🗑️ Claim notification deleted');
  }
};

// Mark notifications as seen but keep them in the list (they're in the Claim Requests section)
// 🔄 Periodic sync: Check for new claims (OPTIMIZED: longer interval, only when needed)
// Track claim IDs we've seen to prevent re-processing
let isSyncing = false;

const syncPendingClaims = async () => {
  // Prevent concurrent syncs
  if (isSyncing) {
    console.debug("🔄 [Sync] Already syncing, skipping...");
    return;
  }
  
  try {
    isSyncing = true;
    const res = await axios.get(`${API_BASE_URL}/api/claims/pending/count`);
    const newCount = res.data?.pending_count || 0;
    
    // Only fetch claims if the count actually increased (indicates new claims)
    if (newCount > pendingClaimsCount.value) {
      console.log(`🔄 [Sync] New claims detected: ${newCount} (was ${pendingClaimsCount.value})`);
      
      try {
        const allRes = await axios.get(`${API_BASE_URL}/api/claims/security/all`);
        const allClaims = Array.isArray(allRes.data) ? allRes.data : [];
        
        let newClaimsAdded = 0;
        
        // Check for claims we haven't added to notifications yet
        for (const claim of allClaims) {
          const normalized = normalizeClaim(claim);
          const claimId = normalized.claim_id;
          const claimantId = normalized.user_id || normalized.claimant_id;
          const itemId = normalized.claimed_item_id || normalized.item_id;
          
          // 🔒 Skip if we've already processed this claim_id
          if (processedClaimIds.has(claimId)) {
            continue;
          }
          
          // 🔒 Check for duplicates: don't add if we already have this exact claim
          const alreadyExists = claimNotifications.value.some((n) => {
            const existingClaimantId = n.user_id || n.claimant_id;
            const existingItemId = n.claimed_item_id || n.item_id;
            return String(existingClaimantId) === String(claimantId) && 
                   String(existingItemId) === String(itemId);
          });
          
          if (!alreadyExists && normalized.status === 'pending') {
            console.log(`🔄 [Sync] Adding missing claim: claimant=${claimantId}, item=${itemId}`);
            await addClaimNotification(normalized);
            processedClaimIds.add(claimId);
            saveProcessedClaimIds();
            newClaimsAdded++;
          } else if (alreadyExists) {
            // Mark as processed even if duplicate (to avoid re-checking)
            processedClaimIds.add(claimId);
            saveProcessedClaimIds();
          }
        }
        
        if (newClaimsAdded === 0 && newCount > 0) {
          console.log(`🔄 [Sync] No new claims to add (all claims already in notifications)`);
        }
      } catch (err) {
        console.error("Failed to fetch all claims during sync:", err);
      }
    } else if (newCount < pendingClaimsCount.value) {
      // Count decreased (claims approved/rejected), clear processed set to allow re-sync if needed
      console.log(`🔄 [Sync] Claims were processed, resetting cache (${newCount} pending now)`);
      processedClaimIds.clear();
      saveProcessedClaimIds();
      // Reconcile persistent claim store with authoritative server state to remove stale entries
      try {
        await reconcileClaimRequestsStoreWithServer();
      } catch (reconErr) {
        console.warn('⚠️ Reconciliation with server failed:', reconErr);
      }
    }
    
    pendingClaimsCount.value = newCount;
  } catch (err) {
    console.error("❌ [Sync] Error fetching pending claims count:", err);
  } finally {
    isSyncing = false;
  }
};

const fetchItemById = async (id) => {
  if (!id) return null;
  try {
    const res = await axios.get(`${API_BASE_URL}/api/items/${encodeURIComponent(id)}`);
    return res.data || null;
  } catch (err) {
    // If endpoint doesn't exist or fails, ignore silently
    return null;
  }
};

// Fetch user/profile by id (used to populate claimant info)
const fetchProfileById = async (id) => {
  if (!id) return null;
  try {
    const res = await axios.get(`${API_BASE_URL}/api/profile/${encodeURIComponent(id)}`);
    return res.data || null;
  } catch (err) {
    // ignore - profile may not exist or endpoint unavailable
    return null;
  }
};

// Ensure an item object has claimant display fields by fetching profile when claimant_id exists
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
      // Track Student ID from profile
      item.claimant_profile_id_number = profile.id_number || profile.student_id || null;
    }
  } catch (e) {
    // swallow errors - non-critical UI enhancement
    console.warn('ensureClaimantForItem error', e);
  }
};

// Reconcile the persistent claimRequestsStore with server state.
// Removes any entries whose claim_id (or id) no longer exists on the server.
const reconcileClaimRequestsStoreWithServer = async () => {
  try {
    const allRes = await axios.get(`${API_BASE_URL}/api/claims/security/all`);
    const allClaims = Array.isArray(allRes.data) ? allRes.data : [];
    const serverIds = new Set(allClaims.map((c) => String(c.id || c.claim_id)));

    const before = claimRequestsStore.value.length;

    claimRequestsStore.value = claimRequestsStore.value.filter((c) => {
      const id = c.claim_id || c.id || null;
      // If claim has no server id, keep it (can't reconcile); otherwise keep only if present on server
      if (!id) return true;
      return serverIds.has(String(id));
    });

    const after = claimRequestsStore.value.length;
    if (after !== before) {
      console.log(`🔁 Reconciled claimRequestsStore with server: removed ${before - after} stale entries`);
    }
  } catch (err) {
    console.warn('⚠️ Failed to reconcile claimRequestsStore with server:', err);
    throw err;
  }
};

// Build a full URL for images/APIs: return absolute URL, fixing common misconfigurations
const getFullUrl = (path) => {
  if (!path) return "";
  try {
    const s = String(path);
    // Already absolute
    if (s.startsWith('http://') || s.startsWith('https://')) return s;

    // Determine base
    let base = String(API_BASE_URL || '').trim();
    // If API_BASE_URL is empty, fallback to current origin
    if (!base) base = window.location.origin || '';

    // If base looks like ":5000" (port-only), prefix origin
    if (/^:\d+/.test(base)) {
      const origin = window.location.protocol + '//' + window.location.hostname;
      base = origin + base;
      console.warn('getFullUrl: normalized port-only API_BASE_URL to', base);
    }

    // If base starts with '//' add current protocol
    if (base.startsWith('//')) base = window.location.protocol + base;

    // If base lacks protocol, prefix with origin
    if (!/^https?:\/\//.test(base)) {
      const origin = window.location.origin || (window.location.protocol + '//' + window.location.hostname);
      base = origin.replace(/\/$/, '') + '/' + base.replace(/^\//, '');
    }

    // Combine ensuring single slash
    const combined = base.replace(/\/$/, '') + '/' + s.replace(/^\//, '');
    return combined;
  } catch (e) {
    console.warn('getFullUrl error', e);
    return '';
  }
};

// Generate a PDF return report for a returned item. Tries to use jsPDF if available,
// otherwise falls back to opening a printable HTML view that the user can save as PDF.
  const generateReturnReport = async (item, { download = true, forceType = null } = {}) => {
  if (!item) return;

    // Ensure we have freshest data from backend for this item (fetch by id when possible)
    try {
      const id = item.id || item.item_id || item._id || item.itemId;
      if (id) {
        try {
          // Skip fetching for synthetic transaction IDs created on the frontend (e.g., "txn-...")
          const sid = String(id || '');
          const looksLikeNumeric = /^[0-9]+$/.test(sid);
          const looksLikeUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(sid);
          if (!sid.startsWith('txn-') && (looksLikeNumeric || looksLikeUUID)) {
            try {
              const res = await axios.get(`${API_BASE_URL}/api/items/${encodeURIComponent(id)}`);
              if (res && res.data) {
                // merge backend fields onto the local item object, prefer backend values
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
  const returnDate = item.return_date || new Date().toISOString();

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

  const verificationDate = returnDate;
  const verificationOfficer = securityDisplayName.value || 'Security Officer';
  const returnMethod = item.return_method || 'In-person pickup';

  // Try to use jsPDF + autotable if available in node_modules
  try {
    const jsPDFModule = await import('jspdf');
    const { jsPDF } = jsPDFModule;
    // Import autotable plugin which augments jsPDF with `autoTable`
    try { await import('jspdf-autotable'); } catch (e) { /* ignore if not present */ }

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
          // If candidate looks like a relative/uploads path, try explicit API_BASE_URL prefix
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
    let y = 14;
    // Try to embed item and claimant images (if available) using multiple candidate fields
    // Prefer item-specific image fields for the top/right image
    const itemImageCandidates = [
      item.image_url, item.image, item.photo, item.imagePath, item.image_path,
      item.item_image, item.item_photo, item.display_image, item.displayImage,
      item.item_image_url, item.item_image_path
    ];
    // Claimant/reporter-specific candidates used only for claimant image area
    // For found items manually marked as returned with claimant_name, don't use reporter photo
    const claimantImageCandidates = [
      item.claimant_profile_picture, 
      item.transaction_claimant_profile_picture, 
      item.transaction_claimant_picture,
      (item.type === 'found' && item.claimant_name) ? null : item.reporter_profile_picture,
      item.reporter && item.reporter.profile_picture
    ];
    const itemImageData = await loadImageAsDataURL(itemImageCandidates);
    const claimantImageData = await loadImageAsDataURL(claimantImageCandidates.filter(Boolean));

    if (!itemImageData && !claimantImageData) {
      try {
        console.warn('generateReturnReport: no image data found. tried candidates', { itemImageCandidates, claimantImageCandidates });
      } catch (e) { console.warn('generateReturnReport warn failed', e); }
    }

    // Debug log to help map runtime fields when images or ID detection fail
    try {
      console.log('generateReturnReport debug', {
        source: 'SecurityDashboard',
        isIdGuess: null, // will be replaced below after we compute isId
        itemKeys: item ? Object.keys(item) : null,
        itemSample: item,
        itemImageCandidates,
        claimantImageCandidates,
        itemImageDataExists: !!itemImageData,
        claimantImageDataExists: !!claimantImageData
      });
    } catch (e) { /* ignore console errors */ }

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
    // place item image on the right if exists (detect mime); otherwise draw placeholder box
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
    // Ensure text color is reset to black for subsequent text
    try { doc.setTextColor(0, 0, 0); } catch (e) { /* ignore */ }
    y += 8;
    // header printed above
    y += 10;
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
      } catch (e) { /* ignore */ }
      return false;
    })();

    if (explicitIsId !== null) {
      try { isId = Boolean(explicitIsId); console.log('generateReturnReport: explicitIsId override ->', isId); } catch (e) { console.warn('generateReturnReport explicitIsId override failed', e); }
    }

    // Update the earlier debug log with the isId result (helps correlate to runtime)
    try {
      console.log('generateReturnReport debug post-detect', { source: 'SecurityDashboard', isId, itemName: item && (item.name || item.display_name) });
    } catch (e) { console.warn('generateReturnReport debug post-detect log failed', e); }

    // Build table rows depending on whether it's an ID or an Item
    let rows = [];
    if (isId) {
      rows = [
        ['Student Name', item.student_name || item.reporter_name || item.reporter?.full_name || item.user_name || item.display_name || item.name || 'N/A'],
        ['Student ID', item.student_id || item.item_student_id || item.studentId || item.display_student_id || item.display_student || 'N/A'],
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

    // Use autoTable if available for nicer layout
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
      // Fallback plain text rendering
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
    // Reset to black and restore font size so claimant info text is not greyed out/small
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
    y += 6;
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
    doc.text(`${securityDisplayEmail.value}`, 14, y);
    y += 12;
    // Signature block (Received by / Date)
    try {
      const sigY = y;
      doc.setFontSize(10);
      doc.text('Received by:', 14, sigY);
      doc.text('Date:', 120, sigY);
      // lines for signature and date
      const lineY = sigY + 8;
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(14, lineY, 110, lineY); // received signature line
      doc.line(120, lineY, 190, lineY); // date line
      // labels under lines
      doc.setFontSize(9);
      doc.text('Owner with Signature', 20, lineY + 8);
      doc.text('', 120, lineY + 8);
      y = lineY + 16;
    } catch (e) { /* ignore signature rendering errors */ }

    const filename = `CSU_Return_Report_${(item.name || item.id || 'item').toString().replace(/\s+/g,'_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    if (download) {
      doc.save(filename);
      return;
    } else {
      // Open PDF in new tab for preview (no immediate download)
      try {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        return;
      } catch (e) {
        // fallback to save if preview fails
        doc.save(filename);
        return;
      }
    }
  } catch (err) {
    console.warn('jsPDF not available or error generating PDF, falling back to printable HTML', err);
  }

  // Fallback: open printable HTML view in new window
  try {
    const printScript = download ? '' : 'window.print()';
    // build candidate lists and pick first reachable/normalized URL for the printable HTML fallback
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

    const claimantImgCandidatesHtml = [
      item.claimant_profile_picture, item.transaction_claimant_profile_picture, item.transaction_claimant_picture,
      item.reporter_profile_picture, (item.reporter && item.reporter.profile_picture), item.display_image
    ];
    let claimantImgUrl = '';
    try {
      for (const c of claimantImgCandidatesHtml) {
        const f = getFullUrl(c);
        if (f) { claimantImgUrl = f; break; }
      }
    } catch (e) { claimantImgUrl = getFullUrl(item.claimant_profile_picture || '') || ''; }

    const isIdHtml = (() => {
      try {
        const t = (item.type || item.item_type || '').toString().toLowerCase();
        const name = (item.name || '').toString().toLowerCase();
        const sid = (item.student_id || item.item_student_id || item.studentId || '').toString().toLowerCase();
        if (sid) return true;
        if (t.includes('id') || t.includes('student id')) return true;
        if (/^\d{4,}$/.test(name.replace(/[^0-9]/g, ''))) return true;
        if (name.includes('student id') || name.includes('(id)') || name.includes(' id')) return true;
      } catch (e) { /* ignore */ }
      return false;
    })();

    const html = `
      <html><head><title>Return Report</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111} h1,h2{color:#222} .img-right{float:right;margin-left:12px;width:140px}</style>
      </head><body>
      <h1>${universityName}</h1>
      <h2>${officeName}</h2>
      <h3>${reportLine3}</h3>
      <h4>${reportLine4}</h4>
      <p><strong>Date of Report:</strong> ${reportDate}</p>
      <h3>${isIdHtml ? 'ID Return Details' : 'Item Return Details'}</h3>
      ${itemImgUrl ? `<img src="${itemImgUrl}" class="img-right"/>` : `<div class="img-right" style="width:140px;height:140px;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;color:#888;background:#fafafa">No image</div>`}
      ${isIdHtml ? `
        <p><strong>Student Name:</strong> ${item.student_name || item.name || 'N/A'}</p>
        <p><strong>Student ID:</strong> ${item.student_id || item.item_student_id || item.studentId || 'N/A'}</p>
        <p><strong>Department:</strong> ${item.department || item.student_department || item.claimant_department || 'N/A'}</p>
        <p><strong>Course/Program:</strong> ${item.course || item.program || item.course_program || 'N/A'}</p>
      ` : `
        <p><strong>Item Name:</strong> ${item.name || 'N/A'}</p>
        <p><strong>Brand:</strong> ${item.brand || 'N/A'}</p>
        <p><strong>Color:</strong> ${item.color || 'N/A'}</p>
        <p><strong>Description:</strong> ${item.description || itemDescription || 'N/A'}</p>
      `}
      <p><strong>Found Location:</strong> ${foundLocation}</p>
      <p><strong>Return Date:</strong> ${formatDate(returnDate)}</p>
      <h3>Claimant Information</h3>
      ${claimantImgUrl ? `<img src="${claimantImgUrl}" style="width:120px;float:right;margin-left:12px"/>` : `<div style="width:120px;float:right;margin-left:12px;height:120px;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;color:#888;background:#fafafa">No image</div>`}
      <p><strong>Name:</strong> ${claimantName}</p>
      <p><strong>Email:</strong> ${claimantEmail}</p>
      <p><strong>Student ID:</strong> ${claimantStudentId}</p>
      <p><strong>Phone:</strong> ${claimantPhone}</p>
      <h3>Verification and Return Process</h3>
      <p><strong>Claim Verification Date:</strong> ${formatDate(verificationDate)}</p>
      <p><strong>Verification Officer:</strong> ${verificationOfficer}</p>
      <p><strong>Return Method:</strong> ${returnMethod}</p>
      <h3>Report Prepared By:</h3>
      <p>${verificationOfficer}<br/>${securityDisplayEmail.value}</p>
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

// (Removed unused viewGeneratedReport wrapper — use `printReturnReport` or `downloadReturnReport`)

// Download PDF version of the return report (if jsPDF available this will auto-download)
const downloadReturnReport = async (item) => {
  if (!item) return;
  await ensureClaimantForItem(item).catch(() => {});
  await generateReturnReport(item, { download: true });
};

// Open printable view (preview) of the return report
const printReturnReport = async (item) => {
  if (!item) return;
  await ensureClaimantForItem(item).catch(() => {});
  await generateReturnReport(item, { download: false });
};

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
        // Try to fetch freshest item data from backend (same logic as single report)
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
                } catch (e) { /* ignore fetch errors */ }
              }
            } catch (e) { /* ignore id parsing errors */ }
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
        const returnDate = item.return_date || new Date().toISOString();
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
        const verificationDate = returnDate;
        const verificationOfficer = securityDisplayName.value || 'Security Officer';
        const returnMethod = item.return_method || 'In-person pickup';

        let y = 14;
        // Header: three lines (university, office, report title)
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
        
        // Load and embed images (item image on right)
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
                try {
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
                } catch (e) {
                  continue;
                }
              }
            } catch (e) {
              continue;
            }
          }
          return null;
        };

        const itemImageCandidates = [
          item.image_url, item.image, item.photo, item.imagePath, item.image_path,
          item.item_image, item.item_photo, item.display_image, item.displayImage,
          item.item_image_url, item.item_image_path
        ];
        const claimantImageCandidates = [
          item.claimant_profile_picture,
          item.transaction_claimant_profile_picture,
          item.transaction_claimant_picture,
          (item.type === 'found' && item.claimant_name) ? null : item.reporter_profile_picture,
          item.reporter && item.reporter.profile_picture
        ];
        
        const itemImageData = await loadImageAsDataURL(itemImageCandidates);
        const claimantImageData = await loadImageAsDataURL(claimantImageCandidates);

        // Place item image on the right
        if (itemImageData) {
          try {
            const fmt = itemImageData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
            mergedDoc.addImage(itemImageData, fmt, 150, 8, 40, 40);
          } catch (e) { /* ignore image embed errors */ }
        } else {
          try {
            mergedDoc.setDrawColor(200);
            mergedDoc.rect(150, 8, 40, 40);
            mergedDoc.setFontSize(8);
            mergedDoc.setTextColor(120);
            mergedDoc.text('No image', 170, 28, { align: 'center' });
          } catch (e) { /* ignore placeholder draw errors */ }
        }
        // Reset to black and restore font size for claimant info text
        try { mergedDoc.setTextColor(0, 0, 0); mergedDoc.setFontSize(10); } catch (e) { /* ignore */ }
        
        y += 8;
        // header printed above
        y += 10;
        mergedDoc.setFontSize(10);
        mergedDoc.text(`Date of Report: ${reportDate}`, 14, y);
        y += 8;
        mergedDoc.setFontSize(9);
        mergedDoc.text(`Item ${i + 1} of ${totalItems}`, 14, y);
        y += 10;

        // Detect if ID or item
        const isId = (() => {
          try {
            const name = (item.name || item.display_name || item.item_name || '').toString().toLowerCase();
            const sid = (item.student_id || item.item_student_id || item.studentId || '').toString().toLowerCase();
            if (item.is_id || item.is_student_id || item.isStudentId) return true;
            const claimantNames = [item.claimant_name, item.transaction_claimant_name, item.reporter_name, item.display_name, item.reporter?.full_name].filter(Boolean).map(s => String(s).trim().toLowerCase());
            if (item.name && claimantNames.includes(String(item.name).trim().toLowerCase())) return true;
            const looksLikePerson = item.name && /\w+\s+\w+/.test(String(item.name));
            const hasItemProperties = item.brand || item.color || item.description;
            if (looksLikePerson && !hasItemProperties && (item.claimant_name || item.transaction_claimant_name || item.reporter_name)) return true;
            if (sid) return true;
            if (name.includes('student id') || name.includes('(id)') || name.includes(' id')) return true;
          } catch (e) { 
            // Ignore parsing errors
          }
          return false;
        })();

        // Build table rows
        let rows = [];
        if (isId) {
          rows = [
            ['Student Name', item.student_name || item.reporter_name || item.reporter?.full_name || item.display_name || item.name || 'N/A'],
            ['Student ID', item.student_id || item.item_student_id || item.studentId || item.display_student_id || 'N/A'],
            ['Department', item.department || item.student_department || item.reporter_department || 'N/A'],
            ['Course/Program', item.course || item.program || item.student_program || 'N/A'],
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

        // Use autoTable if available
        if (typeof mergedDoc.autoTable === 'function') {
          mergedDoc.autoTable({
            startY: y,
            head: [['Field', 'Value']],
            body: rows,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 }
          });
          y = mergedDoc.lastAutoTable ? mergedDoc.lastAutoTable.finalY + 8 : y + (rows.length * 6) + 8;
        } else {
          mergedDoc.setFontSize(12);
          mergedDoc.text(isId ? 'ID Return Details' : 'Item Return Details', 14, y);
          y += 8;
          mergedDoc.setFontSize(10);
          rows.forEach(([k, v]) => {
            mergedDoc.text(`${k}: ${v}`, 14, y);
            y += 6;
            if (y > 270) { mergedDoc.addPage(); y = 14; }
          });
        }

        y += 8;
        mergedDoc.setFontSize(12);
        mergedDoc.text('Claimant Information', 14, y);
        y += 8;
        mergedDoc.setFontSize(10);
        mergedDoc.text(`Name: ${claimantName}`, 14, y);
        
        // Place claimant image on the right
        if (claimantImageData) {
          try {
            const fmtC = claimantImageData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
            mergedDoc.addImage(claimantImageData, fmtC, 150, y - 6, 36, 36);
          } catch (e) { /* ignore */ }
        } else {
          try {
            mergedDoc.setDrawColor(200);
            mergedDoc.rect(150, y - 6, 36, 36);
            mergedDoc.setFontSize(7);
            mergedDoc.setTextColor(120);
            mergedDoc.text('No image', 150 + 18, y + 12, { align: 'center' });
            // reset color/font after placeholder so subsequent text is black
            mergedDoc.setTextColor(0, 0, 0);
            mergedDoc.setFontSize(10);
          } catch (e) { /* ignore */ }
        }
        
        y += 6;
        mergedDoc.text(`Email: ${claimantEmail}`, 14, y);
        y += 6;
        mergedDoc.text(`Student ID: ${claimantStudentId}`, 14, y);
        y += 6;
        mergedDoc.text(`Phone: ${claimantPhone}`, 14, y);
        y += 10;

        // Reporter Information (no profile picture)
        mergedDoc.setFontSize(12);
        mergedDoc.text('Reporter Information', 14, y);
        y += 8;
        mergedDoc.setFontSize(10);
        mergedDoc.text(`Name: ${reporterName}`, 14, y);
        y += 6;
        mergedDoc.text(`Email: ${reporterEmail}`, 14, y);
        y += 6;
        mergedDoc.text(`Student ID: ${reporterStudentId}`, 14, y);
        y += 6;
        mergedDoc.text(`Phone: ${reporterPhone}`, 14, y);
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

        // Report Prepared By and signature block
        // add extra vertical space before the prepared-by block
        y += 12;
        mergedDoc.setFontSize(12);
        mergedDoc.text('Report Prepared By:', 14, y);
        y += 6;
        mergedDoc.setFontSize(10);
        mergedDoc.text(`${verificationOfficer}`, 14, y);
        y += 6;
        mergedDoc.text(`${securityDisplayEmail.value}`, 14, y);

        y += 12;
        try {
          const sigY = y;
          mergedDoc.setFontSize(10);
          mergedDoc.text('Received by:', 14, sigY);
          mergedDoc.text('Date:', 120, sigY);
          const lineY = sigY + 8;
          mergedDoc.setDrawColor(0);
          mergedDoc.setLineWidth(0.5);
          mergedDoc.line(14, lineY, 110, lineY);
          mergedDoc.line(120, lineY, 190, lineY);
          mergedDoc.setFontSize(9);
          mergedDoc.text('Owner with Signature', 20, lineY + 8);
          y = lineY + 16;
        } catch (e) { /* ignore signature rendering errors */ }

      } catch (itemError) {
        console.error(`Error processing item ${i + 1}:`, itemError);
      }
    }

    // Download the merged PDF
    mergedDoc.save(`Returned_Items_Report_${new Date().toISOString().split('T')[0]}.pdf`);

  } catch (error) {
    console.error('Error downloading all reports:', error);
    alert('Failed to download reports. Please try again.');
  }
};

const addClaimNotification = async (rawClaim) => {
  try {
    const note = normalizeClaim(rawClaim);

    // Provide display helpers if backend included image/name fields directly
    note.display_image = note.display_image || rawClaim.item_image || rawClaim.display_image || (rawClaim.item && rawClaim.item.image_url) || null;
    note.display_name = note.display_name || rawClaim.item_name || rawClaim.display_name || (rawClaim.item && rawClaim.item.name) || null;

    // 🔒 Check for duplicate: same claimant (user_id) for same item
    const itemId = note.claimed_item_id || note.item_id || note.notification_item_id;
    const claimantId = note.user_id || note.claimant_id;
    
    const isDuplicate = claimNotifications.value.some(existing => {
      const existingItemId = existing.claimed_item_id || existing.item_id || existing.notification_item_id;
      const existingClaimantId = existing.user_id || existing.claimant_id;
      return String(existingItemId) === String(itemId) && String(existingClaimantId) === String(claimantId);
    });
    
    if (isDuplicate) {
      console.warn(`🔒 [Frontend] Duplicate claim blocked: claimant ${claimantId} already claimed item ${itemId}`);
      return;
    }

    // Attempt to find the item in local lists
    let item = null;
    const id = note.claimed_item_id || note.item_id || note.notification_item_id || (note.related_item_ids && note.related_item_ids[0]);
    if (id) {
      item = foundItems.value.find((i) => String(i.id) === String(id)) ||
             lostItems.value.find((i) => String(i.id) === String(id)) ||
             returnedHistory.value.find((i) => String(i.id) === String(id));
    }

    // If item not found locally, try to fetch it
    if (!item && id) {
      const fetched = await fetchItemById(id);
      if (fetched) item = fetched;
    }

    // Show claim notifications for all items (regardless of status)
    // This ensures claims are visible as soon as they're submitted
    note.item = item;
    note.itemImageError = false;

  // keep notification-related fields if present on payload
  note.notification = note.notification || {};
  if (rawClaim.notification_id) note.notification.id = rawClaim.notification_id;
  if (rawClaim.notification_item_id) note.notification.item_id = rawClaim.notification_item_id;
  if (rawClaim.notification_matched_item_id) note.notification.matched_item_id = rawClaim.notification_matched_item_id;
  if (rawClaim.match_id) note.notification.match_id = rawClaim.match_id;

    // Optionally fetch claimant profile picture if user id present (best-effort)
    if (note.user_id && !note.claimant_profile_picture) {
      try {
        // backend exposes user lookup at /api/user/:id (singular)
        const u = await axios.get(`${API_BASE_URL}/api/user/${encodeURIComponent(note.user_id)}`);
        if (u?.data?.profile_picture) note.claimant_profile_picture = u.data.profile_picture;
      } catch (e) {
        console.warn('Failed to fetch claimant user profile', e?.message || e);
      }
    }

  // prepend so newest appear at top
  claimNotifications.value.unshift(note);
  
  // 🔹 KEEP ONLY THE LATEST CLAIM IN THE MODAL (for cleaner UX - no stacking)
  // Keep only the first item (newest) in claimNotifications for modal display
  if (claimNotifications.value.length > 1) {
    claimNotifications.value = [claimNotifications.value[0]];
  }
  
  // mark as unseen so the bell shows the badge for this new notification
  notificationsSeen.value = false;
    // Also save to persistent claim requests store so clearing the bell
    // notifications doesn't remove the authoritative list shown in the
    // Claim Requests page.
    try {
      const itemId = note.claimed_item_id || note.item_id || note.notification_item_id;
      const claimantId = note.user_id || note.claimant_id;
      const duplicateInStore = claimRequestsStore.value.some(existing => {
        const existingItemId = existing.claimed_item_id || existing.item_id || existing.notification_item_id;
        const existingClaimantId = existing.user_id || existing.claimant_id;
        return String(existingItemId) === String(itemId) && String(existingClaimantId) === String(claimantId);
      });
      if (!duplicateInStore) {
        claimRequestsStore.value.unshift(note);
      }
    } catch (e) {
      console.error('Failed to update claimRequestsStore:', e);
    }

    // ⚠️ Don't increment pendingClaimsCount here - it's managed by syncPendingClaims and backend count
    // Incrementing here causes the badge to show wrong numbers during periodic syncs
    console.log(`✅ [Frontend] Claim notification added: claimant=${claimantId}, item=${itemId}`);
  } catch (e) {
    console.error('Failed to add claim notification', e);
  }
};

const normalizeClaim = (raw = {}) => {
  const normalized = { ...raw };

  normalized.claim_id =
    raw.claim_id || raw.id || raw.claimId || normalized.claim_id || null;
  normalized.user_id =
    raw.user_id || raw.claimant_id || raw.userId || normalized.user_id || null;
  normalized.notification_id =
    raw.notification_id || raw.notificationId || normalized.notification_id || null;

  const timestamp =
    raw.created_at ||
    raw.requested_at ||
    raw.createdAt ||
    raw.requestedAt ||
    normalized.created_at ||
    normalized.requested_at ||
    null;
  normalized.created_at = timestamp || new Date().toISOString();

  normalized.status = raw.status || raw.user_claim_status || normalized.status || "pending";

  normalized.message =
    raw.claimant_message ??
    raw.message ??
    raw.claimantMessage ??
    raw.notes ??
    normalized.message ??
    null;

  normalized.claimant_name =
    raw.claimant_name ||
    raw.user_name ||
    raw.claimant_full_name ||
    raw.full_name ||
    raw.name ||
    normalized.claimant_name ||
    "Unknown claimant";

  normalized.claimant_email =
    raw.claimant_email || raw.user_email || raw.email || normalized.claimant_email || null;

  normalized.claimant_contact =
    raw.claimant_contact ||
    raw.user_contact ||
    raw.contact_number ||
    raw.contact ||
    normalized.claimant_contact ||
    null;

  normalized.claimant_department =
    raw.claimant_department ||
    raw.department ||
    raw.user_department ||
    normalized.claimant_department ||
    null;

  normalized.claimant_profile_picture =
    raw.claimant_profile_picture ||
    raw.profile_picture ||
    raw.user_profile_picture ||
    raw.profilePicture ||
    normalized.claimant_profile_picture ||
    null;

  normalized.claimed_item_id =
    raw.claimed_item_id || raw.item_id || raw.itemId || normalized.claimed_item_id || null;

  const relatedCandidates = [
    normalized.claimed_item_id,
    raw.lost_item_id || raw.lostItemId,
    raw.found_item_id || raw.foundItemId,
    raw.notification_item_id || raw.notificationItemId,
    raw.notification_matched_item_id || raw.notificationMatchedItemId,
  ].filter(Boolean);

  if (Array.isArray(raw.related_item_ids)) {
    relatedCandidates.push(...raw.related_item_ids.filter(Boolean));
  }

  normalized.related_item_ids = Array.from(new Set(relatedCandidates));

  return normalized;
};
const openClaimsModal = async (item) => {
  claimModalItem.value = item;
  claimModalItemImageError.value = false;
  claimRequests.value = [];
  try {
    // Primary fetch: item-specific claims
    const res = await axios.get(
      `${API_BASE_URL}/api/claims/item/${encodeURIComponent(item.id)}`
    );

    const rows = Array.isArray(res.data) ? res.data : [];
    claimRequests.value = rows.map((row) => normalizeClaim(row));

    if (claimRequests.value.length > 0) return;
  } catch (err) {
    console.error(
      "Error fetching claims via item endpoint:",
      err?.response?.data || err.message || err
    );
  }

  try {
    // Fallback: fetch all claims and filter (ensures older data still appears)
    const allRes = await axios.get(`${API_BASE_URL}/api/claims/security/all`);
    const normalizedAll = (Array.isArray(allRes.data) ? allRes.data : []).map((row) =>
      normalizeClaim(row)
    );

    const filtered = normalizedAll.filter((claim) => {
      if (claim.related_item_ids?.length) {
        return claim.related_item_ids.some(
          (candidate) => String(candidate) === String(item.id)
        );
      }
      return String(claim.claimed_item_id) === String(item.id);
    });

    if (filtered.length === 0) {
      console.warn(
        "No claims found for item after fallback filter",
        item.id,
        allRes.data
      );
    }

    claimRequests.value = filtered;
  } catch (err) {
    console.error(
      "Error fetching claims via fallback endpoint:",
      err?.response?.data || err.message || err
    );
    claimRequests.value = [];
  }
};
    

// Open review modal for claim approval
const openClaimApprovalReview = async (claim) => {
  // Directly approve without showing review modal
  await confirmClaimApproval(claim);
};

// Open review modal for claim rejection
const openClaimRejectionReview = async (claim) => {
  // Ensure we have full item details for display in the modal
  try {
    if (claim && !claim.item) {
      const id = claim.item_id || claim.claimed_item_id || claim.claimed_item_id || null;
      if (id) {
        const item = await fetchItemById(id);
        if (item) {
          claim.item = item;
        }
      }
    }
  } catch (e) {
    console.warn('Could not fetch item details for claim review:', e);
  }

  claimReviewData.value = { claim, action: 'reject' };
  claimReviewItemImageError.value = false;
  showClaimReviewModal.value = true;
};

// Close review modal
const closeClaimReviewModal = () => {
  showClaimReviewModal.value = false;
  claimReviewData.value = null;
  claimReviewItemImageError.value = false;
};

// Confirm approval from review modal
const confirmClaimApproval = async (claim) => {
  if (!claim || claim.status === "approved") return;
  if (isApproving.value) return; // prevent double-submit

  const wasPending = !claim.status || claim.status === "pending";
  isApproving.value = true;

  try {
    await axios.put(`${API_BASE_URL}/api/claims/${claim.claim_id}/approve`);

    const idx = claimRequests.value.findIndex(
      (c) => c.claim_id === claim.claim_id
    );
    if (idx !== -1) {
      const updated = {
        ...claimRequests.value[idx],
        status: "approved",
      };
      claimRequests.value[idx] = updated;
      claim.status = updated.status;
    }
    // Update persistent store as well
    const storeIdx = claimRequestsStore.value.findIndex((n) => (n.claim_id || n.id) === (claim.claim_id || claim.id));
    if (storeIdx !== -1) {
      claimRequestsStore.value[storeIdx].status = "approved";
    }
    if (wasPending && pendingClaimsCount.value > 0) {
      pendingClaimsCount.value--;
    }

    // --- New: When a claim is approved, mark the involved item(s) as returned
    // and create a returned-history entry. This ensures the lost/found lists
    // no longer show items that were matched and returned via approval.
    try {
      // Determine primary claimed item id and any matched item id
      const claimedItemId = claim.claimed_item_id || claim.item?.id || claim.item_id || null;
      // claim may include notification_matched_item_id or related_item_ids
      const matchedItemId = claim.notification_matched_item_id || (claim.related_item_ids && claim.related_item_ids.find(id => String(id) !== String(claimedItemId))) || null;

      const toUpdateIds = [];
      if (claimedItemId) toUpdateIds.push(claimedItemId);
      if (matchedItemId && String(matchedItemId) !== String(claimedItemId)) toUpdateIds.push(matchedItemId);

      if (toUpdateIds.length > 0) {
        const now = new Date().toISOString();
        // Update items on server in parallel
        const updatePromises = toUpdateIds.map((id) =>
          axios.put(`${API_BASE_URL}/api/items/${encodeURIComponent(id)}`, {
            status: 'returned',
            return_date: now,
          }).then(res => ({ id, data: res.data })).catch(e => ({ id, error: e }))
        );

        const results = await Promise.all(updatePromises);

        // Build a merged returned report for the history view
        const returnedReport = {
          id: `txn-${Date.now()}-${claimedItemId}`,
          name: null,
          category: null,
          image_url: null,
          item_image_url: null,
          status: 'returned',
          return_date: now,
          transaction_claimant_name: claim.claimant_name || claim.user_name || 'Unknown',
          transaction_claimant_id: claim.user_id || claim.claimant_id || null,
          transaction_message: claim.message || claim.claimant_message || null,
          transaction_place: null,
        };

        for (const r of results) {
          if (r.error) {
            console.warn('Failed to update item during claim approval:', r.id, r.error?.message || r.error);
            continue;
          }
          let itemData = r.data || {};
          // axios.put may return { message, item } — normalize to the actual item row
          if (itemData && itemData.item) itemData = itemData.item;
          // Remove from UI lists
          const removeFromList = (list) => {
            const i = list.findIndex(it => String(it.id) === String(r.id));
            if (i !== -1) list.splice(i, 1);
          };
          removeFromList(foundItems.value);
          removeFromList(lostItems.value);

          // Use the first item's details as primary if not set
          if (!returnedReport.name) returnedReport.name = itemData.name || itemData.item_name || 'Unknown';
          if (!returnedReport.category) returnedReport.category = itemData.category || itemData.item_category || 'General';
          if (!returnedReport.image_url) returnedReport.image_url = itemData.image_url || itemData.item_image || null;
          if (!returnedReport.item_image_url) returnedReport.item_image_url = itemData.item_image_url || itemData.image_url || itemData.item_image || null;
          // Fallback to any image fields present on the claim payload (when items were created from frontend payloads)
          if (!returnedReport.item_image_url) {
            try {
              returnedReport.item_image_url = claim?.item?.image_url || claim?.item?.display_image || claim?.display_image || claim?.item_image_url || claim?.item?.item_image_url || null;
            } catch (e) {
              returnedReport.item_image_url = returnedReport.item_image_url || null;
            }
          }
          if (!returnedReport.transaction_place && itemData.location) returnedReport.transaction_place = itemData.location;
          // Fallback to location included in the claim payload (some reports store location there)
          if (!returnedReport.transaction_place) {
            try {
              returnedReport.transaction_place = claim?.item?.location || claim?.item_location || claim?.location || null;
            } catch (e) {
              returnedReport.transaction_place = returnedReport.transaction_place || null;
            }
          }
          // propagate transaction_place into conventional location fields so PDF generator picks it up
          if (!returnedReport.location) returnedReport.location = returnedReport.transaction_place || itemData.location || itemData.found_location || claim?.item?.location || claim?.item_location || null;
          if (!returnedReport.found_location) returnedReport.found_location = returnedReport.location || itemData.found_location || claim?.item?.location || claim?.item_location || null;
          // Propagate student/ID-specific fields so the PDF generator can detect an ID
          if (!returnedReport.student_id) returnedReport.student_id = itemData.student_id || itemData.item_student_id || itemData.studentId || itemData.display_student_id || (claim && claim.item && (claim.item.student_id || claim.item.studentId)) || null;
          if (!returnedReport.student_name) returnedReport.student_name = itemData.student_name || itemData.reporter_name || itemData.name || (claim && claim.item && (claim.item.student_name || claim.item.name)) || null;
          if (!returnedReport.department) returnedReport.department = itemData.department || itemData.student_department || (claim && claim.item && claim.item.department) || null;
          if (!returnedReport.course) returnedReport.course = itemData.course || itemData.program || itemData.course_program || (claim && claim.item && (claim.item.course || claim.item.program)) || null;
          // Also copy brand/color/description for better PDF rows
          if (!returnedReport.brand) returnedReport.brand = itemData.brand || itemData.item_brand || null;
          if (!returnedReport.color) returnedReport.color = itemData.color || itemData.item_color || null;
          if (!returnedReport.description) returnedReport.description = itemData.description || itemData.notes || null;

          // Emit socket so other clients update
          socket.emit('updateReport', itemData);
        }

        // Ensure claimant display fields on the synthesized returned entry
        try {
          await ensureClaimantForItem(returnedReport);
        } catch (e) {
          console.warn('ensureClaimantForItem failed:', e);
        }

        // Generate and offer the PDF report for this returned transaction
        try {
          await generateReturnReport(returnedReport, { download: true });
        } catch (e) {
          console.warn('Failed to generate return PDF:', e);
        }

        // Add to returned history UI
        returnedHistory.value.unshift(returnedReport);
        unreadReturnedCount.value++;
      }
    } catch (approvalSideErr) {
      console.error('Error while marking items returned after claim approval:', approvalSideErr);
    }

    // Show approval success modal with gratitude message
    approvalSuccessData.value = {
      claimant_name: claim.claimant_name || claim.user_name || 'Unknown',
      item_name: claim.item?.name || claim.item_name || 'Unknown Item',
      item_image_url: claim.item?.image_url || claim.item_image_url || null,
      item_category: claim.item?.category || claim.item_category || 'general',
      item_brand: claim.item?.brand || claim.item_brand || null,
      item_color: claim.item?.color || claim.item_color || null,
      item_location: claim.item?.location || claim.item_location || null,
      item_description: claim.item?.description || claim.item_description || null,
      item_student_id: claim.item?.student_id || claim.item_student_id || null,
      student_id: claim.item?.student_id || claim.item_student_id || null,
      item_department: claim.item?.department || claim.item_department || null,
      department: claim.item?.department || claim.item_department || null,
      item_course_program: claim.item?.course_program || claim.item_course_program || null,
      course_program: claim.item?.course_program || claim.item_course_program || null
    };
    // clear loading before showing success modal so the modal transition plays smoothly
    isApproving.value = false;
    showApprovalSuccessModal.value = true;

    closeClaimReviewModal();
  } catch (err) {
    console.error("Error approving claim:", err);
    alert("❌ Failed to approve claim.");
  } finally {
    // ensure loading flag is cleared even on unexpected failures
    isApproving.value = false;
  }
};

// Confirm rejection from review modal
const confirmClaimRejection = async (claim) => {
  if (!claim) return;

  const claimId = claim.claim_id || claim.id;

  try {
    const rawId = String(claimId || "");
    const trimmed = rawId.trim();
    const encoded = encodeURIComponent(trimmed);
    const url = `${API_BASE_URL}/api/claims/${encoded}/reject`;
    console.log("[SecurityDashboard] Rejecting claim", { claimId: rawId, trimmed, url });
    await axios.put(url);

    // Update the claim status to "rejected" locally
    claim.status = "rejected";
    
    // Also update in all local lists
    const updateClaimStatus = (list) => {
      const idx = list.findIndex((c) => (c.claim_id || c.id) === claimId);
      if (idx !== -1) {
        list[idx].status = "rejected";
      }
    };
    
    updateClaimStatus(claimRequests.value);
    updateClaimStatus(claimNotifications.value);
    updateClaimStatus(claimRequestsStore.value);
    updateClaimStatus(dbClaimRequests.value);

    console.log(`✅ Claim ${claimId} rejected and status updated to 'rejected'. Claim is now deletable.`);
    
    alert("❌ Claim rejected. The claimant has been notified. You can now delete this claim.");
    closeClaimReviewModal();
  } catch (err) {
    console.error("Error rejecting claim:", err);
    // If the backend returned 404 -> claim not found, remove stale entries from local UI
    const status = err?.response?.status;
    if (status === 404) {
      console.warn(`Claim ${claimId} not found on server — cleaning local Claim Requests and notifications.`);
      
      // Remove from claimRequests
      const reqIdx = claimRequests.value.findIndex((c) => (c.claim_id || c.id) === claimId);
      if (reqIdx !== -1) {
        claimRequests.value.splice(reqIdx, 1);
      }
      
      // Remove from claimNotifications
      const notifIdx = claimNotifications.value.findIndex((n) => (n.claim_id || n.id) === claimId);
      if (notifIdx !== -1) {
        claimNotifications.value.splice(notifIdx, 1);
      }
      
      // Remove from claimRequestsStore
      const storeIdx = claimRequestsStore.value.findIndex((n) => (n.claim_id || n.id) === claimId);
      if (storeIdx !== -1) {
        claimRequestsStore.value.splice(storeIdx, 1);
      }
      
      alert("⚠️ Claim not found on server. Removed from local cache.");
      closeClaimReviewModal();
    } else {
      alert("❌ Failed to reject claim.");
    }
  }
};

// Method to view claim details - opens the existing claims modal
const viewClaimDetails = async (claim) => {
  console.log('[viewClaimDetails] Claim status:', claim.status, 'Claim:', claim);
  
  // If claim is already returned, show the StaffClaimApproved modal
  // Check for both 'returned' and 'approved' status values
  if (claim.status === 'returned' || claim.status === 'approved') {
    console.log('[viewClaimDetails] Claim is returned/approved, showing approval modal');
    const item = claim.item || (claim.item_id ? await fetchItemById(claim.item_id || claim.claimed_item_id) : null);
    if (item) {
      approvalSuccessData.value = {
        item_name: item.name || claim.display_name || 'Unknown Item',
        item_category: item.item_category || item.category,
        claimant_name: claim.claimant_name,
        item_image_url: item.image_url || item.photo || null
      };
      showApprovalSuccessModal.value = true;
    } else {
      alert("❌ Could not load item details.");
    }
    return;
  }

  if (claim.item) {
    // If we already have the item data, open the modal directly
    claimModalItem.value = claim.item;
    claimModalItemImageError.value = false;
    claimRequests.value = [claim];
  } else {
    // Otherwise try to fetch the item
    const item = await fetchItemById(claim.item_id || claim.claimed_item_id);
    if (item) {
      claimModalItem.value = item;
      claimModalItemImageError.value = false;
      claimRequests.value = [claim];
    } else {
      alert("❌ Could not load item details.");
    }
  }
};

const deleteRejectedClaim = async (claim) => {
  // Confirm deletion
  if (!confirm(`Are you sure you want to delete the rejected claim from ${claim.claimant_name || 'Unknown'}?`)) {
    return;
  }

  try {
    const claimId = claim.claim_id || claim.id;
    if (!claimId) {
      alert("❌ Error: Claim ID not found.");
      console.error("❌ Claim object has no ID:", claim);
      return;
    }

    console.log(`🗑️ Attempting to delete claim with ID: "${claimId}"`);
    console.log(`🗑️ Claim status: ${claim.status}`);
    console.log(`🗑️ Full claim object:`, claim);
    
    // ✅ Verify claim still exists and is in rejected status before deletion
    try {
      // First, try to fetch all claims to check current status
      const checkRes = await axios.get(`${API_BASE_URL}/api/claims/security/all`);
      const allClaims = Array.isArray(checkRes.data) ? checkRes.data : [];
      
      console.log(`🔍 Searching for claim ${claimId} in ${allClaims.length} claims from database`);
      
      // The API returns claim_id (not id), so search by claim_id
      const currentClaim = allClaims.find(c => String(c.claim_id) === String(claimId));
      
      if (!currentClaim) {
        console.warn(`⚠️ Claim ${claimId} not found in current database. It may have been already deleted.`);
        console.log(`📋 Available claim IDs in database:`, allClaims.map(c => c.claim_id));
        alert("❌ Claim not found. It may have been already deleted.");
        // Remove from local list anyway
        const idx = claimNotifications.value.findIndex(n => (n.claim_id || n.id) === claimId);
        if (idx !== -1) claimNotifications.value.splice(idx, 1);
        return;
      }
      
      if (currentClaim.status !== 'rejected') {
        console.warn(`⚠️ Claim ${claimId} is no longer in rejected status. Current status: ${currentClaim.status}`);
        alert(`❌ Claim status has changed to "${currentClaim.status}". Only rejected claims can be deleted.`);
        return;
      }
    } catch (checkErr) {
      console.error("⚠️ Could not verify claim status before deletion:", checkErr);
      // Continue anyway - backend will validate
    }
    
    const res = await axios.delete(`${API_BASE_URL}/api/claims/${claimId}`);
    
    if (res.status === 200 || res.data) {
      console.log(`✅ Rejected claim deleted: ${claimId}`, res.data);
      
      // Remove from claimNotifications
      const index = claimNotifications.value.findIndex((n) => (n.claim_id || n.id) === claimId);
      if (index !== -1) {
        claimNotifications.value.splice(index, 1);
      }
      
      alert("✅ Rejected claim has been deleted.");
      
      // 🔄 Refresh the claims from database
      await fetchClaimsFromDatabase();
      console.log("✅ Refreshed claims from database after deletion");
    }
  } catch (err) {
    console.error("❌ Error deleting rejected claim:", err);
    console.error("Error details:", err.response?.data || err.message);
    alert(`Failed to delete the rejected claim: ${err.response?.data?.message || err.message}`);
  }
};

const deleteApprovedClaim = async (claim) => {
  // Show confirmation modal instead of browser confirm
  claimToDelete.value = claim;
  showDeleteConfirmModal.value = true;
};

const confirmDeleteApprovedClaim = async () => {
  const claim = claimToDelete.value;
  if (!claim) return;

  try {
    const claimId = claim.claim_id || claim.id;
    if (!claimId) {
      alert("❌ Error: Claim ID not found.");
      console.error("❌ Claim object has no ID:", claim);
      showDeleteConfirmModal.value = false;
      claimToDelete.value = null;
      return;
    }

    console.log(`🗑️ Attempting to delete approved claim with ID: "${claimId}"`);
    console.log(`🗑️ Claim status: ${claim.status}`);
    console.log(`🗑️ Full claim object:`, claim);
    
    // ✅ Verify claim still exists and is in approved status before deletion
    try {
      // First, try to fetch all claims to check current status
      const checkRes = await axios.get(`${API_BASE_URL}/api/claims/security/all`);
      const allClaims = Array.isArray(checkRes.data) ? checkRes.data : [];
      
      console.log(`🔍 Searching for claim ${claimId} in ${allClaims.length} claims from database`);
      
      // The API returns claim_id (not id), so search by claim_id
      const currentClaim = allClaims.find(c => String(c.claim_id) === String(claimId));
      
      if (!currentClaim) {
        console.warn(`⚠️ Claim ${claimId} not found in current database. It may have been already deleted.`);
        console.log(`📋 Available claim IDs in database:`, allClaims.map(c => c.claim_id));
        alert("❌ Claim not found. It may have been already deleted.");
        // Remove from local list anyway
        const idx = claimNotifications.value.findIndex(n => (n.claim_id || n.id) === claimId);
        if (idx !== -1) claimNotifications.value.splice(idx, 1);
        showDeleteConfirmModal.value = false;
        claimToDelete.value = null;
        return;
      }
      
      if (currentClaim.status !== 'approved') {
        console.warn(`⚠️ Claim ${claimId} is no longer in approved status. Current status: ${currentClaim.status}`);
        alert(`❌ Claim status has changed to "${currentClaim.status}". Only approved claims can be deleted from top corner.`);
        showDeleteConfirmModal.value = false;
        claimToDelete.value = null;
        return;
      }
    } catch (checkErr) {
      console.error("⚠️ Could not verify claim status before deletion:", checkErr);
      // Continue anyway - backend will validate
    }
    
    const res = await axios.delete(`${API_BASE_URL}/api/claims/${claimId}`);
    
    if (res.status === 200 || res.data) {
      console.log(`✅ Approved claim deleted: ${claimId}`, res.data);
      
      // Remove from claimNotifications
      const index = claimNotifications.value.findIndex((n) => (n.claim_id || n.id) === claimId);
      if (index !== -1) {
        claimNotifications.value.splice(index, 1);
      }
      
      alert("✅ Approved claim has been deleted.");
      
      // 🔄 Refresh the claims from database
      await fetchClaimsFromDatabase();
      console.log("✅ Refreshed claims from database after deletion");
    }
    
    showDeleteConfirmModal.value = false;
    claimToDelete.value = null;
  } catch (err) {
    console.error("❌ Error deleting approved claim:", err);
    console.error("Error details:", err.response?.data || err.message);
    alert(`Failed to delete the approved claim: ${err.response?.data?.message || err.message}`);
    showDeleteConfirmModal.value = false;
    claimToDelete.value = null;
  }
};

const cancelDeleteApprovedClaim = () => {
  showDeleteConfirmModal.value = false;
  claimToDelete.value = null;
};

const highlightNewItem = async (id) => {
  newItemIds.value.push(id);
  await nextTick();
  setTimeout(() => {
    newItemIds.value = newItemIds.value.filter((i) => i !== id);
  }, 5000);
};

const handleNewReport = (newReport) => {
  const reportWithFlags = {
    ...newReport,
    imageError: false,
    reporterImageError: false,
  };

  if (Notification.permission === "granted") {
    new Notification("🆕 New Report", {
      body: `${newReport.type === "lost" ? "Lost" : "Found"}: ${newReport.name}`,
      icon: newReport.image_url ? `${API_BASE_URL}${newReport.image_url}` : undefined,
    });
  }

  const exists =
    lostItems.value.some((i) => i.id === newReport.id) ||
    foundItems.value.some((i) => i.id === newReport.id) ||
    returnedHistory.value.some((i) => i.id === newReport.id);
  if (exists) return;

  if (newReport.status === "returned") {
    // attempt to populate claimant info
    ensureClaimantForItem(reportWithFlags).catch(() => {});
    returnedHistory.value.unshift(reportWithFlags);
    unreadReturnedCount.value++;
    highlightNewItem(newReport.id);
  } else if (newReport.type === "lost") {
    lostItems.value.unshift(reportWithFlags);
    unreadLostCount.value++;
    highlightNewItem(newReport.id);
  } else if (newReport.type === "found") {
    foundItems.value.unshift(reportWithFlags);
    unreadFoundCount.value++;
    highlightNewItem(newReport.id);
  }
};

socket.on("reportUpdated", async (updatedReport) => {
  const lists = [lostItems.value, foundItems.value, returnedHistory.value];
  lists.forEach((list) => {
    const idx = list.findIndex((item) => item.id === updatedReport.id);
    if (idx !== -1) list.splice(idx, 1);
  });

        if (updatedReport.status === "returned") {
    // ensure claimant info is present for updated returned reports
    await ensureClaimantForItem(updatedReport);
    returnedHistory.value.unshift(updatedReport);
  } else if (updatedReport.type === "found") {
    foundItems.value.unshift(updatedReport);
  } else if (updatedReport.type === "lost") {
    lostItems.value.unshift(updatedReport);
  }
});

socket.on("refreshDashboard", fetchItems);

// 🔸 UPDATED: newClaimRequest listener with counter
socket.on("newClaimRequest", (claimData) => {
  // Add to claim notifications (only for items in security custody)
  addClaimNotification(claimData);

  // Desktop notification (still useful)
  if (Notification.permission === "granted") {
    try {
      new Notification("🆕 New Claim", {
        body: `New claim for: ${claimData.item_name || claimData.item_name || claimData.item?.name || claimData.item_name}`,
      });
    } catch (e) {
      void e;
    }
  }

  // Add to modal if open for the same item
  try {
    if (claimModalItem.value && (String(claimModalItem.value.id) === String(claimData.item_id) || String(claimModalItem.value.id) === String(claimData.claimed_item_id))) {
      claimRequests.value.push(
        normalizeClaim({ ...claimData, status: claimData.status || 'pending' })
      );
    }
  } catch (e) {
    console.error('Error handling newClaimRequest add to modal', e);
  }
});

const confirmReceived = async () => {
  if (!reviewItem.value || isConfirmingReceived.value) return;
  isConfirmingReceived.value = true;
  try {
    console.log("🔄 Marking item as received. Current status:", reviewItem.value.status);
    
    const res = await axios.put(`${API_BASE_URL}/api/items/${reviewItem.value.id}`, {
      status: "in_security_custody",
      name: reviewItem.value.name,
      description: reviewItem.value.description,
      category: reviewItem.value.category,
    });

    const updated = { ...(res.data.item || res.data || {}), imageError: false, reporterImageError: false };
    console.log("✅ Item updated successfully:", updated);

    // Try to find and replace the item in any of the lists so the UI updates immediately
    const lists = [foundItems.value, lostItems.value, returnedHistory.value];
    let replaced = false;
    for (const list of lists) {
      const idx = list.findIndex((i) => String(i.id) === String(updated.id));
      if (idx !== -1) {
        const prev = list[idx] || {};
        list.splice(idx, 1, { ...prev, ...updated });
        replaced = true;
        break;
      }
    }

    if (!replaced) {
      if ((updated.status || "").toLowerCase() === "returned") {
        returnedHistory.value.unshift(updated);
      } else {
        foundItems.value.unshift(updated);
      }
    }

    socket.emit("updateReport", updated);

    reviewItem.value = null;
    successMessage.value = `✅ Item "${updated.name}" has been accepted successfully!`;
    showSuccessModal.value = true;
    console.log("✅ Item status updated successfully. No page reload needed - UI updated reactively.");
    
  } catch (err) {
    console.error("Error marking received:", err);
    successMessage.value = "❌ Failed to accept item. Please try again.";
    showSuccessModal.value = true;
  } finally {
    isConfirmingReceived.value = false;
  }
};



const confirmReturn = async () => {
  if (!returnItem.value) return;

  const item = returnItem.value;
  const itemId = item.id;

  try {
    // Update status to returned on server
    const now = new Date().toISOString();
    const res = await axios.put(`${API_BASE_URL}/api/items/${itemId}`, {
      status: "returned",
      return_date: now,
    });

    const updated = { ...(res.data || {}), imageError: false, reporterImageError: false };
    // Ensure a return_date is present for UI display even if backend didn't echo it
    if (!updated.return_date && !updated.returnDate) {
      updated.return_date = now;
    } else if (!updated.return_date && updated.returnDate) {
      // handle alternative naming from server
      updated.return_date = updated.returnDate;
    }

    // Remove any existing occurrences from found/lost lists immediately
    const removeById = (list) => {
      const idx = list.findIndex((i) => String(i.id) === String(itemId));
      if (idx !== -1) list.splice(idx, 1);
    };

    removeById(foundItems.value);
    removeById(lostItems.value);

    // Add to returnedHistory if not already present
    const existsInReturned = returnedHistory.value.some((i) => String(i.id) === String(itemId));
      if (!existsInReturned) {
      returnedHistory.value.unshift(updated);
      unreadReturnedCount.value++;
    }

    // Notify other listeners
    socket.emit("updateReport", updated);

    // Reconcile authoritative lists in background
    fetchItems().catch(() => {});

    alert("✅ Item marked as returned.");
  } catch (err) {
    console.error("Error marking as returned:", err);
    alert("Failed to mark item as returned. Please try again.");
  } finally {
    returnItem.value = null;
  }
};

onMounted(() => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser?.role === "security" || storedUser?.role === "admin") {
      securityUser.value = storedUser;
    }
  } catch (err) {
    console.error("Failed to parse security user from storage:", err);
  }

  // Close all dropdowns when clicking outside
  const closeAllDropdowns = () => {
    showCategoryDropdown.value = false;
    showFoundStatusDropdown.value = false;
    showFoundCategoryDropdown.value = false;
    showLostCategoryDropdown.value = false;
    showClaimsStatusDropdown.value = false;
    showClaimsCategoryDropdown.value = false;
  };

  document.addEventListener("click", () => {
    closeAllDropdowns();
  });

  document.addEventListener("click", handleProfileMenuOutside);
  document.addEventListener("click", handleNotificationsOutside);
  fetchItems();

  // 🔒 IMPORTANT: Remove any existing listeners first to prevent duplicates
  // (in case component remounts or socket reconnects)
  socket.off("newReport");
  socket.off("newClaimRequest");
  socket.off("claimStatusUpdated");
  socket.off("itemMatched");
  
  console.log("🔌 Cleared existing socket listeners to prevent duplicates");

  socket.on("newReport", handleNewReport);

  // 🔴 PRIMARY: Listen for new claim requests (main socket event from backend)
  socket.on("newClaimRequest", (claimData) => {
    try {
      console.log("🔔 [Socket] Received newClaimRequest event:", claimData);
      
      const normalized = normalizeClaim(claimData);
      const claimId = normalized.claim_id;
      
      // 🔒 Skip if we've already processed this claim_id
      if (processedClaimIds.has(claimId)) {
        console.log(`⚠️ [Socket] Claim ${claimId} already processed, skipping duplicate`);
        return;
      }
      
      addClaimNotification(claimData);
      processedClaimIds.add(claimId);
      saveProcessedClaimIds();
      
      // ⚠️ Do NOT increment pendingClaimsCount here
      // It will be updated by periodic sync with authoritative backend count

      if (Notification.permission === "granted") {
        try {
          const claimantName = claimData.claimant_name || claimData.user_name || "Unknown claimant";
          const itemName = claimData.item_name || claimData.display_name || "Unknown item";
          new Notification("🆕 Claim Request", {
            body: `${claimantName} claims: ${itemName}`,
            icon: claimData.claimant_profile_picture ? getFullUrl(claimData.claimant_profile_picture) : undefined,
          });
        } catch (e) { 
          console.error("Failed to show notification:", e);
        }
      }

      // If the modal for this item is open, refresh the claims list
      if (claimModalItem.value) {
        const itemId = claimData.item_id || claimData.claimed_item_id || claimData.notification_item_id;
        if (itemId && String(itemId) === String(claimModalItem.value.id)) {
          console.log("📋 Modal open for this item, refreshing claims...");
          openClaimsModal(claimModalItem.value);
        }
      }
    } catch (e) {
      console.error('Error handling newClaimRequest socket event', e);
    }
  });

  // FALLBACK: Listen for claim status updates (secondary event)
  socket.on("claimStatusUpdated", (payload) => {
    try {
      console.log("🔔 [Socket] Received claimStatusUpdated event (fallback):", payload);
      
      const normalized = normalizeClaim(payload);
      const claimId = normalized.claim_id;
      
      // 🔒 Skip if we've already processed this claim_id
      if (processedClaimIds.has(claimId)) {
        console.log(`⚠️ [Socket] Claim ${claimId} already processed, skipping duplicate`);
        return;
      }
      
      addClaimNotification(payload);
      processedClaimIds.add(claimId);
      saveProcessedClaimIds();
      
      // ⚠️ Do NOT increment pendingClaimsCount here
      // It will be updated by periodic sync with authoritative backend count

      if (Notification.permission === "granted") {
        try {
          new Notification("🆕 Claim Request", {
            body: `Claim for: ${payload.item_id}`,
          });
        } catch (e) { void e; }
      }

      // If the modal for this item is open, refresh the claims list
      if (claimModalItem.value) {
        const itemId = payload.item_id || payload.claimed_item_id;
        if (itemId && String(itemId) === String(claimModalItem.value.id)) {
          openClaimsModal(claimModalItem.value);
        }
      }
    } catch (e) {
      console.error('Error handling claimStatusUpdated socket event', e);
    }
  });

  // EXTRA: Also listen to itemMatched as fallback
  socket.on("itemMatched", (payload) => {
    try {
      console.log("🔔 [Socket] Received itemMatched event (fallback):", payload);
      
      if (payload && (payload.user_id || payload.item_id)) {
        const normalized = normalizeClaim(payload);
        const claimId = normalized.claim_id;
        
        // 🔒 Skip if we've already processed this claim_id
        if (claimId && processedClaimIds.has(claimId)) {
          console.log(`⚠️ [Socket] Claim ${claimId} already processed, skipping duplicate`);
          return;
        }
        
        addClaimNotification(payload);
        if (claimId) {
          processedClaimIds.add(claimId);
          saveProcessedClaimIds();
          // ⚠️ Do NOT increment pendingClaimsCount here
          // It will be updated by periodic sync with authoritative backend count
        }
      }
    } catch (e) {
      console.error('Error handling itemMatched socket event', e);
    }
  });

  if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }
  
  // Fetch initial pending claims count for badge
  (async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/claims/pending/count`);
      pendingClaimsCount.value = res.data?.pending_count || 0;
      console.log("📊 Initial pending claims count:", pendingClaimsCount.value);
    } catch (err) {
      console.error('Failed to fetch pending claims count:', err);
    }
  })();

  // 🔄 Fetch claims directly from database on mount
  (async () => {
    try {
      await fetchClaimsFromDatabase();
      console.log("✅ Initial claims fetched from database");
    } catch (err) {
      console.error('Failed to fetch initial claims from database:', err);
    }
  })();

  // Conditional sync management: start periodic syncs only when the user
  // is viewing the relevant page AND there is something to sync. This
  // avoids confusing automatic background requests when there are no
  // claim requests or submitted reports.

  const startClaimSyncIfNeeded = () => {
    if (claimSyncInterval) return;
    if (currentPage.value !== 'claim-requests') return;
  // require at least one active notification in the bell
  // NOTE: we intentionally do NOT start the periodic sync just because the
  // persistent claimRequestsStore contains entries — the periodic sync is
  // intended to keep the notification bell up-to-date only. We also avoid
  // using the backend pending count to start polling because that can be
  // out-of-sync with the bell visual state and cause confusing background
  // polling when the bell is empty.
  if (!(claimNotifications.value.length > 0)) return;

    // run an immediate sync and then start periodic sync as a failsafe
    syncPendingClaims();
    claimSyncInterval = setInterval(() => {
      syncPendingClaims();
    }, 60000);
  // periodic claim sync started
  };

  const stopClaimSync = () => {
    if (claimSyncInterval) {
      clearInterval(claimSyncInterval);
      claimSyncInterval = null;
  // periodic claim sync cleared
    }
  };

  const startItemSyncIfNeeded = () => {
    if (itemSyncInterval) return;
    if (!["lost-reports", "found-reports", "returned-history"].includes(currentPage.value)) return;
    if (!(lostItems.value.length > 0 || foundItems.value.length > 0 || returnedHistory.value.length > 0)) return;

    // fetch immediately then start periodic sync
    fetchItems();
    itemSyncInterval = setInterval(() => {
      fetchItems();
    }, 60000);
  // periodic item sync started
  };

  const stopItemSync = () => {
    if (itemSyncInterval) {
      clearInterval(itemSyncInterval);
      itemSyncInterval = null;
  // periodic item sync cleared
    }
  };

  // Watch page changes to enable/disable syncs based on which view is active
  watch(currentPage, (page) => {
    if (page === 'claim-requests') {
      // Mark notifications seen when the user navigates to the Claim Requests
      // page so sidebar/bell badges hide after clicking the sidebar.
      notificationsSeen.value = true;
      startClaimSyncIfNeeded();
    } else {
      stopClaimSync();
    }

    if (["lost-reports", "found-reports", "returned-history"].includes(page)) {
      startItemSyncIfNeeded();
    } else {
      stopItemSync();
    }
  });

  // Watch relevant signals so the sync can start/stop dynamically while
  // the user stays on the page (e.g., new notification arrives or is cleared)
  watch([
    () => claimNotifications.value.length,
  ], () => {
    // Only consider the bell for deciding whether to start the periodic
    // notification sync. Persistent claimRequestsStore entries do not
    // trigger automatic polling.
    if (currentPage.value === 'claim-requests') {
      if (claimNotifications.value.length > 0) {
        startClaimSyncIfNeeded();
      } else {
        stopClaimSync();
      }
    }
  });

  watch([
    () => lostItems.value.length,
    () => foundItems.value.length,
    () => returnedHistory.value.length,
  ], () => {
    if (["lost-reports", "found-reports", "returned-history"].includes(currentPage.value)) {
      if (lostItems.value.length > 0 || foundItems.value.length > 0 || returnedHistory.value.length > 0) {
        startItemSyncIfNeeded();
      } else {
        stopItemSync();
      }
    }
  });
});

onUnmounted(() => {
  // Clear periodic sync interval
  if (claimSyncInterval) {
    clearInterval(claimSyncInterval);
  // periodic claim sync cleared
  }

  // Clear database claims refresh interval
  if (dbClaimsRefreshInterval) {
    clearInterval(dbClaimsRefreshInterval);
    console.log("🔄 Cleared database claims refresh interval");
  }

  // Remove all socket listeners to prevent memory leaks
  socket.off("newReport", handleNewReport);
  socket.off("reportUpdated");
  socket.off("refreshDashboard");
  socket.off("newClaimRequest");
  socket.off("claimStatusUpdated");
  socket.off("itemMatched");
  
  // Remove DOM event listeners
  document.removeEventListener("click", handleProfileMenuOutside);
  document.removeEventListener("click", handleNotificationsOutside);
  
  // Do NOT disconnect the shared socket here; just remove listeners.
  console.log("🔌 SecurityDashboard unmounted, socket listeners removed");
});

// Filters (unchanged)
const filteredLostItems = computed(() => {
  let items = lostItems.value;
  if (lostSearch.value) {
    const searchLower = lostSearch.value.toLowerCase();
    items = items.filter(
      (i) =>
        i.name?.toLowerCase().includes(searchLower) ||
        (i.student_id && i.student_id.toLowerCase().includes(searchLower)) ||
        (i.brand && i.brand.toLowerCase().includes(searchLower)) ||
        (i.color && i.color.toLowerCase().includes(searchLower)) ||
        (i.department && i.department.toLowerCase().includes(searchLower)) ||
        (i.course && i.course.toLowerCase().includes(searchLower)) ||
        (i.course_program && i.course_program.toLowerCase().includes(searchLower))
    );
  }
  if (lostCategoryFilter.value)
    items = items.filter((i) => i.category === lostCategoryFilter.value);
  return items;
});

const filteredFoundItems = computed(() => {
  let items = foundItems.value;
  if (foundStatusFilter.value)
    items = items.filter((i) => i.status === foundStatusFilter.value);
  if (foundSearch.value) {
    const searchLower = foundSearch.value.toLowerCase();
    items = items.filter(
      (i) =>
        i.name?.toLowerCase().includes(searchLower) ||
        (i.student_id && i.student_id.toLowerCase().includes(searchLower)) ||
        (i.brand && i.brand.toLowerCase().includes(searchLower)) ||
        (i.color && i.color.toLowerCase().includes(searchLower)) ||
        (i.department && i.department.toLowerCase().includes(searchLower)) ||
        (i.course && i.course.toLowerCase().includes(searchLower)) ||
        (i.course_program && i.course_program.toLowerCase().includes(searchLower))
    );
  }
  if (foundCategoryFilter.value)
    items = items.filter((i) => i.category === foundCategoryFilter.value);
  return items;
});

// Total count and paged slice for found items
const foundTotal = computed(() => filteredFoundItems.value.length);
const pagedFoundItems = computed(() => {
  const start = (foundPage.value - 1) * foundLimit.value;
  return filteredFoundItems.value.slice(start, start + foundLimit.value);
});

function foundShowingRange() {
  const total = foundTotal.value || 0;
  if (total === 0) return { start: 0, end: 0 };
  const start = Math.min((foundPage.value - 1) * foundLimit.value + 1, total);
  const end = Math.min(foundPage.value * foundLimit.value, total);
  return { start, end };
}

function nextFoundPage() {
  if (foundPage.value * foundLimit.value >= foundTotal.value) return;
  foundPage.value += 1;
}

function prevFoundPage() {
  foundPage.value = Math.max(1, foundPage.value - 1);
}

// Reset pagination when filters/search change so user sees first page of results
watch([foundSearch, foundStatusFilter, foundCategoryFilter], () => {
  foundPage.value = 1;
});

// Lost reports pagination
const lostTotal = computed(() => filteredLostItems.value.length);
const pagedLostItems = computed(() => {
  const start = (lostPage.value - 1) * lostLimit.value;
  return filteredLostItems.value.slice(start, start + lostLimit.value);
});

function lostShowingRange() {
  const total = lostTotal.value || 0;
  if (total === 0) return { start: 0, end: 0 };
  const start = Math.min((lostPage.value - 1) * lostLimit.value + 1, total);
  const end = Math.min(lostPage.value * lostLimit.value, total);
  return { start, end };
}

function nextLostPage() {
  if (lostPage.value * lostLimit.value >= lostTotal.value) return;
  lostPage.value += 1;
}

function prevLostPage() {
  lostPage.value = Math.max(1, lostPage.value - 1);
}

watch([lostSearch, lostCategoryFilter], () => {
  lostPage.value = 1;
});

// Returned history pagination
const returnedTotal = computed(() => filteredReturnedHistory.value.length);
const pagedReturnedHistory = computed(() => {
  const start = (returnedPage.value - 1) * returnedLimit.value;
  return filteredReturnedHistory.value.slice(start, start + returnedLimit.value);
});

function returnedShowingRange() {
  const total = returnedTotal.value || 0;
  if (total === 0) return { start: 0, end: 0 };
  const start = Math.min((returnedPage.value - 1) * returnedLimit.value + 1, total);
  const end = Math.min(returnedPage.value * returnedLimit.value, total);
  return { start, end };
}

function nextReturnedPage() {
  if (returnedPage.value * returnedLimit.value >= returnedTotal.value) return;
  returnedPage.value += 1;
}

function prevReturnedPage() {
  returnedPage.value = Math.max(1, returnedPage.value - 1);
}

watch([returnedSearch, returnedCategoryFilter], () => {
  returnedPage.value = 1;
});

// Claim requests pagination (client-side paging over fetched claims)
const claimsTotal = computed(() => filteredClaimRequests.value.length);
const pagedClaimRequests = computed(() => {
  const start = (claimsPage.value - 1) * claimsLimit.value;
  return filteredClaimRequests.value.slice(start, start + claimsLimit.value);
});

function claimsShowingRange() {
  const total = claimsTotal.value || 0;
  if (total === 0) return { start: 0, end: 0 };
  const start = Math.min((claimsPage.value - 1) * claimsLimit.value + 1, total);
  const end = Math.min(claimsPage.value * claimsLimit.value, total);
  return { start, end };
}

function nextClaimsPage() {
  if (claimsPage.value * claimsLimit.value >= claimsTotal.value) return;
  claimsPage.value += 1;
}

function prevClaimsPage() {
  claimsPage.value = Math.max(1, claimsPage.value - 1);
}

watch([claimsSearch, claimsStatusFilter, claimsCategoryFilter], () => {
  claimsPage.value = 1;
});

const categoryDropdownLabel = computed(() => {
  if (returnedCategoryFilter.value === "id") return "ID Items";
  if (returnedCategoryFilter.value === "general") return "General Items";
  return "All Categories";
});

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

const filteredClaimRequests = computed(() => {
  // 🔄 ALWAYS fetch from database instead of persistent store
  // This ensures the claim requests section shows the authoritative state from the claims table
  let claims = dbClaimRequests.value;
  
  // Filter by search term (item name, student ID, or claimant name)
  if (claimsSearch.value) {
    const searchTerm = claimsSearch.value.toLowerCase();
    claims = claims.filter((c) =>
      (c.item_name || c.item?.name || '')?.toLowerCase().includes(searchTerm) ||
      (c.item?.student_id || '')?.includes(claimsSearch.value) ||
      (c.claimant_name || c.user_name || '')?.toLowerCase().includes(searchTerm)
    );
  }
  
  // Filter by status
  if (claimsStatusFilter.value) {
    claims = claims.filter((c) => (c.status || 'pending') === claimsStatusFilter.value);
  }
  // Filter by category: student (items with student_id) or general (items without student_id)
  if (claimsCategoryFilter.value) {
    if (claimsCategoryFilter.value === 'student') {
      claims = claims.filter((c) => !!(c.item && (c.item.student_id || c.item.studentId)));
    } else if (claimsCategoryFilter.value === 'general') {
      claims = claims.filter((c) => !(c.item && (c.item.student_id || c.item.studentId)));
    }
  }
  
  return claims;
});

const viewItem = async (item) => {
  imageError.value = false;
  reporterImageError.value = false;
  
  // Always fetch fresh item data from backend to ensure we have all reporter information
  try {
    const response = await axios.get(`${API_BASE_URL}/api/items/${encodeURIComponent(item.id)}`);
    selectedItem.value = response.data;
    
    console.log('📋 Fresh item data from backend:', {
      reporter_name: selectedItem.value.reporter_name,
      reporter_email: selectedItem.value.reporter_email,
      reporter_contact: selectedItem.value.reporter_contact,
      reporter_profile_picture: selectedItem.value.reporter_profile_picture,
      reporter_user_id: selectedItem.value.reporter_user_id,
      reporter_id: selectedItem.value.reporter_id
    });
    
    // Map reporter data from backend response fields to reporter object
    if (selectedItem.value.reporter_name) {
      selectedItem.value.reporter = {
        id: selectedItem.value.reporter_user_id || selectedItem.value.reporter_id,
        full_name: selectedItem.value.reporter_name || 'Unknown',
        email: selectedItem.value.reporter_email || 'N/A',
        contact_number: selectedItem.value.reporter_contact || 'N/A',
        profile_picture: selectedItem.value.reporter_profile_picture || null
      };
      console.log('✅ Reporter data mapped from backend:', selectedItem.value.reporter);
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
  claimModalItem.value = null;
};

const openReviewModal = (item) => {
  reviewItem.value = item;
  imageError.value = false;
  reporterImageError.value = false;
};
const closeReviewModal = () => {
  reviewItem.value = null;
  imageError.value = false;
  reporterImageError.value = false;
};
const openReturnModal = (item) => (returnItem.value = item);

const viewReporterProfile = (reporterId) => {
  if (reporterId) router.push(`/view-profile/${reporterId}`);
};

const openMarkAsReturnedConfirm = (item) => {
  itemToMarkAsReturned.value = item;
  showMarkAsReturnedConfirm.value = true;
};

const closeMarkAsReturnedConfirm = () => {
  showMarkAsReturnedConfirm.value = false;
  itemToMarkAsReturned.value = null;
};

const confirmMarkAsReturned = async () => {
  if (!itemToMarkAsReturned.value) return;
  await markAsReturned(itemToMarkAsReturned.value);
};

const markAsReturned = async (item) => {
  if (!item || !item.id) {
    if (Notification.permission === "granted") {
      new Notification("Error", { body: "Item not found" });
    }
    return;
  }

  isMarkingAsReturned.value = true;
  const now = new Date().toISOString();

  try {
    // For lost items, use "marked_returned" status; for found items, use "returned"
    const statusToSet = item.type === "lost" ? "marked_returned" : "returned";
    console.log(`🔄 Marking item ${item.id} (type: ${item.type}) as "${statusToSet}"`);
    
    // Update the item status in the backend
    const updateResponse = await axios.put(`${API_BASE_URL}/api/items/${item.id}`, {
      status: statusToSet,
      return_date: now
    });

    console.log(`✅ Update response:`, updateResponse.data);

    if (updateResponse.status === 200 || updateResponse.status === 204) {
      // Fetch the complete updated item data
      const fetchResponse = await axios.get(`${API_BASE_URL}/api/items/${item.id}`);
      const updatedItem = fetchResponse.data;
      console.log(`✅ Fetched updated item:`, updatedItem);

      if (Notification.permission === "granted") {
        new Notification("✅ Success", { body: "Item marked as returned successfully!" });
      }
      
      // Remove from lostItems
      lostItems.value = lostItems.value.filter(i => i.id !== item.id);
      console.log(`✅ Removed from lostItems, remaining:`, lostItems.value.length);
      
      // Add to returnedHistory with the complete updated item data
      returnedHistory.value.unshift({
        ...updatedItem,
        imageError: false,
        reporterImageError: false,
        claimantImageError: false
      });
      console.log(`✅ Added to returnedHistory, now has:`, returnedHistory.value.length);
      
      closeModal();
      closeMarkAsReturnedConfirm();
    }
  } catch (error) {
    console.error("Error marking item as returned:", error);
    if (Notification.permission === "granted") {
      new Notification("❌ Error", { body: "Failed to mark item as returned" });
    }
  } finally {
    isMarkingAsReturned.value = false;
  }
};

// Found Items - Mark as Returned with Claimant Info
const openMarkFoundAsReturnedConfirm = (item) => {
  foundItemToMark.value = item;
  claimantInfo.value = {
    name: "",
    studentId: "",
    phoneNumber: ""
  };
  showClaimantInfoModal.value = true;
};

const closeClaimantInfoModal = () => {
  showClaimantInfoModal.value = false;
  foundItemToMark.value = null;
  claimantInfo.value = {
    name: "",
    studentId: "",
    phoneNumber: ""
  };
};

const confirmMarkFoundAsReturned = async () => {
  if (!foundItemToMark.value || !claimantInfo.value.name || !claimantInfo.value.phoneNumber) {
    if (Notification.permission === "granted") {
      new Notification("Error", { body: "Please enter claimant name and phone number" });
    }
    return;
  }
  
  isMarkingAsReturned.value = true;
  const now = new Date().toISOString();

  try {
    // Update the item status in the backend with claimant info
    const updateResponse = await axios.put(`${API_BASE_URL}/api/items/${foundItemToMark.value.id}`, {
      status: "returned",
      claimant_name: claimantInfo.value.name,
      claimant_student_id: claimantInfo.value.studentId,
      claimant_phone_number: claimantInfo.value.phoneNumber,
      return_date: now
    });

    if (updateResponse.status === 200 || updateResponse.status === 204) {
      // Fetch the complete updated item data
      const fetchResponse = await axios.get(`${API_BASE_URL}/api/items/${foundItemToMark.value.id}`);
      const updatedItem = fetchResponse.data;

      if (Notification.permission === "granted") {
        new Notification("✅ Success", { body: "Item marked as returned successfully!" });
      }
      
      // Remove from foundItems
      foundItems.value = foundItems.value.filter(i => i.id !== foundItemToMark.value.id);
      
      // Add to returnedHistory with the complete updated item data
      returnedHistory.value.unshift({
        ...updatedItem,
        imageError: false,
        reporterImageError: false,
        claimantImageError: false
      });
      
      closeModal();
      closeClaimantInfoModal();
    }
  } catch (error) {
    console.error("Error marking found item as returned:", error);
    if (Notification.permission === "granted") {
      new Notification("❌ Error", { body: "Failed to mark item as returned" });
    }
  } finally {
    isMarkingAsReturned.value = false;
  }
};

const logout = () => {
  showProfileMenu.value = false;
  disconnectSocket();
  localStorage.clear();
  router.push("/login");
};
</script>

<style scoped>
/* ... (keep all existing styles unchanged) ... */
.animate-fade-in {
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-bounce-in {
  animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
  from {
    opacity: 0;
    transform: scale(0.3) translateY(-50px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.new-report-highlight {
  animation: highlightFlash 1.5s ease-in-out;
  box-shadow: 0 0 20px 4px rgba(0, 255, 100, 0.4);
  border: 2px solid rgba(0, 255, 100, 0.6);
  border-radius: 12px;
  transition: all 0.3s ease;
}

@keyframes highlightFlash {
  0% { background-color: rgba(0, 255, 100, 0.1); transform: scale(1.02); }
  50% { background-color: rgba(0, 255, 100, 0.25); transform: scale(1.05); }
  100% { background-color: transparent; transform: scale(1); }
}

.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: popIn 0.4s ease-in-out;
  box-shadow: 0 0 8px rgba(255, 0, 0, 0.4);
}

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  80% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); }
}

.report-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.report-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 12px rgba(0, 255, 150, 0.3);
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(75, 85, 99, 0.2);
  color: #9ca3af;
  font-size: 0.9rem;
  font-style: italic;
  border-radius: 0.5rem;
}

.modal-fade {
  animation: modalFadeIn 0.4s ease;
}
@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
</style>