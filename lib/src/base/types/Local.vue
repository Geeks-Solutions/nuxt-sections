<template>
  <div>
    <h4>Adding section...</h4>
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
      });
    }, 500);
  },
};
</script>

<style></style>
