<template>
  <div class="container containerWidth text-center">

    <div class="flex d-inline-flex w-full justify-center ml-2 md:ml-0">
      <div class="bg-info px-2 h-45px flex justify-center items-center rounded-tl-lg" :class="currentTab === 'config' ? 'bg-info' : 'bg-light border border-Blue'" style="border-top-left-radius: 10px 10px; cursor: pointer;" @click="currentTab = 'config';">
        <div
            class="font-light mt-2 mb-2"
            :class="currentTab === 'config' ? 'text-white' : 'text-info'"
        >
          <div class="text-capitalize ">{{ formatName(props.name) }}</div>
        </div>
      </div>
      <div v-if="showCustomFormTab === true" class="bg-info px-2 h-45px flex justify-center items-center rounded-br-lg" :class="currentTab === 'custom' ? 'bg-info' : 'bg-light border border-Blue'" style="border-bottom-right-radius: 10px 10px; cursor: pointer;" @click="currentTab = 'custom';">
        <div
            class="font-light mt-2 mb-2"
            :class="currentTab === 'custom' ? 'text-white' : 'text-info'"
        >
          {{ $t('Custom form') }}
        </div>
      </div>
    </div>

    <div v-show="currentTab === 'config'">
      <div class="text-danger">
        {{ errorMessage }}
      </div>
      <div class="form-group">
        <form>
          <div
              class=" flex flex-col justify-between content-wrapper"
          >
            <div
                class="element d-inline-block"
                :key="idx"
                v-for="(field, idx) in props.fields"
                :class="getType(field.type) !== 'file' ? '' : ''"
            >
              <!-- <div v-if="field.type === 'file' && options[idx][fields[idx]['name']]" class="file-text">
                Selected file :
                <a class="text-light-blue" :href="options[idx][fields[idx]['name']]">
                {{formatFileName(options[idx][fields[idx]['name']])}}
                </a>
              </div> -->
              <div
                  v-if="field.name && field.type !== 'hidden'"
                  class="text-capitalize text-left"
              >
                {{ field.name.replace("_", " ")+'*' }}
              </div>
              <div v-if="field.type === 'wysiwyg'">
                <div class="input">
                  <quill-editor v-model="optionsData[field.key]" :ref="field.type+'Editor'" class="wyzywig" @change="onEditorChange($event, idx, field.key)" />
                </div>
              </div>
              <div v-else-if="field.type === 'textarea'" class="w-full">
                <textarea
                    v-model="optionsData[field.key]"
                    class="d-input py-4 pl-6 border rounded-xl border-FieldGray h-48px w-full focus:outline-none"
                    :name="field.name"
                    @change="changeFieldValue($event, idx, field.type, field.key)"
                />
              </div>
              <div v-else class="w-full justify-start">
                <div v-if="field.type === 'media' && optionsData[field.key] && optionsData[field.key].files && optionsData[field.key].files[0].url !== ''" class="py-4 flex align-items-center">
                  <img
                      v-if="optionsData[field.key].files[0].url"
                      :src="optionsData[field.key].files[0].url"
                      alt="image"
                      class="w-95px h-63px object-contain"
                  />
                  <div class="cursor-pointer pl-2" @click="removeImage(field.key)">
                    <CloseIcon />
                  </div>
                </div>
                <div v-else-if="field.type === 'media' && previewMedia" class="py-4 flex align-items-center">
                  <img
                      :src="previewMedia"
                      alt="image"
                      class="w-95px h-63px object-contain"
                  />
                  <div class="cursor-pointer pl-2" @click="removeImage(field.key)">
                    <CloseIcon />
                  </div>
                </div>
                <div v-else-if="field.type === 'media' && isInProgress" class="loadingCircle pl-4 p-2">
                  <loadingCircle />
                </div>
                <component
                    v-show="field.type !== 'media' || (field.type === 'media' && previewMedia === '' && ( !optionsData[field.key] || (optionsData[field.key] && optionsData[field.key].files && optionsData[field.key].files[0].url === '')))"
                    :value="optionsData[field.key]"
                    :class="field.type !== 'media' ? 'd-input py-4 pl-6 border rounded-xl border-FieldGray h-48px w-full focus:outline-none' : ''"
                    :id="field.key"
                    :is="getTag(field.type, field.name)"
                    :type="getType(field.type)"
                    :name="field.name"
                    :title="'choose'"
                    @input="changeFieldValue($event, idx, field.type, field.key)"
                >
                  <option value="no-value">Select a value</option>
                  <option
                      v-for="option in optionValues.option_values"
                      :selected="
                  parseInt(option.id) === parseInt(options[idx].effect)
                "
                      :key="option.id"
                      :value="option.id"
                  >{{ option.title }}</option
                  >
                </component>
              </div>
              <span v-if="field.type === 'media'" class="flex text-error py-2 text-xs">{{ mediaError }}</span>
            </div>
            <div
                v-if="options[idx] && props.fields && props.fields.length > 1"
                class="deleteRow p1 clickable"
                @click="removeRow(idx)"
            >
              X
            </div>
          </div>
          <div class="text-right" v-if="props.multiple || savedView.multiple">
            <button type="button" @click="addAnother()" class="btn btn-primary">
              Add another
            </button>
          </div>
          <button class="flex items-center justify-center form-control bg-Blue text-white border-Blue border hover:text-Blue px-3.5 h-53px py-3.5 rounded-xl hover:bg-white mt-4 mb-4" type="button" @click="addConfigurable()">
            Submit data
          </button>
        </form>
      </div>
    </div>

    <div v-show="currentTab === 'custom'" class="sub-types">
      <div>
        <div class="text-video d-flex content-wrapper" v-show="formatName(props.name)">
          <component :is="getComponentForm" :ref="formatName(props.name)" :section-settings="props" :section-options="options[0]" @whitelistIdUpdated="updateWhitelistId" @load="(value) => $emit('load', value)" @customFormLoaded="showCustomFormTab = true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {formatName, sectionHeader, importComp, deleteMedia, globalFileUpload} from "../../utils";
