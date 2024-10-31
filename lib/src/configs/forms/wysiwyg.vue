<template>
  <div>
    <div class="input mt-8">
      <wysiwyg :key="quillKey" ref="myQuillEditor" class="wyzywig" :html="settings[0][selectedLang]" @wysiwygMedia="wysiwygMediaAdded" @settingsUpdate="updateContent" />
	  <span v-if="errors.quill === true && selectedLang === 'en'" class="flexSections sections-required-field-error">{{ $t('requiredField') }}</span>
	</div>
  </div>
</template>
<script>
import wysiwyg from "@geeks.solutions/nuxt-sections/lib/src/components/Editor/wysiwyg";

export default {
  components: {
    wysiwyg
  },
  props: {
    locales: {
      type: Array,
      default() {
        return ['en', 'fr']
      }
    },
    quillKey: {
      type: String,
      default: "quillKey"
    },
    selectedLang: {
      type: String,
      default: 'en'
    }
  },
  data() {
    return {
      settings: [
        {
          en: "",
          fr: ""
        }
      ],
	  errors: {
		quill: false
	  }
    };
  },
  watch: {
    settings: {
      handler(val) {
        if(typeof val === 'string') {
          this.settings = [{}]
          this.locales.forEach(lang => {
            this.settings[0][lang] = ""
          })
          this.settings[0]['en'] = val
        } else if (!Array.isArray(val)) {
          this.settings = [val]
        } else if(Array.isArray(val) && val.length === 0) {
          this.settings = [{}]
        }
      }
    }
  },
  methods: {
    updateContent(content) {
      this.settings[0][this.selectedLang] = content
    },
    wysiwygMediaAdded(media) {
      this.settings.push({
        wysiwygMedia: media,
        wysiwygLang: this.selectedLang
      })
    },
    validate() {
	  this.errors.quill = false
      if (Array.isArray(this.settings)) {
        this.settings.forEach((ob, index) => {
          if (ob.wysiwygLang && this.settings[0][ob.wysiwygLang] !== undefined) {
            if (!this.settings[0][ob.wysiwygLang].includes(ob.wysiwygMedia.url)) {
              this.settings.splice(index, 1)
            }
          }
        })
      }
	  if (!this.settings[0].en) {
		this.errors.quill = true
		return false
	  } else return true;
    }
  }
};
</script>

<style>
.ql-save-format:after {
  content: "Save format";
}

.ql-apply-format:after {
  content: "Apply format";
}

.ql-formats button.ql-save-format {
  width: 100px;
  padding: 0 !important;
}

.ql-formats button.ql-apply-format {
  width: 100px;
  padding: 0 !important;
}
</style>
