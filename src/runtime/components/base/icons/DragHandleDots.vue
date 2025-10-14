<template>
  <svg width="20" height="20" viewBox="0 0 20 20">
    <circle cx="5" cy="5" r="2" fill="#666"/>
    <circle cx="15" cy="5" r="2" fill="#666"/>
    <circle cx="5" cy="10" r="2" fill="#666"/>
    <circle cx="15" cy="10" r="2" fill="#666"/>
    <circle cx="5" cy="15" r="2" fill="#666"/>
    <circle cx="15" cy="15" r="2" fill="#666"/>
  </svg>
</template>

<script setup>
// Define component props using defineProps
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'currentColor'
  }
});
</script>
