<template>
  <div class="input mt-8">
    <quill-editor ref="myQuillEditor" class="wyzywig" v-model="settings" />
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
  data() {
    return {
      settings: ""
    };
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
