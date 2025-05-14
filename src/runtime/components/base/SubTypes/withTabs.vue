<template>
  <div class="tabs-grid">
    <div>
      <!-- Iterate over tabs -->
      <div
        @click="activeTab = tab"
        class="section-item"
        v-for="(tab, k) in tabs"
        :key="k"
      >
        <!-- Pass props to sectionItem -->
        <LazyBaseSubTypesSectionItem :title="tab" :active="activeTab === tab" base />
      </div>
    </div>
    <div>
      <!-- Pass activeTab to the default slot -->
      <slot :activeTab="activeTab" />
    </div>
  </div>
</template>

<script setup>
import { ref, useNuxtApp, onMounted } from '#imports'

// Props definition
const props = defineProps({
  tabs: {
    type: Array,
    default: () => [], // Use factory function for default array
  },
});

// Reactive state for the active tab, initialized with the first tab if available
const activeTab = ref(props.tabs.length > 0 ? props.tabs[0] : '');
const nuxtApp = useNuxtApp();

// Lifecycle hooks (Removed $root.$emit logic)
onMounted(() => {
  // console.log('withTabs mounted. Previous $root.$emit("toggleWithTabs", true) removed.');
  // If the toggleWithTabs logic is needed, it should be reimplemented
  // using props, provide/inject, or a store (like Pinia).
  nuxtApp.$emit("toggleWithTabs", true);
});

onUnmounted(() => {
  // console.log('withTabs unmounted. Previous $root.$emit("toggleWithTabs", false) removed.');
  nuxtApp.$emit("toggleWithTabs", false);
});

// No methods needed in script setup for this component's current logic
</script>

<style scoped> /* Changed to scoped */
.section-item {
  width: 100px;
  height: 100px;
  margin: 10px auto;
  cursor: pointer; /* Added cursor pointer */
}
.tabs-grid {
  display: grid;
  grid-template-columns: 15% 84%; /* Consider using fr units or more flexible layout */
  gap: 1%; /* Added gap between columns */
  min-width: 800px; /* Consider if this fixed min-width is necessary */
  padding: 10px; /* Added some padding */
}
</style>
