<template>
  <div class="input">
    <quill-editor :key="quillKey" ref="myQuillEditor" v-model="settings" :options="options" class="wyzywig" />
    <MediaComponent ref="sectionsMediaComponent" :sections-user-id="null" @emittedMedia="(media) => selectedMedia = media"></MediaComponent>
  </div>
</template>
<script>
import "quill/dist/quill.snow.css";

import { quillEditor } from "vue-quill-editor";
import * as Emoji from "quill-emoji";
import Quill from 'quill';
Quill.register("modules/emoji", Emoji);
import MediaComponent from "@geeks.solutions/nuxt-sections/lib/src/components/Medias/MediaComponent.vue";

/* eslint-disable camelcase */

export default {
  components: {
    quillEditor,
    MediaComponent
  },
  props: {
    html: {
      type: String,
      default: ""
    },
    quillKey: {
      type: String,
      default: "quillKey"
    },
    editorOptions: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      settings: "",
      savedFormat: null,
      selectedMedia: null,
      options: null
    };
  },
  watch: {
    settings() {
      this.$emit('settingsUpdate', this.settings)
    },
    html: {
      handler() {
        this.settings = this.html
      },
      deep: true,
      immediate: true
    },
    selectedMedia(mediaObject) {
      const media = {
        media_id: "",
        url: "",
        seo_tag: "",
        files: [
          {
            filename: "",
            url: ""
          }
        ],
        headers: {}
      };
      media.files[0].url = mediaObject.files[0].url;
      media.files[0].filename = mediaObject.files[0].filename;
      media.media_id = mediaObject.id;
      media.url = mediaObject.files[0].url;
      media.seo_tag = mediaObject.seo_tag;
      if (mediaObject.files[0].headers) {
        media.headers = mediaObject.files[0].headers
      }
      const range = this.$refs.myQuillEditor.quill.getSelection();
      this.$refs.myQuillEditor.quill.insertEmbed(range ? range.index : 0, 'image', media.url);
      this.$emit('wysiwygMedia', media);
      this.$refs.sectionsMediaComponent.closeModal()
    }
  },
  created() {
    if(this.editorOptions.modules) {
      this.options = this.editorOptions
    } else if(this.$sections.wysiwygEditorOptions) {
      this.options = this.$sections.wysiwygEditorOptions
    } else {
      this.options = {
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['link'],
            ['blockquote', 'code-block'],

            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
            [{ 'direction': 'rtl' }],                         // text direction

            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

            [{ 'color': ['#03B1C7', '#61035B', '#fff', '#868686', '#011321'] }, { 'background': ['#03B1C7', '#61035B', '#fff', '#868686', '#011321'] }],          // dropdown with defaults from theme
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['emoji'],
            ['image'],
            ["save-format", "apply-format"],
          ],
          "emoji-toolbar": true,
          "emoji-textarea": true,
          "emoji-shortname": true,
        }
      }
    }
  },
  mounted() {
    this.$refs.myQuillEditor.quill.getModule('toolbar').addHandler('image', () => {
      this.uploadFunction();
    });

    var saveButtons = document.querySelectorAll('.ql-save-format');
    saveButtons.forEach((saveButton) => {
      saveButton.addEventListener('click', () => {
        this.saveFormat()
      });
    })

    var applyButtons = document.querySelectorAll('.ql-apply-format');
    applyButtons.forEach((applyButton) => {
      applyButton.addEventListener('click', () => {
        this.applyFormat()
      });
    })
  },
  methods: {
    validate() {
      return true;
    },
    uploadFunction() {
      this.$refs.sectionsMediaComponent.openModal(null, null)
    },
    saveFormat() {
      const selection = this.$refs.myQuillEditor.quill.getSelection();
      if (selection) {
        const savedFormat = JSON.stringify(this.$refs.myQuillEditor.quill.getFormat(selection));
        this.$cookies.set('sections-quill-format', savedFormat);
      }
    },
    applyFormat() {
      const selection = this.$refs.myQuillEditor.quill.getSelection();
      const savedFormat = this.$cookies.get('sections-quill-format');

      if (selection && savedFormat) {
        this.$refs.myQuillEditor.quill.formatText(selection.index, selection.length, savedFormat);
      }
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
