<template>
  <div class="container text-center sub-types" :class="{'containerWidth': isSideBarOpen === false}">

    <div class="flex d-inline-flex w-full justify-center ml-2 md:ml-0">
      <div>
        <div class="active-tab px-2 h-45px flex justify-center items-center rounded-tl-lg" :class="currentTab === 'config' ? 'active-tab' : 'inactive-tab border border-Blue'" style="border-top-left-radius: 10px 10px; cursor: pointer;" @click="currentTab = 'config';">
          <div
              class="font-light mt-2 mb-2"
              :class="currentTab === 'config' ? 'text-white' : 'inactive-text'"
          >
            <div class="text-capitalize ">{{ props.linked_to ? formatName(props.linked_to, '/') : formatName(props.name, " / ") }}</div>
          </div>
        </div>
      </div>
      <!--  The below div element adds an extra tab to the configurable section. -->
      <!--  If the custom form is present on the host project with the same name as the configurable section, the tab will show and clicking on it results in showing this custom form   -->
      <div v-if="showCustomFormTab === true" class="active-tab px-2 h-45px flex justify-center items-center rounded-br-lg" :class="currentTab === 'custom' ? 'active-tab' : 'inactive-tab border border-Blue'" style="border-bottom-right-radius: 10px 10px; cursor: pointer;" @click="currentTab = 'custom';">
        <div
          class="font-light mt-2 mb-2"
          :class="currentTab === 'custom' ? 'text-white' : 'inactive-text'"
        >
          {{ $t('Custom form') }}
        </div>
      </div>
    </div>
    <!--  The below div element is the configurable section form tab and its fields/types are loaded based on the response fields coming from backend -->
    <div v-show="currentTab === 'config'">
      <div class="error-message">
        {{ errorMessage }}
      </div>
      <div class="form-group">
        <form>
          <div
            class=" flex flex-col justify-between"
			:class="{'content-wrapper': isSideBarOpen === false}"
          >
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
            <TranslationComponent v-if="translationComponentSupport" :locales="locales" :default-lang="defaultLang" @setFormLang="updateLocale"/>
            <div
              :key="idx"
              v-for="(field, idx) in props.fields"
              :class="getType(field.type) !== 'file' ? '' : ''"
            >
              <div v-if="registeredType(field.type, field.key)" class="element d-inline-block">
                <component :is="registeredType(field.type, field.key)" :reference="sectionsConfigurableType" :options=options :options-data="optionsData" :field="field" :custom-form-data="customFormData" :sections-user-id="sectionsUserId" :ref="`${field.type}-${field.key}`" :locales="locales" :selectedLang="formLang" :default-lang="defaultLang" :option-values="optionValues" />
              </div>
              <div v-else-if="!getType(field.type)" class="element w-full unsupportedFieldType">
                {{ $t('unsupportedFieldType', { name: `"${field.type}_${field.key}"`, type: `"${field.type}"`}) }}
              </div>
              <div v-else class="element d-inline-block">
                <div
                  v-if="field.name && field.type !== 'hidden'"
                  class="text-capitalize text-left"
                >
                  {{ changeFieldLabel(field) }}
                </div>
                <div v-if="field.type === 'wysiwyg'">
                  <div class="input">
                    <wysiwyg :ref="field.type+'Editor'" class="wyzywig" :html="computedWysiwygValue(field)" @settingsUpdate="(content) => onEditorChange(content, idx, field.key)" />
                  </div>
                </div>
                <div v-else-if="field.type === 'textarea'" class="w-full">
                  <textarea
                    v-model="optionsData[field.key][formLang]"
                    class="d-input py-4 pl-6 border rounded-xl border-FieldGray text-area-field w-full focus:outline-none"
                    :name="field.name"
                    :placeholder="changeFieldLabel(field)"
                    @change="changeFieldValue($event, idx, field.type, field.key)"
                  />
                </div>
                <div v-else-if="stringType(field.key)" class="w-full">
                  <input
                    v-model="optionsData[field.key][formLang]"
                    class="d-input pl-6 border rounded-xl border-FieldGray h-48px w-full focus:outline-none"
                    :name="field.name"
                    :placeholder="changeFieldLabel(field)"
                    @change="changeFieldValue($event, idx, field.type, field.key)"
                  />
                </div>
                <div v-else class="w-full justify-start">
                  <div v-if="field.type === 'media' && optionsData[field.key] && optionsData[field.key].length > 0 && optionsData[field.key][0].url !== ''" class="py-4 flex align-items-center">
                    <img
                      v-if="optionsData[field.key][0].url"
                      :src="optionsData[field.key][0].url"
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
                  <div v-else-if="field.type === 'integer' && optionValues.field === field.name && optionValues.option_values">
                    <div class="selectMultipleOptions">
                      <div v-for="option in optionValues.option_values" :key="option.id" class="multiple-options-wrapper">
                        <div class="single-multiple-option" :class="isSelected(option.id, field.name) ? 'multiple-options-selected' : ''" @click="selectOption(option.id, field.name)">{{ option.title + ' - ' + option.id }}</div>
                      </div>
                    </div>
                  </div>
                  <component
                    v-show="(field.type === 'string' || field.type === 'textfield') || (!Array.isArray(optionValues.option_values) && field.type !== 'media' || (field.type === 'media' && previewMedia === '' && ( !optionsData[field.key] || (optionsData[field.key] && (optionsData[field.key].length === 0 || (optionsData[field.key].length > 0 && optionsData[field.key][0].url === ''))))))"
                    :value="computedComponentValue(field)"
                    :class="optionValues.field === field.name && optionValues.option_values ? 'd-input pl-6 border rounded-xl border-FieldGray w-full focus:outline-none' : field.type !== 'media' ? 'd-input pl-6 border rounded-xl border-FieldGray h-48px w-full focus:outline-none' : ''"
                    :id="field.key"
                    :is="getTag(field.type, field.name && field.name.includes(':') ? field.name.split(':')[1] : field.name)"
                    :type="getType(field.type)"
                    :name="field.name"
                    :title="'choose'"
                    :placeholder="changeFieldLabel(field)"
                    :multiple="optionValues.field === field.name && optionValues.option_values"
                    @input="changeFieldValue($event, idx, field.type, field.key)"
                  >
                    <option
                      v-for="option in optionValues.option_values"
                      :key="option.id"
                      :value="option.id"
                      :selected="optionValues.field === field.name && optionValues.option_values && optionsData[field.key] && optionsData[field.key].indexOf(option.id) !== -1"
                    >{{ option.title }}</option
                    >
                  </component>
                </div>
                <span v-if="field.type === 'media'" class="flex text-error py-2 text-xs">{{ mediaError }}</span>
              </div>
            </div>
          </div>
          <button class="submit-btn mt-4" type="button" @click="addConfigurable()">
            {{ $t('Submit data') }}
          </button>
          <button
              v-if="instance === false && props.creation !== true && globalSectionMode === false"
              class="mt-4 submit-btn promote-btn"
              type="button"
              @click="$emit('promote-section')"
          >
            {{ $t('promoteSection') }}
          </button>
        </form>
      </div>
      <MediaComponent ref="sectionsMediaComponent" :sections-user-id="sectionsUserId" @emittedMedia="(media) => selectedMedia = media"></MediaComponent>
    </div>
    <!--  The below div element is the custom form tab and its loaded from the host project using the computed getComponentForm() property that relies on the configurable section name -->
    <div v-show="currentTab === 'custom'" class="sub-types">
      <div>
        <div class="text-video d-flex content-wrapper" v-show="formatName(props.name)">
          <component :is="getComponentForm" :ref="formatName(props.name)" :section-settings="props" :section-options="options[0]" @whitelistIdUpdated="updateWhitelistId" @customFormEvent="(data) => { customFormData = data }" @load="(value) => $emit('load', value)" @customFormLoaded="showCustomFormTab = true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  formatName,
  sectionHeader,
  importComp,
  deleteMedia,
  globalFileUpload,
  importJs,
  parseQS,
  validateQS,
  getGlobalTypeData
} from "../../utils";
import loadingCircle from "../icons/loadingCircle.vue";
import CloseIcon from "../icons/close.vue";
import UploadMedia from "../../components/Medias/UploadMedia.vue";
import MediaComponent from "../../components/Medias/MediaComponent.vue";
import wysiwyg from "../../components/Editor/wysiwyg.vue";
import TranslationComponent from "../../components/Translations/TranslationComponent";
import GlobalReferences from "../SubTypes/globalReferences.vue";

