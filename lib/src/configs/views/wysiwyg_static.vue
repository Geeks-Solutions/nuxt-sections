<template>
  <div
    class="wys-wrapper view-section-component"
    :class="html && html.length > 2 ? 'mtitle' + html.charAt(2) : 'mtitle'"
    v-if="html"
  >
    <div class="ql-editor ql-snow" :class="{ 'slide-up': isVisible }">
      <div v-html="html" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    section: {
      type: Object,
      default: () => {},
    },
    lang: {
      type: String,
      default: "en"
    },
	viewStructure: {
	  settings: [
		{
		  en: 'html',
		  fr: 'html'
		}
	  ]
	}
  },
  data() {
    return {
      percenInViewPort: 0,
      addOpacity: false,
      isVisible: false,
    };
  },
  computed: {
    html() {
      if (this.section.settings) {
        if(Array.isArray(this.section.settings) && this.section.settings.length > 0 && this.section.settings[0][this.lang] !== undefined) {
          return this.section.settings[0][this.lang];
        } else if(this.section.settings[this.lang]) {
          return this.section.settings[this.lang];
        } else return this.section.settings
      }
      return "not found";
    }
  }
};
</script>

<style scoped>
.wys-wrapper {
  width: 87%;
  margin: 0 auto;
}
.wys-wrapper .title {
  max-width: 470px;
}
</style>