import loadingCircle from "../icons/loadingCircle.vue";
import CloseIcon from "../icons/close.vue";

export default {
  components: {
    loadingCircle,
    CloseIcon
  },
  props: {
    props: {
      type: Object,
      default: () => {},
    },
    savedView: {
      type: Object,
      default: {},
    },
    headers: {
      type: Object,
      default: {},
    },
    html: {
      type: String,
      default: ""
    },
  },
  data() {
    return {
      errorMessage: "",
      settings: {},
      options: [{}],
      optionValues: {},
      currentTab: 'config',
      optionsData: {},
      showCustomFormTab: false,
      previewMedia: "",
      isInProgress: false,
      mediaError: ''
    };
  },
  watch: {
    settings() {
      this.$emit('settingsUpdate', this.settings)
    },
    html() {
      this.settings = this.html
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
    getComponentForm() {
      let path = "";
      if (this.props.name.includes(":")) {
        path = "/forms/" + this.props.name.split(":")[1];
      } else {
        path = "/forms/" + this.props.name;
      }
      return importComp(path);
    },
  },
  mounted() {
    // edit
    if (this.savedView.fields) {
      const options = [];
      const fields = [];
      let savedViewData = {};
      if (this.savedView.render_data) {
        savedViewData = this.savedView.render_data
      } else {
        savedViewData = this.savedView.renderData
      }
      savedViewData.map((rdata) => {
        const keys = Object.keys(rdata.settings);
        const obj = {};
        keys.map((key) => {
          obj[key] = rdata.settings[key];
        });
        options.push(obj);
        const fieldGroup = this.savedView.fields;
        if (fieldGroup[0][0]) {
          fields.push(...fieldGroup);
        } else {
          fields.push(fieldGroup);
        }
      });
      this.options = options;
      Object.assign(this.optionsData, this.options[0])
      this.props.fields = [...fields[0]];
      return;
    } else {
      this.props.fields.forEach((field) => {
        this.options[0][field.key] = "";
      });
    }

    if (this.savedView.settings) {
      this.settings.data = this.savedView.settings;
    }

    const ob = this.props.fields[0].length;
    if (this.props.multiple && !ob) {
      this.props.fields = [this.props.fields];
    }

    if (this.props.dynamic_options || this.savedView.dynamic_options){
      this.$emit("loading");
      const token = this.$cookies.get("sections-auth-token");
      const header = {
        token,
      };
      const config = {
        headers: sectionHeader(header),
      };

      const URL =
        `${this.$sections.serverUrl}/project/${this.$sections.projectId}/section/${this.props.name}/options`;

      this.$axios
        .get(URL, config)
        .then((res) => {
          //TODO this should be updated to iterate over all the elements of the data array
          //and key the result by the `field` key in the object
          this.optionValues = res.data[0]
          this.$emit("loading");
        })
        .catch((err) => {
          this.$emit("loading");
          this.showToast("Error", "error", err.response.data.message.toString());
        });
    }
  },
  methods: {
    formatFileName(name) {
      if (!name) {
        return "Choose a file...";
      }
      return "..." + name.substr(name.length - 8);
    },
    removeRow(idx) {
      this.options.splice(idx, 1);
      this.props.fields.splice(idx, 1);
    },
    async changeFieldValue(e, idx, type, fieldname) {
      const value = type === "media" ? e : e.target.value;
      const name = type === "media" ? fieldname : e.target.name;
      if (type === "media") {
        await this.mediaUpload(e, idx, name);
      } else if(type === 'integer') {
        this.options[0][name] = parseInt(value);
      } else if(type === 'textarea') {
        this.options[0][name] = value;
      } else {
        this.options[0][name] = value;
      }
    },
    async mediaUpload(e, idx, name) {
      this.isInProgress = true
      const media = {
        id: "",
        files: [
          {
            filename: "",
            url: ""
          }
        ]
      };
      this.mediaError = ''
      await globalFileUpload(e.target.files[0]).then(
          (result) => {
            if(result.success) {
              this.isInProgress = false
              media.files[0].url = result.data.files[0].url;
              media.files[0].filename = result.data.files[0].filename;
              media.id = result.data.id;
              this.previewMedia = media.files[0].url;
              this.options[0][name] = media;
            } else {
              this.isInProgress = false
              this.mediaError = `${result.error.response.data.error}. ${result.error.response.data.message}`
            }
          }
      )
    },
    async removeImage(name) {
      if(this.options[0][name]) {
        await deleteMedia(this.options[0][name].id)
      }
      this.previewMedia = ''
      this.options[0][name].files[0].url = ''
      this.options[0][name].id = null
      this.options[0][name] = null
    },
    onEditorChange({ quill, html, text }, idx, fieldname) {
      this.options[0][fieldname] = html;
    },
    addAnother() {
      this.errorMessage = "";
      let errorMessage = "";

      this.options.map((opt) => {
        const fields = this.props.fields[0];
        fields.map((field) => {
          if (!opt[field.name] || opt[field.name] === "no-value") {
            errorMessage =
              "You must fill your current fields before adding a new one";
          }
        });
      });
      if (errorMessage) {
        this.errorMessage = errorMessage;
      } else {
        this.props.fields.push(this.props.fields[0]);
        this.options.push({});
      }
    },
    formatName,
    getTag(type, name) {
      switch (type) {
        case "integer":
          if (
            this.optionValues.field === name &&
            this.optionValues.option_values
          ) {
            return "select";
          }
          return "input";
        case "media":
          return "input";
        case "string":
          if (
            this.optionValues.field === name &&
            this.optionValues.option_values
          ) {
            return "select";
          }
          return "input";
        case "textfield":
          if (
            this.optionValues.field === name &&
            this.optionValues.option_values
          ) {
            return "select";
          }
          return "input";
        case "textarea":
          if (
            this.optionValues.field === name &&
            this.optionValues.option_values
          ) {
            return "select";
          }
          return "textarea";
      }
    },
    getType(type) {
      switch (type) {
        case "file":
          return "file";
        case "media":
          return "file";
        case "string":
          return "text";
        case "integer":
          return "text";
        case "textfield":
          return "text";
        case "textarea":
          return "text";
        case "hidden":
          return "text";
      }
    },
    addConfigurable() {
      this.errorMessage = "";
      let errorMessage = "";
      Object.keys(this.options[0]).map((key, i) => {
        const fields = this.props.fields[i];
        if (!this.options[0][key] || this.options[0][key][fields.key] === "no-value") {
          errorMessage =
              "You must fill your required fields before submitting.";
        }
      });
      if (errorMessage) {
        this.errorMessage = errorMessage;
        return;
      }
      this.$emit("load", true);

      const token = this.$cookies.get("sections-auth-token");
      const header = {
        token,
      };
      const config = {
        headers: sectionHeader(header),
      };

      const options = JSON.stringify(this.options)

      const variables = {
        section: {
              name: this.props.name.includes(":") ? this.props.name : `${this.savedView.application_id}:${this.props.name}`,
              weight: 1,
              options: this.options
            }
      };
      const URL =
        this.$sections.serverUrl +
        `/project/${this.$sections.projectId}/section/render`;

      axios
        .post(URL, variables, config)
        .then((res) => {
          this.$emit("load", false);
          if (res.data && res.data.error) {
            this.$emit('errorAddingSection', {
              closeModal: false,
              title: "Error adding "+ this.props.name,
              message: res.data.error
            })
            return;
          }
          this.$emit('addSectionType', {
            name: this.props.name.includes(":") ? this.props.name.split(":")[1] : this.props.name,
            nameID: this.props.name.includes(":") ? this.props.name : `${this.savedView.application_id}:${this.props.name}`,
            type: 'configurable',
            settings: this.options[0],
            id: this.id,
            weight: this.weight,
            render_data: res.data.render_data
          })
        })
        .catch(() => {
          this.$emit("load", false);
          this.$emit('errorAddingSection', {
              closeModal: false,
              title: "Error adding "+ this.props.name,
              message: "We couldn't save your changes, try again later"
            })
        });
    },
    showToast(title, variant, message) {
      this.$toast[variant](message, {
        position: "top-right",
        timeout: 5000,
        closeOnClick: true,
        pauseOnFocusLoss: true,
        pauseOnHover: true,
        draggable: true,
        draggablePercent: 0.6,
        showCloseButtonOnHover: false,
        hideProgressBar: false,
        closeButton: "button",
        icon: false,
        rtl: false
      });
    },
    updateWhitelistId(id) {
      this.optionsData['whitelist_id'] = id;
      this.options[0]['whitelist_id'] = id;
    }
  },
};
</script>

<style scoped>
.element {
  margin: 15px;
  flex-direction: column;
  align-items: flex-start;
  display: flex;
  text-align: left;
}
.element select {
  width: 100%;
  padding: 9px 19px;
  border-radius: 6px;
}
.deleteRow {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 130px;
}

.btn-primary {
  min-width: 100px;
}

.containerWidth {
  min-width: 800px;
}
.border-FieldGray {
  --tw-border-opacity: 1!important;
  border-color: #f2f2f3!important;
  border-color: rgba(242,242,243,var(--tw-border-opacity))!important;
}
.bg-blue {
  background: #31a9db;
  color: white;
  border: none;
  outline: none !important;
  transition: 0.2s;
}
.bg-blue:hover {
  background: #0881b3;
  transition: 0.2s;
}
.text-Blue {
  background: #31a9db;
}

.loadingCircle {
  width: 70px;
  height: 70px;
}
.content-wrapper {
  overflow-y: scroll;
  height: 550px;
}
@media only screen and (max-height: 800px) {
  .content-wrapper {
    overflow-y: scroll;
    height: 450px;
  }
}
</style>
