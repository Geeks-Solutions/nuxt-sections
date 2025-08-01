<template>
  <div class="custom-clickable-tooltip">
    <div class="tooltip-wrapper">
      <span class="tooltip-trigger" @click.stop.prevent="toggleTooltip">
        <slot />
      </span>
      <div
        v-if="isVisible"
        class="tooltip"
        :class="tooltipPosition"
        :style="color ? `background-color: ${color}` : ``"
      >
        {{ content }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from '#imports'

defineOptions({
  name: 'ClickableTooltip'
});

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: 'top',
  },
  color: {
    type: String,
    default: '',
  },
});

const isVisible = ref(false);

const tooltipPosition = computed(() => {
  return `tooltip-${props.position}`;
});

const toggleTooltip = () => {
  isVisible.value = !isVisible.value;
}
</script>

<style scoped>
/* Wrapper to manage the tooltip's position */
.custom-clickable-tooltip .tooltip-wrapper {
  position: relative;
}

/* Tooltip styling */
.custom-clickable-tooltip .tooltip {
  position: absolute;
  background-color: #333;
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}

/* Tooltip positions */
.custom-clickable-tooltip .tooltip-top {
  bottom: 100%;
  right: 0;
}

/* Tooltip positions */
.custom-clickable-tooltip .tooltip-left {
  bottom: 0%;
  right: 100%;
}
</style>
