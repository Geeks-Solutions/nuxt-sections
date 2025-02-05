<template>
  <div class="fieldsets">
    <draggable
      v-model="arrayData"
      :group="{ name: fieldsetGroup }"
      class="array-list-fieldsets"
      :class="draggableClasses"
      handle=".handle"
      animation="200"
      :disabled="dragDisabled"
      ghost-class="ghost"
      @start="drag = true"
      @end="drag = false">
      <transition-group type="transition" :name="!drag ? 'flip-list' : null">
        <div
          v-for="(object, idx) in arrayData"
          :key="`${fieldsetGroup}-fieldset-${idx}`"
          class="flex flex-col"
          :class="mainWrapperClasses"
        >
          <fieldset :class="wrapperClasses">
            <legend :class="legendClasses">
              {{ alterLengendLabel(legendLabel, idx) }}
            </legend>

            <span
              class="controls flexSections sections-flex-row sections-justify-center sections-p-1 rounded-xl sections-top-0 sections-right-2 sections-absolute hide-mobile">
                <DragIcon class="drag-icon handle" />
                <span
                  @click="$emit('remove-fieldset', object, idx)">
                  <TrashIcon class="trash-icon" />
                </span>
            </span>

            <slot :object="object" :idx="idx"></slot>

          </fieldset>
        </div>
      </transition-group>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import AnchorIcon from '../../base/icons/anchor.vue'
import AlertIcon from '../../base/icons/alert.vue'
import TrashIcon from '../../base/icons/trash.vue'
import DragIcon from '../../base/icons/drag.vue'
import EditIcon from '../../base/icons/edit.vue'

export default {
  name: 'FieldSets',
  components: {
    EditIcon, DragIcon, TrashIcon, AlertIcon, AnchorIcon,
    draggable
  },
  props: {
    draggableClasses: {
      type: String,
      default: ''
    },
    mainWrapperClasses: {
      type: String,
      default: ''
    },
    wrapperClasses: {
      type: String,
      default: 'fieldSetStyle border border-solid border-gray-300 p-3 mt-2 relativeSections'
    },
    legendClasses: {
      type: String,
      default: 'w-auto px-16'
    },
    legendLabel: {
      type: String,
      default: ''
    },
    alterLengendLabel: {
      type: Function,
      default: (label, idx) => {
        return `${label} #${idx + 1}:`
      }
    },
    arrayDataPop: {
      type: Array,
      default() {
        return []
      }
    },
    fieldsetGroup: {
      type: String,
      default: ''
    },
    dragDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      drag: false
    }
  },
  computed: {
    arrayData: {
      get() {
        return this.arrayDataPop.map((object, idx) => {
          if (object.id === undefined) {
            return { ...object, id: idx }
          } else {
            return object
          }
        })
      },
      set(newData) {
        this.$emit('array-updated', newData)
      }
    }
  }
}
</script>

<style scoped>
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.fieldsets .controls {
  --tw-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);
  box-shadow: 0 0 rgba(0, 0, 0, 0), 0 0 rgba(0, 0, 0, 0), 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 rgba(0, 0, 0, 0)), var(--tw-ring-shadow, 0 0 rgba(0, 0, 0, 0)), var(--tw-shadow);
  border-width: 1px;
}
.fieldsets .controls svg {
  cursor: pointer;
  color: #31a9db;
  margin: 3px;
}
</style>
