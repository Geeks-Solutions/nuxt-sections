<template>
  <div>
    <div class="input mt-8">
      <quill-editor :key="selectedLang" ref="myQuillEditor" class="wyzywig" v-model="settings[selectedLang]" :options="editorOptions" />
    </div>
  </div>
</template>
<script>
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

import { quillEditor } from "vue-quill-editor";
import {globalFileUpload} from "@geeks.solutions/nuxt-sections/lib/src/utils";

export default {
  components: {
    quillEditor,
  },
  props: {
    locales: {
      type: Array,
      default() {
        return ['en', 'fr']
      }
    },
    editorOptions: {
      type: Object,
      default() {
        return {
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

              [{ 'size': ['small', false, 'large', 'huge' , '26px', '50px', '90px'] }],  // custom dropdown
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

              [{ 'color': ['#03B1C7', '#61035B', '#fff', '#868686', '#00131F'] }, { 'background': [] }],          // dropdown with defaults from theme
              [{ 'font': [] }],
              [{ 'align': [] }],

              ['clean']                                         // remove formatting button
            ]
          }
        }
      }
    },
    selectedLang: {
      type: String,
      default: 'en'
    }
  },
  data() {
    return {
      settings: {}
    };
  },
  watch: {
    settings: {
      handler(val) {
        if(typeof val === 'string') {
          this.settings = {}
          this.locales.forEach(lang => {
            this.settings[lang] = ""
          })
          this.settings[lang] = val
        }
      }
    }
  },
  mounted() {
    this.$refs.myQuillEditor.quill.getModule('toolbar').addHandler('image', () => {
      this.uploadFunction();
    });
  },
  methods: {
    validate() {
      return true;
    },
    uploadFunction() {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.click();

      let imageURL = ''

      // Listen upload local image and save to server
      input.onchange = async () => {
        const file = input.files[0];
          await globalFileUpload(file).then((result) => {
            imageURL = result.data.files[0].url
            const range = this.$refs.myQuillEditor.quill.getSelection();
            this.$refs.myQuillEditor.quill.insertEmbed(range.index, 'image', imageURL);
          })
      };
    }
  }
};
</script>
