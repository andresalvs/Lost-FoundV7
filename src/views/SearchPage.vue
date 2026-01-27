<template>
  <div
    class="relative min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center pb-32 pt-20 transition-colors duration-200"
  >
    <!-- Back button (top-right) - visible for steps 2, 3 -->
    <button
      v-if="step > 1"
      @click="handleBackClick"
      class="fixed top-6 right-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 z-40 bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
    >
      ← Back
    </button>

    <!-- Header with step indicator -->
    <div class="w-full max-w-4xl px-6 mb-12">
      <div class="flex flex-col gap-4 text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
          <text-balance>Find Your Lost Item</text-balance>
        </h1>
      </div>
      
      <!-- Progress bar -->
      <div class="mt-8 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1">
        <div
          class="bg-emerald-500 h-1 rounded-full transition-all duration-300"
          :style="{ width: `${(step / 3) * 100}%` }"
        ></div>
      </div>

      <!-- Added step progress indicator -->
      <div v-if="step >= 1" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-3">
        <span class="font-medium">Step {{ step }} of 3</span>
      </div>
    </div>

    <!-- Step 1: Choose Category -->
    <div v-if="step === 1" class="w-full max-w-2xl px-6">
      <div class="text-center mb-10">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          What did you lose?
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Select the type of item to help us find it faster
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Redesigned category buttons with better styling and icons -->
        <button
          @click="selectCategory('id')"
          class="p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-900 transition-all duration-200 text-left group"
        >
          <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">🎓</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Student ID</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Scan or enter your ID number</p>
        </button>

        <button
          @click="selectCategory('general')"
          class="p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-gray-900 transition-all duration-200 text-left group"
        >
          <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">📦</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">General Item</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Describe or show your item</p>
        </button>
      </div>
    </div>


    <!-- Step 2: Upload Image for General Items (AI-assisted) -->
    <div
      v-if="step === 2 && searchMethod === 'image' && category === 'general'"
      class="w-full max-w-4xl px-6"
    >
      <div class="mb-8 text-center">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Describe your item with a photo
        </h2>
      </div>

      <!-- Two-column layout matching Student ID format -->
      <div class="flex flex-col items-center max-w-2xl mx-auto">
        <!-- Left column: Upload -->
        <div class="w-full">
          <div class="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer group mb-6">
            <input
              type="file"
              @change="handleImageUpload"
              id="file"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div v-if="!previewImageCurrent" class="py-12">
              <div class="text-4xl mb-3">📷</div>
              <p class="text-gray-900 dark:text-white font-medium">Click or drag to upload</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">PNG, JPG up to 10MB</p>
            </div>
            <div v-else class="relative">
              <img :src="previewImageCurrent" alt="Preview" class="w-full h-64 object-cover rounded-lg" />
            </div>
          </div>

          <button
            type="button"
            @click="resetImageUpload"
            v-if="selectedFileGeneral"
            class="w-full py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors mb-3"
          >
            Clear Image
          </button>

          <div class="mt-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-300 dark:border-yellow-700 rounded mb-6">
            <p class="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> This AI search assistant is not perfect. For better results, please provide a clearer, close-up photo of the item you want to search for.
            </p>
          </div>

          <button
            type="button"
            @click="leftSearchButtonClicked"
            :disabled="!hasSelectedFile || isAnalyzingImage"
            :class="(hasSelectedFile && !isAnalyzingImage)
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'"
            class="w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span v-if="isAnalyzingImage" class="inline-block">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isAnalyzingImage ? 'Analyzing...' : hasSelectedFile ? 'Search Item' : 'Select an image first' }}
          </button>

          <!-- Detected Object Info (Success Case) - now editable -->
          <div v-if="classNames" class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mt-6">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Detected Object</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Edit the name of the item (suggestions available)</p>
              <div class="relative">
                <input
                  ref="detectedInput"
                  v-model="tempDetectedName"
                  @input="filterDetectedSuggestions"
                  @focus="showDetectedSuggestions = true"
                  @blur="hideDetectedSuggestions"
                  type="text"
                  class="w-full bg-transparent border border-emerald-200 rounded-md px-3 py-2 text-lg font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Edit detected name"
                />
                <button
                  type="button"
                  @click.prevent="focusDetectedInput"
                  class="absolute -top-3 -right-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs shadow-sm hover:bg-emerald-700 focus:outline-none"
                  title="Edit detected name"
                >
                  ✏️ Edit
                </button>
                <ul
                  v-if="showDetectedSuggestions && detectedFilteredSuggestions && detectedFilteredSuggestions.length"
                  class="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-40 overflow-y-auto"
                >
                  <li
                    v-for="(sugg, idx) in detectedFilteredSuggestions"
                    :key="`det-sugg-` + idx"
                    @mousedown.prevent="selectDetectedSuggestion(sugg)"
                    class="px-3 py-2 hover:bg-emerald-50 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-200"
                  >
                    {{ sugg }}
                  </li>
                </ul>
              </div>
          </div>

          <!-- Manual Entry Suggestion (Failure Case) -->
          <div v-else-if="errorMessage && !isAnalyzingImage" class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mt-6">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Alternative Option</p>
            <p class="text-sm text-amber-800 dark:text-amber-300 mb-3">Unable to detect the object. Try uploading a clearer image or describe your item manually.</p>
            <button
              type="button"
              @click="switchToManualEntry"
              class="w-full py-2 px-4 rounded-lg font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
            >
              Enter Item Manually
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2B: Upload Student ID Image (QR scan) -->
    <div
      v-if="step === 2 && searchMethod === 'image' && category === 'id'"
      class="w-full max-w-4xl px-6"
    >
      <div class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Scan your Student ID
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Take a clear photo of the QR code on your Student ID
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Upload -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
            ID Photo
          </label>
          <div class="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors cursor-pointer group mb-4">
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div v-if="!previewImageCurrent" class="py-12">
              <div class="text-4xl mb-3">🎓</div>
              <p class="text-gray-900 dark:text-white font-medium">Upload ID photo</p>
            </div>
            <div v-else class="relative">
              <img :src="previewImageCurrent" alt="ID Preview" class="w-full h-64 object-cover rounded-lg" />
            </div>
          </div>

          <button
            type="button"
            @click="resetIdUpload"
            v-if="selectedFileId"
            class="w-full py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Clear Image
          </button>
        </div>

        <!-- QR Results -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Detected Student ID
          </label>
          <div class="space-y-4">
            <!-- Status -->
            <div class="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Scan Status</p>
              <div class="space-y-2">
                <p v-if="isExtractingQR" class="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-2">
                  <span class="animate-spin">⏳</span> Analyzing QR code...
                </p>
                <p v-else-if="qrDetected" class="text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                  <span>✅</span> QR code detected!
                </p>
                <p v-else-if="qrDetectionFailed" class="text-amber-600 dark:text-amber-400 text-sm flex items-center gap-2">
                  <span>⚠️</span> No QR code found
                </p>
                <p v-if="qrErrorMessage" class="text-red-600 dark:text-red-400 text-sm">{{ qrErrorMessage }}</p>
              </div>
            </div>

            <!-- Student ID Input -->
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">Student ID Number</label>
              <input
                v-model="studentId"
                @input="formatStudentId"
                placeholder="e.g. 221-01878"
                class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p v-if="studentId && !isValidStudentId" class="text-red-600 dark:text-red-400 text-sm mt-2">
                ❌ Format: 3 digits + dash + 5 digits
              </p>
            </div>

            <!-- Search Button -->
            <button
              type="button"
              :disabled="isExtractingQR || !studentId || !isValidStudentId"
              @click="performSearch"
              class="w-full py-3 px-4 rounded-lg font-semibold transition-colors"
              :class="(isExtractingQR || !studentId || !isValidStudentId)
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'"
            >
              Search Using Student ID
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2C: Manual Input -->
    <div
      v-if="step === 2 && searchMethod === 'manual'"
      class="w-full max-w-2xl px-6"
    >
      <div class="text-center mb-10">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {{ category === 'id' ? 'Enter Your Student ID' : 'Describe Your Item' }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ category === 'id' ? 'Type your student ID number to search' : 'Tell us what you lost' }}
        </p>
      </div>

      <div class="space-y-6">
        <!-- Student ID Input -->
        <div v-if="category === 'id'">
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Student ID Number
          </label>
          <div class="relative">
            <input
              v-model="studentId"
              @input="formatStudentId"
              placeholder="e.g. 221-01878"
              class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 pr-12 rounded-lg text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <!-- Camera Icon to trigger QR scan -->
            <button
              type="button"
              @click.prevent="switchToImageUpload"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:scale-110 transition-transform"
              title="Scan QR code on ID"
            >
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </button>
          </div>
          <p v-if="studentId && !isValidStudentId" class="text-red-600 dark:text-red-400 text-sm mt-2">
            ❌ Format: 3 digits + dash + 5 digits (e.g. 221-01878)
          </p>
        </div>

        <!-- Item Name Input -->
        <div v-if="category === 'general'" class="relative">
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Item Name
          </label>
          <div class="relative">
            <input
              v-model="itemName"
              @input="filterSuggestions"
              @focus="showSuggestions = true"
              @blur="hideSuggestions"
              placeholder="e.g. Black Umbrella, Silver Laptop"
              class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 pr-12 rounded-lg text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <!-- Camera Icon to trigger photo upload -->
            <button
              type="button"
              @click.prevent="switchToImageUpload"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:scale-110 transition-transform"
              title="Upload photo to describe item"
            >
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </button>
          </div>
          
          <!-- Suggestions Dropdown -->
          <ul
            v-if="showSuggestions && filteredSuggestions && filteredSuggestions.length"
            class="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            <li
              v-for="(suggestion, index) in filteredSuggestions"
              :key="index"
              @mousedown.prevent="selectSuggestion(suggestion)"
              class="px-4 py-3 cursor-pointer hover:bg-emerald-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-300 transition-colors"
            >
              {{ suggestion }}
            </li>
          </ul>
        </div>

        <!-- Search Button -->
        <button
          :disabled="(category === 'id' && !isValidStudentId) || (category === 'general' && !itemName)"
          @click="performSearch"
          class="w-full py-4 px-6 rounded-lg font-semibold transition-colors"
          :class="((category === 'id' && !isValidStudentId) || (category === 'general' && !itemName))
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white'"
        >
          Start Search
        </button>
      </div>
    </div>

    <!-- Step 3: Results -->
    <div v-if="step === 3" class="w-full max-w-6xl px-6">
      <!-- Search Bar (stays at top for new searches) -->
      <div v-if="category === 'general'" class="mb-8 max-w-2xl mx-auto">
        <div class="relative">
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Item Name
          </label>
          <div class="relative">
            <input
              v-model="itemName"
              @input="filterSuggestions"
              @focus="showSuggestions = true"
              @blur="hideSuggestions"
              @keyup.enter="performSearch"
              placeholder="e.g. Black Umbrella, Silver Laptop"
              class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 pr-12 rounded-lg text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <!-- Camera Icon to trigger photo upload -->
            <button
              type="button"
              @click.prevent="switchToImageUpload"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:scale-110 transition-transform"
              title="Upload photo to describe item"
            >
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </button>
          </div>
          
          <!-- Suggestions Dropdown -->
          <ul
            v-if="showSuggestions && filteredSuggestions && filteredSuggestions.length"
            class="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            <li
              v-for="(suggestion, index) in filteredSuggestions"
              :key="index"
              @mousedown.prevent="selectSuggestion(suggestion)"
              class="px-4 py-3 cursor-pointer hover:bg-emerald-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-300 transition-colors"
            >
              {{ suggestion }}
            </li>
          </ul>
        </div>

        <!-- Search Button -->
        <div class="flex justify-center">
          <button
            :disabled="!itemName"
            @click="performSearch"
            class="py-4 px-8 rounded-lg font-semibold transition-colors mt-6"
            :class="!itemName
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'"
          >
            Search
          </button>
        </div>
      </div>

      <div class="text-center mb-12">
        <h2 class="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
          <div v-if="studentId" class="flex flex-col">
            <span>Search Results</span>
            <span class="text-2xl">for {{ studentId }}</span>
          </div>
          <div v-else>Search Results</div>
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ results.length > 0 ? `Found ${results.length} matching item${results.length !== 1 ? 's' : ''}` : noResultsMessage }}
        </p>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block">
          <div class="animate-spin text-4xl mb-4">⏳</div>
          <p class="text-gray-600 dark:text-gray-400">Searching...</p>
        </div>
      </div>

      <!-- Results Grid -->
      <div
        v-if="!loading && results.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
      >
        <!-- Improved result card styling with better visual hierarchy -->
        <div
          v-for="(item, index) in results"
          :key="index"
          class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg dark:hover:shadow-lg/50 transition-shadow duration-300"
        >
          <div class="relative overflow-hidden bg-gray-100 dark:bg-gray-800 h-48">
            <img
              :src="formatImageUrl(item.image_url)"
              alt="Found Item"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 blur-sm"
            />
          </div>
          <div class="p-5">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ item.name }}</h3>
            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <!-- If this result represents a Student ID item, show student details -->
              <template v-if="item.student_id">
                <p class="flex items-center gap-2">
                  <span class="text-emerald-500">🎓</span>
                  <span class="text-gray-900 dark:text-white font-medium">{{ item.name }}</span>
                </p>
                <p class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <span>🎫</span> ID: {{ item.student_id }}
                </p>
                <p class="flex items-center gap-2">
                  <span>📄</span> Type: ID
                </p>
                <p class="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <span>🔒</span> In custody of the security office
                </p>
              </template>

              <!-- Otherwise treat as a general item: show name, brand, and custody status -->
              <template v-else>
                <p class="flex items-center gap-2">
                  <span class="text-amber-500">📦</span> {{ item.name }}
                </p>
                <p v-if="item.brand" class="flex items-center gap-2">
                  <span>🏷️</span> Brand: {{ item.brand }}
                </p>
                <p class="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <span>🔒</span> In custody of the security office
                </p>
              </template>
            </div>
            <div class="mt-4 flex items-center gap-3 px-5">
              <button
                @click="openClaimModal(item)"
                class="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-0.5"
              >
                I want to claim this item
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results Message -->
      <div v-if="!loading && results.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No items found</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-8">{{ noResultsMessage }}</p>
      </div>
    </div>
    
    <!-- Claim Request Modal (uses existing logic in script) -->
    <div
      v-if="showClaimModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4 py-6"
      @click="closeClaimModal"
    >
      <div
        @click.stop
        class="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl animate-fade-in"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Claim Item</h3>
          <button @click="closeClaimModal" class="text-gray-500 hover:text-gray-300">✕</button>
        </div>

        <div class="flex flex-col items-center gap-4 mb-4 text-center">
          <div class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 mx-auto">
            <img v-if="selectedClaimItem && selectedClaimItem.image_url" :src="formatImageUrl(selectedClaimItem.image_url)" alt="item" class="w-full h-full object-cover blur-sm" />
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">You are claiming:</p>
            <p class="font-semibold text-gray-900 dark:text-white">{{ selectedClaimItem && selectedClaimItem.name }}</p>
          </div>
        </div>

        <label class="block text-sm text-gray-700 dark:text-gray-300 mb-2">Message (optional)</label>
        <textarea
          v-model="claimMessage"
          rows="4"
          class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 resize-none mb-3"
          placeholder="Add a short message for the security office (e.g. where you lost it, contact info)"
        ></textarea>

        <div v-if="claimError" class="text-sm text-red-600 dark:text-red-400 mb-3">{{ claimError }}</div>
        <div v-if="claimSuccess" class="text-sm text-green-600 dark:text-green-400 mb-3">{{ claimSuccess }}</div>

        <div class="flex justify-end gap-3">
          <button
            @click="closeClaimModal"
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="submitClaim"
            :disabled="isSubmittingClaim"
            class="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors disabled:opacity-60"
          >
            {{ isSubmittingClaim ? 'Submitting...' : 'Confirm Claim' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Claim Success Modal with Office Hours -->
    <div v-if="showClaimSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4 py-6 overflow-y-auto">
      <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl animate-fade-in my-6">
        <!-- Success Message -->
        <div class="text-center p-6 mb-4 border-b border-gray-200 dark:border-gray-800">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Claim Request Submitted!</h2>
          <p class="text-gray-600 dark:text-gray-300 text-sm">
            Your claim request has been sent to the security office. Please visit the office for verification and claiming of your item.
          </p>
        </div>

        <!-- Office Hours Section -->
        <div class="px-6 pb-6 space-y-4">
          <!-- Today's Hours -->
          <div v-if="officeHours" :class="[
            'p-4 rounded border-l-4',
            isOfficeOpenToday 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-400'
          ]">
            <h3 class="font-semibold mb-3 flex items-center gap-2" :class="[
              isOfficeOpenToday 
                ? 'text-green-900 dark:text-green-100'
                : 'text-amber-900 dark:text-amber-100'
            ]">
              <svg v-if="isOfficeOpenToday" class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.002v6a3 3 0 01-.709 1.938l-5.854 7.381a3 3 0 01-4.474 0L3.172 10.938A3 3 0 012.5 9V3.457a3.066 3.066 0 012.767-3.002z" clip-rule="evenodd" />
              </svg>
              <svg v-else class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {{ isOfficeOpenToday ? '✓ Office is Open Today!' : '⚠ Office is Closed Today' }}
            </h3>
            
            <!-- Today's Hours Display -->
            <div class="p-3 bg-white dark:bg-gray-800 rounded border" :class="[
              isOfficeOpenToday
                ? 'border-green-200 dark:border-green-700'
                : 'border-amber-200 dark:border-amber-700'
            ]">
              <p class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Today ({{ officeHours ? officeHours.todayName : '' }}):</p>
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

          <!-- Close Button -->
          <button
            @click="closeClaimSuccessModal"
            class="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors text-center"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>



