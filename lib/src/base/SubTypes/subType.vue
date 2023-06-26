<template>
  <div class="sub-types">
    <div>
      <div class="text-video content-wrapper d-flex" v-show="name">
        <TranslationComponent v-if="translationComponentSupport" :locales="locales"  @setFormLang="(locale) => formLang = locale"/>
        <component :is="getComponentForm" :ref="name" :locales="locales" :selectedLang="formLang" :selected-media="selectedMedia" @openMediaModal="$refs.sectionsMediaComponent.openModal()" @closeMediaModal="$refs.sectionsMediaComponent.closeModal()" />
        <MediaComponent ref="sectionsMediaComponent" :sections-user-id="sectionsUserId" @emittedMedia="(media) => selectedMedia = media"></MediaComponent>
      </div>
    </div>
    <button
      class="mt-4 submit-btn"
      type="button"
      @click="sendJsonData"
      :class="{ withTabs }"
    >
      {{ $t('Submit data') }}
    </button>
  </div>
</template>

<script>
import { importComp } from "../../utils";
import TranslationComponent from "../../components/Translations/TranslationComponent";
import MediaComponent from "../../components/Medias/MediaComponent.vue";

export default {
  components: {
    MediaComponent,
    TranslationComponent
  },
  props: {
    name: {
      type: String,
      default: "",
    },
    locales: {
      type: Array,
      default() {
        return ['en', 'fr']
      }
    },
    translationComponentSupport: {
      type: Boolean,
      default: false
    },
    sectionsUserId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      withTabs: false,
      formLang: this.locales[0],
      selectedMedia: null
    };
  },
  computed: {
    getComponentForm() {
      const path = "/forms/" + this.name;
      return importComp(path);
    },
  },
  mounted() {
    this.$root.$on("toggleWithTabs", (val) => {
      this.withTabs = val;
    });
  },
  methods: {
    sendJsonData() {
      const valid = this.$refs[this.name].validate();
      if (!valid) {
        return;
      }
      const settings = this.$refs[this.name].settings;
      this.$emit("addStatic", settings);
    },
  },
};
</script>
<style>
.submit-btn {
  border: none;
  font-size: 24px;

  padding: 7px;
  background: #31a9db;
  color: white;
  border-radius: 16px;
  transition: 0.2s;
  width: 385px;
  height: 70px;
  text-align: center;
}
.submit-btn.withTabs {
  margin-left: 14%;
}
.submit-btn.withTabs:hover {
  background-color: darken(#31a9db, 17%);
  transition: 0.2s;
}
.content-wrapper {
  overflow-y: scroll;
  height: 550px;
}
@media only screen and (max-height: 800px) {
  .content-wrapper {
    overflow-y: scroll;
    height: 450px;
  }
}
</style>
