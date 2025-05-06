<template>
  <div class="item text-center" :class="{ active }">
    <div class="card-content" :class="{'card-content-preview': (sectionData && sectionData.type === 'local') || (sectionData && sectionData.settings) || (sectionData && sectionData.render_data)}">
      <div v-if="(sectionData && sectionData.type === 'local') || (sectionData && sectionData.settings) || (sectionData && sectionData.render_data)" class="comp-preview">
        <!-- Use Vue's built-in component tag for dynamic components -->
		<component
			 :is="componentItem"
			 :section="sectionData"
			 :lang="lang"
			 :locales="locales"
		/>
      </div>
      <div v-else class="p3 text-capitalize px-1">
        <!-- Call formatTexts directly in the template -->
        {{ formatTexts(title, " ") }}
      </div>
    </div>
  </div>
</template>

<script setup>

// Define component props using defineProps
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  active: {
    type: Boolean,
    default: true,
  },
  view: {
    type: Object,
    default: () => ({}), // Default factory function for objects
  },
  section: {
    type: Object,
    default: () => ({}), // Default factory function for objects
  },
  lang: {
    type: String,
    default: "en"
  },
  locales: {
    type: Array,
    default: () => [] // Default factory function for arrays
  },
  componentItem: {
    type: [String, Object], // Can be a component name string or the component object itself
    required: true,
  }
});

const sectionData = props.section
</script>

<style scoped>
.item {
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
  background: #adadad;
}
.item.active {
  background: #31a9db;
  transition: 0.2s;
}
.item.active:hover {
  transition: 0.2s;
  background: darken(#31a9db, 10%);
}
.icon svg {
  color: white;
  fill: white;
  min-width: 60px;
  height: 60px;
}
.card-content {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: auto;
  align-content: center;
}
.card-content .comp-preview {
  position: absolute;
  width: 1736px;
  top: 0;
  left: 0;
  overflow: hidden;
  transform: scale(0.188);
  transform-origin: top left;
  pointer-events: none;
  color: initial;
  background: white;
  padding: 20px 0;
}
.card-content-preview {
  background: white;
}
</style>