export default {
  components: {
    UploadMedia,
    MediaComponent,
    TranslationComponent,
    GlobalReferences,
    loadingCircle,
    CloseIcon,
    wysiwyg
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
    sectionsUserId: {
      type: String,
      default: ''
    },
    sectionsConfigurableType: {},
    locales: {
      type: Array,
      default() {
        return ['en', 'fr']
      }
    },
    defaultLang: {
      type: String,
      default: 'en'
    },
    translationComponentSupport: {
      type: Boolean,
      default: false
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
      mediaError: '',
      customFormData: null,
      formLang: this.$i18n.locale.toString(),
      autoInsert: false,
      instanceNameError: false,
      showPagesList: false,
      instanceName: '',
      pages: []
    };
  },
  watch: {
    settings() {
      this.$emit('settingsUpdate', this.settings)
    },
    html() {
      this.settings = this.html
    },
    props: {
      handler(v) {
        if (v && v.fields) {
          v.fields.forEach((field) => {
            if (this.options[0][field.key] === undefined) {
              this.$set(this.options[0], field.key, null);
            }
            if (this.optionsData[field.key] === undefined) {
              if (this.stringType(field.type)) {
                this.$set(this.optionsData, field.key, {})
                this.locales.forEach(locale => {
                  this.$set(this.optionsData[field.key], locale, '');
                })
              } else {
                this.$set(this.optionsData, field.key, null);
              }
            }
          });
        }
      },
      deep: true,
      immediate: true
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
    // This property is to import the custom form from the host project if it exists and if it has the same name as the configurable section type
    getComponentForm() {
      let path = "";
      if (this.props.name.includes(":")) {
        path = "/forms/" + this.props.name.split(":")[1];
      } else {
        path = "/forms/" + this.props.name;
      }
      return importComp(path);
    },
    globalSectionMode() {
      return this.instance === true || this.linked === true
    }
  },
  mounted() {
    this.$emit('loadReference')
    // Load the configurable section type options
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

      let alteredOptions = null
      let hooksJs = importJs(`/js/configurable-hooks`)
      if (hooksJs['configurable_pre_render']) {
        if (typeof hooksJs['configurable_pre_render'] === 'function') {
          alteredOptions = hooksJs['configurable_pre_render'](JSON.parse(JSON.stringify(this.options)), this.defaultLang, this.locales, this.props)
        }
      }

      if (alteredOptions) {
        this.$set(this, ['options'], alteredOptions);
      }

      this.props.fields.forEach((field) => {
        if (this.options[0][field.key] === undefined) {
          if (this.stringType(field.type)) {
            this.$set(this.options[0], field.key, {});
            this.locales.forEach(locale => {
              this.$set(this.options[0][field.key], locale, '');
            })
          } else {
            this.$set(this.options[0], field.key, null);
          }
        }
      });

      Object.assign(this.optionsData, this.options[0])
      Object.keys(this.options[0]).forEach(key => {
        this.$set(this.optionsData, key, this.options[0][key]);
      })
      this.props.fields = [...fields[0]];
    } else {
      this.props.fields.forEach((field) => {
        if (this.options[0][field.key] === undefined || this.options[0][field.key] === null) {
          if (this.stringType(field.type)) {
            this.$set(this.options[0], field.key, {});
            this.locales.forEach(locale => {
              this.$set(this.options[0][field.key], locale, '');
            })
          } else {
            this.$set(this.options[0], field.key, null);
          }
        }
      });
    }

    if (this.savedView.settings) {
      this.settings.data = this.savedView.settings;
    }

    if (this.props.dynamic_options || this.savedView.dynamic_options){
      this.$emit("load", true);
      const token = this.$cookies.get("sections-auth-token");
      const header = {
        token,
      };
      const config = {
        headers: sectionHeader(header),
      };

      const URL =
        `${this.$sections.serverUrl}/project/${this.$sections.projectId}/section/${this.props.nameID ? this.props.nameID : this.props.name}/options`;

      this.$axios
        .get(URL, config)
        .then((res) => {
          //TODO this should be updated to iterate over all the elements of the data array
          //and key the result by the `field` key in the object
          this.optionValues = res.data[0]

          if (this.optionValues.option_values) {
            this.optionValues.option_values.forEach(opt => {
              if (this.isSelected(opt.id, this.optionValues.field)) {
                const foundIdx = this.optionValues.option_values.findIndex(el => el.id == opt.id)
                this.optionValues.option_values.splice(foundIdx, 1)
                this.optionValues.option_values.unshift(opt)
              }
            })
          }

          if (this.props.addToPage) {
            this.addConfigurable()
          }

          this.$emit("load", false);
        })
        .catch((err) => {
          this.$emit("load", false);
          this.showToast("Error", "error", err.response.data.message.toString());
        });
    }

    this.importHooks('mounted')

    if (this.props.linked_to !== '' && this.props.linked_to !== undefined) {
      this.getGlobalType()
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
    stringType(type, name) {
      return ['wysiwyg', 'string', 'textfield', 'textarea'].includes(type)
    },
    async changeFieldValue(e, idx, type, fieldname) {
      const value = type === "media" ? e : e.target.value;
      const name = type === "media" ? fieldname : e.target.name;
      if (type === "media") {
        await this.mediaUpload(e, idx, name);
      } else if(type === 'integer') {
        this.options[0][name] = parseInt(value);
      } else if(type === 'textarea') {
        this.options[0][name][this.formLang] = value;
      } else if(this.stringType(type) && !(this.optionValues.field === fieldname && this.optionValues.option_values)) {
        this.options[0][name][this.formLang] = value;
      } else {
        this.options[0][name] = value;
      }
    },
    async mediaUpload(e, idx, name) {
      this.isInProgress = true
      const media = [
        {
          media_id: "",
          url: "",
          fielname: ""
        }
      ];
      this.mediaError = ''
      await globalFileUpload(e.target.files[0]).then(
        (result) => {
          if(result.success) {
            this.isInProgress = false
            media[0].url = result.data.files[0].url;
            media[0].filename = result.data.files[0].filename;
            media[0].media_id = result.data.id;
            this.previewMedia = media[0].url;
            this.options[0][name] = media;
          } else {
            this.isInProgress = false
            this.mediaError = `${result.error.response.data.error}. ${result.error.response.data.message}`
          }
        }
      )
    },
    async removeImage(name) {
      this.previewMedia = ''
      this.optionsData[name][0].url = ""
      this.options[0][name] = []
    },
    onEditorChange(html, idx, fieldname) {
      this.options[0][fieldname][this.formLang] = html;
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
    // Compute the element tag name based on the field value
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
    // Compute the element type based on the type value
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
        case "wysiwyg":
          return "text";
      }
    },
    addConfigurable() {
      this.instanceNameError = false
      if (this.globalSectionMode && this.instanceName === '') {
        this.instanceNameError = true
        return
      }
      this.errorMessage = "";
      let errorMessage = "";
      Object.keys(this.options[0]).map((key, i) => {
        const fields = this.props.fields.find(field => field.key === key);
        let typeComp = fields ? this.registeredType(fields.type, fields.key) : null
        if (fields.type ==='boolean' && this.options[0][key] === null) {
          this.options[0][key] = false
        }
        if (((typeof this.options[0][key] === 'string' && !this.options[0][key]) || (typeof this.options[0][key] === 'object' && this.stringType(fields.type) && !this.options[0][key][this.defaultLang])) && typeof this.options[0][key] !== "boolean" && !Array.isArray(this.options[0][key])) {
          if (typeof this.options[0][key] === 'string') {
            errorMessage =
              this.$t('fillRequiredFields') + ` (${key})`;
          } else {
            errorMessage =
              this.$t('fillRequiredFields') + ` (${key})` + ` / (${this.defaultLang})`;
          }
        } else if (fields.type ==='integer' && !Array.isArray(this.options[0][key]) && (this.options[0][key] === null || isNaN(this.options[0][key]))) {
          errorMessage =
            this.$t('fillRequiredFields') + ` (${key})`;
        } else if (this.options[0][key] === null) {
          errorMessage =
            this.$t('fillRequiredFields') + ` (${key})`;
        } else if (typeComp && typeComp.methods) {
          try {
            let validatedOptions = typeComp.methods.validateOptions(this.options, fields, key, this)
            if(validatedOptions.errorMessage === true) {
              errorMessage = this.$t('fillRequiredFields') + ` (${key} ${validatedOptions.errors})`;
            }
          } catch {}
        }
      });
      if (errorMessage) {
        this.errorMessage = errorMessage;
        return;
      } else {
        Object.keys(this.options[0]).map((key, i) => {
          const fields = this.props.fields.find(field => field.key === key);
          let typeComp = fields ? this.registeredType(fields.type, fields.key) : null
          try {
            typeComp.methods.optionsValidated(this)
          } catch {}
        })
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
        this.$sections.serverUrl +
        `/project/${this.$sections.projectId}/section/render`;

      this.$axios
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
            render_data: res.data.render_data,
            query_string_keys: res.data.query_string_keys,
            auto_insertion: this.autoInsert,
            instance_name: this.props.addToPage ? this.props.instance_name : this.instanceName
          })
        })
        .catch((e) => {
          if (e.response.status === 404) {
            this.$emit('addSectionType', {
              name: this.props.name.includes(":") ? this.props.name.split(":")[1] : this.props.name,
              nameID: this.props.name.includes(":") ? this.props.name : `${this.savedView.application_id}:${this.props.name}`,
              type: 'configurable',
              settings: this.options[0],
              id: this.id,
              weight: this.weight,
              render_data: e.response.data.render_data,
              query_string_keys: e.response.data.query_string_keys,
              auto_insertion: this.autoInsert,
              instance_name: this.props.addToPage ? this.props.instance_name : this.instanceName
            })
          } else {
            this.$emit('errorAddingSection', {
              closeModal: false,
              title: "Error adding "+ this.props.name,
              message: e.response.data.error ? e.response.data.error : this.$t('saveConfigSectionError')
            })
          }
          this.$emit("load", false);
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
    },
    isSelected(id, name) {
      return this.optionsData[name] !== undefined && this.optionsData[name] !== null && this.optionsData[name].indexOf(id) !== -1;
    },
    selectOption(value, name) {
      if (Array.isArray(this.optionsData[name]) && this.optionsData[name].indexOf(parseInt(value)) === -1) {
        this.optionsData[name].push(parseInt(value));
      } else if (Array.isArray(this.optionsData[name]) && this.optionsData[name].indexOf(parseInt(value)) !== -1) {
        this.optionsData[name].splice(this.optionsData[name].indexOf(parseInt(value)), 1);
      } else {
        this.$set(this.optionsData, name, [parseInt(value)]);
      }
      this.options[0][name] = this.optionsData[name]
    },
    importHooks(hook, params) {
      let hooksJs = importJs(`/js/configurable-hooks`)
      if (hooksJs[hook]) {
        return hooksJs[hook](params)
      } else return;
    },
    registeredType(type, key) {
      let path = `/configurable_components/${type}_${key}`
      return importComp(path);
    },
    updateLocale(locale) {
      this.$set(this, 'formLang', locale)
      this.$set(this.props, 'fields', [...this.props.fields])
      this.$set(this, 'optionsData', {...this.optionsData})
      this.$set(this, 'options', [...this.options])
    },
    computedWysiwygValue(field) {
      if (this.options && this.options[0] && this.options[0][field.key] && this.options[0][field.key][this.formLang]) {
        return this.options[0][field.key][this.formLang]
      }
    },
    computedComponentValue(field) {
      if (this.optionValues.field === field.name && this.optionValues.option_values) {
        return this.optionsData[field.key]
      } else if (this.stringType(field.type, field.name)) {
        return this.optionsData[field.key][this.formLang]
      } else return this.optionsData[field.key]
    },
    changeFieldLabel(field) {
      let importedHook = this.importHooks('updateFieldLabel', field)
      if(importedHook) {
        return importedHook
      } else return field.name.replace("_", " ")+'*'
    }
  }
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
.error-message {
  color: #dc3545;
}
.inactive-text {
  color: #03B1C7;
}
.active-tab {
  background: #03B1C7;
}
.inactive-tab {
  background: #ffffff;
  border-color: #03B1C7;
}
@media only screen and (max-height: 800px) {
  .content-wrapper {
    overflow-y: scroll;
    height: 450px;
  }
}

.selectMultipleOptions {
  border-radius: 0.75rem;
  border-width: 1px;
  border-radius: 0.75rem;
  overflow-y: scroll;
  align-items: flex-start;
  flex-direction: column;
  max-width: 32rem;
  height: 250px;
  display: flex;
  margin-top: 0.5rem;
}

.single-multiple-option {
  padding-left: 1rem;
  padding: 0.5rem;
  cursor: pointer;
  width: 100%;
}

.multiple-options-wrapper {
  width: 100%;
}

.multiple-options-selected {
  background: #C2C2C2;
}

.text-area-field {
  min-height: 48px;
}

.wl-col {
  padding: 0 20px;
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
.promote-btn {
  font-size: 20px !important;
}
</style>