<script>
import axios from "axios";
import jsQR from "jsqr";
import Fuse from "fuse.js";

export default {
  name: "SearchPage",
  data() {
    return {
      predictedImage: null, // Holds the base64 image returned by Flask
      errorMessage: '', // Holds any error message
      classNames: '', // Holds the single classname string returned by Flask (top detection)
      detectedConfidence: null, // Confidence value for the returned classname
      step: 1,
      category: null,
      searchMethod: null,
      selectedFile: null,  // Holds the selected file
    // Separate storage for ID vs General uploads
    selectedFileId: null,
    selectedFileGeneral: null,
    previewImageId: null,
    previewImageGeneral: null,
    previewImage: null,
      studentId: "",
      itemName: "",
      results: [],
      loading: false,
      isAnalyzingImage: false,
      showNotifications: false,
      showProfileMenu: false,
      notifications: [],
      user: null,
      reporterId: null,
      sourceItemId: null,
      showSuggestions: false,
      filteredSuggestions: [],
      showDetectedSuggestions: false,
      detectedFilteredSuggestions: [],
      itemSuggestions: [
        "Airpods", "Backpack", "Cap", "Eyeglasses", "Flash Drive", "Handbag",
        "Handheld Mini Fan", "Headphone", "Helmet", "Laptop", "Laptop Briefcase",
        "Laptop Charger", "Motorcycle keys", "Phone Charger", "Powerbank",
        "Scientific Calculator", "Sling bag", "Smart Watch", "Smartphone",
        "Sunglasses", "T-square Ruler", "Tablet", "Tote bag", "Tumbler",
        "Umbrella", "Wallet", "Watch"
      ],
      isExtractingQR: false,
      qrDetected: false,
      qrDetectionFailed: false,
      qrErrorMessage: "",
      // Optional override to force a status param when searching (e.g., 'in_security_custody')
      searchStatusOverride: null,
      // Temporary editable field for detected classname so user can correct it
      tempDetectedName: '',
      showClaimModal: false,
      selectedClaimItem: null,
      claimMessage: "",
      isSubmittingClaim: false,
      claimError: "",
      claimSuccess: "",
      showClaimSuccessModal: false,
      weekSchedule: [],
    };
  },
  computed: {
    unreadNotificationCount() {
      return this.notifications.filter((n) => !n.is_read).length;
    },
    officeHours() {
      if (this.weekSchedule.length === 0) return null;
      const today = new Date();
      const todayIndex = today.getDay();
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const todaySchedule = this.weekSchedule[todayIndex] || {};
      const isOpen = todaySchedule.is_open;
      return {
        today: {
          open: isOpen ? this.formatTime(todaySchedule.opening_time) : "Closed",
          close: isOpen ? this.formatTime(todaySchedule.closing_time) : "-",
        },
        todayName: dayNames[todayIndex]
      };
    },
    isOfficeOpenToday() {
      if (this.weekSchedule.length === 0) return false;
      const today = new Date();
      const todayIndex = today.getDay();
      const todaySchedule = this.weekSchedule[todayIndex] || {};
      return todaySchedule.is_open || false;
    },
    profileInitial() {
      return this.user?.full_name?.[0]?.toUpperCase() || "U";
    },
    isValidStudentId() {
      return /^\d{3}-\d{5}$/.test(this.studentId);
    },
    noResultsMessage() {
      // Show a helpful message depending on what the user searched for
      if (this.category === 'id') {
        return 'Student ID not found in security custody yet.';
      }

      if (this.category === 'general') {
        return 'This object is not found yet.';
      }

      return 'No matching items found.';
    },
    // Shows the preview image for the currently active category
    previewImageCurrent() {
      if (this.category === 'id') return this.previewImageId || null;
      if (this.category === 'general') return this.previewImageGeneral || null;
      return this.previewImage;
    },
    // Whether a file is selected for the active category
    hasSelectedFile() {
      if (this.category === 'id') return !!this.selectedFileId;
      if (this.category === 'general') return !!this.selectedFileGeneral;
      return !!this.selectedFile;
    },
  },
  methods: {
    // Small helper to retry fetch requests for a short period while backend starts
    async fetchWithRetry(url, options = {}, retries = 6, delayMs = 500) {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url, options);
          return res;
        } catch (err) {
          // Only retry on network errors (connection refused). If last try, rethrow.
          if (i === retries - 1) throw err;
          // Wait and retry
          await new Promise((r) => setTimeout(r, delayMs));
          delayMs *= 1.5;
        }
      }
    },

    // Resolve image URLs stored in DB to full backend URLs when needed
    formatImageUrl(url) {
      if (!url) return "";
      // If already absolute or a data URI, return as-is
      if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;

      // Ensure the path starts with a single '/'
      const normalized = url.startsWith("/") ? url : "/" + url;

      // Backend base (matches other files in the project)
      const API_BASE = "http://localhost:5000";

      return `${API_BASE}${normalized}`;
    },

    // Handle form submission
    async submitForm() {
      if (this.category !== 'general') {
        return;
      }
      const fileToUpload = this.selectedFileGeneral;

      if (!fileToUpload) {
        this.errorMessage = 'Please select an image for upload before starting prediction.';
        return;
      }

      this.isAnalyzingImage = true;

      const formData = new FormData();
      formData.append('file', fileToUpload); // Append the selected file
      // include category so backend can differentiate if needed
      formData.append('category', this.category || 'general');

      try {
        const response = await this.fetchWithRetry('http://localhost:8080/predict_qwen', {
          method: 'POST',
          body: formData,
        });

        // If the response is not JSON or not OK, try to show useful message
        let result = null;
        try {
          result = await response.json();
        } catch (e) {
          // Non-JSON response
          result = null;
        }

        if (response.ok) {
          // qwen model returns item metadata (item_name, brand, color, description)
          this.predictedImage = result?.image || null;
          const itemName = result?.item_name || result?.name || '';

          this.classNames = itemName;
          this.tempDetectedName = itemName;
          this.detectedConfidence = null; // not provided by qwen
          // Optionally populate other UI fields if present (if you have inputs for them)
          // (Search page keeps only name by default)
          this.errorMessage = '';
          // Auto-search after successful detection
          if (itemName) {
            this.itemName = itemName;
            // force search to only return items in security custody
            this.searchStatusOverride = 'in_security_custody';
            setTimeout(() => {
              this.performSearch();
            }, 500);
          }
        } else {
          this.predictedImage = null;
          this.classNames = '';
          this.detectedConfidence = null;
          this.tempDetectedName = '';
          // Prefer backend message if present
          this.errorMessage = (result && (result.error || result.message)) || 'Error occurred during prediction';
          console.error('Prediction error response:', result);
        }
      } catch (error) {
        // Network or retry-exhausted
        this.predictedImage = null;
        this.classNames = '';
        this.detectedConfidence = null;
        this.tempDetectedName = '';
        this.errorMessage = 'Could not reach prediction server. Please ensure the model server is running.';
        console.error('Request failed:', error);
      } finally {
        this.isAnalyzingImage = false;
      }
    },
    selectCategory(cat) {
      this.category = cat;
      // For both general items and student IDs, go to step 2 (manual entry first)
      // User can click camera icon to switch to image upload
      this.searchMethod = 'manual';
      this.step = 2;
    },
    handleBackClick() {
      if (this.step === 2) {
        this.step = 1;
        this.category = null;
        this.searchMethod = null;
      } else if (this.step === 3) {
        this.step = 1;
        this.category = null;
        this.searchMethod = null;
        this.results = [];
        this.itemName = '';
        this.studentId = '';
      }
    },
    // (removed) handleDetectionSearch - left button now performs detected-object search
    switchToManualEntry() {
      // Reset the image-based search state and switch to manual entry
      this.resetImageUpload();
      this.searchMethod = 'manual';
      this.step = 2;
    },
    switchToImageUpload() {
      // Switch from manual entry to image upload
      this.searchMethod = 'image';
      this.step = 2;
    },
    formatStudentId() {
      let val = this.studentId.replace(/\D/g, "");
      if (val.length > 3) val = val.slice(0, 3) + "-" + val.slice(3);
      if (val.length > 9) val = val.slice(0, 9);
      this.studentId = val;
    },
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (!file) return;

      if (this.category === 'id') {
        if (this.previewImageId) {
          URL.revokeObjectURL(this.previewImageId);
        }
        this.resetQrState(true);
        this.selectedFileId = file;
        this.previewImageId = URL.createObjectURL(file);
        this.scanQrFromFile(file);
      } else if (this.category === 'general') {
        if (this.previewImageGeneral) {
          URL.revokeObjectURL(this.previewImageGeneral);
        }
        this.selectedFileGeneral = file;
        this.previewImageGeneral = URL.createObjectURL(file);
        // Automatically analyze the image after selecting it for general category
        // (run asynchronously so UI updates immediately)
        setTimeout(() => {
          // only run if a file is still selected and not currently analyzing
          if (this.selectedFileGeneral && !this.isAnalyzingImage) {
            this.submitForm();
          }
        }, 80);
      } else {
        // fallback to generic slot
        if (this.previewImage) {
          URL.revokeObjectURL(this.previewImage);
        }
        this.selectedFile = file;
        this.previewImage = URL.createObjectURL(file);
      }
      // clear previous prediction when a new file is chosen
      this.predictedImage = null;
      this.classNames = '';
      this.tempDetectedName = '';
      this.detectedConfidence = null;
      this.errorMessage = '';
    },

    // Left primary button handler: if detection already present, perform search using detected class.
    // Otherwise, analyze the image then search if detection succeeds.
    async leftSearchButtonClicked() {
      // If category is general and there's a detected class, use it
      if (this.category === 'general' && this.classNames) {
        // prefer user-edited name if provided
        this.itemName = (this.tempDetectedName && this.tempDetectedName.trim()) ? this.tempDetectedName.trim() : this.classNames;
        // force search to only return items in security custody
        this.searchStatusOverride = 'in_security_custody';
        this.performSearch();
        return;
      }

      // If no file selected, do nothing
      if (!this.hasSelectedFile) return;

      // If an analysis is in progress, wait for it to finish
      if (this.isAnalyzingImage) return;

      // Trigger analysis first
      try {
        await this.submitForm();
      } catch (err) {
        // submitForm handles its own errors; swallow here
      }

      // After analysis, if we have a detected classname, search for it
      if (this.classNames) {
        this.itemName = this.classNames;
        // force search to only return items in security custody
        this.searchStatusOverride = 'in_security_custody';
        this.performSearch();
      }
    },
    async readFileAsDataURL(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result);
        reader.onerror = () => reject(new Error('Failed to read file as data URL'));
        reader.readAsDataURL(file);
      });
    },
    async scanQrFromFile(file) {
      this.isExtractingQR = true;
      this.qrDetected = false;
      this.qrDetectionFailed = false;
      this.qrErrorMessage = '';

      try {
        const dataUrl = await this.readFileAsDataURL(file);
        const qrRawData = await this.extractQRFromImage(dataUrl);

        if (qrRawData) {
          const extractedId = this.extractStudentIdFromQR(qrRawData);
          if (extractedId) {
            this.studentId = extractedId;
            this.qrDetected = true;
            // Auto-search after successful QR detection
            setTimeout(() => {
              this.performSearch();
            }, 500);
          } else {
            this.qrDetectionFailed = true;
            this.qrErrorMessage = 'QR detected but no valid student ID was found.';
          }
        } else {
          this.qrDetectionFailed = true;
          this.qrErrorMessage = 'No QR code detected in the image.';
        }
      } catch (error) {
        console.error('Error scanning QR:', error);
        this.qrDetectionFailed = true;
        this.qrErrorMessage = 'Unable to process the image. Please try another photo.';
      } finally {
        this.isExtractingQR = false;
      }
    },
    async extractQRFromImage(imageDataUrl) {
      // Multi-pass QR extraction: scale, rotate, crop (right-side), and contrast-pass.
      const loadImage = (src) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Failed to load image for QR extraction'));
          img.crossOrigin = 'anonymous';
          img.src = src;
        });

      const createCanvas = (w, h) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return c;
      };

      const tryJsQROnCtx = (ctx, w, h) => {
        try {
          const imageData = ctx.getImageData(0, 0, w, h);
          const qr = jsQR(imageData.data, imageData.width, imageData.height);
          return qr?.data || null;
        } catch (e) {
          return null;
        }
      };

      const drawRotated = (img, angleDeg, targetW, targetH) => {
        const rad = (angleDeg * Math.PI) / 180;
        const canvas = createCanvas(targetW, targetH);
        const ctx = canvas.getContext('2d');
        // center & rotate
        ctx.translate(targetW / 2, targetH / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
        return { canvas, ctx };
      };

      const drawScaled = (img, scale) => {
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = createCanvas(w, h);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        return { canvas, ctx };
      };

      const enhanceContrast = (ctx, w, h, contrast = 30) => {
        try {
          const imageData = ctx.getImageData(0, 0, w, h);
          const data = imageData.data;
          // contrast adjustment - linear contrast
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          for (let i = 0; i < data.length; i += 4) {
            for (let c = 0; c < 3; c++) {
              const v = data[i + c];
              let nv = factor * (v - 128) + 128;
              if (nv < 0) nv = 0;
              if (nv > 255) nv = 255;
              data[i + c] = nv;
            }
          }
          ctx.putImageData(imageData, 0, 0);
        } catch (e) {
          // ignore
        }
      };

      try {
        const img = await loadImage(imageDataUrl);

        // Limit maximum dimension to speed up and avoid huge canvases
        const MAX_DIM = 1200;
        const scaleToFit = Math.min(1, MAX_DIM / Math.max(img.width, img.height));

        // Helper: attempt jsqr on a canvas and return data or null
        const attemptOnCanvas = (canvas) => {
          const ctx = canvas.getContext('2d');
          if (!ctx) return null;
          return tryJsQROnCtx(ctx, canvas.width, canvas.height);
        };

        // 1) Try scaled full image
        const full = drawScaled(img, scaleToFit);
        let result = attemptOnCanvas(full.canvas);
        if (result) return result;

        // 2) Try rotations (90,180,270) on scaled image
        const angles = [90, 180, 270];
        for (const a of angles) {
          // For rotation, create canvas with swapped dims when 90/270
          const targetW = a % 180 === 0 ? full.canvas.width : full.canvas.height;
          const targetH = a % 180 === 0 ? full.canvas.height : full.canvas.width;
          const { canvas, ctx } = drawRotated(full.canvas, a, targetW, targetH);
          result = tryJsQROnCtx(ctx, canvas.width, canvas.height);
          if (result) return result;
        }

        // 3) Try crops around right side (where ID QR is typically located)
        const crops = [0.45, 0.35, 0.25]; // fractions of width to take from right
        for (const frac of crops) {
          const w = Math.round(full.canvas.width * frac);
          // right-side crop
          const cropCanvas = createCanvas(w, full.canvas.height);
          const cropCtx = cropCanvas.getContext('2d');
          cropCtx.drawImage(full.canvas, full.canvas.width - w, 0, w, full.canvas.height, 0, 0, w, full.canvas.height);
          // Try on original crop
          result = tryJsQROnCtx(cropCtx, cropCanvas.width, cropCanvas.height);
          if (result) return result;
          // Try scaled up crop (to make QR modules larger)
          const scaledUp = createCanvas(Math.min(MAX_DIM, w * 2), Math.min(MAX_DIM, full.canvas.height * 2));
          const upCtx = scaledUp.getContext('2d');
          upCtx.drawImage(cropCanvas, 0, 0, scaledUp.width, scaledUp.height);
          result = tryJsQROnCtx(upCtx, scaledUp.width, scaledUp.height);
          if (result) return result;
          // Try contrast-enhanced crop
          enhanceContrast(cropCtx, cropCanvas.width, cropCanvas.height, 40);
          result = tryJsQROnCtx(cropCtx, cropCanvas.width, cropCanvas.height);
          if (result) return result;
        }

        // 4) As a last effort, try center crop and contrast pass
        const centerFrac = 0.6;
        const cw = Math.round(full.canvas.width * centerFrac);
        const ch = Math.round(full.canvas.height * centerFrac);
        const centerCanvas = createCanvas(cw, ch);
        const centerCtx = centerCanvas.getContext('2d');
        centerCtx.drawImage(full.canvas, Math.round((full.canvas.width - cw) / 2), Math.round((full.canvas.height - ch) / 2), cw, ch, 0, 0, cw, ch);
        enhanceContrast(centerCtx, cw, ch, 35);
        result = tryJsQROnCtx(centerCtx, cw, ch);
        if (result) return result;

        // nothing found
        return null;
      } catch (err) {
        console.warn('extractQRFromImage failed:', err);
        return null;
      }
    },
    extractStudentIdFromQR(qrText) {
      if (!qrText) return null;
      const patterns = [
        /(\d{3}-\d{5})/,
        /CSU[-\s]?(\d{3}-\d{5})/i,
        /ID[:\s]?(\d{3}-\d{5})/i,
        /Student[:\s]?(\d{3}-\d{5})/i,
        /(\d{8})/,
      ];

      for (const pattern of patterns) {
        const match = qrText.match(pattern);
        if (match) {
          let studentId = match[1];
          if (studentId.length === 8 && !studentId.includes('-')) {
            studentId = `${studentId.substring(0, 3)}-${studentId.substring(3)}`;
          }
          return studentId;
        }
      }

      return null;
    },
    // Fuzzy search using Fuse.js - handles typos, fuzzy matching, and weighted field searching
    fuzzySearchItems(searchTerm, items) {
      if (!searchTerm || !items || items.length === 0) return items;
      
      // Configure Fuse.js options for optimal search
      const fuseOptions = {
        // Field weighting - name is most important, then brand, color, description
        keys: [
          { name: 'name', weight: 0.4 },      // 40% weight - item name is primary
          { name: 'brand', weight: 0.3 },     // 30% weight - brand is important
          { name: 'color', weight: 0.2 },     // 20% weight - color helps narrow down
          { name: 'description', weight: 0.1 } // 10% weight - description for context
        ],
        // Threshold for matching (0 = exact, 1 = match anything)
        // 0.3 = good balance between strict and loose matching
        threshold: 0.3,
        // Enable distance-based ranking
        includeScore: true,
        // Ignore location preference for better typo matching
        ignoreLocation: true,
        // Minimum match length to avoid random matches
        minMatchCharLength: 2,
        // Use extended search syntax for better pattern matching
        useExtendedSearch: false
      };
      
      try {
        // Create Fuse instance with items
        const fuse = new Fuse(items, fuseOptions);
        
        // Search and get results
        const results = fuse.search(searchTerm);
        
        // Return items sorted by relevance score (lower score = better match)
        return results
          .sort((a, b) => a.score - b.score)
          .map(result => result.item);
      } catch (error) {
        // Fallback if Fuse fails
        console.error('Fuse search error:', error);
        return items;
      }
    },

    filterSuggestions() {
      const input = this.itemName.toLowerCase();
      this.filteredSuggestions = this.itemSuggestions.filter((item) =>
        item.toLowerCase().includes(input)
      );
    },
    filterDetectedSuggestions() {
      const input = (this.tempDetectedName || '').toLowerCase();
      this.detectedFilteredSuggestions = this.itemSuggestions.filter((item) =>
        item.toLowerCase().includes(input)
      );
    },
    selectDetectedSuggestion(suggestion) {
      this.tempDetectedName = suggestion;
      this.showDetectedSuggestions = false;
    },
    hideDetectedSuggestions() {
      setTimeout(() => (this.showDetectedSuggestions = false), 150);
    },
    focusDetectedInput() {
      // focus the detected-name input for quicker editing
      try {
        this.$refs.detectedInput && this.$refs.detectedInput.focus();
      } catch (e) {
        // ignore
      }
    },
    selectSuggestion(suggestion) {
      this.itemName = suggestion;
      this.showSuggestions = false;
    },
    hideSuggestions() {
      setTimeout(() => (this.showSuggestions = false), 150);
    },
    async performSearch() {
      // Clear previous errors and show loading UI
      this.errorMessage = '';
      this.loading = true;
      this.results = [];

      // Move to results area so user sees searching state
      this.step = 3;

      try {
        // Validate inputs based on selected category
        if (this.category === 'id') {
          if (!this.isValidStudentId) {
            this.errorMessage = 'Invalid Student ID format. Use XXX-XXXXX.';
            this.loading = false;
            return;
          }

          // Send both studentId and legacy query to be robust
          const params = { studentId: this.studentId, query: this.studentId };
          if (this.sourceItemId) params.source_item_id = this.sourceItemId;
          const reporterId = this.reporterId || this.user?.id;
          if (reporterId) params.reporter_id = reporterId;
          // Include status override if present
          if (this.searchStatusOverride) params.status = this.searchStatusOverride;
          const resp = await axios.get('http://localhost:5000/api/items/search', {
            params,
          });

          this.results = resp.data || [];
          return;
        }

        if (this.category === 'general') {
          if (!this.itemName || !this.itemName.trim()) {
            this.errorMessage = 'Please enter an item name to search.';
            this.loading = false;
            return;
          }

          // Send itemName param so backend can filter by item name
          const trimmed = this.itemName.trim();

          // Send both itemName (new param) and query (legacy) to be robust while debugging
          const params = { itemName: trimmed, query: trimmed };
          if (this.sourceItemId) params.source_item_id = this.sourceItemId;
          const reporterId = this.reporterId || this.user?.id;
          if (reporterId) params.reporter_id = reporterId;
          // Include status override if present
          if (this.searchStatusOverride) params.status = this.searchStatusOverride;
          const resp = await axios.get('http://localhost:5000/api/items/search', {
            params,
          });
          
          // Apply fuzzy search logic to enhance results
          let rawResults = resp.data || [];
          
          // If we got results, apply fuzzy matching across all fields to improve relevance
          if (rawResults.length > 0) {
            this.results = this.fuzzySearchItems(trimmed, rawResults);
            
            // If fuzzy filtering removed results, fall back to raw results sorted by date
            if (this.results.length === 0) {
              this.results = rawResults;
              console.warn('Fuzzy search filtered all results; showing raw backend results instead');
            }
          } else {
            this.results = rawResults;
          }
          
          return;
        }

        // Fallback: no category selected
        this.errorMessage = 'Please select a category and search method.';
      } catch (err) {
        console.error('Error searching items:', err);
        // Prefer backend message if present
        if (err.response && err.response.data && err.response.data.message) {
          this.errorMessage = err.response.data.message;
        } else {
          this.errorMessage = 'An error occurred while searching. Please try again.';
        }
      } finally {
        // clear override after search so subsequent searches are normal
        this.searchStatusOverride = null;
        this.loading = false;
      }
    },
    resetSearch() {
      this.step = 1;
      this.category = null;
      this.searchMethod = null;
      // clear both upload states
      if (this.previewImageId) {
        URL.revokeObjectURL(this.previewImageId);
      }
      if (this.previewImageGeneral) {
        URL.revokeObjectURL(this.previewImageGeneral);
      }
      if (this.previewImage) {
        URL.revokeObjectURL(this.previewImage);
      }
      this.previewImage = null;
      this.previewImageId = null;
      this.previewImageGeneral = null;
      this.selectedFile = null;
      this.selectedFileId = null;
      this.selectedFileGeneral = null;
      this.studentId = "";
      this.itemName = "";
      this.results = [];
      this.predictedImage = null;
      this.classNames = '';
      this.tempDetectedName = '';
      this.detectedConfidence = null;
      this.errorMessage = '';
      this.resetQrState(true);
    },
    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
    },
    goToProfile() {
      this.$router.push("/profile");
    },
    logout() {
      localStorage.clear();
      this.$router.push("/login");
    },
    resetQrState(clearStudentId = false) {
      this.isExtractingQR = false;
      this.qrDetected = false;
      this.qrDetectionFailed = false;
      this.qrErrorMessage = '';
      if (clearStudentId) {
        this.studentId = '';
      }
    },
    resetIdUpload() {
      if (this.previewImageId) {
        URL.revokeObjectURL(this.previewImageId);
      }
      this.previewImageId = null;
      this.selectedFileId = null;
      this.resetQrState(true);
    },
    resetImageUpload() {
      if (this.previewImageGeneral) {
        URL.revokeObjectURL(this.previewImageGeneral);
      }
      this.previewImageGeneral = null;
      this.selectedFileGeneral = null;
      this.predictedImage = null;
      this.classNames = '';
      this.tempDetectedName = '';
      this.detectedConfidence = null;
      this.errorMessage = '';
    },
    openClaimModal(item) {
      this.selectedClaimItem = item;
      this.claimMessage = "";
      this.claimError = "";
      this.claimSuccess = "";
      this.showClaimModal = true;
    },
    closeClaimModal() {
      this.showClaimModal = false;
      this.selectedClaimItem = null;
      this.claimMessage = "";
      this.claimError = "";
      this.claimSuccess = "";
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
      } catch (err) {
        console.error("Failed to load office hours:", err);
        this.weekSchedule = [];
      }
    },
    closeClaimSuccessModal() {
      this.showClaimSuccessModal = false;
      this.resetSearch();
    },
    async submitClaim() {
      if (!this.selectedClaimItem || !this.user) {
        this.claimError = "Unable to process claim at this time.";
        return;
      }

      this.isSubmittingClaim = true;
      this.claimError = "";
      this.claimSuccess = "";

      try {
        const itemId = this.selectedClaimItem.id;
        const API_BASE = "http://localhost:5000";

        // Submit claim directly to the claims route (same flow as NotificationsPage.vue)
        const claimRes = await axios.post(`${API_BASE}/api/claims`, {
          user_id: this.user.id,
          item_id: itemId,
          // No existing notification id in this flow
          notification_id: null,
          message: this.claimMessage || null,
        });

        if (claimRes.status === 201 || claimRes.status === 200) {
          // Load office hours before showing success modal
          await this.loadOfficeHours();
          this.showClaimModal = false;
          this.showClaimSuccessModal = true;
        } else {
          this.claimError = claimRes.data?.message || "Failed to submit claim.";
        }
      } catch (err) {
        console.error("Error submitting claim:", err);
        const errorMsg = err?.response?.data?.message || err.message || "Failed to submit claim.";
        this.claimError = errorMsg;
      } finally {
        this.isSubmittingClaim = false;
      }
    },
  },
  watch: {
    "$route.query"(next = {}) {
      if (next.source_item_id || next.sourceItemId) {
        this.sourceItemId = next.source_item_id || next.sourceItemId;
      }
      if (next.reporter_id || next.reporterId) {
        this.reporterId = next.reporter_id || next.reporterId;
      }
    },
  },
  async mounted() {
    // Restore authenticated context so the search API knows who is searching.
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (storedUser) {
        this.user = storedUser;
        if (!this.reporterId && storedUser.id) {
          this.reporterId = storedUser.id;
        }

        // Fetch profile data including profile picture
        try {
          const response = await axios.get(`http://localhost:5000/api/profile/${storedUser.id}`);
          if (response.data) {
            // Update user data with profile information including profile picture
            this.user = { ...storedUser, ...response.data };
            // Update localStorage with the new user data including profile picture
            localStorage.setItem("user", JSON.stringify(this.user));
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      }
    } catch (err) {
      console.error("Failed to parse stored user:", err);
    }

    // Accept both snake_case and camelCase query params for flexibility.
    const query = this.$route?.query || {};
    this.sourceItemId =
      query.source_item_id || query.sourceItemId || this.sourceItemId;
    this.reporterId =
      query.reporter_id || query.reporterId || this.reporterId;
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
