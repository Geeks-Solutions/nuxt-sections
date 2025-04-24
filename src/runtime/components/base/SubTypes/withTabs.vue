<template>
  <div class="tabs-grid">
    <div>
      <div
        @click="activeTab = tab"
        class="section-item"
        v-for="(tab, k) in tabs"
        :key="k"
      >
        <sectionItem :title="tab" :active="activeTab === tab" base />
      </div>
    </div>
    <div>
      <slot :activeTab="activeTab" />
    </div>
  </div>
</template>

<script>
import sectionItem from "./sectionItem.vue";
export default {
  components: {
    sectionItem,
  },
  props: {
    tabs: {
      type: Array,
      default: [""],
    },
  },
  data() {
    return {
      activeTab: this.tabs[0],
    };
  },
  mounted() {
    this.$root.$emit("toggleWithTabs", true);
  },
  destroyed() {
    this.$root.$emit("toggleWithTabs", false);
  },
};
</script>

<style>
.section-item {
  width: 100px;
  height: 100px;
  margin: 10px auto;
}
.tabs-grid {
  display: grid;

  grid-template-columns: 15% 84%;
  min-width: 800px;
}
</style>
