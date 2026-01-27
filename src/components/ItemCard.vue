<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden cursor-pointer 
           transform transition duration-300 hover:scale-105 hover:shadow-2xl hover:ring-2 hover:ring-yellow-500 dark:hover:ring-yellow-400 border border-gray-200 dark:border-gray-800"
    @click="emitOpen"
  >
    <!-- Image -->
    <img
      :src="item.image"
      alt="Item image"
      class="w-full h-48 object-cover"
    />

    <!-- Content -->
    <div class="p-4">
      <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">{{ item.title }}</h3>
      <p class="text-gray-700 dark:text-gray-300 text-sm ">
        {{ item.description }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(["open"])

function emitOpen() {
  emit("open", props.item)
}
</script>