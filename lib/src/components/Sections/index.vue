<template>
  <!--  <div>-->
  <!--    <component :is="getComponentForm" :section="sectionSettings" />-->
  <!--  </div>-->
  <div class="sections-config justify-center">
    <div v-if="!pageNotFound">
      <!-- page buttons part 1-->
      <button
        @click="openEditMode()"
        v-if="admin"
        class="bg-blue control-button hide-mobile"
      >
        {{ !editMode ? $t("Edit page") : $t("View page") }}
      </button>
      <div class="bg-light-grey-hp hide-mobile section-wrapper">
        <div v-if="admin && editMode" class="p-3 text-center mainmsg pt-3">
          Your changes will be published when the page is saved.
        </div>

        <div
          class="pb-4 flex flex-row justify-center hide-mobile"
          v-if="admin && editMode"
        >
          <button
            class="hp-button create-static-section"
            @click="openStaticSection"
          >
            <div class="btn-icon check-icon"><CreateIcon /></div>
            <div class="btn-text">{{ $t("Create static section") }}</div>
          </button>
          <button
            class="hp-button"
            @click="
              (currentSection = null), (isModalOpen = true), (savedView = {})
            "
          >
            <div class="btn-icon plus-icon"><PlusIcon /></div>
            <div class="btn-text">{{ $t("Add") }}</div>
          </button>
          <button class="hp-button" @click="saveVariation">
            <div class="btn-icon check-icon"><CheckIcon /></div>
            <div class="btn-text">{{ $t("Save") }}</div>
          </button>
          <button class="hp-button grey" @click="restoreVariations">
            <div class="btn-icon back-icon"><BackIcon /></div>
            <div class="btn-text">{{ $t("Restore") }}</div>
          </button>
          <div class="flex control-button" style="right: 0px; left: auto;">
            <button
              class="hp-button "
              :class="selectedVariation === pageName ? 'danger' : 'grey'"
              data-toggle="tooltip" data-placement="top" title="Export sections"
              @click="exportSections"
            >
              <ImportIcon />
            </button>
            <a id="downloadAnchorElem" style="display:none"></a>
            <button
              class="hp-button "
              :class="selectedVariation === pageName ? 'danger' : 'grey'"
              data-toggle="tooltip" data-placement="top" title="Import sections"
              @click="initImportSections"
            >
              <ExportIcon />
            </button>
            <input ref="jsonFilePick" type="file" @change="e => importSections(e)" style="display:none" />
            <button
              @click="$cookies.remove('sections-auth-token'), (admin = false)"
              v-if="admin"
              class="bg-blue"
              style="background: black;
                  font-size: 13px;
                  border-radius: 5px;
                  padding: 3px 6px;"
            >
              {{ $t("Logout") }}
            </button>
          </div>
        </div>
      </div>
      <!-- page buttons part 2-->
      <div
        class="bg-light-grey-hp p-3 flex flex-row justify-center part2 hide-mobile"
        v-if="admin && editMode"
      >
        <button
          class="hp-button "
          :class="selectedVariation === pageName ? 'danger' : 'grey'"
          @click="selectedVariation = pageName"
        >
          <div class="btn-text">{{ pageName + " " + "Main" }}</div>
        </button>
        <div v-for="(v, idx) in variations" :key="idx">
          <button
            class="hp-button"
            :class="selectedVariation === v.pageName ? 'danger' : 'grey'"
            @click="
              if (displayVariations[pageName].altered) dismissCountDown = 4;
              else selectedVariation = v.pageName;
            "
          >
            <div class="btn-text">{{ v.name }}</div>
          </button>
          <div
            class="sync flex flex-row p-4 justify-center"
            v-if="selectedVariation === v.pageName"
            @click="synch()"
          >
            <div class="icon" :class="{ synched }"><SyncIcon /></div>
            <span>{{ $t("Synchronise") }}</span>
          </div>
        </div>
      </div>

      <!-- ------------------------------------------------------------------------------------------- -->

      <!-- page section types popup 'edit' -->
      <div v-if="isModalOpen" ref="modal" class="fixed section-modal-content z-50 bg-grey bg-opacity-25 inset-0 p-8 modalContainer" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="section-modal-content bg-white relative shadow rounded-xl">
            <div class="flex flex-row relative justify-center">
              <div class="text-center h4 my-3 pb-6" v-if="!currentSection">
                {{ $t("Add") }}
              </div>
              <div class="closeIcon" @click="isModalOpen = false">
                <CloseIcon />
              </div>
            </div>
            <div
              class="step-back"
              v-if="currentSection"
              @click="currentSection = null"
            >
              <BackIcon />
            </div>

            <div v-if="!currentSection" class="m-1 p-1 type-items content-wrapper">
              <div
                class="section-item section-item-box bg-blue"
                v-for="(type, index) in types"
                :key="type.name"
              >
                <div v-if="type.access === 'private'" class="section-delete">
                  <div class="section-delete-icon" @click="openDeleteSectionTypeModal(type.name, index)">
                    <TrashIcon class="trash-icon-style" />
                  </div>
                </div>
                <div class="section-item" @click="openCurrentSection(type)">
                  <SectionItem
                    v-if="type.name && !type.name.includes('local')"
                    class="bg-light-blue"
                    :title="formatName(type.name)"
                    :icon="type.name"
                  />
                </div>
                <div v-if="type.type !== 'configurable'" class="flex pl-2 pb-1" style="font-size: 10px;">
                  {{ 'By ' + type.application }}
                </div>
                <div v-if="type.app_status === 'disbaled' || type.app_status === 'disabled'" class="section-delete">
                  <div class="section-delete-icon" @click="openAuthConfigurableSectionTypeModal(type.application_id, index, type.requirements, type.name, type.application)">
                    <div class="flex justify-between items-end">
                      <div v-if="type.type === 'configurable'" class="flex pl-2 pb-1" style="font-size: 8px;">
                        {{ 'By ' + type.application }}
                      </div>
                      <LockedIcon class="trash-icon-style p-1" />
                    </div>
                  </div>
                </div>
                <div v-else-if="type.type === 'configurable'" class="section-delete">
                  <div class="section-delete-icon" @click="openUnAuthConfigurableSectionTypeModal(type.application_id, index, type.name, type.application)">
                    <div class="flex justify-between items-end">
                      <div class="flex pl-2 pb-1" style="font-size: 8px;">
                        {{ 'By ' + type.application }}
                      </div>
                      <UnlockedIcon class="trash-icon-style p-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="flex">
              <div class="component-view">
                <!-- we can use this short hand too -->
                <!-- <component :is="currentSection.type" :props="currentSection"  /> -->
                <Static
                  v-if="currentSection.type === 'static'"
                  :props="currentSection"
                  @addSectionType="addSectionType"
                  :savedView="savedView"
                />
                <Dynamic
                  v-if="currentSection.type === 'dynamic'"
                  :props="currentSection"
                  @addSectionType="addSectionType"
                  @errorAddingSection="errorAddingSection"
                  :savedView="savedView"
                  :headers="headers"
                />
                <Configurable
                  v-if="currentSection.type === 'configurable'"
                  @addSectionType="addSectionType"
                  @errorAddingSection="errorAddingSection"
                  :props="currentSection"
                  :variation="variation"
                  :savedView="savedView"
                  :headers="headers"
                  @load="(value) => loading = value"
                />
                <Local
                  v-if="currentSection.type === 'local'"
                  :props="currentSection"
                  @addSectionType="addSectionType"
                  :savedView="savedView"
                />
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- ------------------------------------------------------------------------------------------- -->

      <!-- page section types popup 'delete' -->
      <div v-show="isDeleteModalOpen" ref="modal" class="fixed z-50 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex h-full items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="section-modal-content bg-white relative shadow rounded-xl overflow-scroll">
            <div class="text-center h4 my-3  pb-3">
              {{ $t("delete-section-type") + selectedSectionTypeName}}
            </div>
            <div class="flex flex-row">
              <button
                class="hp-button"
                @click="deleteSectionType(selectedSectionTypeName, selectedSectionTypeIndex)"
              >
                <div class="btn-text">
                  {{ $t("Confirm") }}
                </div>
              </button>
              <button
                class="hp-button"
                @click="isDeleteModalOpen = false"
              >
                <div class="btn-text">
                  {{ $t("Cancel") }}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ------------------------------------------------------------------------------------------- -->

      <!-- Authorize configurable section types popup -->
      <div v-show="isAuthModalOpen" ref="modal" class="fixed z-50 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex h-full items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="section-modal-content bg-white relative shadow rounded-xl overflow-scroll">
            <div class="text-center h4 my-3 pb-4">
              {{ $t("authorize-section-type") + selectedAppName}}
            </div>
            <div class="flex flex-col gap-4">
              <div v-for="requiredInput in selectedSectionRequirements">
                <input
                  class="py-4 pl-6 border rounded-xl border-FieldGray h-48px w-full focus:outline-none"
                  type="text"
                  :placeholder="requiredInput"
                  v-model="requirementsInputs[requiredInput]"
                />
              </div>

              <div class="flex flex-row">
                <button
                  class="hp-button"
                  @click="authorizeSectionType(selectedSectionTypeAppId, selectedSectionTypeIndex)"
                >
                  <div class="btn-text">
                    {{ $t("Confirm") }}
                  </div>
                </button>
                <button
                  class="hp-button"
                  @click="isAuthModalOpen = false; requirementsInputs = {}"
                >
                  <div class="btn-text">
                    {{ $t("Cancel") }}
                  </div>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- ------------------------------------------------------------------------------------------- -->

      <!-- ------------------------------------------------------------------------------------------- -->

      <!-- UnAuthorize configurable section types popup -->
      <div v-show="isUnAuthModalOpen" ref="modal" class="fixed z-50 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex h-full items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="section-modal-content bg-white relative shadow rounded-xl overflow-scroll">
            <div class="text-center h4 my-3  pb-3">
              {{ $t("un-authorize-section-type") + selectedAppName }}
            </div>
            <div class="flex flex-col gap-4">

              <div class="flex flex-row">
                <button
                  class="hp-button"
                  @click="unAuthorizeSectionType(selectedSectionTypeAppId, selectedSectionTypeIndex)"
                >
                  <div class="btn-text">
                    {{ $t("Confirm") }}
                  </div>
                </button>
                <button
                  class="hp-button"
                  @click="isUnAuthModalOpen = false;"
                >
                  <div class="btn-text">
                    {{ $t("Cancel") }}
                  </div>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- ------------------------------------------------------------------------------------------- -->

      <!-- views rendered in homepage -->
      <div class="views">
        <draggable
          v-model="currentViews"
          group="people"
          @start="drag = true"
          @end="drag = false"
          handle=".handle"
        >
          <!-- <transition-group> -->
          <section
            v-for="(view, index) in currentViews"
            :key="index"
            :id="`${view.name}-${view.id}`"
            :class="{ [view.name]: true, 'view-in-edit-mode': editMode }"
          >
            <div class="section-view relative">
              <div
                class="controls flex flex-row justify-center p-1 rounded-xl top-0 right-2 absolute z-9 hide-mobile"
                v-if="admin && editMode"
              >
                <LinkIcon v-if="view.linkedTo" />
                <div @click="edit(view)" v-if="editable(view.type)">
                  <EditIcon class="edit-icon" />
                </div>
                <DragIcon class="drag-icon handle" />
                <div @click="deleteView(view.id)">
                  <TrashIcon class="trash-icon" />
                </div>
                <div @click="copyAnchor(`#${view.name}-${view.id}`)">
                  <AnchorIcon :title="`Anchor id: #${view.name}-${view.id}, click to copy`" class="edit-icon" />
                </div>
              </div>
              <div class="view-component" :style="{ background: viewsBgColor }">
                <component
                  v-if="view.settings || view.type == 'local'"
                  :is="getComponent(view.name, view.type)"
                  :section="view"
                  :lang="lang"
                />
                <div v-else>
                  <div v-if="admin" class="error-section-loaded">
                    Some sections could not be loaded correctly, saving the page
                    will delete these sections from your page, unless you are
                    happy with the page you see now, do not save it
                  </div>
                </div>
              </div>
            </div>
          </section>
          <!-- </transition-group> -->
        </draggable>
      </div>
      <div v-show="staticModal" :modal-class="'section-modal-main-wrapper'" ref="modal" class="fixed z-50 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex h-full items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="section-modal-content bg-white relative shadow rounded-xl overflow-scroll">
            <div class="section-modal-wrapper">
              <div class="text-center h4 header" v-if="!currentSection">
                <div class="title">{{ $t("section-title") }}:</div>
                <div class="closeIcon" @click="staticModal = false">
                  <CloseIcon />
                </div>
              </div>
              <div class="flex w-full justify-center">
                <div class="body">
                  <div style="margin-bottom: 10px;">
                    {{ $t("section-input-title") }}
                  </div>
                  <input
                    class="py-4 pl-6 border rounded-xl border-FieldGray h-48px w-full focus:outline-none"
                    type="text"
                    v-model="sectionTypeName"
                  />
                </div>
              </div>
              <div class="footer">
                <button class="hp-button" @click="addNewStaticType">
                  <div class="btn-icon check-icon"></div>
                  <div class="btn-text">
                    {{ $t("Continue") }}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-show="staticSuccess" :modal-class="'section-modal-main-wrapper'" ref="modal" class="fixed z-50 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex h-full items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="section-modal-content bg-white relative shadow rounded-xl overflow-scroll">
            <div class="section-modal-wrapper success-section-type">
              <div class="text-center h4 header">
                <div class="icon-head">
                  <CelebrateIcon />
                </div>
                <div class="title">
                  {{ $t("success-section-title") }}
                </div>
                <div class="closeIcon" @click="staticSuccess = false">
                  <CloseIcon />
                </div>
              </div>
              <div class="flex w-full justify-center">
                <div class="body">
                  <div class="subtitle">{{ $t("success-section-subtitle") }}:</div>
                  <div class="section-list">
                    <div class="dot"><DotIcon /></div>
                    <div>
                      {{ $t("success-section-instruction-1") }}
                    </div>
                  </div>
                  <div class="section-list">
                    <div class="dot"><DotIcon /></div>
                    <div>
                      {{ $t("success-section-instruction-2") }}
                    </div>
                  </div>
                  <div class="section-list">
                    <div class="dot"><DotIcon /></div>
                    <div>
                      {{ $t("success-section-instruction-3") }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="footer">
                <button class="hp-button" @click="staticSuccess = false">
                  <div class="btn-icon check-icon"></div>
                  <div class="btn-text">{{ $t("Done") }}</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Loading :loading="loading" />
    </div>
    <div v-else>
      <button v-if="admin" class="hp-button" @click="createNewPage">
        {{ $t("Create New Page") }}
      </button>
    </div>
  </div>
</template>

<script>
import { formatName, sectionHeader, importComp } from "../../utils";
import draggable from "vuedraggable";

// import sections types
import Static from "../../base/types/Static.vue";
import Dynamic from "../../base/types/Dynamic.vue";
import Configurable from "../../base/types/Configurable.vue";
import Local from "../../base/types/Local.vue";

// import icons
import Loading from "../../base/icons/Loading.vue";
import EditIcon from "../../base/icons/edit.vue";
import DragIcon from "../../base/icons/drag.vue";
import TrashIcon from "../../base/icons/trash.vue";
import LockedIcon from "../../base/icons/locked.vue";
import UnlockedIcon from "../../base/icons/unlocked.vue";
import ImportIcon from "../../base/icons/import.vue";
import ExportIcon from "../../base/icons/export.vue";
import BackIcon from "../../base/icons/back.vue";
import PlusIcon from "../../base/icons/plus.vue";
import CheckIcon from "../../base/icons/save.vue";
import CloseIcon from "../../base/icons/close.vue";
import SyncIcon from "../../base/icons/sync.vue";
import LinkIcon from "../../base/icons/link.vue";
import AnchorIcon from "../../base/icons/anchor.vue";
import CreateIcon from "../../base/icons/create.vue";
import DotIcon from "../../base/icons/dot.vue";
import CelebrateIcon from "../../base/icons/celebrate.vue";

import SectionItem from "../../base/SubTypes/sectionItem.vue";

import camelCase from "lodash/camelCase";
import upperFirst from "lodash/upperFirst";

export default {
  name: "Sections",
  components: {
    Loading,
    SyncIcon,
    Static,
    Dynamic,
    Local,
    Configurable,
    SectionItem,
    EditIcon,
    DragIcon,
    TrashIcon,
    LockedIcon,
    UnlockedIcon,
    ImportIcon,
    ExportIcon,
    BackIcon,
    PlusIcon,
    CheckIcon,
    CloseIcon,
    draggable,
    LinkIcon,
    AnchorIcon,
    CreateIcon,
    DotIcon,
    CelebrateIcon
  },
  props: {
    pageName: {
      type: String,
      default: "",
    },
    admin: {
      type: Boolean,
      default: false,
    },
    variations: {
      type: Array,
      default: () => [],
    },
    headers: {
      type: Object,
      default() {
        return {};
      },
    },
    reactiveTrigger: {
      type: String,
      default: "",
    },
    lang: {
      type: String,
      default: "en",
    },
    viewsBgColor: {
      type: String,
      default: "transparent",
    },
  },
  data() {
    return {
      sectionSettings: {
        settings: {}
      },
      staticSuccess: false,
      sectionTypeName: "",
      staticModal: false,
      sectionInPage: [],
      pageNotFound: false,
      dismissCountDown: 0,
      editMode: false,
      selectedVariation: this.pageName,
      types: [],
      sectionTypes: [],
      originalVariations: {},
      // current visible views
      views: {},
      getSections: [],
      loading: false,
      dragging: false,
      currentSection: null,
      isModalOpen: false,
      isDeleteModalOpen: false,
      isAuthModalOpen: false,
      isUnAuthModalOpen: false,
      synched: false,
      savedView: {},
      // all saved variations
      displayVariations: {
        [this.pageName]: {
          name: this.pageName,
          views: {},
          altered: false,
        },
      },
      selectedSectionTypeName: "",
      selectedAppName: "",
      selectedSectionTypeIndex: "",
      selectedSectionTypeAppId: "",
      selectedSectionRequirements: [],
      sectionsPageLastUpdated: null,
      requirementsInputs: {},
      allSections: {},
      sectionsError: ""
    }
  },
  computed: {
    activeVariation() {
      // If variation true return its page name
      const activeVar = this.variations.filter((variation) => variation.active);
      if (activeVar.length === 1) return activeVar[0];
      else if (activeVar.length > 1) {
        return activeVar[0];
      }
      // otherwise return the default pageName prop
      else return { name: "default", pageName: this.pageName };
    },
    currentViews: {
      get() {
        let views = [];
        views = Object.values(
          this.displayVariations[this.selectedVariation].views
        );
        views = views.sort(function(a, b) {
          return a.weight - b.weight;
        });

        return views;
      },
      set(newValue) {
        for (let index = 0; index < newValue.length; index++) {
          const replacement = newValue[index];
          replacement.weight = index;
          this.$set(
            this.displayVariations[this.selectedVariation].views,
            newValue[index].id,
            replacement
          );
        }
      },
    },
  },
  mounted() {
    if(this.sectionsError !== "") {
      this.showToast("Error", "error", "Couldn't load the page: " + this.sectionsError);
    }
  },
  async fetch() {
    this.loading = true;
    this.sectionsError = ""
    this.checkToken();
    // We check if this is running in the browser or not
    // because during SSR no cors preflight request is sent
    const inBrowser = typeof window !== 'undefined';

    const queryStringObject = {}
    if(Object.keys(this.$route.query).length !== 0) {
      Object.keys(this.$route.query).map((queryKey) => {
        queryStringObject[queryKey] = this.$route.query[queryKey]
      })
    }

    const config = {
      headers: sectionHeader(((inBrowser) ? {} : {origin: this.$sections.projectUrl})),
    };

    const URL = `${this.$sections.serverUrl}/project/${this.$sections.projectId}/page/${this.pageName}`;

    let payload = {}

    if (this.$sections.queryStringSupport && this.$sections.queryStringSupport === "enabled") {
      payload = {
        "query_string": queryStringObject
      }
    }

    if (inBrowser) {
      try {
        const res = await this.$axios.post(URL, payload, config)
        const sections = res.data.sections;
        this.allSections = res.data.sections;
        const views = {};
        sections.map((section) => {
          this.trackSectionComp(section.name, section.type);

          if (section.type === "configurable") {
            section.settings = section.render_data[0].settings;
            // Splitting the name of the configurable sections into nameID that has the full name of it including the id,
            // and name that has only name of the section which is going to be used for importing the section by using only its name on the host project.
            section.nameID = section.name;
            section.name = section.name.split(":")[1];
          } else if (section.settings) {
            section.settings = JSON.parse(section.settings);
          }
          if (section.id) {
            views[section.id] = section;
          } else {
            views["test"] = section;
          }
        });
        this.$set(this.displayVariations, this.activeVariation.pageName, {
          name: this.activeVariation.pageName,
          views: { ...views },
        });
        this.selectedVariation = this.activeVariation.pageName;
        this.loading = false;
        this.$emit("load", true);
        this.sectionsPageLastUpdated = res.data.last_updated;
      } catch (error) {
        if(error.response.data.error) {
          this.showToast("Error", "error", "Couldn't load the page: " + error.response.data.error);
        } else {
          this.showToast("Error", "error", "Couldn't load the page: " + error.response.data.message);
        }
        this.loading = false;
        this.pageNotFound = true;
        this.$emit("load", false);
      }
    } else {
      const optionsRes = await this.$axios.options(URL, config)
      if (optionsRes.status === 200) {
        console.log(`Options API Call success`)
        try {
          const res = await this.$axios.post(URL, payload, config)
          const sections = res.data.sections;
          this.allSections = res.data.sections;
          const views = {};
          sections.map((section) => {
            this.trackSectionComp(section.name, section.type);

            if (section.type === "configurable") {
              section.settings = section.render_data[0].settings;
              // Splitting the name of the configurable sections into nameID that has the full name of it including the id,
              // and name that has only name of the section which is going to be used for importing the section by using only its name on the host project.
              section.nameID = section.name;
              section.name = section.name.split(":")[1];
            } else if (section.settings) {
              section.settings = JSON.parse(section.settings);
            }
            if (section.id) {
              views[section.id] = section;
            } else {
              views["test"] = section;
            }
          });
          this.$set(this.displayVariations, this.activeVariation.pageName, {
            name: this.activeVariation.pageName,
            views: { ...views },
          });
          this.selectedVariation = this.activeVariation.pageName;
          this.loading = false;
          this.$emit("load", true);
          this.sectionsPageLastUpdated = res.data.last_updated;
        } catch (error) {
          if(error.response.data.error) {
            this.sectionsError = error.response.data.error
          } else {
            this.sectionsError = error.response.data.message
          }
          this.loading = false;
          this.pageNotFound = true;
          this.$emit("load", false);
        }
      }
    }
  },
  watch: {
    isModalOpen(value) {
      const body = document.querySelector("body");
      if(value === true) {
        body.style.overflow = "hidden";
      } else {
        body.style.overflow = "auto";
      }
    }
  },
  methods: {
    checkToken() {
      const auth_code = this.$route.query.auth_code;
      if (auth_code) {
        const config = {
          headers: sectionHeader({}),
        };
        const URL =
          `${this.$sections.serverUrl}/project/${this.$sections.projectId}/token/${auth_code}`;
        this.$axios
          .get(URL, config)
          .then((res) => {
            const token = res.data.token;
            const date = new Date();
            date.setDate(date.getDate() + 7);
            this.$cookies.set("sections-auth-token", token, {expires: date});
            this.$nuxt.context.redirect(this.$route.path)
            this.loading = false;
          })
          .catch((err) => {
            this.loading = false;
          });
      }
    },
    exportSections() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.allSections));
      const dlAnchorElem = document.getElementById('downloadAnchorElem');
      dlAnchorElem.setAttribute("href",     dataStr     );
      dlAnchorElem.setAttribute("download", `${this.pageName}.json`);
      dlAnchorElem.click();
    },
    initImportSections() {
      if (Object.keys(this.displayVariations[this.selectedVariation].views).length > 0) {
        this.showToast(
          "Warning",
          "warning",
          "Import sections only works for empty pages"
        );
      } else {
        this.$refs.jsonFilePick.click();
      }
    },
    importSections(e) {
      const jsonFile = e.target.files[0];
      const reader = new FileReader();
      reader.readAsText(jsonFile, "UTF-8");
      reader.onload = (evt) => {
        const jsonFileResult = evt.target.result;
        const sections = JSON.parse(jsonFileResult);
        let sectionsNames = []
        sections.forEach((section) => {
          sectionsNames.push(section.name);
          if (section.type === "configurable") {
            const sectionTypeObject = this.types.find(type => type.name === section.nameID);
            if((sectionTypeObject.access === 'private' || sectionTypeObject.access === 'public_scoped') && sectionTypeObject.app_status !== 'enabled') {
              this.showToast(
                "Warning",
                "warning",
                `Make sure to activate the configurable section ${section.name} for your project`
              );
            }
          }
          this.addSectionType(section, false);
        })
        this.showToast(
          "Success",
          "info",
          `Successfully imported ${sectionsNames.length} sections: ${sectionsNames.join(', ')}`
        );
      }
    },
    isJsonString(str) {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    },
    addNewStaticType() {
      if (this.sectionTypeName !== "") {
        const token = this.$cookies.get("sections-auth-token");
        const config = {
          headers: sectionHeader({ token }),
        };
        const URL =
          `${this.$sections.serverUrl}/project/${this.$sections.projectId}/section-types/${this.sectionTypeName}`;
        this.loading = true;
        this.$axios.post(URL, {}, config).then(() => {
          this.types = [];
          this.getSectionTypes();
          this.staticSuccess = true;
          this.loading = false;
        })
          .catch((error) => {
            this.showToast("Error", "error", "Couldn't create the new section type: " + error.response.data.message);
            this.loading = false;
          });
      } else {
        this.showToast("Error", "error", "Please enter the name of the section");
      }
    },
    openStaticSection() {
      this.staticModal = true;
    },
    trackSectionComp(sectionName, sectionType) {
      if (!this.sectionInPage.includes(sectionName)) {
        this.sectionInPage.push(sectionName);
        const name = upperFirst(
          camelCase(
            // Gets the file name regardless of folder depth
            sectionName
              .split("/")
              .pop()
              .replace(/\.\w+$/, "")
          )
        );
      }
    },
    getComponent(sectionName, sectionType) {
      let path = "";
      if (sectionName.includes(":")) {
        path = `/views/${sectionName.split(":")[1]}_${sectionType}`;
        this.$options.components[sectionName.split(":")[1]] = importComp(path);
      } else {
        path = `/views/${sectionName}_${sectionType}`;
        return importComp(path);
      }
    },
    createNewPage() {
      // pageName
      this.loading = true;
      const token = this.$cookies.get("sections-auth-token");
      const header = {
        token,
      };
      const config = {
        headers: sectionHeader(header),
      };
      const URL =  `${this.$sections.serverUrl}/project/${this.$sections.projectId}/page/${this.pageName}`;
      this.$axios
        .put(
          URL,
          {
            variations: [],
            sections: [],
          },
          config
        )
        .then((res) => {
          this.loading = false
          this.pageNotFound = false;
          this.showToast(
            "Success",
            "success",
            "Congratulations on successfully creating a new page on sections. Start adding some content to it."
          );
        })
        .catch((err) => {
          this.loading = false
          this.showToast(
            "Error creating page",
            "error",
            "We are unable to create a new sections page for " + this.pageName + "\n" + err.response.data.message
          );
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
    getSectionTypes() {
      if (this.types && this.types.length) {
        return;
      }
      this.loading = true;
      const token = this.$cookies.get("sections-auth-token");
      const config = {
        headers: sectionHeader({
          token,
        }),
      };
      const url =
        `${this.$sections.serverUrl}/project/${this.$sections.projectId}/section-types`;
      this.$axios
        .get(url, config)
        .then((res) => {
          res.data.data.map((d) => {
            this.trackSectionComp(d.name, d.type);
            this.types.push({
              name: d.name,
              type: d.type,
              access: d.access,
              application: d.application,
              dynamic_options: d.dynamic_options,
              fields: d.fields,
              multiple: d.multiple,
              application_id: d.application_id,
              app_status: d.app_status,
              requirements: d.requirements
            });
          });
          this.types = [...this.types, ...this.addSystemTypes()];
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          this.showToast("Error", "error", error.toString());
        });
    },
    addSystemTypes() {
      let staticTypes = [];
      const internal_types = require.context("../../../src/configs/views", false);
      let external_types = {};
      let external_path = "";
      try {
        external_types = require.context(`@/sections/views`, false);
        external_path = `@/sections/views`;
      } catch (error) {
        throw new Error(
          "vue-sections: Your project contains no @/sections folder"
        );
      }
      staticTypes = this.build_comp(
        staticTypes,
        { ...external_types },
        "external",
        external_path
      );
      staticTypes = this.build_comp(
        staticTypes,
        internal_types,
        "internal",
        "internal:path"
      );
      return [...new Set(staticTypes)];
    },
    build_comp(staticTypes, types, compType, path) {
      let names = staticTypes.map((obj) => {
        return obj.name;
      });
      types.keys().forEach((fileName) => {
        const splitName = fileName.split("_");
        const type = splitName[1];
        const mainName = splitName[0];
        if (type) {
          if (type == "local") {
            const name = camelCase(
              // Gets the file name regardless of folder depth
              mainName
                .split("/")
                .pop()
                .replace(/\.\w+$/, "")
            );
            if (!names.includes(name)) {
              this.trackSectionComp(name, "local");
              staticTypes.push({
                name,
                type,
                compType,
              });
              names.push(name);
            }
          }
        } else {
          if (fileName.includes(".vue")) {
            console.error(
              `vue-sections: ${fileName} in ${path} can't be registered! You should follow the naming convention of any registered component '{Section Name}_{Section Type}.vue'`
            );
          }
        }
      });
      return staticTypes;
    },
    async openEditMode() {
      this.getSectionTypes();
      if (!this.originalVariations[this.selectedVariation]) {
        this.originalVariations = JSON.parse(
          JSON.stringify(this.displayVariations)
        );
      }

      this.editMode = !this.editMode;

      if(this.editMode === true) {
        this.loading = true;
        const inBrowser = typeof window !== 'undefined';
        const config = {
          headers: sectionHeader(((inBrowser) ? {} : {origin: this.$sections.projectUrl})),
        };

        const queryStringObject = {}
        if(Object.keys(this.$route.query).length !== 0) {
          Object.keys(this.$route.query).map((queryKey) => {
            queryStringObject[queryKey] = this.$route.query[queryKey]
          })
        }

        const URL =
          `${this.$sections.serverUrl}/project/${this.$sections.projectId}/page/${this.pageName}`;

        let payload = {}

        if (this.$sections.queryStringSupport && this.$sections.queryStringSupport === "enabled") {
          payload = {
            "query_string": queryStringObject
          }
        }

        await this.$axios.post(URL, payload, config).then((res) => {
          this.loading = false;
          if(res.data.last_updated > this.sectionsPageLastUpdated) {
            this.showToast(
              "Warning",
              "warning",
              "The version of the page you have is an old one, please refresh your page before doing any modification"
            );
          }
        })
      }

    },
    formatName,
    editable(sectionType) {
      switch (sectionType) {
        case "local":
        case "dynamic":
          return false;
        case "static":
        case "configurable":
          return true;
      }
    },
    synch() {
      this.synched = true;
      // get all existing linked to
      const currentVariationView = this.displayVariations[
        this.selectedVariation
        ].views;

      // remove all existing linked to
      const withoutLinkedToValueList = Object.values(
        currentVariationView
      ).filter((view) => !view.linkedTo);
      // get default original values from the main
      let defaultVariationViews = Object.values(
        // we use an intermediary json object to deep clone the array
        JSON.parse(JSON.stringify(this.displayVariations[this.pageName].views))
      );
      // update the cloned list with a linkedTo id
      defaultVariationViews = defaultVariationViews.map((view) => {
        view.linkedTo = view.id;
        view.id = "id-" + view.id;
        return view;
      });
      // get the new added sections to this variation
      const finalSections = [
        ...withoutLinkedToValueList,
        ...defaultVariationViews,
      ];

      const finalViews = {};
      finalSections.map((section) => {
        finalViews[section.id] = section;
      });
      this.$set(
        this.displayVariations[this.selectedVariation],
        "views",
        finalViews
      );

      setTimeout(() => {
        this.synched = false;
      }, 1000);
    },
    addSectionType(section, showToast) {
      try {
        if (this.savedView.linkedTo) {
          const confirmed = window.confirm(
            "This section is linked to a main section, editing it will break the link, are you sure you want to proceed ?"
          );
          if (!confirmed) {
            return;
          }
        }
        if (section.weight === null || section.weight === "null") {
          section.weight = Object.keys(
            this.displayVariations[this.selectedVariation].views
          ).length;
        }

        section.linkedTo = "";
        this.$set(
          this.displayVariations[this.selectedVariation].views,
          section.id,
          section
        );

        if (this.selectedVariation === this.pageName) {
          // We check if there are variations that contains a section linked to the one we just edited
          // If there are, we edit them too so they stay in sync
          this.variations.map((variation) => {
            const newViews = Object.values(
              this.displayVariations[variation.pageName].views
            ).map((sectionVariation) => {
              if (sectionVariation.linkedTo === section.id)
                sectionVariation.settings = section.settings;
              return sectionVariation;
            });
            this.$set(this.displayVariations[variation.pageName], "views", {
              ...newViews,
            });
          });
        }

        this.currentViews = this.displayVariations[
          this.selectedVariation
          ].views;
        this.displayVariations[this.selectedVariation].altered = true;
        this.isModalOpen = false;
        this.savedView = {};
        this.loading = false;
        if(showToast !== false) {
          this.showToast(
            "Success",
            "info",
            "This sections was successfully added to your page but is now only visible to you."
          );
        }
      } catch (e) {
        this.showToast(
          "Error",
          "error",
          "We are unable to preview your section, try again later"
        );
      }
    },
    mutateVariation(variationName) {
      const sections = [];
      let views = this.displayVariations[variationName].views;
      views = Object.values(views);
      views.map((view) => {
        if(!view.error) {
          const refactorView = {
            id: view.id,
            weight: view.weight,
            name: view.name,
            type: view.type,
            linkedTo: view.linkedTo,
          };
          if (view.settings && view.type === "configurable") {
            refactorView.name = view.nameID;
            const options = [];
            view.render_data.map((rData) => {
              options.push(rData.settings);
            });
            refactorView.options = options;
          } else if (view.settings) {
            refactorView.options = JSON.stringify(view.settings);
          }
          if (refactorView.id.startsWith("id-")) {
            delete refactorView.id;
          }
          sections.push({ ...refactorView });
        }
      });

      const token = this.$cookies.get("sections-auth-token");
      const header = {
        token,
      };
      const config = {
        headers: sectionHeader(header),
      };

      const variables = {
        page: variationName,
        variations: [],
        sections,
      };
      const URL =
        `${this.$sections.serverUrl}/project/${this.$sections.projectId}/page/${variationName}`;
      this.$axios
        .put(URL, variables, config)
        .then((res) => {
          if (res.data && res.data.error) {
            this.showToast("error", "error", res.data.error);
            return;
          }
          this.sectionsPageLastUpdated = res.data.last_updated
          this.displayVariations[variationName].altered = false;
          this.loading = false;
          this.showToast(
            "Success",
            "success",
            "You have successfully saved your changes and they are now visible to your visitors"
          );
        })
        .catch((error) => {
          this.showToast(
            "Error saving your changes",
            "error",
            error.response.data.message
          );
          this.loading = false;
        });
    },
    saveVariation() {
      this.loading = true;
      // intialise the new views
      this.mutateVariation(this.pageName);
      this.variations.map((variation) => {
        this.mutateVariation(variation.pageName);
      });
    },
    edit(view) {
      this.types.map((type) => {
        if(view.type === "configurable") {
          if (type.name.split(":")[1] === view.name) {
            view.fields = type.fields;
            view.multiple = type.multiple;
            view.application_id = type.application_id;
            if (type.dynamicOptions) {
              view.dynamicOptions = true;
            }
          }
        } else {
          if (type.name === view.name) {
            view.fields = type.fields;
            view.multiple = type.multiple;
            if (type.dynamicOptions) {
              view.dynamicOptions = true;
            }
          }
        }
      });
      this.currentSection = view;
      this.savedView = view;
      this.isModalOpen = true;
    },
    restoreVariations() {
      this.displayVariations = JSON.parse(
        JSON.stringify(this.originalVariations)
      );
      this.showToast(
        "Revert Successful",
        "info",
        "You have successfully reverted your page to how it is currently showing to your visitors"
      );
    },
    deleteView(id) {
      if (this.selectedVariation === this.pageName) {
        // We check if there are variations that contains a section linked to the one we are about to delete
        // If there are, we unlink them
        this.variations.map((variation) => {
          const newViews = Object.values(
            this.displayVariations[variation.pageName].views
          ).map((section) => {
            if (section.linkedTo === id) section.linkedTo = "";
            return section;
          });
          this.$set(this.displayVariations[variation.pageName], "views", {
            ...newViews,
          });
        });
      }
      // Then we remove the variation we want to delete
      this.$delete(this.displayVariations[this.selectedVariation].views, id);
      this.showToast(
        "Deleted",
        "info",
        "Your section has been removed, save your page to display this change to your visitors"
      );
    },
    copyAnchor(anchor) {
      navigator.clipboard.writeText(anchor);
    },
    errorAddingSection(error) {
      this.isModalOpen = !error.closeModal;
      this.showToast(error.title, "error", error.message);
    },
    deleteSectionType(sectionTypeName, index) {
      this.isDeleteModalOpen = false
      this.loading = true
      this.$emit("load", true);
      const token = this.$cookies.get("sections-auth-token");
      const config = {
        headers: sectionHeader(({origin: this.$sections.projectUrl, token})),
      };
      const URL =
        `${this.$sections.serverUrl}/project/${this.$sections.projectId}/section-types/${sectionTypeName}`;
      this.$axios
        .delete(URL, config)
        .then((res) => {
          this.showToast(
            "Success",
            "info",
            res.data.message
          );
          this.types.splice(index, 1)
          this.loading = false
          this.$emit("load", false);
        })
        .catch((error) => {
          this.showToast("Error", "error", "Couldn't delete section type: " + error.response.data.message);
          this.loading = false
          this.$emit("load", false);
        });
    },
    authorizeSectionType(sectionAppId, index) {
      this.isDeleteModalOpen = false
      this.loading = true
      this.$emit("load", true);
      const token = this.$cookies.get("sections-auth-token");
      const config = {
        headers: sectionHeader(({origin: this.$sections.projectUrl, token})),
      };
      const URL =
        `${this.$sections.serverUrl}/project/${this.$sections.projectId}/authorization_fields/${sectionAppId}`;

      let authorization_fields = {}

      for(let requiredItem of this.selectedSectionRequirements) {
        authorization_fields[requiredItem] = this.requirementsInputs[requiredItem]
      }
      const data = {
        authorization_fields
      };
      this.$axios
        .put(URL, data, config)
        .then((res) => {
          this.showToast(
            "Success",
            "info",
            this.$t("authorizeSuccess", {appName: this.selectedAppName})
          );
          this.isAuthModalOpen = false;
          this.requirementsInputs = {}
          this.types[index].app_status = "enabled"
          this.loading = false
          this.$emit("load", false);
        })
        .catch((error) => {
          this.showToast("Error", "error", `Couldn't authorize sections from ${this.selectedAppName}: ` + error.response.data.message);
          this.loading = false
          this.$emit("load", false);
        });
    },
    unAuthorizeSectionType(sectionAppId, index) {
      this.isDeleteModalOpen = false
      this.loading = true
      this.$emit("load", true);
      const token = this.$cookies.get("sections-auth-token");
      const config = {
        headers: sectionHeader(({origin: this.$sections.projectUrl, token})),
      };
      const URL =
        `${this.$sections.serverUrl}/project/${this.$sections.projectId}`;

      let data = {
        configured_fields: {
          [sectionAppId]: {
            app_status: "disabled"
          }
        }
      }

      this.$axios
        .put(URL, data, config)
        .then((res) => {
          this.showToast(
            "Success",
            "info",
            this.$t("unAuthorizeSuccess", {appName: this.selectedAppName})
          );
          this.isUnAuthModalOpen = false;
          this.types[index].app_status = "disabled"
          this.loading = false
          this.$emit("load", false);
        })
        .catch((error) => {
          this.showToast("Error", "error", `Couldn't un-authorize sections from ${this.selectedAppName}: ` + error.response.data.message);
          this.loading = false
          this.$emit("load", false);
        });
    },
    openDeleteSectionTypeModal(sectionTypeName, index) {
      this.selectedSectionTypeName = sectionTypeName
      this.selectedSectionTypeIndex = index
      this.isDeleteModalOpen = true
    },
    openAuthConfigurableSectionTypeModal(sectionAppId, index, requirements, sectionTypeName, applicationName) {
      this.selectedSectionTypeAppId = sectionAppId
      this.selectedSectionTypeIndex = index
      this.selectedSectionRequirements = requirements
      this.selectedSectionTypeName = sectionTypeName
      this.selectedAppName = applicationName
      this.isAuthModalOpen = true
    },
    openUnAuthConfigurableSectionTypeModal(sectionAppId, index, sectionTypeName, applicationName) {
      this.selectedSectionTypeAppId = sectionAppId
      this.selectedSectionTypeIndex = index
      this.selectedSectionTypeName = sectionTypeName
      this.selectedAppName = applicationName
      this.isUnAuthModalOpen = true
    },
    openCurrentSection(type) {
      if(type.app_status === 'disbaled' || type.app_status === 'disabled') {
        this.showToast("Authorisation warning", "warning", this.$t("authorizeFirst"));
      } else this.currentSection = type
    }
  }
}
</script>

<style>
.sections-config {
  min-height: 100vh;
}
.sections-config .control-button {
  position: absolute;
  z-index: 999;
  left: 0;
  top: 60px;
}
.section-view .controls {
  background: #f5f5f5;
  position: absolute !important;
  right: 10px !important;
  top: 10px;
}
.section-view .controls svg {
  cursor: pointer;
  width: 40px;
  height: 40px;
  color: #31a9db;
  margin: 3px;
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
button {
  max-height: 64px;
  width: auto;
  min-width: auto;
  border-radius: 16px;
  height: auto;
  padding: 6px 8px;
  min-height: auto;
  margin: 10px;
}
button svg {
  width: 20px;
  height: 20px;
}
.hp-button {
  outline: none;
  max-width: 1000px;
  display: flex;
  background: #31a9db;
  border: none;
  color: white;
  align-items: center;
  justify-content: center;
}
.hp-button:hover {
  background: #298cb6;
  transition: 0.1s;
}
.hp-button div {
  display: flex;
  align-items: center;
  justify-content: center;
}
.hp-button .btn-icon {
  margin-right: 8px;
}
.hp-button .btn-icon svg {
  color: white;
  width: 24px;
  height: 24px;
}
.hp-button.danger {
  background: red;
}
.hp-button.danger:hover {
  background: rgb(214, 1, 1);
  transition: 0.1s;
}
.hp-button.grey {
  background: #8b8b8b;
}
.hp-button.grey:hover {
  background: rgb(143, 142, 142);
  transition: 0.1s;
}
.section-wrapper {
  position: relative;
}
.section-wrapper .create-static-section {
  border-color: #257596;
  color: #257596;
  background: white;
  position: absolute;
  top: 50px;
  left: 0;
  padding: 0;
  display: flex;
  border-width: 2px;
  border: 2px solid #257596;
}
.section-wrapper .create-static-section:hover {
  background: #257596;
  color: white;
}
.section-wrapper .create-static-section:hover .btn-icon {
  background: white;
}
.section-wrapper .create-static-section:hover svg {
  color: #257596;
}
.section-wrapper .create-static-section .btn-icon {
  background: #257596;
  color: white;
  width: 48px;
  height: 36px;
  border-top-left-radius: 14px;
  border-bottom-left-radius: 14px;
}
.section-wrapper .create-static-section .btn-text {
  padding-right: 10px;
}
.danger {
  color: white;
}

.error-section-loaded {
  text-align: center;
  color: rgb(216, 42, 42);
  font-size: 17px;
  width: 50%;
  margin: 0 auto;
  padding: 15px;
  font-weight: 500;
}
.mainmsg {
  color: #686868;
}

.section-delete {
  text-align: -webkit-right;
}

.section-delete-icon {
  cursor: pointer;
  margin-top: 3px;
}

.trash-icon-style {
  height: 20px;
  width: 20px;
  color: white;
}
.section-modal-main-wrapper.modal-body {
  position: initial;
}
span.handle {
  width: 20px;
  height: 20px;
  display: block;
  border: 1px solid grey;
}

.buttons-wrapper {
  max-width: 800px;
  margin: 0 auto;
}
.component-view {
  margin: 0 auto;
}
.views {
  margin: 0 auto;
}
.part2 {
  margin-top: 3px;
  z-index: 9;
  position: relative;
}
.section-modal-content {
  padding: 2rem;
}
.modal-header,
.modal-footer {
  display: none !important;
}
.modal-content {
  padding: 15px;
  border-radius: 1.3rem;
  outline: none;
  width: auto;
  margin: 0 auto;
  display: -webkit-box;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  min-width: 65%;
}
.modalContainer {
  overflow: visible;
}
.modal-dialog {
  width: 100% !important;
  max-width: 1200px;
  margin: 0 auto;
}
.bg-light-grey-hp {
  background: #f5f5f5;
}
.sync {
  color: red;
  cursor: pointer;
}
.sync svg {
  width: 20px;
  height: 20px;
  color: red;
  margin-right: 3px;
}

.synched {
  display: flex;
  align-items: center;
}
.synched @-moz-keyframes spin {
           100% {
             -moz-transform: rotate(360deg);
           }
         }
.synched @-webkit-keyframes spin {
           100% {
             -webkit-transform: rotate(360deg);
           }
         }
.synched @keyframes spin {
           100% {
             -webkit-transform: rotate(360deg);
             transform: rotate(360deg);
           }
         }
.synched svg {
  -webkit-animation: spin 1.5s linear infinite;
  -moz-animation: spin 1.5s linear infinite;
  animation: spin 1.5s linear infinite;
}
.modalContainer {
  padding: 20px;
  position: fixed !important;
  inset: 0;
}
.modalContainer .section-item {
  width: 100%;
  height: 130px;
  margin: 0px;
}
.modalContainer .section-item-box {
  display: flex;
  flex-direction: column;
}
.modalContainer .type-items {
  display: grid;
  grid-template-columns: repeat(4, 130px);
  grid-gap: 35px;
  justify-content: center;
}
.bg-grey {
  --tw-bg-opacity: 0.5 !important;
  background-color: rgb(0 0 0 / var(--tw-bg-opacity)) !important;
}
.h4 {
  font-size: 1.5rem;
}
.modalContainer .closeIcon,
.step-back {
  cursor: pointer;
}
.modalContainer .closeIcon,
.step-back svg {
  width: 45px;
  height: 45px;
  transition: 0.2s;
}
.modalContainer .closeIcon,
.step-back svg:hover {
  transition: 0.2s;
}
.modalContainer
.step-back {
  position: absolute;
}
.modalContainer
.step-back svg {
  color: #8b8b8b;
}
.modalContainer
.step-back svg:hover {
  color: darken(#8b8b8b, 10%);
}
.modalContainer
.closeIcon {
  position: absolute;
  right: 10px;
}
.modalContainer
.closeIcon svg {
  width: 45px;
  height: 45px;
  color: #31a9db;
}
.modalContainer
.closeIcon svg:hover {
  color: darken(#31a9db, 10%);
}
.widthSpace {
  width: 45px;
}
.z-50 {
  z-index: 2000 !important;
}
.section-modal-wrapper {
  max-width: 780px;
}
.section-modal-wrapper.success-section-type .header {
  flex-direction: column;
  align-items: center;
}
.section-modal-wrapper.success-section-type .icon-head {
  margin-bottom: 10px;
}
.section-modal-wrapper .body {
  width: 60%;
  margin: 20px auto;
}
.section-modal-wrapper .subtitle {
  font-style: italic;
  text-align: center;
  width: 75%;
  margin: 0 auto 10px auto;
  color: #454545;
  font-weight: 400;
}
.section-modal-wrapper .section-list {
  color: #a7a7a7;
  display: flex;
  margin: 5px 0;
}
.section-modal-wrapper .dot {
  color: #31a9db;
  margin-right: 10px;
}
.section-modal-wrapper .header {
  margin: 20px 0 40px 0;
  display: flex;
  justify-content: center;
}
.section-modal-wrapper .title {
  width: 75%;
}
.section-modal-wrapper .closeIcon {
  position: absolute;
  top: 10px;
  right: 10px;
}
.section-modal-wrapper .closeIcon svg {
  height: 40px;
  width: 40px;
}
.section-modal-wrapper .body {
  margin: 20px 0;
}
.section-modal-wrapper .body .section-input {
  width: 100%;
  height: 50px;
}
.section-modal-wrapper .footer {
  display: flex;
  justify-content: center;
}
.section-modal-wrapper .footer {
  display: flex;
  justify-content: center;
}
.section-modal-wrapper .footer .hp-button {
  width: 200px;
}
.flex {
  display: flex !important;
}
.justify-between {
  justify-content: space-between;
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
