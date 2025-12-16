<template>
  <div class="fieldsets">
    <transition-group type="transition" :name="!drag ? 'flip-list' : null">
      <draggable
        v-model="arrayData"
        :group="{ name: props.fieldsetGroup }"
        class="array-list-fieldsets"
        :class="props.draggableClasses"
        handle=".handle"
        item-key="id"
        animation="200"
        :disabled="props.dragDisabled"
        @start="drag = true"
        @end="drag = false"
      >
        <template #item="{ element: object, index: idx }">
          <div :key="object.id" class="flex flex-col" :class="props.mainWrapperClasses">
            <fieldset :class="props.wrapperClasses">
              <legend :class="props.legendClasses">
                {{ props.alterLengendLabel(props.legendLabel, idx) }}
              </legend>

              <span
                class="controls flexSections sections-flex-row sections-justify-center sections-p-1 rounded-xl sections-top-0 sections-right-2 sections-absolute hide-mobile"
              >
                <LazyBaseIconsDrag class="drag-icon handle" />
                <span @click="emit('remove-fieldset', object, idx)">
                  <LazyBaseIconsTrash class="trash-icon" />
                </span>
              </span>

              <!-- Pass object and idx to the default slot -->
              <slot :object="object" :idx="idx"></slot>
            </fieldset>
          </div>
        </template>
      </draggable>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed } from '#imports'

// --- Props ---
const props = defineProps({
  draggableClasses: {
    type: String,
    default: '',
  },
  mainWrapperClasses: {
    type: String,
    default: '',
  },
  wrapperClasses: {
    type: String,
    default: 'fieldSetStyle border border-solid border-gray-300 p-3 mt-2 relativeSections',
  },
  legendClasses: {
    type: String,
    default: 'w-auto px-16', // Note: Original had px-16, might be large?
  },
  legendLabel: {
    type: String,
    default: '',
  },
  alterLengendLabel: {
    type: Function,
    default: (label, idx) => {
      return `${label} #${idx + 1}:`
    },
  },
  arrayDataPop: {
    // Renamed prop to avoid conflict with computed name
    type: Array,
    default: () => [],
  },
  fieldsetGroup: {
    type: String,
    default: 'default-fieldset-group', // Provide a default group name
  },
  dragDisabled: {
    type: Boolean,
    default: false,
  },
})

// --- Emits ---
const emit = defineEmits(['remove-fieldset', 'array-updated'])

// --- Refs ---
const drag = ref(false)

// --- Computed ---
// Handles getting/setting the array for v-model on draggable
let arrayData = computed({
  get() {
    // Ensure every item has a unique ID for draggable and keys
    return props.arrayDataPop
  },
  set(newData) {
    emit('array-updated', newData)
  },
})
</script>

<style scoped>
/* Add styles for ghost class if needed */
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

/* Add styles for flip-list transition if needed */
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}

/* Scoped styles from original */
.drag-icon,
.trash-icon {
  cursor: pointer;
  margin: 0 5px; /* Add some spacing */
}
.handle {
  cursor: grab;
}
/* Consider adding styles for fieldSetStyle if not global */
.fieldSetStyle {
  /* Example */
  position: relative;
}

/* Hide controls on mobile - adjust breakpoint as needed */
@media (max-width: 768px) {
  .hide-mobile {
    display: none;
  }
}
</style>
