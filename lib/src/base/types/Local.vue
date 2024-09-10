<template>
  <div>
    <h4>{{ $t('Adding section') }}</h4>
    <div v-if="instance" class="autoInsertRow">
      <div>
        {{ $t('autoInsertInstance') }}
      </div>
      <input v-model="autoInsert" type="checkbox" class="autoInsertInput" />
    </div>
  </div>
</template>

<script>
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
    }
  },
  data() {
    return {
      autoInsert: false
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
  },
  mounted() {
    // add a little time for the user to see the popup and know that the section is adding
    setTimeout(() => {
      this.$emit("addSectionType", {
        name: this.props.name,
        type: "local",
        id: this.id,
        weight: this.weight,
        auto_insertion: this.autoInsert
      });
    }, 500);
  },
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
</style>
