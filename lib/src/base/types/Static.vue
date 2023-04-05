<template>
  <div class="text-center">
    <div class="element-type">
      <h3>{{ formatName(props.name, " / ") }}</h3>
      <form>
        <div>
          <subType :name="props.name" @addStatic="addStatic" ref="viewSaved">
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
import { formatName, importComp } from "../../utils";

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
  },
  data() {
    return {
      myHtml: "",
      elements: [],
      imported: false,
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
      });
    },
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
</style>
