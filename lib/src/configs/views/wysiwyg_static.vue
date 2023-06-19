<template>
  <div
    class="wys-wrapper view-section-component"
    :class="'mtitle' + html.charAt(2)"
    v-view="viewHandler"
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
        if(this.section.settings[this.lang]) {
          return this.section.settings[this.lang];
        } else return this.section.settings
      }
      return "not found";
    },
  },
  methods: {
    viewHandler(e) {
      this.percenInViewPort = e.percentInView === 0 ? 1 : e.percentInView;
      const percenInViewPort = e.percentInView;
      if (percenInViewPort > 0) {
        this.isVisible = true;
      }
      if (percenInViewPort === 1) {
        this.addOpacity = true;
      }
    },
  },
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
