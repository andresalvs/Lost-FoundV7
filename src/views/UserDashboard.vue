<template>
  <div class="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 pb-32" @click="closeMenusOnClickOutside">
    <!-- Item Received Modal -->
    <ItemReceivedModal
      :isOpen="showItemReceivedModal"
      :itemName="itemReceivedModalData.itemName"
      :itemId="itemReceivedModalData.itemId"
      @close="closeItemReceivedModal"
    />

    <!-- ClaimStatusNotification removed: notifications moved to Alerts/Notifications page -->

    <!-- Top-Right Profile & Notification -->
    <div class="absolute top-6 right-6 flex items-center gap-4">
      <!-- Notification Icon -->
      <div class="relative" @click.stop>
        <button
          @click="toggleNotifications"
          class="relative hidden lg:flex w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 items-center justify-center shadow-lg transition-all duration-200 text-white"
          title="Notifications"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>

          <span
            v-if="unreadNotificationCount > 0"
            class="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow-md"
          >
            {{ unreadNotificationCount }}
          </span>
        </button>

        <!-- Notifications Dropdown -->
        <div
          v-if="showNotifications"
          class="fixed top-20 left-4 right-4 md:absolute md:left-auto md:right-0 md:top-full md:mt-2 w-auto md:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-emerald-50 dark:bg-emerald-900/20">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
          </div>

          <ul v-if="notifications.length > 0" class="max-h-96 md:max-h-96 overflow-y-auto" style="max-height: 60vh;">
            <li
              v-for="notif in notifications"
              :key="notif.id"
              :class="[
                'mx-1 my-2 w-full p-3 md:p-4 rounded-xl shadow-sm transition hover:shadow-md flex flex-col text-gray-900 dark:text-white text-sm md:text-base',
                notif.type === 'claim_approved'
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                      : (['item_received','claim_rejected','item_claimed'].includes(notif.type)
                      ? 'bg-emerald-50 dark:bg-emerald-900/20'
                      : 'bg-emerald-50 dark:bg-emerald-900/20')
              ]"
            >
              <!-- Item Received Notification (Special Style) -->
              <div v-if="notif.type === 'item_received'" class="flex items-start gap-3">
                <div class="relative w-12 h-12 flex items-center justify-center rounded-full bg-white/90 dark:bg-white/10 shadow-inner text-2xl">
                  <span>📦</span>
                  <span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">💬</span>
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-sm text-emerald-800 dark:text-emerald-300">Item Received!</p>
                  <p class="font-medium mb-1 text-sm">{{ notif.message }}</p>
                  <p v-if="notif.display_name" class="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Item:</strong> {{ notif.display_name }}
                  </p>
                  <p v-if="notif.display_student_id" class="text-xs text-gray-600 dark:text-gray-400">
                    <strong>ID:</strong> {{ notif.display_student_id }}
                  </p>
                  <p v-if="notif.created_at" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {{ notif.created_at }}
                  </p>
                  <div class="mt-2">
                    <button
                      @click="goToAcknowledge(notif)"
                      class="px-4 py-2 text-sm rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow"
                    >
                      View Acknowledge
                    </button>
                  </div>
                </div>
              </div>

              <!-- Claim Rejected Notification -->
              <div v-else-if="notif.type === 'claim_rejected'" class="flex items-start gap-3">
                <div class="relative w-12 h-12 flex items-center justify-center rounded-full bg-white/90 dark:bg-white/10 shadow-inner text-2xl">
                  <span>❌</span>
                  <span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">✖</span>
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-sm text-emerald-800 dark:text-emerald-300">Claim Rejected</p>
                  <p class="font-medium mb-1 text-sm">{{ notif.message }}</p>
                  <p v-if="notif.display_name" class="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Item:</strong> {{ notif.display_name }}
                  </p>
                  <p v-if="notif.created_at" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {{ notif.created_at }}
                  </p>
                  <div class="mt-2 flex gap-2">
                    <button
                      @click.stop="goToClaimRejected(notif)"
                      class="flex-1 px-4 py-2 text-xs md:text-sm rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow"
                    >
                      View
                    </button>
                    <button
                      @click.stop="clearNotification(notif)"
                      class="flex-1 px-4 py-2 text-xs md:text-sm rounded-full bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition shadow"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              <!-- Item Claimed Notification -->
              <div v-else-if="notif.type === 'item_claimed'" class="flex items-start gap-3">
                <div class="relative w-12 h-12 flex items-center justify-center rounded-full bg-white/90 dark:bg-white/10 shadow-inner text-2xl">
                  <span>🎉</span>
                  <span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">🎊</span>
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-sm text-blue-800 dark:text-blue-300">{{ (notif.category === 'id' || notif.category === 'id_number_match') ? 'ID Returned!' : 'Item Returned!' }}</p>
                  <p class="text-sm text-gray-700 dark:text-gray-300">{{ notif.message }}</p>
                  <p v-if="notif.created_at" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {{ notif.created_at }}
                  </p>
                  <div class="mt-3 flex gap-2">
                    <button
                      @click="goToAcknowledge(notif)"
                      class="px-4 py-2 text-sm rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow"
                    >
                      View Acknowledge
                    </button>
                    <button
                      @click.stop="clearNotification(notif)"
                      class="px-4 py-2 text-sm rounded-full bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition shadow"
                      title="Delete this notification"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>

              <!-- Claim Approved Notification (Dropdown) -->
              <div v-else-if="notif.type === 'claim_approved'" class="flex items-start gap-3">
                <div class="relative w-12 h-12 flex-shrink-0">
                  <img 
                    v-if="notif.display_image" 
                    :src="apiBaseUrl + notif.display_image" 
                    :alt="notif.display_name"
                    class="w-12 h-12 object-cover rounded-full shadow-md border-2 border-blue-500"
                  />
                  <div v-else class="w-12 h-12 rounded-full bg-blue-200 dark:bg-blue-900 flex items-center justify-center text-2xl">📦</div>
                  <span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center">✔</span>
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-sm text-blue-800 dark:text-blue-300">{{ (notif.category === 'id' || notif.category === 'id_number_match') ? 'ID Returned!' : 'Item Returned!' }}</p>
                  <p class="font-medium mb-1 text-sm text-gray-700 dark:text-gray-300">{{ notif.message }}</p>
                  <p v-if="notif.display_name" class="text-xs text-gray-600 dark:text-gray-400">
                    <strong>{{ (notif.category === 'id' || notif.category === 'id_number_match') ? 'ID' : 'Item' }}:</strong> {{ notif.display_name }}
                  </p>
                  <p v-if="notif.created_at" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {{ notif.created_at }}
                  </p>
                  <div class="mt-2 flex gap-2">
                    <button
                      @click.stop="goToClaimApproved(notif)"
                      class="flex-1 px-4 py-2 text-xs md:text-sm rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow"
                    >
                      View
                    </button>
                    <button
                      @click.stop="clearNotification(notif)"
                      class="flex-1 px-4 py-2 text-xs md:text-sm rounded-full bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition shadow"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              <!-- Match Notifications (Original Style) -->
              <div v-else class="flex items-start gap-3">
                <div class="relative w-12 h-12 flex items-center justify-center rounded-full bg-white/90 dark:bg-white/10 shadow-inner text-2xl">
                  <template v-if="notif.display_image">
                    <img :src="notif.display_image" alt="Matched item" class="w-12 h-12 object-cover rounded-full border border-gray-300 dark:border-gray-600" />
                  </template>
                  <template v-else>
                    <span>🔔</span>
                  </template>
                  <span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">💬</span>
                </div>

                <div class="flex-1">
                  <p class="font-medium mb-1 text-sm">{{ notif.message }}</p>
                  <p v-if="notif.display_description" class="text-xs text-gray-600 dark:text-gray-400">
                    {{ notif.display_description }}
                  </p>
                  <p v-if="notif.created_at" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {{ notif.created_at }}
                  </p>

                  <div class="flex items-start gap-2 mt-2">
                    <div class="text-xs">
                      <p class="font-semibold text-gray-900 dark:text-white">{{ notif.display_name }}</p>
                      <p v-if="notif.display_student_id" class="text-gray-600 dark:text-gray-400">ID: {{ notif.display_student_id }}</p>
                      <p class="text-gray-600 dark:text-gray-400">Location: {{ notif.matched_location || "N/A" }}</p>
                    </div>
                  </div>

                  <div class="mt-3 flex gap-2 w-full">
                    <button
                      @click="goToNotificationForMatch(notif)"
                      class="flex-1 px-4 py-2 text-xs md:text-sm rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow"
                    >
                      View
                    </button>
                    <button
                      @click.stop="clearNotification(notif)"
                      class="flex-1 px-4 py-2 text-xs md:text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      title="Remove notification"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>

          <div v-else class="p-4 text-gray-600 dark:text-gray-400 text-center text-sm">
            No new notifications.
          </div>
        </div>
        <!-- Full-screen Notifications View (opened via route ?show_notifications=1 or navbar) -->
        <div
          v-if="notificationsFullscreen"
          class="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-auto p-5 pb-32"
        >
          <div class="flex items-center justify-between mb-4">
            <h1 class="pl-5 pt-2 text-4xl font-bold text-gray-900 dark:text-white">Notifications</h1>          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg  p-4">
            <ul v-if="notifications.length > 0" class="space-y-2">
                <li
                  v-for="notif in notifications"
                  :key="notif.id"
                  :class="[
                    'mx-1 my-2 w-full p-2 rounded-xl shadow-sm transition hover:shadow-md flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 text-gray-900 dark:text-white border-l-4 border-emerald-500',
                    notif.type === 'claim_approved'
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                          : (['item_received','claim_rejected','item_claimed'].includes(notif.type)
                          ? 'bg-emerald-50 dark:bg-emerald-900/20'
                          : 'bg-emerald-50 dark:bg-emerald-900/20')
                  ]"
                >
                  <!-- Item Received Notification (Special Style) -->
                  <div v-if="notif.type === 'item_received'" class="flex items-start gap-3">
                    <div class="relative w-12 h-12 flex items-center justify-center rounded-full bg-white/90 dark:bg-white/10 shadow-inner text-2xl">
                      <span>📦</span>
                      <span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">💬</span>
                    </div>
                    <div class="flex-1">
                      <p class="font-semibold text-sm text-emerald-800 dark:text-emerald-300">Item Received!</p>
                      <p class="font-medium mb-1 text-sm">{{ notif.message }}</p>
                      <p v-if="notif.display_name" class="text-xs text-gray-600 dark:text-gray-400">
                        <strong>Item:</strong> {{ notif.display_name }}
                      </p>
                      <p v-if="notif.display_student_id" class="text-xs text-gray-600 dark:text-gray-400">
                        <strong>ID:</strong> {{ notif.display_student_id }}
                      </p>
                      <p v-if="notif.created_at" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {{ notif.created_at }}
                      </p>
                      <div class="mt-2">
                        <button
                          @click="goToAcknowledge(notif)"
                          class="px-4 py-2 text-sm rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow"
                        >
                          View Acknowledge
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Claim Approved Notification -->
                  <div v-else-if="notif.type === 'claim_approved'" class="flex items-start gap-3 flex-1">
                    <div class="relative w-12 h-12 flex-shrink-0">
                      <img 
                        v-if="notif.display_image" 
                        :src="apiBaseUrl + notif.display_image" 
                        :alt="notif.display_name"
                        class="w-12 h-12 object-cover rounded-full shadow-md border-2 border-green-500"
                      />
                      <div v-else class="w-12 h-12 rounded-full bg-blue-200 dark:bg-blue-900 flex items-center justify-center text-2xl">📦</div>
                      <span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center">✔</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-sm text-blue-800 dark:text-blue-300">{{ (notif.category === 'id' || notif.category === 'id_number_match') ? 'ID Returned!' : 'Item Returned!' }}</p>
                      <p class="font-medium mb-1 text-sm">{{ notif.message }}</p>
                      <p v-if="notif.display_name" class="text-xs text-gray-600 dark:text-gray-400">
                        <strong>{{ (notif.category === 'id' || notif.category === 'id_number_match') ? 'ID' : 'Item' }}:</strong> {{ notif.display_name }}
                      </p>
                      <p v-if="notif.created_at" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {{ notif.created_at }}
                      </p>
                      <div class="lg:hidden mt-2 flex gap-2 max-w-xs">
                        <button
                          @click.stop="goToClaimApproved(notif)"
                          class="flex-1 px-4 py-2 text-xs md:text-sm rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow"
                        >
                          View
                        </button>

                        <button
                          @click.stop="clearNotification(notif)"
                          class="flex-1 px-4 py-2 text-xs md:text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Web Buttons for Claim Approved (Right side) -->
                  <div v-if="notif.type === 'claim_approved'" class="hidden lg:flex gap-2 flex-shrink-0">
                    <button
                      @click.stop="goToClaimApproved(notif)"
                      class="px-6 py-2 text-sm rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow whitespace-nowrap"
                    >
                      View
                    </button>

                    <button
                      @click.stop="clearNotification(notif)"
                      class="px-6 py-2 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition whitespace-nowrap"
                    >
                      Clear
                    </button>
                  </div>

                  <!-- Claim Rejected Notification -->
                  <div v-else-if="notif.type === 'claim_rejected'" class="flex items-start gap-3 flex-1">
                    <div class="relative w-12 h-12 flex items-center justify-center rounded-full bg-white/90 dark:bg-white/10 shadow-inner text-2xl">
                      <span>❌</span>
                      <span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">✖</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-sm text-emerald-800 dark:text-emerald-300">Claim Rejected</p>
                      <p class="font-medium mb-1 text-sm">{{ notif.message }}</p>
                      <p v-if="notif.display_name" class="text-xs text-gray-600 dark:text-gray-400">
                        <strong>Item:</strong> {{ notif.display_name }}
                      </p>
                      <p v-if="notif.created_at" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {{ notif.created_at }}
                      </p>
                      <div class="lg:hidden mt-3 flex gap-2 max-w-xs">
                        <button
                          @click="goToClaimRejected(notif)"
                          class="flex-1 px-4 py-2 text-xs md:text-sm rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow"
                        >
                          View
                        </button>
                        <button
                          @click.stop="clearNotification(notif)"
                          class="flex-1 px-4 py-2 text-xs md:text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                          title="Remove notification"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Web Buttons (Right side) for Claim Rejected -->
                  <div v-if="notif.type === 'claim_rejected'" class="hidden lg:flex gap-2 flex-shrink-0">
                    <button
                      @click="goToClaimRejected(notif)"
                      class="px-6 py-2 text-sm rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow whitespace-nowrap"
                    >
                      View
                    </button>
                    <button
                      @click.stop="clearNotification(notif)"
                      class="px-6 py-2 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition whitespace-nowrap"
                      title="Remove notification"
                    >
                      Clear
                    </button>
                  </div>

                  <!-- Item Claimed Notification -->
                  <div v-else-if="notif.type === 'item_claimed'" class="flex items-start gap-3 flex-1">
                    <div class="relative w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-white/90 dark:bg-white/10 shadow-inner text-2xl">
                      <span>🎉</span>
                      <span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">🎊</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-sm text-blue-800 dark:text-blue-300">{{ (notif.category === 'id' || notif.category === 'id_number_match') ? 'ID Returned!' : 'Item Returned!' }}</p>
                      <p class="text-sm text-gray-700 dark:text-gray-300">{{ notif.message }}</p>
                      <p v-if="notif.created_at" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {{ notif.created_at }}
                      </p>
                      <div class="lg:hidden mt-3">
                        <button
                          @click="goToAcknowledge(notif)"
                          class="px-4 py-2 text-sm rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow"
                        >
                          View Acknowledge
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Web Button (Right side) for Item Claimed -->
                  <div v-if="notif.type === 'item_claimed'" class="hidden lg:flex flex-shrink-0">
                    <button
                      @click="goToAcknowledge(notif)"
                      class="px-6 py-2 text-sm rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow whitespace-nowrap"
                    >
                      View Acknowledge
                    </button>
                  </div>

                  <!-- Match Notifications (Original Style) -->
                  <div v-else-if="notif.type !== 'claim_approved' && notif.type !== 'claim_rejected'" class="flex items-start gap-3 flex-1">
                    <div class="relative w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-white/90 dark:bg-white/10 shadow-inner text-2xl">
                      <template v-if="notif.display_image">
                        <img :src="notif.display_image" alt="Matched item" class="w-12 h-12 object-cover rounded-full border border-gray-300 dark:border-gray-600" />
                      </template>
                      <template v-else>
                        <span>🔔</span>
                      </template>
                      <span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">💬</span>
                    </div>

                    <div class="flex-1 min-w-0">
                      <p class="font-medium mb-1 text-sm">{{ notif.message }}</p>
                      <p v-if="notif.display_description" class="text-xs text-gray-600 dark:text-gray-400">
                        {{ notif.display_description }}
                      </p>
                      <p v-if="notif.created_at" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {{ notif.created_at }}
                      </p>

                      <div class="flex items-start gap-2 mt-2">
                        <div class="text-xs">
                          <p class="font-semibold text-gray-900 dark:text-white">{{ notif.display_name }}</p>
                          <p v-if="notif.display_student_id" class="text-gray-600 dark:text-gray-400">ID: {{ notif.display_student_id }}</p>
                          <p class="text-gray-600 dark:text-gray-400">Location: {{ notif.matched_location || "N/A" }}</p>
                        </div>
                      </div>

                      <div class="lg:hidden mt-3 flex gap-2 max-w-xs">
                        <button
                          @click="goToNotificationForMatch(notif)"
                          class="flex-1 px-4 py-2 text-xs md:text-sm rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow"
                        >
                          View
                        </button>
                        <button
                          @click.stop="clearNotification(notif)"
                          class="flex-1 px-4 py-2 text-xs md:text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                          title="Remove notification"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Web Buttons (Right side) -->
                  <div v-if="notif.type !== 'item_claimed' && notif.type !== 'claim_approved' && notif.type !== 'claim_rejected'" class="hidden lg:flex gap-2 flex-shrink-0">
                    <button
                      @click="goToNotificationForMatch(notif)"
                      class="px-6 py-2 text-sm rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow whitespace-nowrap"
                    >
                      View
                    </button>
                    <button
                      @click.stop="clearNotification(notif)"
                      class="px-6 py-2 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition whitespace-nowrap"
                      title="Remove notification"
                    >
                      Clear
                    </button>
                  </div>
                </li>
            </ul>

            <div v-else class="text-center text-gray-600 dark:text-gray-400 py-8">No new notifications.</div>
          </div>
        </div>
      </div>

      <!-- Profile Button -->
      <div class="relative" @click.stop>
        <button
          @click="toggleProfileMenu"
          class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg hover:bg-emerald-600 transition overflow-hidden border-2 border-emerald-400"
          title="Profile"
        >
          <template v-if="user && user.profile_picture">
            <img :src="user.profile_picture" alt="Profile" class="w-full h-full object-cover" />
          </template>
          <template v-else>
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A9 9 0 1118.88 6.196 9 9 0 015.12 17.804z"/></svg>
          </template>
        </button>

        <!-- Profile Dropdown -->
        <div v-if="showProfileMenu" class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ul>
            <li>
              <button @click="$router.push('/profile')" class="w-full px-4 py-3 flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1"/></svg>
                <span>My Profile</span>
              </button>
            </li>

            <li>
              <div class="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center justify-between transition text-gray-900 dark:text-white">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-amber-500 dark:text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 7a5 5 0 100 10 5 5 0 000-10z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>Theme</span>
                </div>

                <div>
                  <ThemeToggle @change="showProfileMenu = false" />
                </div>
              </div>
            </li>

            <li>
              <button
                @click="logout"
                class="w-full px-4 py-3 flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
              >
                <svg
                  class="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 12h4M4 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </li>
          </ul>
          <!-- Profile menu should not contain pagination controls; pagination lives in the dashboard cards -->
        </div>
      </div>
    </div>

    <!-- Dashboard Header -->
    <div class="max-w-6xl mx-auto mb-8 sm:mb-12 mt-2 px-4 sm:px-0">
      <div class="mb-6 sm:mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2 pt-0">Dashboard</h1>
        <p class="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium">Manage your lost and found items</p>
      </div>
    </div>

    <!-- Success Message -->
    <div
      v-if="claimResultMessage"
      class="mb-6 max-w-6xl mx-auto px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 text-sm"
    >
      {{ claimResultMessage }}
    </div>

    <!-- Item Received Message -->
    <div
      v-if="itemReceivedMessage"
      class="mb-6 max-w-6xl mx-auto px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-sm flex items-start gap-3"
    >
      <span class="text-xl">📦</span>
      <span>{{ itemReceivedMessage }}</span>
    </div>

    <!-- Dashboard Sections -->
    <div class="w-full max-w-6xl mx-auto mb-8 px-3 sm:px-6 md:px-0">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5 md:gap-8 items-stretch min-h-[65vh]">
        <!-- Pending Reports Card -->
        <div class="px-4 sm:px-6 py-5 sm:py-6 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-emerald-50/80 via-white dark:from-emerald-900/10 dark:via-gray-800 dark:to-gray-800 flex flex-col justify-between h-full min-h-[400px] shadow-lg hover:shadow-xl rounded-2xl transition-shadow duration-300">
          <div class="flex-1">
            <div class="flex items-center justify-between mb-5 sm:mb-6 flex-col sm:flex-row gap-3 sm:gap-0">
              <div class="flex items-center gap-3">
                <div class="bg-emerald-100 dark:bg-emerald-900/40 p-2.5 sm:p-3 rounded-xl">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Pending Reports</h2>
              </div>
            </div>
            <ul class="space-y-2.5 sm:space-y-3">
            <li
              v-for="(report, index) in reports"
              :key="report.id || index"
              class="p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-700/20 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-all duration-200 border border-gray-100 dark:border-gray-700/50 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 h-full shadow-sm hover:shadow-md"
            >
              <div class="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div class="w-14 sm:w-16 h-14 sm:h-16 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0 border border-gray-300 dark:border-gray-600">
                  <img
                    v-if="report.image_url"
                    :src="report.image_url"
                    alt="report image"
                    class="w-full h-full object-cover"
                  />
                  <div v-else-if="isClaimItemId(report)" class="w-full h-full bg-emerald-500 flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54h3.01l-3.01 4.17h5.1l-2.35-4.17 3.01-3.54z"/>
                    </svg>
                  </div>
                  <div v-else class="w-full h-full bg-amber-500 flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2 mb-1">
                    <div>
                      <p class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">{{ report.name || 'Unnamed item' }}</p>
                      <p class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 capitalize mt-1">{{ report.type || report.item_type || 'N/A' }}: <span class="capitalize">{{ isClaimItemId(report) ? 'ID' : 'Item' }}</span></p>
                    </div>
                  </div>

                  <!-- Student ID intentionally hidden on dashboard -->
                </div>
              </div>

              <!-- Right-side controls -->
              <div class="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0">
                <span class="inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-2 text-xs font-semibold rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 whitespace-nowrap capitalize h-full">{{ formatStatusDisplay(report.status) }}</span>
                <button @click="viewReport(report)" class="px-3 sm:px-4 py-1 sm:py-2 flex items-center justify-center text-xs sm:text-sm rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition whitespace-nowrap h-full">View</button>
              </div>
            </li>
            <li v-if="reports.length === 0" class="text-center py-8 text-gray-600 dark:text-gray-400">
              <div class="flex flex-col items-center">
                <svg class="w-12 h-12 opacity-30 mb-2 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p class="font-medium">You have no pending reports yet.</p>
              </div>
            </li>
          </ul>
          </div>
          <div class="mt-auto pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span v-if="reportsTotal > 0">
                Showing {{ reportsShowingRange().start }} to {{ reportsShowingRange().end }} of {{ reportsTotal }} results
              </span>
              <span v-else>
                Showing 0 results
              </span>
            </div>
            <div class="flex items-center gap-1 sm:gap-2">
              <button @click="prevReportsPage" :disabled="reportsOffset === 0" class="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50 text-xs sm:text-sm">
                ‹ Prev
              </button>
              <button @click="nextReportsPage" :disabled="reportsOffset + reportsLimit >= reportsTotal" class="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50 text-xs sm:text-sm">
                Next ›
              </button>
            </div>
          </div>
        </div>

        <!-- Claimed Items Card -->
        <div class="px-4 sm:px-6 py-5 sm:py-6 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-amber-50/80 via-white dark:from-amber-900/10 dark:via-gray-800 dark:to-gray-800 flex flex-col justify-between h-full min-h-[400px] shadow-lg hover:shadow-xl rounded-2xl transition-shadow duration-300">
          <div class="flex-1">
            <div class="flex items-center justify-between mb-5 sm:mb-6 flex-col sm:flex-row gap-3 sm:gap-0">
              <div class="flex items-center gap-3">
                <div class="bg-amber-100 dark:bg-amber-900/40 p-2.5 sm:p-3 rounded-xl">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Claimed Items</h2>
              </div>
            </div>
            <ul class="space-y-2.5 sm:space-y-3">
            <li
              v-for="(item, index) in claimedItems"
              :key="index"
              class="p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-700/20 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-all duration-200 border border-gray-100 dark:border-gray-700/50 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md"
            >
              <div class="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div class="w-14 sm:w-16 h-14 sm:h-16 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0 border border-gray-300 dark:border-gray-600">
                  <img v-if="item.image_url" :src="item.image_url" alt="claimed item" class="w-full h-full object-cover" />
                  <div v-else-if="isClaimItemId(item)" class="w-full h-full bg-emerald-500 flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54h3.01l-3.01 4.17h5.1l-2.35-4.17 3.01-3.54z"/>
                    </svg>
                  </div>
                  <div v-else class="w-full h-full bg-amber-500 flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <div>
                    <p class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate capitalize">Claimed: <span class="capitalize">{{ isClaimItemId(item) ? 'ID' : 'Item' }}</span></p>
                    <p class="text-xs sm:text-sm text-gray-900 dark:text-white truncate mt-1">{{ item.name }}</p>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0">
                <div class="px-2 sm:px-3 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-semibold whitespace-nowrap">{{ getClaimStatusText(item) }}</div>
                <button @click="goToReportDetails(item.item_id)" class="px-3 sm:px-4 py-1 sm:py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition whitespace-nowrap text-xs sm:text-sm">View</button>
              </div>
            </li>
            <li v-if="claimedItems.length === 0" class="text-center py-8 text-gray-600 dark:text-gray-400">
              <div class="flex flex-col items-center">
                <svg class="w-12 h-12 opacity-30 mb-2 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <p class="font-medium">No claimed items yet.</p>
              </div>
            </li>
          </ul>
          </div>
          <div class="mt-auto pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span v-if="claimedTotal > 0">
                Showing {{ claimedShowingRange().start }} to {{ claimedShowingRange().end }} of {{ claimedTotal }} results
              </span>
              <span v-else>
                Showing 0 results
              </span>
            </div>
            <div class="flex items-center gap-1 sm:gap-2">
              <button @click="prevClaimedPage" :disabled="claimedOffset === 0" class="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50 text-xs sm:text-sm">
                ‹ Prev
              </button>
              <button @click="nextClaimedPage" :disabled="claimedOffset + claimedLimit >= claimedTotal" class="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 disabled:opacity-50 text-xs sm:text-sm">
                Next ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-2.5 sm:gap-4 w-full max-w-2xl mx-auto mb-10 px-3 sm:px-6 md:px-0">
      <button
        @click="$router.push('/report')"
        class="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl bg-emerald-500 text-white font-bold text-base hover:bg-emerald-600 active:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        File a Report
      </button>

      <button
        @click="$router.push('/search')"  
        class="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl bg-emerald-500 text-white font-bold text-base hover:bg-emerald-600 active:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        Search Item 
      </button>
    </div>

    <!-- Match Details Modal -->
    <div
      v-if="selectedMatch"
      class="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-200 dark:border-gray-700">
        <div class="p-6 md:grid md:grid-cols-2 md:gap-6 md:items-center">
          <div class="flex flex-col items-center md:items-start">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 md:hidden text-center md:text-left">✨ Match Found!</h3>
            <p class="text-gray-900 dark:text-white mb-2 md:hidden text-center md:text-left">{{ selectedMatch.message }}</p>
            <div class="mb-4">
              <img
                v-if="selectedMatch.display_image"
                :src="selectedMatch.display_image"
                alt="Matched item"
                class="w-40 h-40 object-cover rounded-xl border-4 border-emerald-100 dark:border-emerald-900/30 mb-4 shadow-md filter blur-md"
              />
            </div>
          </div>

          <div>
            <h3 class="hidden md:block text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center md:text-left">✨ Match Found!</h3>
            <p class="hidden md:block text-gray-900 dark:text-white mb-2 text-center md:text-left">{{ selectedMatch.message }}</p>
            <p
              v-if="selectedMatch.display_description"
              class="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center md:text-left"
            >
              {{ selectedMatch.display_description }}
            </p>

            <p class="font-semibold text-gray-900 dark:text-white text-lg text-center md:text-left">
              {{ selectedMatch.display_name }}
            </p>
            <p
              v-if="selectedMatch.display_student_id"
              class="text-gray-600 dark:text-gray-400 text-sm"
            >
              Student ID: {{ selectedMatch.display_student_id }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Location: {{ selectedMatch.matched_location || "N/A" }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Status: {{ selectedMatchStatusLabel }}
            </p>
            <p
              v-if="claimStatusNotice"
              class="mt-2 text-sm text-red-600 dark:text-red-400 font-medium"
            >
              {{ claimStatusNotice }}
            </p>

            <div class="flex justify-center md:justify-start mt-6">
              <button
                @click="goToNotificationForMatch(selectedMatch)"
                class="px-6 py-2 rounded-lg font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md mr-2"
              >
                View Found Item
              </button>
              <button
                @click="openClaimModal(selectedMatch)"
                :disabled="claimButtonDisabled"
                class="px-6 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
                v-if="!claimButtonDisabled"
              >
                Send Claim Request
              </button>
              <button
                :disabled="true"
                v-if="claimButtonDisabled"
                class="px-6 py-2 rounded-lg font-semibold bg-gray-400 text-white opacity-60 cursor-not-allowed"
              >
                {{ claimButtonCta }}
              </button>
            </div>

            
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 text-center md:text-right border-t border-gray-200 dark:border-gray-700">
          <button
            @click="closeMatchModal"
            class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Claim Submission Modal -->
    <div
      v-if="showClaimModal"
      class="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Submit Claim Request</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            You are about to submit a claim for <strong>{{ selectedMatch.display_name }}</strong>.
            Share a quick note below so security can verify your request, then confirm to send the claim to the Security Office.
          </p>

          <textarea
            v-model="claimMessage"
            rows="3"
            placeholder="Optional: e.g., 'I can describe the unique scratch on the back.'"
            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 text-gray-900 dark:text-white bg-white dark:bg-gray-900 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          ></textarea>

          <div class="flex justify-end gap-3">
            <button
              @click="closeClaimModal"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
            >
              Cancel
            </button>
            <button
              @click="submitClaim"
              :disabled="claimSubmitDisabled"
              class="px-5 py-2 rounded-lg font-semibold transition"
              :class="
                claimSubmitDisabled
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              "
            >
              {{ claimSubmitLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ThemeToggle from '../components/ThemeToggle.vue';

import initSocket, { disconnectSocket } from "../socket";

// ClaimStatusNotification removed from dashboard to keep notifications on the dedicated page
import ItemReceivedModal from '../components/ItemReceivedModal.vue';

export default {
  name: "UserDashboard",
  components: {
    ItemReceivedModal,
    ThemeToggle
  },
  data() {
    return {
      showNotifications: false,
      showProfileMenu: false,
      notifications: [],
      user: null,
      reports: [],
      reportsLimit: 3,
      reportsOffset: 0,
      reportsTotal: 0,
      claimedItems: [],
      claimedLimit: 3,
      claimedOffset: 0,
      claimedTotal: 0,
      showImageSearch: false,
      selectedMatch: null,
      claiming: false,
      showClaimModal: false,
      claimMessage: "",
      claimResultMessage: "",
      itemReceivedMessage: "",
      showItemReceivedModal: false,
      itemReceivedModalData: {
        itemName: null,
        itemId: null
      },
      socket: null,
      apiBaseUrl: "http://localhost:5000",
      notificationPollTimer: null,
      notificationsInitialized: false,
      latestNotificationSignature: null,
      // When true, render notifications in a full-screen view (triggered by route query)
      notificationsFullscreen: false,
      // Keep short-lived keys for notifications the user just cleared so auto-preview
      // and realtime handlers won't immediately re-open them.
      recentlyClearedNotificationKeys: [],
      // Image blur state for Match Found modal (confidential display)
    };
  },
  computed: {
    unreadNotificationCount() {
      return this.notifications.filter((n) => !n.is_read).length;
    },
    profileInitial() {
      if (this.user && this.user.full_name)
        return this.user.full_name[0].toUpperCase();
      return "U";
    },
    claimButtonDisabled() {
      return this.isClaimDisabled(this.selectedMatch);
    },
    claimButtonCta() {
      if (!this.selectedMatch || !this.claimButtonDisabled)
        return "I want to claim this item";

      const status = this.normalizeClaimStatus(
        this.selectedMatch.claim_status || this.selectedMatch.matched_status
      );

      switch (status) {
        case "pending_claim":
          return "Claim already submitted";
        case "confirmed_claim":
          return "Claim already approved";
        case "returned":
        case "returned_to_owner":
          return "Item already returned";
        case "rejected_claim":
          return "Claim already reviewed";
        default:
          return "Claim unavailable";
      }
    },
    selectedMatchStatusLabel() {
      if (!this.selectedMatch) return "In Security Custody";

      const candidates = [
        this.normalizeClaimStatus(this.selectedMatch.claim_status),
        this.normalizeClaimStatus(this.selectedMatch.matched_status),
      ];

      const prioritized = candidates.find((status) =>
        [
          "pending_claim",
          "confirmed_claim",
          "rejected_claim",
          "returned",
          "returned_to_owner",
        ].includes(status)
      );

      const fallback = candidates.find(Boolean) || "in_security_custody";

      return (prioritized || fallback)
        .split("_")
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
        .join(" ");
    },
    claimSubmitDisabled() {
      return this.claiming || this.claimButtonDisabled;
    },
    claimSubmitLabel() {
      if (this.claimButtonDisabled) return "Claim unavailable";
      return this.claiming ? "Submitting..." : "Submit Claim";
    },
  },
  methods: {
    // Helper function to limit concurrent requests to prevent UI freeze
    async runWithConcurrencyLimit(tasks, limit = 3) {
      const results = [];
      const executing = [];
      
      for (const task of tasks) {
        const promise = Promise.resolve().then(() => task()).then(
          result => {
            executing.splice(executing.indexOf(promise), 1);
            return result;
          }
        );
        
        results.push(promise);
        executing.push(promise);
        
        if (executing.length >= limit) {
          await Promise.race(executing);
        }
      }
      
      return Promise.all(results);
    },

    normalizeClaimStatus(value) {
      if (value === undefined || value === null) return null;
      if (typeof value === "string") return value.trim().toLowerCase();
      try {
        return String(value).trim().toLowerCase();
      } catch (err) {
        return null;
      }
    },

    // ✅ Format status display text
    formatStatusDisplay(status) {
      const normalizedStatus = String(status || "pending").toLowerCase().trim();
      const statusMap = {
        "": "Pending",
        "pending": "Pending",
        "reported": "Reported",
        "reported_lost": "Reported Lost",
        "pending_review": "Pending Review",
        "in_security_custody": "In Security Custody"
      };
      return statusMap[normalizedStatus] || (normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1));
    },

    // ✅ Get claim status display text
    getClaimStatusText(claimedItem) {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      // If this is a marked_returned item (user's own lost item marked as returned by staff)
      if (claimedItem.status === 'marked_returned' || claimedItem._isOwnMarkedItem) {
        return "Marked Returned";
      }
      
      if (!currentUser?.id) return "Claimed by Owner";
      
      // If the claimant is the current user, show "Claimed by You"
      if (claimedItem.claimant_id === currentUser.id) {
        return "Claimed by You";
      }
      
      // If the current user is the item reporter (finder of a found item that was claimed), show "Claimed by Owner"
      if (claimedItem.item_reporter_id === currentUser.id) {
        return "Claimed by Owner";
      }
      
      // Default case (should rarely happen)
      return "Claimed by Owner";
    },
    // Determine whether a claimed item should be considered an ID
    isClaimItemId(item) {
      if (!item) return false;
      const t = (item.type || item.item_type || '').toString().toLowerCase();
      const name = (item.name || '').toString().toLowerCase();
      const sid = (item.student_id || item.item_student_id || item.studentId || '').toString().toLowerCase();

      // If backend included a student_id field, treat as ID
      if (sid) return true;

      // If type explicitly mentions 'id' or 'student id', treat as ID
      if (t.includes('id') || t.includes('student id')) return true;

      // If the name looks like a student id (mostly digits, at least 4 characters), treat as ID
      if (/^\d{4,}$/.test(name.replace(/[^0-9]/g, ''))) return true;

      // If name explicitly contains 'student id' or '(id)' markers
      if (name.includes('student id') || name.includes('(id)') || name.includes(' id')) return true;

      return false;
    },

    isClaimDisabled(match) {
      if (!match) return false;

      const statuses = [
        this.normalizeClaimStatus(match.claim_status),
        this.normalizeClaimStatus(match.matched_status),
      ].filter(Boolean);

      const blocking = [
        "pending_claim",
        "confirmed_claim",
        "returned",
        "returned_to_owner",
      ];

      return statuses.some((status) => blocking.includes(status));
    },

    applyClaimState(match, status) {
      if (!match) return;

      const normalized = this.normalizeClaimStatus(status) || "pending_claim";
      const key =
        match.match_id ||
        match.notification_id ||
        match.id ||
        match.item_id ||
        null;

      const clonedMatch = { ...match, claim_status: normalized };
      this.selectedMatch = { ...clonedMatch };

      if (key) {
        const idx = this.notifications.findIndex((n) => {
          const candidate =
            n.match_id || n.notification_id || n.id || n.item_id || null;
          return candidate && String(candidate) === String(key);
        });

        if (idx !== -1) {
          this.notifications.splice(idx, 1, {
            ...this.notifications[idx],
            claim_status: normalized,
          });
        }
      }
    },

    async toggleNotifications() {
      this.showNotifications = !this.showNotifications;
      if (this.showNotifications) {
        // Close profile menu when opening notifications
        this.showProfileMenu = false;
        
        // Load latest notifications first (populate list from server)
        await this.loadNotifications();

        // Immediately mark notifications as read locally so the badge/indicator clears
        try {
          this.notifications = this.notifications.map((n) => ({ ...n, is_read: true }));
        } catch (e) {
          console.warn("Failed to mark notifications read locally:", e);
        }
      }
    },

    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu;
      if (this.showProfileMenu) {
        // Close notifications menu when opening profile
        this.showNotifications = false;
      }
    },

    closeMenusOnClickOutside() {
      // Close both notifications and profile menus when clicking outside
      this.showNotifications = false;
      this.showProfileMenu = false;
    },

    async loadNotifications(options = {}) {
      const { autoPreview = false, markInitial = false } = options;
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) return console.warn("⚠️ No logged-in user found.");

        const res = await fetch(
          `http://localhost:5000/api/notifications/${user.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch notifications");

        const data = await res.json();
        console.log(`📥 Fetched ${data.length} notifications from backend`);
        data.forEach((n, idx) => {
          if (n.type === 'match_generated') {
            console.log(`   [${idx}] MATCH: item_id=${n.item_id}, matched_item_id=${n.matched_item_id}, item_name="${n.item_name}", matched_item_name="${n.matched_item_name}", display_name="${n.display_name}"`);
            console.log(`       Item Type: ${n.base_item_type}, display_image=${n.display_image}, item_image_url=${n.item_image_url}, matched_image_url=${n.matched_image_url}`);
          }
        });

        // ✅ Make sure to include the correct item_id from backend
        const mapped = data.map((n) => {
          // ✅ Special handling for item_received notifications
          if (n.type === 'item_received') {
            const createdAtRaw = n.created_at ? new Date(n.created_at) : new Date();
            return {
              id: n.id,
              notification_id: n.id,
              item_id: n.item_id,
              type: 'item_received',
              category: 'delivery',
              message: "The item you delivered or turned over to the security office has been received successfully. Thank you for your cooperation.",
              display_name: n.item_name || "Your Item",
              display_student_id: n.item_student_id || null,
              display_description: null,
              display_image: n.item_image_url || null,
              matched_location: "N/A",
              matched_status: "in_security_custody",
              is_read: Boolean(n.is_read),
              created_at: createdAtRaw.toLocaleString(),
              created_at_ts: createdAtRaw.getTime(),
              match_id: null,
              lost_item_id: null,
              found_item_id: n.item_id,
              matched_item_id: null,
              base_item_type: "found",
              claim_status: null,
            };
          }

          // ✅ Special handling for claim approved notifications
          if (n.type === 'claim_approved') {
            const createdAtRaw = n.created_at ? new Date(n.created_at) : new Date();
            return {
              id: n.id,
              notification_id: n.id,
              item_id: n.item_id,
              type: 'claim_approved',
              category: n.category || 'general',
              message: `The item you requested has been returned to you. This message verifies that you have already claimed your item.`,
              display_name: n.item_name || "Your Item",
              display_student_id: n.item_student_id || null,
              display_description: null,
              display_image: n.item_image_url || null,
              matched_location: "N/A",
              matched_status: "approved",
              is_read: Boolean(n.is_read),
              created_at: createdAtRaw.toLocaleString(),
              created_at_ts: createdAtRaw.getTime(),
              match_id: null,
              lost_item_id: null,
              found_item_id: n.item_id,
              matched_item_id: null,
              base_item_type: "found",
              claim_status: "approved",
            };
          }

          // ✅ Special handling for claim rejected notifications
          if (n.type === 'claim_rejected') {
            const createdAtRaw = n.created_at ? new Date(n.created_at) : new Date();
            const detailSegments = [];
            if (n.color) detailSegments.push(`Color: ${n.color}`);
            if (n.matched_location && n.matched_location !== "N/A") detailSegments.push(`Stored at: ${n.matched_location}`);
            
            return {
              id: n.id,
              notification_id: n.id,
              item_id: n.item_id,
              type: 'claim_rejected',
              category: n.category || 'general',
              message: `Your claim request for the item "${n.item_name || 'this item'}" has been rejected since we couldn't verify that you're the owner of the item. You can try again another time.`,
              display_name: n.item_name || "Your Item",
              display_student_id: n.item_student_id || null,
              display_description: detailSegments.length > 0 ? detailSegments.join(" • ") : null,
              display_image: n.item_image_url || null,
              matched_location: "N/A",
              matched_status: "rejected",
              is_read: Boolean(n.is_read),
              created_at: createdAtRaw.toLocaleString(),
              created_at_ts: createdAtRaw.getTime(),
              match_id: null,
              lost_item_id: null,
              found_item_id: n.item_id,
              matched_item_id: null,
              base_item_type: "found",
              claim_status: "rejected",
              color: n.color || null,
            };
          }

          // ✅ Special handling for item claimed notifications (sent to item reporter)
          if (n.type === 'item_claimed') {
            const createdAtRaw = n.created_at ? new Date(n.created_at) : new Date();
            const category = n.category?.toLowerCase();
            const itemDisplay = category === 'id' && n.item_student_id 
              ? `Student ID (${n.item_student_id})` 
              : n.item_name || 'this item';
            
            return {
              id: n.id,
              notification_id: n.id,
              item_id: n.item_id,
              type: 'item_claimed',
              category: n.category || 'general',
              message: `The ${itemDisplay} you reported has been successfully claimed by ${n.claimant_full_name || 'the rightful owner'}. Thank you for your cooperation!`,
              display_name: itemDisplay,
              display_student_id: category === 'id' ? n.item_student_id : null,
              display_description: `Claimed by ${n.claimant_full_name || 'Unknown'}`,
              display_image: n.item_image_url || null,
              matched_location: "N/A",
              matched_status: "claimed",
              claimant_name: n.claimant_full_name || 'Unknown',
              claimant_profile_picture: n.claimant_profile_picture || null,
              is_read: Boolean(n.is_read),
              created_at: createdAtRaw.toLocaleString(),
              created_at_ts: createdAtRaw.getTime(),
              match_id: null,
              lost_item_id: null,
              found_item_id: n.item_id,
              matched_item_id: null,
              base_item_type: "found",
              claim_status: "claimed",
            };
          }

          // ✅ Special handling for ID number match notifications
          if (n.category === 'id_number_match') {
            const createdAtRaw = n.created_at ? new Date(n.created_at) : new Date();
            const itemType = n.item_type || 'Item';
            const displayName = n.item_name || `Your ${itemType}`;
            
            return {
              id: n.id,
              notification_id: n.id,
              item_id: n.item_id,
              type: 'match_generated',
              category: 'id_number_match',
              message: `Your ID (${n.item_student_id || 'Unknown'}) has been found!`,
              display_name: displayName,
              display_student_id: n.item_student_id || null,
              display_description: n.item_location ? `Found at: ${n.item_location}` : null,
              display_image: n.item_image_url ? `${this.apiBaseUrl}${n.item_image_url.startsWith('/') ? '' : '/'}${n.item_image_url}` : null,
              matched_location: n.item_location || "Unknown",
              matched_status: n.item_type === 'found' ? 'in_security_custody' : 'pending',
              is_read: Boolean(n.is_read),
              created_at: createdAtRaw.toLocaleString(),
              created_at_ts: createdAtRaw.getTime(),
              match_id: null,
              lost_item_id: null,
              found_item_id: n.item_id,
              matched_item_id: null,
              base_item_type: n.item_type || 'found',
              claim_status: null,
            };
          }

          const baseClaimStatus = this.normalizeClaimStatus(
            n.base_user_claim_status
          );
          const matchedClaimStatus = this.normalizeClaimStatus(
            n.matched_user_claim_status
          );
          const category = n.category?.toLowerCase();
          const baseType = (n.base_item_type || n.item_type || "").toLowerCase();
          const displayName = n.display_name || n.item_name || "Matched item";
          const studentId = n.display_student_id || null;
          const description =
            n.display_description ||
            n.matched_description ||
            (category === "id" && studentId
              ? `Possible match for student ID ${studentId}`
              : null);
          const message =
            category === "id"
              ? `A match for your lost Student ID (${studentId || "Unknown"}) has been found!`
              : `A match for your lost "${displayName}" has been found!`;

          const rawImagePath =
            n.display_image || n.matched_image_url || n.item_image_url || null;
          const baseUrl = this.apiBaseUrl.replace(/\/+$/, "");
          const normalizedPath = rawImagePath
            ? rawImagePath.startsWith("/")
              ? rawImagePath
              : `/${rawImagePath}`
            : null;
          const imageUrl = normalizedPath ? `${baseUrl}${normalizedPath}` : null;

          const createdAtRaw = n.created_at ? new Date(n.created_at) : new Date();

          const lostItemId =
            baseType === "lost"
              ? n.item_id
              : baseType === "found"
              ? n.matched_item_id || null
              : n.item_id;

          const foundItemId =
            baseType === "lost"
              ? n.matched_item_id || null
              : baseType === "found"
              ? n.item_id
              : n.matched_item_id || null;

          const resolvedClaimStatus =
            baseType === "lost"
              ? matchedClaimStatus || null
              : baseClaimStatus || matchedClaimStatus || null;

          // Compute actual lost and found item data based on base_item_type
          let actualLostItemData, actualFoundItemData;
          if (baseType === 'lost') {
            // i is LOST, matched_i is FOUND
            actualLostItemData = {
              image: n.item_image_url ? `${this.apiBaseUrl}${n.item_image_url.startsWith('/') ? '' : '/'}${n.item_image_url}` : null,
              name: n.item_name || null,
              studentId: n.item_student_id || null,
              brand: n.brand || null,
              color: n.color || null,
              type: baseType,
              description: n.item_description || null,
            };
            actualFoundItemData = {
              image: n.matched_image_url ? `${this.apiBaseUrl}${n.matched_image_url.startsWith('/') ? '' : '/'}${n.matched_image_url}` : null,
              name: n.matched_item_name || null,
              studentId: n.matched_student_id || null,
              brand: n.brand || null,
              color: n.color || null,
              type: n.matched_type || null,
              location: n.matched_location || null,
              description: n.matched_description || null,
            };
          } else {
            // i is FOUND, matched_i is LOST
            actualLostItemData = {
              image: n.matched_image_url ? `${this.apiBaseUrl}${n.matched_image_url.startsWith('/') ? '' : '/'}${n.matched_image_url}` : null,
              name: n.matched_item_name || null,
              studentId: n.matched_student_id || null,
              brand: n.brand || null,
              color: n.color || null,
              type: n.matched_type || null,
              description: n.matched_description || null,
            };
            actualFoundItemData = {
              image: n.item_image_url ? `${this.apiBaseUrl}${n.item_image_url.startsWith('/') ? '' : '/'}${n.item_image_url}` : null,
              name: n.item_name || null,
              studentId: n.item_student_id || null,
              brand: n.brand || null,
              color: n.color || null,
              type: baseType,
              location: n.matched_location || null,
              description: n.item_description || null,
            };
          }

          return {
            id: n.id || `match-${n.match_id}`,
            notification_id: n.id || null,
            item_id: n.item_id,
            lost_item_id: lostItemId,
            found_item_id: foundItemId,
            matched_item_id: n.matched_item_id || null,
            match_id: n.match_id,
            category: n.category,
            message,
            display_name: displayName,
            display_student_id: studentId,
            display_description: description,
            display_image: imageUrl,
            matched_location: n.matched_location || "N/A",
            matched_status: n.matched_status || "in_security_custody",
            is_read: Boolean(n.is_read),
            created_at: createdAtRaw.toLocaleString(),
            created_at_ts: createdAtRaw.getTime(),
            base_item_type: baseType,
            claim_status: resolvedClaimStatus,
            actualLostItemData,
            actualFoundItemData,
          };
        });

        mapped.sort((a, b) => b.created_at_ts - a.created_at_ts);

        console.log(`✅ Mapped ${mapped.length} notifications for display`);
        mapped.forEach((m, idx) => {
          if (m.match_id) {
            console.log(`   [${idx}] MATCH: display_name="${m.display_name}", item_id=${m.item_id}, matched_item_id=${m.matched_item_id}, found_item_id=${m.found_item_id}`);
          }
        });

        this.notifications = mapped;

        if (this.selectedMatch) {
          const key =
            this.selectedMatch.match_id ||
            this.selectedMatch.notification_id ||
            this.selectedMatch.id ||
            this.selectedMatch.item_id ||
            null;
          if (key) {
            const refreshed = this.notifications.find((n) => {
              const candidate =
                n.match_id || n.notification_id || n.id || n.item_id || null;
              return candidate && String(candidate) === String(key);
            });
            if (refreshed) {
              this.selectedMatch = { ...refreshed };
            }
          }
        }

        const newest = this.notifications[0] || null;

        if (!this.notificationsInitialized && markInitial) {
          this.notificationsInitialized = true;
          this.latestNotificationSignature = newest
            ? this.buildNotificationSignature(newest)
            : null;
        } else if (autoPreview) {
          this.tryAutoPreviewLatest(newest);
        }

        return mapped;
      } catch (err) {
        console.error("❌ Error loading notifications:", err);
      }
    },

    buildNotificationSignature(notification) {
      if (!notification) return null;
      const keyParts = [
        notification.match_id ?? "no-match",
        notification.item_id ?? "no-item",
        notification.created_at_ts ?? Date.now(),
      ];
      return keyParts.join("::");
    },

    tryAutoPreviewLatest(candidate) {
      const target = candidate || this.notifications[0] || null;
      if (!target) return;

      const key = target.notification_id || target.id || target.match_id || target.item_id || null;
      // If the user just cleared this notification, skip auto-preview
      if (key && this.recentlyClearedNotificationKeys.includes(String(key))) return;

      const signature = this.buildNotificationSignature(target);
      if (!signature || signature === this.latestNotificationSignature) return;

      this.latestNotificationSignature = signature;
      // Do not auto-open the match modal for auto-preview; send a desktop notification instead
      try {
        this.maybeSendDesktopNotification(target);
      } catch (e) {
        console.warn('Auto-preview desktop notification failed', e);
      }
    },

    triggerNotificationPreview(notification, options = {}) {
      if (!notification) return;
      const { showBrowserNotification = true, openModal = false } = options;

      if (this.showClaimModal) {
        this.closeClaimModal();
      }

      if (showBrowserNotification) {
        this.maybeSendDesktopNotification(notification);
      }

      // Do not auto-open the modal by default — callers must opt-in via { openModal: true }
      if (openModal) {
        this.$nextTick(() => {
          this.viewMatchDetails(notification);
        });
      }
    },

    goToAcknowledge(notif) {
      if (!notif) return;
      try {
        // Store the notification payload so the acknowledge page can read details
        localStorage.setItem('acknowledge_notification', JSON.stringify(notif));
      } catch (e) {
        console.warn('Failed to cache acknowledge notification:', e);
      }
      this.showNotifications = false;
      // Navigate to the acknowledge page
      try {
        this.$router.push({ path: '/acknowledge' });
      } catch (e) {
        console.error('Navigation to acknowledge page failed:', e);
      }
    },

    goToClaimApproved(notif) {
      if (!notif) return;
      try {
        // Cache the notification so the claim-approved page can read it
        localStorage.setItem('claim_approved_notification', JSON.stringify(notif));
      } catch (e) {
        console.warn('Failed to cache claim approved notification:', e);
      }
      this.showNotifications = false;
      try {
        this.$router.push({ path: '/claim-approved' });
      } catch (e) {
        console.error('Navigation to claim-approved page failed:', e);
      }
    },

    goToClaimRejected(notif) {
      if (!notif) return;
      try {
        // Cache the notification so the claim-rejected page can read it
        localStorage.setItem('claim_rejected_notification', JSON.stringify(notif));
      } catch (e) {
        console.warn('Failed to cache claim rejected notification:', e);
      }
      this.showNotifications = false;
      try {
        this.$router.push({ path: '/claim-rejected' });
      } catch (e) {
        console.error('Navigation to claim-rejected page failed:', e);
      }
    },

    goToNotificationForMatch(match) {
      // Navigate to the Notifications page and include a query param that
      // the NotificationsPage component will use to auto-open the matching notification.
      if (!match) return;
      
      // Check if this is an ID number match notification
      if (match.category === 'id_number_match') {
        return this.goToIDMatchDetails(match);
      }
      
      // mark this notification as read so the badge/count is cleared
      try {
        if (match && typeof match.is_read !== 'undefined') {
          match.is_read = true;
        } else if (match) {
          // attempt to find by id in the notifications array
          const idx = this.notifications.findIndex(n => (n.notification_id || n.id || n.match_id) === (match.notification_id || match.id || match.match_id));
          if (idx !== -1) this.notifications[idx].is_read = true;
        }
      
        // Also remove the notification from the dropdown locally so it's cleared from the list
        try {
          const key = match.notification_id || match.id || match.match_id || match.item_id || null;
          const removeIdx = this.notifications.findIndex(n => (n.notification_id || n.id || n.match_id || n.item_id) === key);
          if (removeIdx !== -1) this.notifications.splice(removeIdx, 1);

          // Remember the cleared key briefly so auto-preview/poll/sockets won't reopen it
          if (key) {
            try {
              this.recentlyClearedNotificationKeys.push(String(key));
              this.latestNotificationSignature = this.buildNotificationSignature(match) || this.latestNotificationSignature;
              // remove after 60s
              setTimeout(() => {
                const i = this.recentlyClearedNotificationKeys.indexOf(String(key));
                if (i !== -1) this.recentlyClearedNotificationKeys.splice(i, 1);
              }, 60000);
            } catch (e) {
              // non-fatal
            }
          }
        } catch (e) {
          // non-fatal
        }
      } catch (e) {
        console.warn('Failed to mark notification read locally:', e);
      }
      // Prepare a lightweight payload the MatchDetails page can consume via localStorage
      try {
        console.log('DEBUG goToNotificationForMatch - notification object:', match);
        
        // Use the computed actual lost and found item data
        const payload = {
          claim_status: match.claim_status || match.matched_status || null,
          matched_status: match.matched_status || null,
          match_id: match.match_id || match.id || null,
          lostItem: {
            preview: match.actualLostItemData?.image || null,
            name: match.actualLostItemData?.name || null,
            studentId: match.actualLostItemData?.studentId || null,
            category: match.category || null,
            type: match.actualLostItemData?.type || null,
            brand: match.actualLostItemData?.brand || null,
            color: match.actualLostItemData?.color || null,
            description: match.actualLostItemData?.description || null,
            status: match.claim_status || null,
            date: match.created_at || null,
          },
          foundItem: {
            id: match.found_item_id || null,
            itemId: match.found_item_id || null,
            preview: match.actualFoundItemData?.image || null,
            name: match.actualFoundItemData?.name || null,
            studentId: match.actualFoundItemData?.studentId || null,
            category: match.category || null,
            type: match.actualFoundItemData?.type || null,
            brand: match.actualFoundItemData?.brand || null,
            color: match.actualFoundItemData?.color || null,
            description: match.actualFoundItemData?.description || null,
            status: match.matched_status || null,
            date: match.created_at || null,
            location: match.actualFoundItemData?.location || null,
          },
        };

        console.log('DEBUG goToNotificationForMatch - created payload:', payload);
        try { localStorage.setItem('selectedMatch', JSON.stringify(payload)); } catch (e) { /* ignore */ }
      } catch (e) {
        console.warn('Failed to prepare match payload for details page:', e);
      }

      this.showNotifications = false;
      try {
        this.$router.push({ path: '/item-match-details' });
      } catch (e) {
        console.error('Navigation to match details failed:', e);
      }
    },

    goToIDMatchDetails(notification) {
      // Handle navigation to ID Match Details page for ID number match notifications
      if (!notification || !notification.item_id) {
        console.error('Missing item ID for ID match notification');
        return;
      }

      // Mark notification as read
      try {
        if (notification && typeof notification.is_read !== 'undefined') {
          notification.is_read = true;
        }
      } catch (e) {
        console.warn('Failed to mark notification read:', e);
      }

      // Remove from notification list
      try {
        const key = notification.notification_id || notification.id || notification.item_id;
        const removeIdx = this.notifications.findIndex(n => (n.notification_id || n.id || n.item_id) === key);
        if (removeIdx !== -1) this.notifications.splice(removeIdx, 1);
      } catch (e) {
        // non-fatal
      }

      // Store item data in localStorage for the detail page
      try {
        const itemData = {
          id: notification.item_id,
          name: notification.display_name || 'ID Card',
          student_id: notification.display_student_id || null,
          category: notification.category || 'ID',
          image_url: notification.item_image || null,
          created_at: notification.created_at || null,
          location: notification.matched_location || null,
          type: 'found',
          status: 'in_security_custody',
        };
        localStorage.setItem('idMatchItemData', JSON.stringify(itemData));
      } catch (e) {
        console.warn('Failed to store ID match item data:', e);
      }

      this.showNotifications = false;

      // Navigate to ID match details page
      try {
        this.$router.push({
          name: 'IDMatchDetails',
          params: { id: notification.item_id },
        });
      } catch (e) {
        console.error('Navigation to ID match details failed:', e);
      }
    },

    async clearNotification(notif) {
      if (!notif) return;
      try {
        const key = notif.notification_id || notif.id || notif.match_id || notif.item_id || null;

        // Remove locally first for responsive UI
        try {
          const idx = this.notifications.findIndex(n => (n.notification_id || n.id || n.match_id || n.item_id) === key);
          if (idx !== -1) this.notifications.splice(idx, 1);
        } catch (e) {
          // non-fatal
        }

        // Remember cleared key briefly to avoid auto-preview
        if (key) {
          try {
            this.recentlyClearedNotificationKeys.push(String(key));
            this.latestNotificationSignature = this.buildNotificationSignature(notif) || this.latestNotificationSignature;
            setTimeout(() => {
              const i = this.recentlyClearedNotificationKeys.indexOf(String(key));
              if (i !== -1) this.recentlyClearedNotificationKeys.splice(i, 1);
            }, 60000);
          } catch (e) {
            // ignore
          }
        }

        // Persist to backend: if we have a real notification id, call clear endpoint.
        // If this is a synthesized match (no notification id but has match_id), call the
        // new match-clear endpoint so the server will insert a cleared notification
        // and the synthesized row won't reappear on next fetch.
        try {
          const user = JSON.parse(localStorage.getItem('user')) || {};
          const API_BASE = 'http://localhost:5000';

          if (notif.notification_id || notif.id) {
            const id = notif.notification_id || notif.id;
            await fetch(`${API_BASE}/api/notifications/${encodeURIComponent(id)}/clear`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
            });
          } else if (notif.match_id) {
            // synthesize-and-clear
            await fetch(`${API_BASE}/api/notifications/match/${encodeURIComponent(notif.match_id)}/clear`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: user.id }),
            });
          }
        } catch (e) {
          console.warn('Failed to persist notification clear to backend:', e);
        }
      } catch (e) {
        console.warn('Failed to clear notification locally:', e);
      }
    },

    clearAndCloseSelectedMatch() {
      try {
        // Remove the corresponding notification from the dropdown (if present)
        if (this.selectedMatch) {
          this.clearNotification(this.selectedMatch);
        }
      } catch (e) {
        console.warn('Failed to clear selected notification:', e);
      } finally {
        // Close the modal
        this.selectedMatch = null;
        this.showClaimModal = false;
      }
    },

    maybeSendDesktopNotification(notification) {
      if (typeof Notification === "undefined") return;

      if (Notification.permission === "granted") {
        new Notification("Item match found!", {
          body:
            notification.category?.toLowerCase() === "id"
              ? "Your Student ID may have been found."
              : `Possible match: ${notification.display_name}`,
          icon: notification.display_image || undefined,
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    },

    findNotificationForEvent(evt) {
      if (!evt) return null;

      // Handle id_number_match events
      if (evt.category === 'id_number_match' && evt.item_id) {
        return this.notifications.find((n) => 
          n.category === 'id_number_match' && 
          String(n.item_id) === String(evt.item_id)
        ) || null;
      }

      return (
        this.notifications.find((n) => {
          const matchMatches =
            evt.match_id != null && String(n.match_id) === String(evt.match_id);
          const itemMatches =
            evt.item_id != null && String(n.item_id) === String(evt.item_id);
          const foundMatches =
            evt.found_item_id != null &&
            (String(n.found_item_id) === String(evt.found_item_id) ||
              String(n.matched_item_id) === String(evt.found_item_id));
          return matchMatches || itemMatches || foundMatches;
        }) || null
      );
    },

    // Handle realtime incoming match notification
    async handleNewNotificationEvent(evt) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) return;

        // Only react if this event is for the logged-in user
        if (String(evt.user_id) !== String(user.id)) return;

        // Refresh list to get complete display fields
        // If this event corresponds to a notification the user just cleared, ignore it
        const candidateKey = evt.notification_id || evt.match_id || evt.item_id || evt.found_item_id || null;
        if (candidateKey && this.recentlyClearedNotificationKeys.includes(String(candidateKey))) {
          return;
        }

        await this.loadNotifications();

        const newly = this.findNotificationForEvent(evt);
        const target = newly || this.notifications[0] || null;
        if (!target) return;

        const signature = this.buildNotificationSignature(target);
        if (signature === this.latestNotificationSignature) return;

        this.latestNotificationSignature = signature;
        // For realtime events, only send a desktop notification and avoid auto-opening modal
        try {
          this.maybeSendDesktopNotification(target);
        } catch (e) {
          console.warn('Realtime desktop notification failed', e);
        }
      } catch (e) {
        console.error("Error handling realtime match event:", e);
      }
    },

    async handleClaimApprovedEvent(evt) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) return;

        // Only react if this event is for the logged-in user
        if (String(evt.user_id) !== String(user.id)) return;
        
        // Show a success message
        this.claimResultMessage = evt.message || "Your claim has been approved!";
        setTimeout(() => {
          this.claimResultMessage = "";
        }, 6000);

        // Refresh all data in parallel (not sequentially) to avoid UI blocking
        await Promise.all([
          this.loadNotifications(),
          this.loadClaimedItems(),
          this.loadUserReports()
        ]);

        // Update the selected match if open
        if (this.selectedMatch) {
          this.applyClaimState(this.selectedMatch, "approved");
        }

        // Send desktop notification
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("✅ Claim Approved!", {
            body: evt.message || "Your claim has been approved. Please visit the Security Office.",
            icon: "/logo.png",
          });
        }
      } catch (e) {
        console.error("Error handling claim approved event:", e);
      }
    },

    async handleClaimRejectedEvent(evt) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) return;

        // Only react if this event is for the logged-in user
        if (String(evt.user_id) !== String(user.id)) return;
        
        // Show an error message
        this.claimResultMessage = evt.message || "Your claim has been rejected.";
        setTimeout(() => {
          this.claimResultMessage = "";
        }, 6000);

        // Refresh notifications to reflect the claim status change
        await this.loadNotifications();

        // Reload claimed items to remove any rejected claims
        await this.loadClaimedItems();

        // Update the selected match if open
        if (this.selectedMatch) {
          this.applyClaimState(this.selectedMatch, "rejected");
        }

        // Send desktop notification
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("❌ Claim Rejected", {
            body: evt.message || "Your claim has been rejected.",
            icon: "/logo.png",
          });
        }
      } catch (e) {
        console.error("Error handling claim rejected event:", e);
      }
    },

    async handleItemClaimedEvent(evt) {
      try {
        console.log("[itemClaimed event received]", evt);
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) {
          console.log("[itemClaimed] No user in localStorage");
          return;
        }

        console.log(`[itemClaimed] Comparing: evt.item_reporter_id=${evt.item_reporter_id} vs user.id=${user.id}`);
        
        // Only react if this event is for the logged-in user (the item reporter)
        if (String(evt.item_reporter_id) !== String(user.id)) {
          console.log("[itemClaimed] Event not for this user, ignoring");
          return;
        }

        console.log("[itemClaimed] Event is for this user, processing...");

        // Show a success message
        this.claimResultMessage = evt.message || "Someone has claimed your found item!";
        setTimeout(() => {
          this.claimResultMessage = "";
        }, 6000);

        // Refresh notifications to reflect the item claimed event
        await this.loadNotifications();

        // Reload pending reports to update the status of the claimed item
        await this.loadPendingReports();

        // Send desktop notification
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("✅ Item Claimed!", {
            body: evt.message || "Someone has claimed your found item. Check the security office.",
            icon: "/logo.png",
          });
        }
      } catch (e) {
        console.error("Error handling item claimed event:", e);
      }
    },

    async handleItemReceivedEvent(evt) {
      try {
        // Show modal with item details
        this.itemReceivedModalData = {
          itemName: evt.item_name || "Your Item",
          itemId: evt.item_student_id || null
        };
        this.showItemReceivedModal = true;

        // Refresh notifications to show the new item received notification
        await this.loadNotifications();

        // Send desktop notification
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("📦 Item Received!", {
            body: evt.message || "Your item has been received by the security office.",
            icon: "/logo.png",
          });
        }
      } catch (e) {
        console.error("Error handling item received event:", e);
      }
    },

    async handleItemReturnedEvent(evt) {
      try {
        // Show modal with item details when lost item is marked as returned
        this.itemReceivedModalData = {
          itemName: evt.item_name || "Your Item",
          itemId: evt.item_student_id || null
        };
        this.showItemReceivedModal = true;

        // Refresh notifications and claimed items to show the marked_returned item
        await this.loadNotifications();
        await this.loadClaimedItems();

        // Send desktop notification
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("✅ Item Marked as Returned!", {
            body: evt.message || "Your lost item has been marked as returned. Please check with the security office.",
            icon: "/logo.png",
          });
        }
      } catch (e) {
        console.error("Error handling item returned event:", e);
      }
    },

    viewMatchDetails(match) {
      if (!match) {
        this.selectedMatch = null;
        return;
      }

      this.selectedMatch = { ...match };
    },

    closeMatchModal() {
      this.selectedMatch = null;
    },

    openClaimModal(match) {
      if (this.isClaimDisabled(match)) return;
      this.showClaimModal = true;
    },

    closeClaimModal() {
      this.showClaimModal = false;
      this.claimMessage = "";
    },

    closeItemReceivedModal() {
      this.showItemReceivedModal = false;
      this.itemReceivedModalData = { itemName: null, itemId: null };
    },

    async submitClaim() {
      if (!this.selectedMatch) return;

      try {
        this.claiming = true;
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) throw new Error("User not logged in!");

        const foundItemId =
          this.selectedMatch.found_item_id || this.selectedMatch.matched_item_id;
        if (!foundItemId) {
          throw new Error(
            "Cannot submit claim because the matched found item is missing. Please run the search again or contact support."
          );
        }

        const targetNotificationId =
          this.selectedMatch.notification_id || this.selectedMatch.id;

        if (!targetNotificationId) {
          throw new Error(
            "Unable to submit claim: missing notification reference for this match."
          );
        }

        const res = await fetch(`http://localhost:5000/api/claims`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            item_id: foundItemId,
            notification_id: targetNotificationId,
            message: this.claimMessage,
          }),
        });

        let data = null;
        try {
          data = await res.json();
        } catch (parseErr) {
          data = null;
        }

        if (res.status === 409) {
          const existingStatus =
            data?.claim?.status ||
            data?.claim?.user_claim_status ||
            data?.claim_status ||
            "pending_claim";
          this.applyClaimState(this.selectedMatch, existingStatus);
          this.claimResultMessage =
            data?.message ||
            "You already submitted a claim for this item. Security is reviewing it.";
          setTimeout(() => {
            this.claimResultMessage = "";
          }, 9000);
          this.closeClaimModal();
          await this.loadNotifications();
          return;
        }

        if (!res.ok)
          throw new Error(
            (data && data.message) || "Failed to submit claim request"
          );

        const suggestion =
          data?.suggestion ||
          "Your claim request was submitted. Please visit the Security Office for verification and claiming.";
        this.claimResultMessage = suggestion;
        setTimeout(() => {
          this.claimResultMessage = "";
        }, 9000);

        this.closeClaimModal();
        this.closeMatchModal();
        await this.loadNotifications();
      } catch (err) {
        console.error("❌ Claim failed:", err.message);
        alert(`❌ Claim failed: ${err.message}`);
      } finally {
        this.claiming = false;
      }
    },



    goToProfile() {
      this.showProfileMenu = false;
      this.$router.push("/profile");
    },

    logout() {
      if (this.notificationPollTimer) {
        clearInterval(this.notificationPollTimer);
        this.notificationPollTimer = null;
      }

      if (this.socket) {
        try {
          this.socket.off("newNotification", this.handleNewNotificationEvent);
        } catch (err) {
          console.warn("Failed to remove socket listener on logout:", err);
        }
      }

      disconnectSocket();
      this.socket = null;
      // Remove only authentication-related keys so dashboard lists remain cached locally
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {
        console.warn('Failed to clear auth keys on logout:', e);
      }
      this.$router.push("/login");
    },

  async fetchUserData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Missing authentication token");

        const res = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user data");

        const data = await res.json();
        if (data.profile_picture)
          data.profile_picture = `http://localhost:5000${data.profile_picture.replace(
            /^\/?uploads\//,
            "/uploads/"
          )}`;
        this.user = data;
      } catch (err) {
        console.error("Fetch user data error:", err);
        disconnectSocket();
        // keep cached lists, just remove auth and redirect
        try { localStorage.removeItem('token'); localStorage.removeItem('user'); } catch (e) { console.warn('Failed to remove auth keys during fetchUserData error handling', e); }
        this.$router.push("/login");
      }
    },

    // Load user's claimed items (claims) and marked_returned items, then enrich with item details
    async loadClaimedItems() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.id) return;

        // Fetch both user's claims and their own items marked as returned
        const [claimsRes, itemsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/claims/user/${user.id}`),
          fetch(`http://localhost:5000/api/items?user_id=${user.id}`)
        ]);

        if (!claimsRes.ok || !itemsRes.ok) throw new Error('Failed to fetch claimed items or user items');

        const claimsData = await claimsRes.json();
        const itemsData = await itemsRes.json();

        const claims = Array.isArray(claimsData) ? claimsData : (Array.isArray(claimsData?.value) ? claimsData.value : []);
        // Handle response object { value: [], count: 0 } or direct array
        const allItems = itemsData.value || (Array.isArray(itemsData) ? itemsData : []);

        // Get IDs of items already in claims to avoid duplicates
        const claimedItemIds = new Set(claims.map(c => c.item_id));

        // Filter to get user's own items that have been marked/returned
        // Lost items: status = 'marked_returned' (marked by staff)
        // Found items: status = 'returned' (marked as returned after claimant received it)
        // EXCLUSION LOGIC: Only show these in "Claimed Items" card if the user IS the one who reporter_id matches
        // and we haven't already linked them via a claim.
        const returnedItems = allItems.filter(item => 
          item.reporter_id === user.id &&
          !claimedItemIds.has(item.id) && (
            (item.status === 'marked_returned' && item.type === 'lost') ||
            (item.status === 'returned' && item.type === 'found')
          )
        );

        // Combine claims with returned items
        const combinedItems = [
          ...claims,
          ...returnedItems.map(item => ({
            id: item.id,
            claim_id: null,
            item_id: item.id,
            status: 'marked_returned',
            user_id: user.id,
            created_at: item.created_at,
            _isOwnMarkedItem: true // Flag to identify marked_returned items
          }))
        ];

        // Support both `count` and legacy `Count`
        this.claimedTotal = combinedItems.length;

        // Paginate the combined results client-side
        const pagedClaims = combinedItems.slice(this.claimedOffset, this.claimedOffset + this.claimedLimit);

        // For each claim on the current page, fetch the item details to display name/type
        // Limit concurrent requests to avoid overwhelming the browser/network
        const itemTasks = pagedClaims.map((c) => async () => {
          const itemId = c.item_id;
          if (!itemId) return null;
          try {
            const itemRes = await fetch(`http://localhost:5000/api/items/${encodeURIComponent(itemId)}`);
            if (!itemRes.ok) return null;
            const item = await itemRes.json();
            return {
              claim_id: c.id || c.claim_id || null,
              status: c.status || null,
              user_claim_status: item.user_claim_status || c.status || null,
              item_id: item.id || itemId,
              claimant_id: c.user_id || c.claimant_id || null,
              item_reporter_id: item.reporter_id || null,
              name: item.name || item.display_name || 'Unnamed item',
              type: item.type || item.item_type || 'Item',
              student_id: item.student_id || item.item_student_id || item.studentId || null,
              image_url: item.image_url ? (item.image_url.startsWith('/') ? `http://localhost:5000${item.image_url}` : item.image_url) : null,
              created_at: c.created_at || null,
            };
          } catch (e) {
            console.warn('Failed to fetch item for claim', itemId, e);
            return null;
          }
        });

        // Execute with limited concurrency (max 3 at a time) to prevent browser freeze
        const resolved = await this.runWithConcurrencyLimit(itemTasks, 3);
        const mapped = resolved.filter(Boolean);

        this.claimedItems = mapped;

        // Cache to localStorage so lists persist across logout/login
        try { localStorage.setItem('cached_claimed_items', JSON.stringify(this.claimedItems)); } catch (e) { /* ignore */ }
        console.debug('[UserDashboard] loadClaimedItems: fetched', pagedClaims.length, 'items on page, claimedTotal', this.claimedTotal);
      } catch (err) {
        console.error('❌ Error loading claimed items:', err);
        // Try to load from cache if available
        try {
          const cached = JSON.parse(localStorage.getItem('cached_claimed_items') || 'null');
          if (cached) this.claimedItems = cached;
        } catch (e) { /* ignore */ }
      }
    },

    async loadUserReports() {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) {
          console.debug('[UserDashboard] loadUserReports: no user in localStorage', user);
          return;
        }

        console.debug('[UserDashboard] loadUserReports: fetching reports for user id', user.id);

        const res = await fetch(`http://localhost:5000/api/items?user_id=${user.id}&limit=${this.reportsLimit}&offset=${this.reportsOffset}`);
        if (!res.ok) throw new Error("Failed to fetch user reports");

        const data = await res.json();
        // Backend may return either an array or an object with a `value` array and Count.
        const itemsArray = Array.isArray(data) ? data : Array.isArray(data?.value) ? data.value : [];

        // Map all returned items into a display-friendly shape first (we will filter then paginate)
        const mappedAll = itemsArray.map((it) => {
          const imageUrl = it.image_url
            ? it.image_url.startsWith("/")
              ? `http://localhost:5000${it.image_url}`
              : it.image_url
            : null;

          return {
            id: it.id,
            name: it.name,
            type: it.type,
            status: it.status,
            description: it.description,
            student_id: it.student_id,
            location: it.location,
            image_url: imageUrl,
            created_at: it.created_at
              ? new Date(it.created_at).toLocaleString()
              : null,
          };
        });
        // Filter to pending-like statuses across all returned items, then paginate client-side
        const pendingStatuses = ["", "pending", "reported", "reported_lost", "pending_review", "in_security_custody"];
        const excludedStatuses = ["claimed", "returned", "marked_returned", "confirmed_claim", "delivered"];
        const pendingAll = mappedAll.filter((r) => {
          const statusNormalized = r.status == null ? "" : String(r.status).toLowerCase().trim();
          // Include if status is in pending list AND NOT in excluded list
          return pendingStatuses.includes(statusNormalized) && !excludedStatuses.includes(statusNormalized);
        });

        // Update totals based on pending items so the UI reflects pending-only counts
        this.reportsTotal = pendingAll.length;

        // Slice the pending list according to offset/limit to show up to `reportsLimit` per page
        this.reports = pendingAll.slice(this.reportsOffset, this.reportsOffset + this.reportsLimit);

        // Cache reports to localStorage so they remain visible after logout
        try { localStorage.setItem('cached_user_reports', JSON.stringify(this.reports)); } catch (e) { /* ignore */ }
      } catch (err) {
        console.error("❌ Error loading user reports:", err);
        // Fallback to cached reports if available
        try {
          const cached = JSON.parse(localStorage.getItem('cached_user_reports') || 'null');
          if (cached) this.reports = cached;
        } catch (e) { /* ignore */ }
      }
    },

    // Pagination helpers for reports
    reportsShowingRange() {
      const start = this.reportsTotal === 0 ? 0 : this.reportsOffset + 1;
      const end = Math.min(this.reportsOffset + this.reportsLimit, this.reportsTotal);
      return { start, end };
    },
    async nextReportsPage() {
      console.debug('[UserDashboard] nextReportsPage: before', { offset: this.reportsOffset, limit: this.reportsLimit, total: this.reportsTotal });
      if (this.reportsOffset + this.reportsLimit >= this.reportsTotal) {
        console.debug('[UserDashboard] nextReportsPage: at end, not advancing');
        return;
      }
      this.reportsOffset += this.reportsLimit;
      await this.loadUserReports();
    },
    async prevReportsPage() {
      console.debug('[UserDashboard] prevReportsPage: before', { offset: this.reportsOffset, limit: this.reportsLimit });
      this.reportsOffset = Math.max(0, this.reportsOffset - this.reportsLimit);
      await this.loadUserReports();
    },

    // Pagination helpers for claimed items
    claimedShowingRange() {
      const start = this.claimedTotal === 0 ? 0 : this.claimedOffset + 1;
      const end = Math.min(this.claimedOffset + this.claimedLimit, this.claimedTotal);
      return { start, end };
    },
    async nextClaimedPage() {
      console.debug('[UserDashboard] nextClaimedPage: before', { offset: this.claimedOffset, limit: this.claimedLimit, total: this.claimedTotal });
      if (this.claimedOffset + this.claimedLimit >= this.claimedTotal) {
        console.debug('[UserDashboard] nextClaimedPage: at end, not advancing');
        return;
      }
      this.claimedOffset += this.claimedLimit;
      await this.loadClaimedItems();
    },
    async prevClaimedPage() {
      console.debug('[UserDashboard] prevClaimedPage: before', { offset: this.claimedOffset, limit: this.claimedLimit });
      this.claimedOffset = Math.max(0, this.claimedOffset - this.claimedLimit);
      await this.loadClaimedItems();
    },

    viewReport(report) {
      if (!report?.id) return;
      // Navigate to the report/detail page for this item (LostDetails uses route /lost/:id)
      this.$router.push({ path: `/lost/${report.id}` });
    },

    goToReportDetails(itemId) {
      if (!itemId) return;
      // Navigate to the report details page using the item ID with claimed flag
      this.$router.push({ path: `/lost/${itemId}`, query: { claimed: 'true' } });
    },

    // Handler for claim status notifications
    dismissClaimNotification(notifId) {
      // Mark notification as read (dismiss from view)
      this.notifications = this.notifications.filter(n => n.id !== notifId);
    },

    viewClaimItemDetails(itemId) {
      if (!itemId) return;
      // Navigate to lost/found details page for the claimed item
      this.$router.push({ path: "/lost-details", query: { item_id: itemId } });
    },

    resubmitClaimForItem(itemId) {
      if (!itemId) return;
      // Navigate to lost details where user can view and potentially resubmit claim
      this.$router.push({ path: "/lost-details", query: { item_id: itemId } });
    },
  },
  mounted() {
    // Hydrate immediately from localStorage for faster UI update (will be refreshed by fetch)
    try {
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      if (stored) {
        if (stored.profile_picture && !stored.profile_picture.startsWith('http')) {
          const normalizedPath = stored.profile_picture.replace(/^\/?uploads\//, '/uploads/');
          stored.profile_picture = `http://localhost:5000${normalizedPath}`;
        }
        this.user = stored;
      }
    } catch (e) {
      // ignore parse errors
    }

      // Hydrate cached reports/claimed items so UI is usable even when offline or before network fetch
      try {
        const cachedReports = JSON.parse(localStorage.getItem('cached_user_reports') || 'null');
        if (cachedReports && Array.isArray(cachedReports)) this.reports = cachedReports;
      } catch (e) { /* ignore */ }

      try {
        const cachedClaims = JSON.parse(localStorage.getItem('cached_claimed_items') || 'null');
        if (cachedClaims && Array.isArray(cachedClaims)) this.claimedItems = cachedClaims;
      } catch (e) { /* ignore */ }

    // Fetch user profile first, then load user-specific data (reports & notifications)
    this.fetchUserData()
      .then(async () => {
        await this.loadUserReports();
        await this.loadClaimedItems();
        await this.loadNotifications({ markInitial: true });

        // If route requests showing notifications, open a full-screen notifications view
        try {
          if (this.$route && this.$route.query && (this.$route.query.show_notifications === '1' || this.$route.query.show_notifications === 'true')) {
            this.notificationsFullscreen = true;
            this.showNotifications = true;
          }
        } catch (e) {
          // non-fatal
        }
      })
      .catch((e) => {
        console.warn("Failed to fetch user data at mount:", e);
      });

    // Periodically refresh so matches still appear if realtime events are missed.
    this.notificationPollTimer = setInterval(() => {
      this.loadNotifications({ autoPreview: true });
    }, 10000);

    // Setup Socket.io for realtime notifications (shared singleton)
    try {
      this.socket = initSocket();
      // Attach only the listeners this component needs. Do not disconnect the shared socket on unmount;
      // just remove listeners so other components using the socket are unaffected.
      this.socket.on("newNotification", this.handleNewNotificationEvent);
      this.socket.on("claimApproved", this.handleClaimApprovedEvent);
      this.socket.on("claimRejected", this.handleClaimRejectedEvent);
      this.socket.on("itemClaimed", this.handleItemClaimedEvent);
      this.socket.on("itemReceived", this.handleItemReceivedEvent);
      this.socket.on("itemReturned", this.handleItemReturnedEvent);
      
      // ✅ When socket reconnects, refresh notifications to catch any missed events
      this.socket.on("connect", () => {
        console.log("✅ Socket reconnected, refreshing notifications...");
        this.loadNotifications({ autoPreview: true });
      });
    } catch (e) {
      console.error("Failed to initialize realtime socket:", e);
    }
  },

  watch: {
    // Watch route changes to respond to query toggles for showing fullscreen notifications
    '$route'(to) {
      try {
        if (to && to.query && (to.query.show_notifications === '1' || to.query.show_notifications === 'true')) {
          this.notificationsFullscreen = true;
          this.showNotifications = true;
        } else {
          this.notificationsFullscreen = false;
          // Also ensure the dropdown is closed when navigating away
          this.showNotifications = false;
        }
      } catch (e) {
        // ignore
      }
    }
  },
  beforeUnmount() {
    if (this.notificationPollTimer) {
      clearInterval(this.notificationPollTimer);
      this.notificationPollTimer = null;
    }

    if (this.socket) {
      try {
        this.socket.off("newNotification", this.handleNewNotificationEvent);
        this.socket.off("claimApproved", this.handleClaimApprovedEvent);
        this.socket.off("claimRejected", this.handleClaimRejectedEvent);
        this.socket.off("itemClaimed", this.handleItemClaimedEvent);
        this.socket.off("itemReceived", this.handleItemReceivedEvent);
        this.socket.off("itemReturned", this.handleItemReturnedEvent);
        this.socket.off("connect");
        // Do not call disconnect() on the shared socket here. Other components may still need it.
      } catch (e) {
        // Non-fatal: ignore socket cleanup errors during unmount
        // console.debug("socket cleanup error", e);
      }
    }
  },
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