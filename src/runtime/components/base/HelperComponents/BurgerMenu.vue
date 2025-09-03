<template>
  <div class="nuxtSections-burger-menu">
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
import { ref, inject, watch } from "#imports"

const menuManager = inject("menuManager") // shared state
const id = Symbol("menuId")               // unique id for this instance
const isOpen = ref(false)

function toggle() {
  if (isOpen.value) {
    isOpen.value = false
    menuManager.current.value = null
  } else {
    menuManager.current.value = id
  }
}

watch(() => menuManager?.current?.value, (val) => {
  isOpen.value = val === id
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
  background: #FFFFFF;
  border-radius: 50%;
}

/* dropdown menu */
.nuxtSections-menu-content {
  min-width: 120px;
  position: absolute;
  z-index: 100;
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
}

</style>
