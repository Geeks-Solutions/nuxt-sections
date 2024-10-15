<template>
  <div class="text-center">
    <div class="element-type">
      <h3>{{ props.linked_to ? formatName(props.linked_to, '/') : formatName(props.name, " / ") }}</h3>
      <div v-if="globalSectionMode === true">
        <div class="autoInsertRow">
          <div>
            {{ $t('autoInsertInstance') }}
          </div>
          <input v-model="autoInsert" type="checkbox" class="autoInsertInput" />
        </div>
        <div v-if="props.linked_to === '' || props.linked_to === undefined" class="autoInsertRow">
          <input
              class="py-4 pl-6 border rounded-xl border-FieldGray h-48px instanceInput my-2 focus:outline-none"
              type="text"
              :placeholder="$t('instanceName')+'*'"
              :disabled="props.linked_to !== '' && props.linked_to !== undefined"
              v-model="instanceName"
          />
        </div>
        <span v-if="instanceNameError" class="pagesReference mb-2">{{ $t('instanceNameRequired') }}</span>
      </div>
      <GlobalReferences :global-section-mode="globalSectionMode" :show-pages-list="showPagesList" :pages="pages" @showPagesClicked="showPagesList = !showPagesList" />
      <form>
        <div>
          <subType :name="props.name" :promote-button="instance === false && props.creation !== true && globalSectionMode === false" @promote-section="$emit('promote-section')" @addStatic="addStatic" ref="viewSaved" :locales="locales" :translation-component-support="translationComponentSupport" :sections-user-id="sectionsUserId">
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
import GlobalReferences from "../SubTypes/globalReferences.vue";
import {formatName, getGlobalTypeData, importComp} from "../../utils";

export default {
  components: {
    subType,
    GlobalReferences
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
    },
    linked: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      myHtml: "",
      elements: [],
      showPagesList: false,
      imported: false,
      autoInsert: false,
      instanceNameError: false,
      instanceName: '',
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
    globalSectionMode() {
      return this.instance === true || this.linked === true
    }
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
    if (this.props.linked_to !== '' && this.props.linked_to !== undefined) {
      this.getGlobalType()
    }
  },
  methods: {
    formatName,
    addStatic(settings) {
      this.instanceNameError = false
      if (this.globalSectionMode && this.instanceName === '') {
        this.instanceNameError = true
        return
      }
      this.$emit("addSectionType", {
        name: this.props.name,
        type: "static",
        settings,
        id: this.id,
        weight: this.weight,
        auto_insertion: this.autoInsert,
        instance_name: this.instanceName
      });
    },
    async getGlobalType() {
      this.$emit("load", true);
      const result = await getGlobalTypeData(this.props.linked_to)
      if (result.res && result.res.data) {
        this.$emit("load", false);
        this.autoInsert = result.res.data.auto_insertion
        if (result.res.data.pages && result.res.data.pages.length > 0) {
          this.pages = result.res.data.pages.map(p => p.path)
        }
        this.instanceName = result.res.data.name
      } else if (result.error) {
        this.$emit("load", false);
        this.showToast("Error", "error", result.error.response.data.message, result.error.response.data.options);
      }
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
.instanceInput {
  width: 350px;
}
</style>
