<template>
  <div class="item text-center" :class="{ active }">
    <div class="card-content" :class="{'card-content-preview': (section && section.type === 'local') || (section && section.settings && active === true) || (section && section.render_data && active === true)}">
      <div v-if="(section && section.type === 'local') || (section && section.settings && active === true) || (section && section.render_data && active === true)" class="comp-preview">
		<component
			 :is="componentItem"
			 :section="section"
			 :lang="lang"
			 :locales="locales"
		/>
      </div>
      <div v-else class="p3 text-capitalize px-1">
        {{ formatText(title, " ") }}
      </div>
    </div>
  </div>
</template>

<script>
import { formatTexts } from "../../utils";
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: true,
    },
	view: {
	  type: Object,
	  default: () => {},
	},
	section: {
	  type: Object,
	  default: () => {},
	},
	lang: {
	  type: String,
	  default: "en"
	},
	locales: {
	  type: Array,
	  default() {
		return []
	  }
	},
	componentItem: {
	  type: [String, Object],
	  required: true,
	}
  },
  methods: {
    formatText(text, sep) {
      return formatTexts(text, sep);
    }
  }
};
</script>

<style scoped>
.item {
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
  background: #adadad;
}
.item.active {
  background: #31a9db;
  transition: 0.2s;
}
.item.active:hover {
  transition: 0.2s;
  background: darken(#31a9db, 10%);
}
.icon svg {
  color: white;
  fill: white;
  min-width: 60px;
  height: 60px;
}
.card-content {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: auto;
  align-content: center;
}
.card-content .comp-preview {
  position: absolute;
  width: 1496px;
  top: 0;
  left: 0;
  overflow: hidden;
  transform: scale(0.22);
  transform-origin: top left;
  pointer-events: none;
  color: initial;
  background: white;
  padding: 20px 0;
}
.card-content-preview {
  background: white;
}
</style>
