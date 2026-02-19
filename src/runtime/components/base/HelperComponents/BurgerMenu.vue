<template>
  <div :id="menuId" ref="menuRef" class="nuxtSections-burger-menu">
    <div class="cursor-pointer select-none" @click="toggle">
      <slot name="trigger">
        <button class="hp-button" type="button">
          <div class="dots-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </slot>
    </div>

    <div v-show="isOpen" class="nuxtSections-menu-content">
      <slot name="content" />
    </div>
  </div>
</template>

<script setup>
import { ref, inject, watch, onMounted, onBeforeUnmount, computed } from '#imports'

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
})

const menuManager = inject('menuManager') // shared state
const internalId = Symbol('menuId') // unique id for this instance
const menuId = computed(() => props.id || null)
const isOpen = ref(false)
const menuRef = ref(null)

function toggle() {
  if (isOpen.value) {
    isOpen.value = false
    menuManager.current.value = null
  } else {
    menuManager.current.value = internalId
  }
}

watch(
  () => menuManager?.current?.value,
  (val) => {
    isOpen.value = val === internalId
  }
)

// Close on outside click
function handleClickOutside(event) {
  if (isOpen.value && menuRef.value && !menuRef.value.contains(event.target)) {
    isOpen.value = false
    menuManager.current.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.nuxtSections-burger-menu {
  position: relative;
  display: inline-block;
}

/* default vertical dots icon */
.dots-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 24px;
  height: 24px;
}
.dots-icon span {
  display: block;
  width: 4px;
  height: 4px;
  max-width: 4px;
  max-height: 4px;
  background: #ffffff;
  border-radius: 50%;
}

/* dropdown menu */
.nuxtSections-menu-content {
  min-width: 120px;
  position: absolute;
  z-index: 100;
  background: white;
  border-radius: 16px;
}

.nuxtSections-burger-menu.settings .nuxtSections-menu-content {
  right: 0;
  justify-items: flex-end;
}

@media screen and (max-width: 768px) {
  .nuxtSections-menu-content {
    right: 0;
    justify-items: flex-end;
  }
  .pages-list .nuxtSections-menu-content {
    right: unset !important;
    justify-items: start !important;
  }
}
</style>
