<template>
  <div class="text-center">
    <div class="element-type">
      <h3>{{ formatName(props.name, " / ") }}</h3>
      <div v-if="instance" class="autoInsertRow">
        <div>
          {{ $t('autoInsertInstance') }}
        </div>
        <input v-model="autoInsert" type="checkbox" class="autoInsertInput" />
      </div>
      <div v-if="instance && pages.length > 0">
        <div class="pagesReferenceWrapper">
          <div class="pagesReference">{{ $t('referencedSection', {pages: pages.join(', ')}) }}</div>
        </div>
      </div>
      <form>
        <div>
          <subType :name="props.name" @addStatic="addStatic" ref="viewSaved" :locales="locales" :translation-component-support="translationComponentSupport" :sections-user-id="sectionsUserId">
            <slot />
          </subType>
        </div>
      </form>
    </div>
    <!-- get access to the imported static component -->
    <component :is="component" :section="props" v-show="false" ref="importedComponent" />
  </div>
</template>

<script>
import subType from "../SubTypes/subType.vue";
import { formatName, importComp, sectionHeader } from "../../utils";

export default {
  components: {
    subType,
  },
  props: {
    props: {
      type: Object,
      default: () => {},
    },
    savedView: {
      type: Object,
      default: () => {},
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
    },
    instance: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      myHtml: "",
      elements: [],
      imported: false,
      autoInsert: false,
      pages: []
    };
  },
  computed: {
    component() {
      const path = `/views/${this.props.name}_${this.props.type}`;
      return importComp(path);
    },
    id() {
      if (this.savedView.id) {
        return this.savedView.id;
      }
      return "id-" + Date.now();
    },
    weight() {
      if (this.savedView.weight === 0 || this.savedView.weight) {
        return this.savedView.weight;
      }
      return "null";
    },
  },
  mounted() {
    if (this.savedView && this.savedView.settings) {
      setTimeout(() => {
        this.$refs.viewSaved.$refs[
          this.props.name
        ].settings = this.savedView.settings;
      }, 500);
    }
    setTimeout(() => {
      this.elements = this.$refs.importedComponent.fields;
    }, 10);
    if (this.props.linked_to !== '') {
      this.getGlobalType()
    }
  },
  methods: {
    formatName,
    addStatic(settings) {
      this.$emit("addSectionType", {
        name: this.props.name,
        type: "static",
        settings,
        id: this.id,
        weight: this.weight,
        auto_insertion: this.autoInsert
      });
    },
    getGlobalType() {
      const token = this.$cookies.get("sections-auth-token");
      const config = {
        headers: sectionHeader({ token }),
      };
      const URL =
          `${this.$sections.serverUrl}/project/${this.$sections.projectId}/global-instances/${this.props.name}`;
      this.$emit("load", true);

      this.$axios.get(URL, config).then((res) => {
        if (res && res.data) {
          this.$emit("load", false);
          this.autoInsert = res.data.auto_insertion
          if (res.data.pages && res.data.pages.length > 0) {
            this.pages = res.data.pages.map(p => p.path)
          }
        }
      })
          .catch((error) => {
            this.$emit("load", false);
            this.showToast("Error", "error", error.response.data.message, error.response.data.options);
          });
    }
  },
};
</script>

<style>
.dashboard button {
  background: black;
  margin: 10px;
  width: auto;
  height: auto;
  max-height: max-content;
  padding: 5px;
  min-width: 0;
  max-width: 1000px;
}
h3 {
  font-size: 29px;
}
.autoInsertRow {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
  align-items: center;
}
.autoInsertInput {
  width: 15px;
  height: 15px;
}
.pagesReference {
  font-size: 14px;
  color: red;
  width: 500px;
}
.pagesReferenceWrapper {
  width: 100%;
  display: flex;
  place-content: center;
}
</style>
