<template>
  <div>
    <h4 class="dynamic-t">{{ $t('Adding section') }}</h4>
  </div>
</template>

<script>
import { sectionHeader } from "../../utils";

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
  },
  mounted() {
    this.renderSection(this.props.name)
  },
  methods: {
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
            }
      };
      const URL =
        `${this.$sections.serverUrl}/project/${this.$sections.projectId}/section/render`;
      this.$axios
        .post(URL, variables, config)
        .then((res) => {
          if (res.data && res.data.error) {
            this.$emit('errorAddingSection', {
              closeModal: true,
              title: "Error adding "+ this.props.name,
              message: res.data.error
            })
            this.$emit("load", false);
            return;
          }
          this.$emit('addSectionType', {
            name: this.props.name,
            type: 'dynamic',
            id: this.id,
            weight: this.weight,
            render_data: res.data.render_data
          })
          this.$emit("load", false);
        })
        .catch((e) => {
          this.$emit('errorAddingSection', {
              closeModal: true,
              title: "Error adding "+ this.props.name,
              message: "We couldn't save your changes, try again later"
            })

          this.$emit("load", false);
        });
    }
  },
};
</script>

<style>
.dynamic-t {
  min-width: 350px;
  min-height: 40px;
}
</style>
