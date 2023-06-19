<template>
  <SectionsMain
    :admin="admin"
    :pageName="pageName"
    :lang="lang"
    :variations="variations"
    :viewsBgColor="viewsBgColor"
    :editor-options="editorOptions"
    :locales="locales"
    :translation-component-support="translationComponentSupport"
    :_sections-options="_sectionsOptions"
    @load="loaded"
  />
</template>

<script>
// import "../assets/scss/variables.scss"
import SectionsMain from "./index.vue"

export default {
  name: "Sections",
  props: {
    pageName: {
      type: String,
      default: "",
    },
    lang: {
      type: String,
      default: "en",
    },
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
    translationComponentSupport: {
      type: Boolean,
      default: false
    },
    admin: {
      type: Boolean,
      default: false,
    },
    variations: {
      type: Array,
      default: () => [],
    },
    viewsBgColor: {
      type: String,
      default: "transparent",
    },
    _sectionsOptions: {
      type: Object
    }
  },
  components: {
    SectionsMain,
  },
  methods: {
    loaded(e) {
      this.$emit('finishLoad', e)
    },
  },
}
</script>
