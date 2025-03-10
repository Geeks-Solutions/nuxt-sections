<template>
  <div class="sub-types dynamic-s">
    <h4 :class="{'dynamic-t': isSideBarOpen === false}">{{ props.linked_to ? formatTexts(formatName(props.linked_to, '/')) : $t('Adding section') }}</h4>
    <div v-if="globalSectionMode === true" class="mt-4">
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
    <button
        v-if="globalSectionMode === true"
        class="mt-4 submit-btn"
        type="button"
        @click="addStatic"
    >
      {{ $t('Submit data') }}
    </button>
  </div>
</template>

<script>
import {formatName, sectionHeader, parseQS, validateQS, getGlobalTypeData, formatTexts } from "../../utils";
import GlobalReferences from "../SubTypes/globalReferences.vue";

export default {
  props: {
    props: {
      type: Object,
      default: {},
    },
    savedView: {
      type: Object,
      default: {},
    },
    headers: {
      type: Object,
      default: {},
    },
    instance: {
      type: Boolean,
      default: false
    },
    linked: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    },
	isSideBarOpen: {
	  type: Boolean,
	  default: false
	}
  },
  components: {
    GlobalReferences
  },
  data() {
    return {
      autoInsert: false,
      instanceNameError: false,
      showPagesList: false,
      instanceName: '',
      pages: []
    }
  },
  computed: {
    id() {
      if (this.savedView.id) {
        return this.savedView.id;
      }
      return "id-" + Date.now();
    },
    weight() {
      if (this.savedView.weight) {
        return this.savedView.weight;
      }
      return null;
    },
    globalSectionMode() {
      return this.instance === true || this.linked === true
    }
  },
  mounted() {
    if (this.props.linked_to !== '' && this.props.linked_to !== undefined) {
      this.getGlobalType()
    }
    if (this.instance !== true) {
      this.renderSection(this.props.name)
    }
  },
  methods: {
    formatTexts,
    formatName,
    renderSection(name) {
      this.$emit("load", true);
      const token = this.$cookies.get("sections-auth-token");
      const header = {
        token,
      };
      const config = {
        headers: sectionHeader(header),
      };

      const variables = {
        section: {
              name,
              weight: 1
            },
        base_path: this.basePath
      };

      let language = undefined
      try {
        language = this.$i18n.locale
      } catch {}

      if (this.$sections.queryStringSupport && this.$sections.queryStringSupport === "enabled") {
        variables["query_string"] = parseQS(encodeURIComponent(this.$route.params.pathMatch ? this.$route.params.pathMatch : '/'), Object.keys(this.$route.query).length !== 0, this.$route.query)
        if (this.props.query_string_keys && this.props.query_string_keys.length > 0) {
          variables["query_string"] = {
            ...variables["query_string"],
            ...validateQS(variables["query_string"], this.props.query_string_keys, true)
          }
        }
        variables["query_string"] = {
          ...variables["query_string"],
          language
        }
      }

      const URL =
        `${this.$sections.serverUrl}/project/${this.$sections.projectId}/section/render`;
      this.$axios
        .post(URL, variables, config)
        .then((res) => {
          if (res.data && res.data.error) {
            this.$emit('errorAddingSection', {
              closeModal: true,
              title: "Error adding "+ name,
              message: res.data.error
            })
            this.$emit("load", false);
            return;
          }
          this.$emit('addSectionType', {
            name: name,
            type: 'dynamic',
            id: this.id,
            weight: this.weight,
            render_data: res.data.render_data,
            query_string_keys: res.data.query_string_keys,
            instance_name: this.props.instance_name
          })
          this.$emit("load", false);
        })
        .catch((e) => {
          if (e.response.status === 404) {
            this.$emit('addSectionType', {
              name: name,
              type: 'dynamic',
              id: this.id,
              weight: this.weight,
              render_data: e.response.data.render_data,
              query_string_keys: e.response.data.query_string_keys,
              instance_name: this.props.instance_name
            })
          } else {
            if (e.response.data.error) {
              this.$emit('errorAddingSection', {
                closeModal: true,
                title: "Error adding "+ this.props.name,
                message: e.response.data.error
              })
            } else {
              this.$emit('errorAddingSection', {
                closeModal: true,
                title: "Error adding "+ this.props.name,
                message: this.$t('saveConfigSectionError')
              })
            }
          }
          this.$emit("load", false);
        });
    },
    addStatic() {
      this.instanceNameError = false
      if (this.globalSectionMode && this.instanceName === '') {
        this.instanceNameError = true
        return
      }
      this.$emit("addSectionType", {
        name: this.props.name,
        type: 'dynamic',
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
.dynamic-t {
  min-width: 550px;
  min-height: 40px;
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
.dynamic-s {
  text-align: center;
}
</style>
