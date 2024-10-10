<template>
  <div>
    <h4 class="local-t">{{ props.linked_to ? formatName(props.linked_to, '/') : $t('Adding section') }}</h4>
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
    <div v-if="globalSectionMode === true && pages.length > 0">
      <div class="global-sections-reference-section">
        <div class="global-sections-first-row">
          <span>{{ $t('referencedSection1') }}</span>
          <div class="relative">
              <span class="global-sections-pages-link" @click="showPagesList = !showPagesList">
                {{ pages.length }}
              </span>
            <div v-if="showPagesList" class="global-sections-popup">
              <ul>
                <li v-for="(page, index) in pages" :key="`refenced-pages-${index}`">{{ page }}</li>
              </ul>
            </div>
          </div>
          <span>{{ $t('referencedSection1Pages') }}</span>
        </div>
        <div class="global-sections-second-row">
          <span>{{ $t('referencedSection2') }}</span>
        </div>
      </div>
    </div>
    <button
        v-if="globalSectionMode === true"
        class="mt-4 submit-btn"
        type="button"
        @click="addLocal"
    >
      {{ $t('Submit data') }}
    </button>
  </div>
</template>

<script>
import {formatName, getGlobalTypeData} from "../../utils";

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
      return 0;
    },
    globalSectionMode() {
      return this.instance === true || this.linked === true
    }
  },
  mounted() {
    if (this.instance !== true) {
      // add a little time for the user to see the popup and know that the section is adding
      setTimeout(() => {
        this.$emit("addSectionType", {
          name: this.props.name,
          type: "local",
          id: this.id,
          weight: this.weight,
          auto_insertion: this.autoInsert,
          instance_name: this.props.instance_name
        });
      }, 500);
    }
    if (this.props.linked_to !== '' && this.props.linked_to !== undefined) {
      this.getGlobalType()
    }
  },
  methods: {
    formatName,
    addLocal() {
      this.instanceNameError = false
      if (this.globalSectionMode && this.instanceName === '') {
        this.instanceNameError = true
        return
      }
      this.$emit("addSectionType", {
        name: this.props.name,
        type: 'local',
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
  }
};
</script>

<style>
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
.instanceInput {
  width: 350px;
}
.local-t {
  min-width: 350px;
  min-height: 40px;
}
</style>
