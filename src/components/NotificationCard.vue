<template>
  <div class="bg-white dark:bg-gray-900 p-4 rounded-xl shadow hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
    <h3 class="font-medium text-gray-900 dark:text-white">{{ title }}</h3>
    <p class="text-gray-600 dark:text-gray-400 text-sm">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  message: String
});
</script>