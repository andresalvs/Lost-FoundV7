<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-8 pb-32">
    <div class="w-full max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 text-center">{{ getPageTitle }}</h1>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block">
          <div class="w-12 h-12 border-4 border-emerald-500 border-t-white rounded-full animate-spin"></div>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mt-4 text-sm">Loading item details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
        <p class="text-red-600 dark:text-red-400 font-semibold text-sm">Failed to load item details</p>
      </div>

      <!-- Content -->
      <div v-else class="space-y-4">
        <!-- Main Card -->
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden">
          <!-- Grid layout: Image left, Details right -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-8">
            <!-- Image Section (Left column) -->
            <div class="md:col-span-1">
              <div class="border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 sticky top-0">
                <img 
                  v-if="imageSrc" 
                  :src="imageSrc" 
                  alt="Item image" 
                  class="w-full h-80 md:h-96 object-cover"
                />
                <div v-else class="w-full h-80 md:h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500">
                  <div class="text-center">
                    <svg class="w-8 h-8 mx-auto mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-xs">No image</span>
                  </div>
                </div>
              </div>
              <p class="text-xs text-red-500 dark:text-red-400 mt-2 text-center font-medium">Visible only to you</p>
            </div>

            <!-- Details Section (Right column) -->
            <div class="md:col-span-2 space-y-6">
              <div>
                <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b-2 border-emerald-500">Item Information</h3>
                <div class="space-y-4">
                  <!-- Name -->
                  <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Name</p>
                    <p class="text-lg font-bold text-gray-900 dark:text-white mt-1">{{ item?.name || 'Unnamed item' }}</p>
                  </div>

                  <!-- For IDs: Student ID -->
                  <div v-if="isId && item?.student_id" class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50">
                    <p class="text-xs text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide">Student ID</p>
                    <p class="text-base font-bold text-gray-900 dark:text-white mt-1">{{ item.student_id }}</p>
                  </div>

                  <!-- For IDs: Department and Course in 2-column grid -->
                  <div v-if="isId" class="grid grid-cols-2 gap-4">
                    <div v-if="item?.department" class="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                      <p class="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wide">Department</p>
                      <p class="text-base font-bold text-gray-900 dark:text-white mt-1">{{ item.department }}</p>
                    </div>
                    <div v-if="item?.course" class="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                      <p class="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wide">Course</p>
                      <p class="text-base font-bold text-gray-900 dark:text-white mt-1 text-sm">{{ item.course }}</p>
                    </div>
                  </div>

                  <!-- For general items: Brand and Color -->
                  <div v-if="!isId" class="grid grid-cols-2 gap-4">
                    <div v-if="item?.brand" class="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                      <p class="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wide">Brand</p>
                      <p class="text-base font-bold text-gray-900 dark:text-white mt-1">{{ item.brand }}</p>
                    </div>
                    <div v-if="item?.color" class="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                      <p class="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wide">Color</p>
                      <p class="text-base font-bold text-gray-900 dark:text-white mt-1">{{ item.color }}</p>
                    </div>
                  </div>

                  <!-- Status -->
                  <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Status</p>
                    <span class="inline-block px-4 py-2 rounded-full text-sm font-bold mt-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                      {{ (item?.status || item?.user_claim_status || 'pending')?.replace(/_/g, ' ')?.split(' ')?.map(word => word.charAt(0).toUpperCase() + word.slice(1))?.join(' ') }}
                    </span>
                  </div>

                  <!-- Location and Date & Time in 2-column grid -->
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                      <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Location</p>
                      <p class="text-base font-bold text-gray-900 dark:text-white mt-1">{{ item?.location || 'N/A' }}</p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                      <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">Date & Time</p>
                      <p class="text-base font-bold text-gray-900 dark:text-white mt-1 text-sm">{{ item?.created_at ? formatDate(item.created_at) : 'N/A' }}</p>
                    </div>
                  </div>

                  <!-- Description -->
                  <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide mb-2">Description</p>
                    <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{{ item?.description || 'N/A' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Back Button -->
          <div class="border-t border-gray-200 dark:border-gray-700 px-6 md:px-8 py-4 flex justify-end">
            <button 
              @click="goBack" 
              class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { initSocket } from '@/socket';

const API_BASE_URL = 'http://localhost:5000';
const route = useRoute();
const router = useRouter();

const item = ref(null);
const loading = ref(true);
const error = ref(null);

const id = route.params.id || route.query.item_id || route.query.itemId;

const fetchItem = async () => {
  loading.value = true;
  error.value = null;
  try {
    if (!id) throw new Error('No item id');
    const res = await fetch(`${API_BASE_URL}/api/items/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    item.value = data.value || data;
  } catch (err) {
    console.error('Failed to load item', err);
    error.value = err;
  } finally {
    loading.value = false;
  }
};

const handleItemUpdated = (updatedItem) => {
  // Refresh item if the updated item matches this item ID
  if (updatedItem && String(updatedItem.id) === String(id)) {
    console.log('[UserReportDetails] Item updated via socket, refreshing...', updatedItem);
    fetchItem();
  }
};

const handleClaimApproved = () => {
  // Refresh item when a claim is approved (might be for this item)
  console.log('[UserReportDetails] Claim approved, refreshing item...');
  fetchItem();
};

onMounted(() => {
  fetchItem();
  
  // Initialize socket connection
  const socket = initSocket();
  
  // Listen for item updates
  socket.on('updateReport', handleItemUpdated);
  socket.on('claimApproved', handleClaimApproved);
  socket.on('refreshDashboard', fetchItem);
});

onUnmounted(() => {
  // Clean up socket listeners
  const socket = initSocket();
  socket.off('updateReport', handleItemUpdated);
  socket.off('claimApproved', handleClaimApproved);
  socket.off('refreshDashboard', fetchItem);
});

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
};

const goBack = () => {
  router.back();
};

// Determine if this item should be shown as an ID (student ID) or a generic Item
const isId = computed(() => {
  if (!item.value) return false;
  const t = (item.value.type || item.value.item_type || '').toString().toLowerCase();
  const name = (item.value.name || '').toString().toLowerCase();
  const sid = (item.value.student_id || item.value.item_student_id || item.value.studentId || '').toString().toLowerCase();

  if (sid) return true;
  if (t.includes('id') || t.includes('student id')) return true;
  if (/^\d{4,}$/.test(name.replace(/[^0-9]/g, ''))) return true;
  if (name.includes('student id') || name.includes('(id)') || name.includes(' id')) return true;
  return false;
});

// Dynamic page title based on item type and status
const getPageTitle = computed(() => {
  if (!item.value) return 'Item Details';
  
  // Get the item type (ID or Item)
  const itemType = isId.value ? 'ID' : 'Item';
  
  // Check if it's claimed based on various status indicators
  const status = (item.value.status || item.value.user_claim_status || '').toString().toLowerCase();
  const isClaimed = status.includes('claim') || status.includes('received') || status.includes('returned') || status.includes('delivered');
  
  if (isClaimed) {
    // If claimed, show "Claimed ID" or "Claimed Item"
    return `Claimed ${itemType}`;
  }
  
  // If not claimed, determine if it's Lost or Found and show the full report title
  const type = (item.value.type || item.value.item_type || 'found').toString().toLowerCase();
  if (type.includes('lost')) {
    return `Lost ${itemType} Report`;
  }
  
  // Default to Found
  return `Found ${itemType} Report`;
});


// Resolve a usable image source from common fields. If the returned value
// is a relative path or filename, prefix with the API base so browser can fetch it.
const imageSrc = computed(() => {
  if (!item.value) return null;
  const candidates = [item.value.image_url, item.value.image, item.value.photo, item.value.imagePath, item.value.image_path];
  const raw = candidates.find(Boolean);
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return `${API_BASE_URL}${raw}`;
  // assume it's a filename stored in uploads
  return `${API_BASE_URL}/uploads/items/${raw}`;
});
</script>
