<template>
  <div>
    <div class="flex w-full justify-center ml-2 md:ml-0 translationWrapper">
      <div v-for="(locale, index) in locales" :key="locale" class="translationComponent" :class="[formLang === locale ? 'selectedLang' : 'unselectedLang', index === 0 ? 'roundedLeft' : index === locales.length - 1 ? 'roundedRight' : '']" @click="formLang = locale; $emit('setFormLang', locale)">
        <div v-show="$i18n.locale === locale" class="checkMark">
          <svg xmlns="http://www.w3.org/2000/svg" width="23" height="22" id="check"><g fill="none" fill-rule="evenodd" :stroke="formLang === locale ? '#FFFFFF' : '#03B1C7'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M21 10.07V11a10 10 0 1 1-5.93-9.14"></path><path d="M22 2 11 13l-3-3"></path></g></svg>
        </div>
        <div
          class="SectionsFontLight"
          :class="formLang === locale ? 'SectionsTextWhite' : 'SetionsTextBlue'"
        >
          {{ $t(`${locale}Translation`) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TranslationComponent",
  props: {
    locales: {
      type: Array,
      default() {
        return ['en', 'fr']
      }
    }
  },
  data() {
    return {
      formLang: this.$i18n.locale ? this.$i18n.locale : 'en'
    }
  }
}
</script>

<style scoped>
.translationWrapper {
  margin-top: 6px;
}
.translationComponent {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  background-color: #03B1C7;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  height: 45px;
  display: flex;
}
.selectedLang {
  background-color: #03B1C7;
}
.unselectedLang {
  background: white;
  border-color: #03B1C7;
  border-width: 1px;
}
.roundedRight {
  border-bottom-right-radius: 0.5rem
}
.roundedLeft {
  border-top-left-radius: 0.5rem
}
.SectionsFontLight {
  font-weight: 300;
}
.SectionsTextWhite {
  color: white;
}
.SetionsTextBlue {
  color: #03B1C7;
}
.checkMark {
  margin-right: 8px;
}
</style>
