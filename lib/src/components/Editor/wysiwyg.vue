<template>
  <div>
    <gWysiwyg :html="html" :auth-token="$cookies.get('sections-auth-token')" :project-id-prop="$sections.projectId" :sections-user-id="null" :server-url="$sections.serverUrl" :selected-media-id="$route.query.id" :media-translation-prefix="'mediaComponent.'" @wysiwygMedia="(media) => $emit('wysiwygMedia', media)" @settingsUpdate="(content) => $emit('settingsUpdate', content)"/>
    <span v-if="htmlError" :class="htmlErrorClass">{{ htmlError }}</span>
    <div class="flex flex-col items-start justify-start mt-8">
      <label class="mr-4 font-medium">{{ $t("forms.cssClasses") }}</label>
      <span class="text-xs text-Gray_800">{{ $t("forms.cssClassesDesc") }}</span>
      <span class="text-xs text-Gray_800 pb-1">{{ $t("forms.cssClassesDesc2") }}</span>
      <input
        v-model="cssClasses"
        type="text"
        value=""
        :placeholder="$t('forms.cssClasses')"
        class="cssClassesInput"
        @input="(v) => $emit('cssClassesChanged', v.target.value)"
      />
    </div>
  </div>
</template>
<script>

export default {
  props: {
    html: {
      type: String,
      default: ""
    },
    cssClassesProp: {
      type: String,
      default: ""
    },
    htmlError: {
      type: String,
      default: ""
    },
    htmlErrorClass: {
      type: String,
      default: "sections-required-field-error"
    }
  },
  data() {
    return {
      cssClasses: ""
    }
  },
  watch: {
    cssClassesProp: {
      handler(v) {
        this.cssClasses = v
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
