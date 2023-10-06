<template>
  <div class="sections-config justify-center">
    <div v-if="!pageNotFound">
      <!-- This is the Admin page section when admin user can edit/move/delete/create/add/import/export/restore sections to the page -->
      <button
        @click="openEditMode()"
        v-if="admin"
        class="bg-blue control-button hide-mobile btn-text"
      >
        {{ !editMode ? $t("Edit page") : $t("View page") }}
      </button>
      <div class="bg-light-grey-hp hide-mobile section-wrapper">
        <div v-if="admin && editMode" class="p-3 text-center mainmsg pt-3">
          {{ $t('changesPublished') }}
        </div>

        <div
          class="pb-4 flexSections flex-row justify-center hide-mobile"
          v-if="admin && editMode"
        >
          <button
            class="hp-button"
            @click="layoutMode = !layoutMode"
          >
            <div class="btn-text">{{ layoutMode === true ? $t("hideLayout") : $t("editLayout") }}</div>
          </button>
          <div v-if="layoutMode === true" class="layoutSelect-container">
            <div class="layoutSelect-select-wrapper">
              <select v-model="selectedLayout" id="select" name="select" class="layoutSelect-select" @change="computeLayoutData">
                <option disabled value="">-- Select layout --</option>
                <option v-for="layout in availableLayouts" :value="layout">{{ layout }}</option>
              </select>
              <div class="layoutSelect-arrow-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M10 12L5 7h10l-5 5z" />
                </svg>
              </div>
            </div>
          </div>
          <div v-if="layoutMode === true" class="custom-checkbox">
            <span class="mainmsg">{{ $t('highlightRegions') }}</span>
            <label class="switch">
              <input type="checkbox" id="highlightRegions" v-model="highlightRegions">
              <span class="slider round"></span>
            </label>
            <!--            <input type="checkbox" id="highlightRegions" v-model="highlightRegions" />-->
            <label for="highlightRegions"></label>
          </div>
          <button
            v-if="selectedLayout === 'standard'"
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
          <div class="flexSections control-button config-buttons" style="right: 0px; left: auto; top: 0;">
            <button
              class="hp-button "
              :class="selectedVariation === pageName ? 'danger' : 'grey'"
              data-toggle="tooltip" data-placement="top" :title="$t('exportSectionsLabel')"
              @click="exportSections"
            >
              <ImportIcon />
            </button>
            <a id="downloadAnchorElem" style="display:none"></a>
            <button
              class="hp-button "
              :class="selectedVariation === pageName ? 'danger' : 'grey'"
              data-toggle="tooltip" data-placement="top" :title="$t('importSectionsLabel')"
              @click="initImportSections"
            >
              <ExportIcon />
            </button>
            <button
              class="hp-button danger"
              data-toggle="tooltip" data-placement="top" :title="$t('deletePage')"
              @click="isDeletePageModalOpen = true">
              <TrashIcon class="trash-icon-style" />
            </button>
            <button
              class="hp-button "
              :class="selectedVariation === pageName ? 'danger' : 'grey'"
              data-toggle="tooltip" data-placement="top" :title="$t('settingsSectionsLabel')"
              @click="metadataModal = true"
            >
              <SettingsIcon />
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
      <div
        class="bg-light-grey-hp p-3 flexSections flex-row justify-center part2 hide-mobile"
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
              displayVariations[pageName].altered ? dismissCountDown = 4 :
              selectedVariation = v.pageName
            "
          >
            <div class="btn-text">{{ v.name }}</div>
          </button>
          <div
            class="sync flexSections flex-row p-4 justify-center"
            v-if="selectedVariation === v.pageName"
            @click="synch()"
          >
            <div class="icon" :class="{ synched }"><SyncIcon /></div>
            <span>{{ $t("Synchronise") }}</span>
          </div>
        </div>
      </div>

      <!-- ------------------------------------------------------------------------------------------- -->

      <!-- This is the 'add' section types popup that has a list of all section types added to the project and clicking on one of them opens the form of it to create and add it to the page -->
      <div v-if="isModalOpen && admin && editMode" ref="modal" class="fixed section-modal-content z-50 bg-grey bg-opacity-25 inset-0 p-8 modalContainer" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flexSections items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="section-modal-content bg-white relativeSections shadow rounded-xl">
            <div class="flexSections flex-row relativeSections justify-center">
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
                <div v-if="type.type !== 'configurable'" class="flexSections pl-2 pb-1" style="font-size: 10px;">
                  {{ $t('by') + type.application }}
                </div>
                <div v-if="type.app_status === 'disbaled' || type.app_status === 'disabled'" class="section-delete">
                  <div class="section-delete-icon" @click="openAuthConfigurableSectionTypeModal(type.application_id, index, type.requirements, type.name, type.application)">
                    <div class="flexSections justify-between items-end">
                      <div v-if="type.type === 'configurable'" class="flexSections pl-2 pb-1" style="font-size: 8px;">
                        {{ $t('by') + type.application }}
                      </div>
                      <LockedIcon class="trash-icon-style p-1" />
                    </div>
                  </div>
                </div>
                <div v-else-if="type.type === 'configurable'" class="section-delete">
                  <div class="section-delete-icon" @click="openUnAuthConfigurableSectionTypeModal(type.application_id, index, type.name, type.application)">
                    <div class="flexSections justify-between items-end">
                      <div class="flexSections pl-2 pb-1" style="font-size: 8px;">
                        {{ $t('by') + type.application }}
                      </div>
                      <UnlockedIcon class="trash-icon-style p-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="flexSections">
              <div class="component-view">
                <!-- we can use this short hand too -->
                <!-- <component :is="currentSection.type" :props="currentSection"  /> -->
                <Static
                  v-if="currentSection.type === 'static'"
                  :props="currentSection"
                  @addSectionType="addSectionType"
                  :savedView="savedView"
                  :locales="locales"
                  :translation-component-support="translationComponentSupport"
                  :sections-user-id="sectionsUserId"
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

      <!-- This is delete section types popup that opens when the admin click on the trash icon located at the top right of each section type inside the popup list above -->
      <div v-if="isDeleteModalOpen && admin && editMode" ref="modal" class="fixed z-50 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flexSections fullHeightSections items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="section-modal-content bg-white relativeSections shadow rounded-xl overflow-scroll">
            <div class="text-center h4 my-3  pb-3">
              {{ $t("delete-section-type") + selectedSectionTypeName}}
            </div>
            <div class="flexSections flex-row">
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

      <!-- This is delete section page popup that opens when the admin click on the delete page button in red located at the top bottom of the page -->
      <div v-if="isDeletePageModalOpen && admin && editMode" ref="modal" class="fixed z-50 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flexSections fullHeightSections items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="section-modal-content bg-white relativeSections shadow rounded-xl overflow-scroll">
            <div class="flexSections flex-row justify-center items-center">
              <AlertIcon />
              <div class="text-center h4 my-3 pb-3 deletePageLabel">
                {{ $t("deletePage") }}
              </div>
            </div>
            <div class="text-center h4 my-3  pb-3 deletePageConfirmation">
              {{ $t("delete-section-page") }}
            </div>
            <div class="flexSections flex-row justify-center">
              <button
                class="hp-button danger"
                @click="deleteSectionPage()"
              >
                <div class="btn-text">
                  {{ $t("Confirm") }}
                </div>
              </button>
              <button
                class="hp-button"
                @click="isDeletePageModalOpen = false"
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

      <!-- This is delete section page popup that opens when the admin click on the delete page button in red located at the top bottom of the page -->
      <div v-if="isDeleteSectionModalOpen && admin && editMode" ref="modal" class="fixed z-50 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flexSections fullHeightSections items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="section-modal-content bg-white relativeSections shadow rounded-xl overflow-scroll">
            <div class="flexSections flex-row justify-center items-center">
              <AlertIcon />
              <div class="text-center h4 my-3 pb-3 deletePageLabel">
                {{ $t("deleteSection") }}
              </div>
            </div>
            <div class="text-center h4 my-3  pb-3 deletePageConfirmation">
              {{ $t("delete-section") }}
            </div>
            <div class="flexSections flex-row justify-center">
              <button
                class="hp-button danger"
                @click="deleteView(deletedSectionId)"
              >
                <div class="btn-text">
                  {{ $t("Confirm") }}
                </div>
              </button>
              <button
                class="hp-button"
                @click="isDeleteSectionModalOpen = false"
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

      <!-- This is errors formats sections popup that opens when the admin click on the alert icon button in red located near the option to edit or delete a section -->
      <div v-if="isErrorsFormatModalOpen && admin && editMode" ref="modal" class="fixed z-50 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flexSections fullHeightSections items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="section-modal-content bg-white relativeSections shadow rounded-xl overflow-scroll">
            <div class="text-center flexSections h4 sectionTypeHeader">
              <AlertIcon />
              <div class="closeIcon" @click="isErrorsFormatModalOpen = false">
                <CloseIcon />
              </div>
            </div>
            <div class="text-center h4 my-3  pb-3 deletePageConfirmation">
              {{ displayedErrorFormat }}
            </div>
          </div>
        </div>
      </div>

      <!-- ------------------------------------------------------------------------------------------- -->

      <!-- This is the popup that has the required fields loaded from section response requirements in order to authorize configurable section types, it opens when clicking on the lock icon located at the bottom left of a section configurable type -->
      <div v-if="isAuthModalOpen && admin && editMode" ref="modal" class="fixed z-50 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flexSections fullHeightSections items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="section-modal-content bg-white relativeSections shadow rounded-xl overflow-scroll">
            <div class="text-center h4 my-3 pb-4">
              {{ $t("authorize-section-type") + selectedAppName}}
            </div>
            <div class="flexSections flex-col gap-4">
              <div v-for="requiredInput in selectedSectionRequirements">
                <input
                  class="py-4 pl-6 border rounded-xl border-FieldGray h-48px w-full focus:outline-none"
                  type="text"
                  :placeholder="requiredInput"
                  v-model="requirementsInputs[requiredInput]"
                />
              </div>

              <div class="flexSections flex-row">
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

      <!-- This is the popup that opens when clicking on the lock icon located at the bottom left of a section configurable type to unAuthorize it -->
      <div v-if="isUnAuthModalOpen && admin && editMode" ref="modal" class="fixed z-50 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flexSections fullHeightSections items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="section-modal-content bg-white relativeSections shadow rounded-xl overflow-scroll">
            <div class="text-center h4 my-3  pb-3">
              {{ $t("un-authorize-section-type") + selectedAppName }}
            </div>
            <div class="flexSections flex-col gap-4">

              <div class="flexSections flex-row">
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

      <!-- Views rendered in homepage: This section is for Admin users and it is where the saved sections views are implemented, they can be dragged to change their order, can be edited/deleted and has the options to copy its anchor id  -->
      <div v-if="errorInLayout === true && admin && editMode" class="views">
        <div class="flexSections not-found-error">
          <div class="flexSections not-found-error-column">
            <ErrorIcon class="error-icon" />
            <div v-for="(error, index) in sectionsMainErrors" :key="`layout-error-${index}`" class="mainmsg not-found-error-column">
              {{ error }}
            </div>
            <div v-for="(layoutError, layoutIndex) in sectionsLayoutErrors" :key="`layout-region-error-${layoutIndex}`" class="mainmsg not-found-error-column">
              {{ layoutError }}
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="selectedLayout === 'standard'" class="views">
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
            <div class="section-view relativeSections">
              <div
                class="controls flexSections flex-row justify-center p-1 rounded-xl top-0 right-2 absolute z-9 hide-mobile"
                v-if="admin && editMode"
              >
                <div v-if="sectionsFormatErrors[view.weight] || view.error" @click="isErrorsFormatModalOpen = true; displayedErrorFormat = sectionsFormatErrors[view.weight] ? sectionsFormatErrors[view.weight] : view.error">
                  <AlertIcon />
                </div>
                <LinkIcon v-if="view.linkedTo" />
                <div @click="edit(view)" v-if="editable(view.type)">
                  <EditIcon class="edit-icon" />
                </div>
                <DragIcon class="drag-icon handle" />
                <div @click="isDeleteSectionModalOpen = true; deletedSectionId = view.id">
                  <TrashIcon class="trash-icon" />
                </div>
                <div @click="copyAnchor(`#${view.name}-${view.id}`)">
                  <AnchorIcon :title="`Anchor id: #${view.name}-${view.id}, ${$t('clickToCopy')}`" class="edit-icon" />
                </div>
              </div>
              <div class="view-component" :class="admin && editMode && invalidSectionsErrors[`${view.name}-${view.weight}`] && invalidSectionsErrors[view.name].error && invalidSectionsErrors[`${view.name}-${view.weight}`].weight === view.weight ? 'invalidSection' : ''" :style="{ background: viewsBgColor }">
                <div v-if="admin && editMode && invalidSectionsErrors[`${view.name}-${view.weight}`] && invalidSectionsErrors[`${view.name}-${view.weight}`].error && invalidSectionsErrors[`${view.name}-${view.weight}`].weight === view.weight" class="error-section-loaded">
                  {{ $t('invalidSectionsError') + invalidSectionsErrors[`${view.name}-${view.weight}`].error }}
                </div>
                <component
                  v-if="view.settings || view.type == 'local'"
                  :is="getComponent(view.name, view.type)"
                  :section="view"
                  :lang="lang"
                  :locales="locales"
                  :editor-options="editorOptions"
                />
                <div v-else>
                  <div v-if="admin" class="error-section-loaded">
                    {{ $t('sectionsNotLoadedCorrectly') }}
                  </div>
                </div>
              </div>
            </div>
          </section>
          <!-- </transition-group> -->
        </draggable>
      </div>
      <div v-else>
        <component :is="getSelectedLayout()">
          <template v-for="slotName in layoutSlotNames" v-slot:[slotName]>
            <!-- Empty div injected to verify the slots              -->
            <div :id="`sections-slot-region-${selectedLayout}-${slotName}`"></div>
            <div v-if="admin && editMode" class="bg-light-grey-hp p-3 flexSections flex-row justify-center part3 hide-mobile">
              <button
                class="hp-button"
                @click.stop.prevent="
              (currentSection = null), (isModalOpen = true), (savedView = {}), (selectedSlotRegion = slotName)
            "
              >
                <div class="btn-icon plus-icon"><PlusIcon /></div>
                <div class="btn-text">{{ $t("Add") }}</div>
              </button>
              <div class="slot-name">
                {{ $t(slotName.toUpperCase()) }}
              </div>
            </div>
            <div class="views">
              <draggable
                v-model="viewsPerRegions[slotName]"
                group="people"
                @start="drag = true; highlightRegions = true;"
                @end="drag = false; highlightRegions = false;"
                @change="logDrag"
                handle=".handle"
                :class="{ 'highlited-regions-plus': viewsPerRegions[slotName].length === 0 && highlightRegions, }"
              >
                <!-- <transition-group> -->
                <section
                  v-for="(view, index) in viewsPerRegions[slotName]"
                  v-if="view.region[selectedLayout].slot === slotName"
                  :key="index"
                  :id="`${view.name}-${view.id}`"
                  :class="{ [view.name]: true, 'view-in-edit-mode': editMode, 'highlited-regions': highlightRegions }"
                >
                  <div class="section-view relativeSections">
                    <div
                      class="controls flexSections flex-row justify-center p-1 rounded-xl top-0 right-2 absolute z-9 hide-mobile"
                      v-if="admin && editMode"
                    >
                      <div v-if="sectionsFormatErrors[view.weight] || view.error" @click="isErrorsFormatModalOpen = true; displayedErrorFormat = sectionsFormatErrors[view.weight] ? sectionsFormatErrors[view.weight] : view.error">
                        <AlertIcon />
                      </div>
                      <LinkIcon v-if="view.linkedTo" />
                      <div @click="edit(view)" v-if="editable(view.type)">
                        <EditIcon class="edit-icon" />
                      </div>
                      <DragIcon class="drag-icon handle" />
                      <div @click="isDeleteSectionModalOpen = true; deletedSectionId = view.id">
                        <TrashIcon class="trash-icon" />
                      </div>
                      <div @click="copyAnchor(`#${view.name}-${view.id}`)">
                        <AnchorIcon :title="`Anchor id: #${view.name}-${view.id}, ${$t('clickToCopy')}`" class="edit-icon" />
                      </div>
                    </div>
                    <div class="view-component" :class="admin && editMode && invalidSectionsErrors[`${view.name}-${view.weight}`] && invalidSectionsErrors[`${view.name}-${view.weight}`].error && invalidSectionsErrors[`${view.name}-${view.weight}`].weight === view.weight ? 'invalidSection' : ''" :style="{ background: viewsBgColor }">
                      <div v-if="admin && editMode && invalidSectionsErrors[`${view.name}-${view.weight}`] && invalidSectionsErrors[`${view.name}-${view.weight}`].error && invalidSectionsErrors[`${view.name}-${view.weight}`].weight === view.weight" class="error-section-loaded">
                        {{ $t('invalidSectionsError') + invalidSectionsErrors[`${view.name}-${view.weight}`].error }}
                      </div>
                      <component
                        v-if="view.settings || view.type == 'local'"
                        :is="getComponent(view.name, view.type)"
                        :section="view"
                        :lang="lang"
                        :locales="locales"
                        :editor-options="editorOptions"
                      />
                      <div v-else>
                        <div v-if="admin" class="error-section-loaded">
                          {{ $t('sectionsNotLoadedCorrectly') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <!-- </transition-group> -->
              </draggable>
            </div>
          </template>
        </component>
      </div>

      <!-- ------------------------------------------------------------------------------------------- -->

      <!-- This is the popup to create a new static section type     -->
      <div v-if="staticModal && admin && editMode" :modal-class="'section-modal-main-wrapper'" ref="modal" class="fixed z-50 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flexSections fullHeightSections items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="section-modal-content bg-white relativeSections shadow rounded-xl overflow-scroll">
            <div class="section-modal-wrapper">
              <div class="text-center h4 sectionTypeHeader">
                <div class="title">{{ $t("section-title") }}:</div>
                <div class="closeIcon" @click="staticModal = false">
                  <CloseIcon />
                </div>
              </div>
              <div class="flexSections w-full justify-center">
                <div class="body" style="text-align: start;">
                  <div class="sectionsFieldsLabels">
                    {{ $t("section-input-title") }}
                  </div>
                  <input
                    class="py-4 pl-6 border rounded-xl border-FieldGray h-48px w-full focus:outline-none"
                    type="text"
                    v-model="sectionTypeName"
                  />
                  <div class="mt-2 sectionsFieldsLabels">
                    {{ $t("fieldNames") }}
                  </div>
                  <div class="fieldsDescription">
                    {{ $t("fieldDesc") }}
                  </div>
                  <div v-for="(field,k) in fieldsInputs" :key="k" class="flexSections flex-col mb-4">
                    <div class="flexSections">
                      <input
                        v-model="field.name"
                        class="py-4 pl-6 border rounded-xl border-FieldGray h-48px w-full focus:outline-none"
                        type="text"
                        :placeholder="`${$t('field')} #${k+1}`"
                      />
                      <span class="flexSections flex-row pl-2 items-center">
                        <span v-show="k || ( !k && fieldsInputs.length > 1)" class="cursor-pointer text-3xl" @click="removeField(k)">-</span>
                        <span v-show="k === fieldsInputs.length - 1" class="cursor-pointer text-3xl pl-3" @click="addField(k)">+</span>
                      </span>
                    </div>
                  </div>
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

      <!-- ------------------------------------------------------------------------------------------- -->

      <!-- This is the popup to updatethe page metadata     -->
      <div v-if="metadataModal && admin && editMode" :modal-class="'section-modal-main-wrapper'" ref="modal" class="fixed z-50 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flexSections fullHeightSections items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="section-modal-content bg-white relativeSections shadow rounded-xl overflow-scroll">
            <div class="section-modal-wrapper">
              <div class="text-center h4 sectionTypeHeader">
                <div class="title">{{ $t("Metadata") }}</div>
                <div class="closeIcon" @click="metadataModal = false; metadataFormLang = locales[0]">
                  <CloseIcon />
                </div>
              </div>
              <TranslationComponent v-if="translationComponentSupport" :locales="locales"  @setFormLang="(locale) => metadataFormLang = locale"/>
              <div class="flexSections w-full justify-center">
                <div class="body metadataFieldsContainer">
                  <div class="sectionsFieldsLabels">
                    {{ $t("pageUrl") }}
                  </div>
                  <div class="fieldsDescription">
                    {{ $t("pathFieldDesc") }}
                  </div>
                  <input
                    class="py-4 pl-6 border rounded-xl border-FieldGray h-48px w-full focus:outline-none"
                    type="text"
                    v-model="pagePath"
                  />
                  <span class="pagePathRequiredStyle" v-show="metadataErrors.path[0] !== ''">{{ metadataErrors.path[0] }}</span>
                  <div class="flexSections metadataFields">
                    <div class="metadataColumns">
                      <div class="mt-2 sectionsFieldsLabels">
                        {{ $t("pageTitle") }}
                      </div>
                      <input
                        class="py-4 pl-6 border rounded-xl border-FieldGray h-48px w-full focus:outline-none"
                        type="text"
                        v-model="pageMetadata[metadataFormLang].title"
                      />
                      <div class="mt-2 sectionsFieldsLabels">
                        {{ $t("pageSeoDesc") }}
                      </div>
                      <textarea
                        class="py-4 pl-6 border rounded-xl border-FieldGray w-full focus:outline-none"
                        type="text"
                        v-model="pageMetadata[metadataFormLang].description"
                      />
                    </div>
                  </div>

                </div>
              </div>
              <div class="footer">
                <button class="hp-button" @click="updatePageMetaData">
                  <div class="btn-icon check-icon"></div>
                  <div class="btn-text">
                    {{ $t("Save") }}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ------------------------------------------------------------------------------------------- -->

      <!-- This is popup to show the successfully created new static section message      -->
      <div v-if="staticSuccess && admin && editMode" :modal-class="'section-modal-main-wrapper'" ref="modal" class="fixed z-50 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flexSections fullHeightSections items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="section-modal-content bg-white relativeSections shadow rounded-xl overflow-scroll">
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
              <div class="flexSections w-full justify-center">
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

      <!-- ------------------------------------------------------------------------------------------- -->

      <Loading :loading="loading" />
    </div>
    <div v-else>
      <!-- This is to show the create a new page button when the page requested is not found     -->
      <button v-if="admin" class="hp-button btn-text" @click="createNewPage">
        {{ $t("Create New Page") }}
      </button>
      <div class="flexSections not-found-error">
        <div class="flexSections not-found-error-column">
          <ErrorIcon class="error-icon" />
          <div v-for="(error, index) in sectionsMainErrors" :key="index" class="mainmsg not-found-error-column">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {formatName, sectionHeader, importComp} from "../../utils";
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
import AlertIcon from "../../base/icons/alert.vue";
import SettingsIcon from "../../base/icons/settings.vue";
import ErrorIcon from "../../base/icons/error.vue";

import SectionItem from "../../base/SubTypes/sectionItem.vue";

import camelCase from "lodash/camelCase";
import upperFirst from "lodash/upperFirst";

import TranslationComponent from "../../components/Translations/TranslationComponent";

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
    CelebrateIcon,
    AlertIcon,
    SettingsIcon,
    TranslationComponent,
    ErrorIcon
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
    editorOptions: {
      type: Object,
      default() {
        return {}
      }
    },
    viewsBgColor: {
      type: String,
      default: "transparent",
    },
    _sectionsOptions: {
      type: Object
    }
  },
  head() {
    return {
      title: this.computedTitle,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.computedDescription
        }
      ]
    }
  },
  data() {
    return {
      locales: ['en', 'fr'],
      translationComponentSupport: false,
      sectionSettings: {
        settings: {}
      },
      staticSuccess: false,
      sectionTypeName: "",
      staticModal: false,
      metadataModal: false,
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
      isDeletePageModalOpen: false,
      isDeleteSectionModalOpen: false,
      deletedSectionId: null,
      isErrorsFormatModalOpen: false,
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
      pageId: "",
      pagePath: "",
      sectionsPageName: "",
      pageMetadata: {},
      metadataErrors: {
        path: [""]
      },
      sectionsError: "",
      sectionsErrorOptions: null,
      sectionsAdminError: "",
      fieldsInputs: [
        {
          type: "image",
          name: ""
        }
      ],
      metadataFormLang: '',
      computedTitle: '',
      computedDescription: '',
      sectionsUserId: '',
      displayedErrorFormat: '',
      invalidSectionsErrors: {},
      sectionsFormatErrors: {},
      layoutSlotNames: [],
      availableLayouts: ['standard'],
      selectedLayout: 'standard',
      viewsPerRegions: {},
      sectionslayout: 'standard',
      selectedSlotRegion: '',
      layoutMode: false,
      errorInLayout: false,
      highlightRegions: false,
      sectionsMainErrors: [],
      sectionsLayoutErrors: []
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
    }
  },
  mounted() {
    if(this.sectionsError !== "") {
      this.showToast("Error", "error", this.$t('loadPageError') + this.sectionsError, this.sectionsErrorOptions);
    } else if (this.sectionsAdminError !== "") {
      this.showToast("Error", "error", this.sectionsAdminError);
    }
  },
  async fetch() {
    this.getAvailableLayouts()
    this.sectionsMainErrors = []
    this.metadataFormLang = this.locales[0]
    this.locales.forEach(lang => {
      this.pageMetadata[lang] = {
        title: "",
        description: ""
      }
    })
    if(this.$sections.projectLocales && this.$sections.projectLocales !== '' && this.$sections.projectLocales.includes(',')) {
      this.translationComponentSupport = true
      this.locales = []
      this.locales = this.$sections.projectLocales.split(',')
      this.metadataFormLang = this.locales[0]
      this.locales.forEach(lang => {
        this.pageMetadata[lang] = {
          title: "",
          description: ""
        }
      })
    }
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

    const URL = `${this.$sections.serverUrl}/project/${this.$sections.projectId}/page/${encodeURIComponent(this.pageName)}`;

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
        this.pageId = res.data.id;
        this.pagePath = res.data.path;
        this.sectionsPageName = res.data.page;
        this.sectionslayout = res.data.layout;
        this.selectedLayout = res.data.layout;
        for (const lang of this.locales) {
          if (res.data.metadata && res.data.metadata[lang] && res.data.metadata[lang].title) this.pageMetadata[lang].title = res.data.metadata[lang].title;
          if (res.data.metadata && res.data.metadata[lang] && res.data.metadata[lang].description) this.pageMetadata[lang].description = res.data.metadata[lang].description;
        }
        this.computedTitle = this.pageMetadata[this.lang].title
        this.computedDescription = this.pageMetadata[this.lang].description
        const views = {};
        sections.map((section) => {
          this.trackSectionComp(section.name, section.type);

          if (section.type === "configurable") {
            // The below condition is set to replace old image fields in settings that were saved as objects,
            // which was causing the section using this field to be discarded and no more saved to the page
            // after the media content linking update on sections server that requires image field to be an array
            if (!Array.isArray(section.render_data[0].settings.image)) {
              section.render_data[0].settings.image = []
            }
            section.settings = section.render_data[0].settings;
            // Splitting the name of the configurable sections into nameID that has the full name of it including the id,
            // and name that has only name of the section which is going to be used for importing the section by using only its name on the host project.
            section.nameID = section.name;
            section.name = section.name.split(":")[1];
          } else if (section.settings) {
            section.settings = this.isJsonString(section.settings) ? JSON.parse(section.settings) : section.settings;
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
          this.showToast("Error", "error", this.$t('loadPageError') + error.response.data.error);
        } else {
          this.showToast("Error", "error", this.$t('loadPageError') + error.response.data.message, error.response.data.options);
        }
        this.loading = false;
        this.pageNotFound = true;
        this.sectionsMainErrors.push(this.$t('404NotFound'));
        this.$emit("load", false);
      }
    } else {
      const optionsRes = await this.$axios.options(URL, config)
      if (optionsRes.status === 200) {
        try {
          const res = await this.$axios.post(URL, payload, config)
          const sections = res.data.sections;
          this.allSections = res.data.sections;
          this.pageId = res.data.id;
          this.pagePath = res.data.path;
          this.sectionsPageName = res.data.page;
          this.sectionslayout = res.data.layout;
          this.selectedLayout = res.data.layout;
          for (const lang of this.locales) {
            if (res.data.metadata && res.data.metadata[lang] && res.data.metadata[lang].title) this.pageMetadata[lang].title = res.data.metadata[lang].title;
            if (res.data.metadata && res.data.metadata[lang] && res.data.metadata[lang].description) this.pageMetadata[lang].description = res.data.metadata[lang].description;
          }
          this.computedTitle = this.pageMetadata[this.lang].title
          this.computedDescription = this.pageMetadata[this.lang].description
          const views = {};
          sections.map((section) => {
            this.trackSectionComp(section.name, section.type);

            if (section.type === "configurable") {
              // The below condition is set to replace old image fields in settings that were saved as objects,
              // which was causing the section using this field to be discarded and no more saved to the page
              // after the media content linking update on sections server that requires image field to be an array
              if (!Array.isArray(section.render_data[0].settings.image)) {
                section.render_data[0].settings.image = []
              }
              section.settings = section.render_data[0].settings;
              // Splitting the name of the configurable sections into nameID that has the full name of it including the id,
              // and name that has only name of the section which is going to be used for importing the section by using only its name on the host project.
              section.nameID = section.name;
              section.name = section.name.split(":")[1];
            } else if (section.settings) {
              section.settings = this.isJsonString(section.settings) ? JSON.parse(section.settings) : section.settings;
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
          if (error.response.status === 404) {
            this.$nuxt.context.res.statusCode = 404
          }
          if(error.response.data.error) {
            this.sectionsError = error.response.data.error
          } else {
            this.sectionsError = error.response.data.message
            this.sectionsErrorOptions = error.response.data.options
          }
          this.loading = false;
          this.pageNotFound = true;
          this.sectionsMainErrors.push(this.$t('404NotFound'));
          this.$emit("load", false);
        }
      }
    }
    this.computeLayoutData()
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
    updatePageMetaData() {
      this.loading = true
      this.metadataErrors.path[0] = ''

      const sections = [];
      let views = this.originalVariations[this.pageName].views;
      views = Object.values(views);
      views.forEach((view) => {
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
            refactorView.options = view.settings;
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

      let pagePath = this.pagePath && this.pagePath !== "" ? this.pagePath.trim() : "";

      if(pagePath !== '/') {

        // Split the URL into individual path segments
        const pathSegments = pagePath.split('/');

        // Filter out empty segments and remove duplicates
        const uniquePathSegments = pathSegments.filter((segment, index) => segment !== '' && segment !== pathSegments[index - 1]);

        // Reconstruct the URL with the unique path segments
        pagePath = pagePath.endsWith('/') ? '/' + uniquePathSegments.join('/') + '/' : '/' + uniquePathSegments.join('/');

        if (pagePath[0] && pagePath[0] === '/') {
          pagePath = pagePath.replace(/^\/+/, '')
        }
        while (pagePath.endsWith('//')) {
          pagePath = pagePath.slice(0, -1);
        }
      }

      const variables = {
        page: this.sectionsPageName,
        path: pagePath,
        metadata: this.pageMetadata,
        variations: [],
        sections
      };
      const URL =
        `${this.$sections.serverUrl}/project/${this.$sections.projectId}/page/${encodeURIComponent(this.sectionsPageName)}`;

      this.$axios
        .put(URL, variables, config)
        .then((res) => {
          this.loading = false
          if (res.data && res.data.error) {
            this.showToast("error", "error", res.data.error);
            return;
          }
          this.sectionsPageLastUpdated = res.data.last_updated
          this.metadataModal = false
          this.metadataFormLang = this.locales[0]
          this.showToast(
            "Success",
            "success",
            this.$t('successSettingsChanges')
          );
          if (pagePath !== this.pageName) {
            let baseURL = window.location.origin;
            let routerBase = this.$router.options.base
            if(routerBase) {
              while (routerBase.endsWith('/')) {
                routerBase = routerBase.slice(0, -1);
              }
              baseURL = baseURL + routerBase
            }
            window.location.replace(`${baseURL}/${pagePath}`);
          }
        })
        .catch((error) => {
          this.loading = false
          if(error.response.data.errors) {
            this.metadataErrors = error.response.data.errors
          } else {
            this.showToast(
              "Error saving your changes",
              "error",
              error.response.data.message,
              error.response.data.options
            );
          }
        });
    },
    addField(index) {
      if (this.fieldsInputs[index].name.trim() !== '') {
        this.fieldsInputs.push({ type: "image", name: "" });
      }
    },
    removeField(index) {
      this.fieldsInputs.splice(index, 1);
    },
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
            this.$nuxt[`$${this._sectionsOptions.cookiesAlias}`].set("sections-auth-token", token, {expires: date});
            this.$nuxt.context.redirect(this.$route.path)
            this.loading = false;
          })
          .catch((err) => {
            this.loading = false;
            this.sectionsAdminError = err.response.data.token
          });
      }
    },
    getUserData() {
      const config = {
        headers: sectionHeader({token: this.$cookies.get("sections-auth-token")}),
      };
      const URL =
        `${this.$sections.serverUrl}/project/${this.$sections.projectId}/user`;
      this.$axios
        .get(URL, config)
        .then((res) => {
          this.sectionsUserId = res.data.id
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
        });
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
          this.$t('importSections')
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
                `${this.$t('activateConfigSections')} ${section.name} ${this.$t('forProject')}`
              );
            }
          }
          this.addSectionType(section, false);
        })
        this.showToast(
          "Success",
          "info",
          `${this.$t('successImported')} ${sectionsNames.length} sections: ${sectionsNames.join(', ')}`
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

        let fieldsDeclaration = this.fieldsInputs
        fieldsDeclaration = fieldsDeclaration.filter(field => field.name.trim() !== '')

        this.$axios.post(URL, {
          "fields": fieldsDeclaration
        }, config).then(() => {
          this.types = [];
          this.getSectionTypes();
          this.staticSuccess = true;
          this.sectionTypeName = "";
          this.fieldsInputs = [
            {
              type: "image",
              name: ""
            }
          ]
          this.loading = false;
        })
          .catch((error) => {
            this.showToast("Error", "error", this.$t('createSectionTypeError') + error.response.data.message, error.response.data.options);
            this.loading = false;
          });
      } else {
        this.showToast("Error", "error", this.$t('enterSectionTypeName'));
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
    getAvailableLayouts() {
      try {
        const external_layouts = require.context(`@/sections/layouts`, false, /\.vue$/)
        const layouts_count = external_layouts.keys().length
        if (layouts_count > 0) {
          const layouts_names = external_layouts.keys().map((filename) => {
            const name = filename.replace(/^\.\/(.+)\.vue$/, '$1');
            return name;
          });
          this.availableLayouts.push(...layouts_names)
        }
      } catch (error) {
        console.log('noLayoutsFolder')
      }
    },
    getSelectedLayout() {
      let path = "";
      path = `/layouts/${this.selectedLayout}`;
      if (this.selectedLayout === 'standard') {
        return 'div'
      } else return importComp(path);
    },
    computeLayoutData() {
      const slotNameExample = 'i.e. slotNames: { type: Array, default() { return [\'region1\'] }}';
      this.errorInLayout = false;
      if (this.selectedLayout !== 'standard') {
        this.sectionsMainErrors = [];
        this.sectionsLayoutErrors = [];
        let path = "";
        path = `/layouts/${this.selectedLayout}`;
        this.layoutSlotNames = [];
        let layoutComp = importComp(path);
        if (!layoutComp.props) {
          this.errorInLayout = true;
          this.sectionsMainErrors.push(this.$t('layoutErrors.missingComp'))
          return;
        } else if (!layoutComp.props.slotNames) {
          this.errorInLayout = true;
          this.sectionsMainErrors.push(this.$t('layoutErrors.missingProp'))
          this.sectionsMainErrors.push(slotNameExample)
          return;
        } else if (!layoutComp.props.slotNames.type || layoutComp.props.slotNames.type !== Array || !layoutComp.props.slotNames.default) {
          this.errorInLayout = true;
          this.sectionsMainErrors.push(this.$t('layoutErrors.propArray'))
          this.sectionsMainErrors.push(slotNameExample)
          return;
        }
        try {
          this.layoutSlotNames = [...importComp(path).props.slotNames.default()]
        } catch {
          this.errorInLayout = true;
          this.sectionsMainErrors.push(this.$t('layoutErrors.propArray'))
          this.sectionsMainErrors.push(slotNameExample)
          return;
        }

        if (!layoutComp.props.slotNames.default()[0]) {
          this.errorInLayout = true;
          this.sectionsMainErrors.push(this.$t('layoutErrors.propArray'))
          this.sectionsMainErrors.push(slotNameExample)
          return;
        }

        let views = [];
        views = Object.values(
          this.displayVariations[this.selectedVariation].views
        );
        views.map(view => {
          if (!view.region[this.selectedLayout] || !view.region[this.selectedLayout]['slot']) {
            view.region[this.selectedLayout] = {
              slot: this.layoutSlotNames[0],
              weight: view.weight
            }
          }
        })
        this.layoutSlotNames.forEach(slotName => {
          this.viewsPerRegions[slotName] = []
          views.forEach(view => {
            if (view.region[this.selectedLayout].slot === slotName) {
              this.viewsPerRegions[slotName].push(view)
            }
          })
          let selectedLay = this.selectedLayout
          this.viewsPerRegions[slotName] = this.viewsPerRegions[slotName].sort(function(a, b) {
            return a.region[selectedLay].weight - b.region[selectedLay].weight;
          });
        })
        if (this.admin && this.editMode){
          this.verifySlots();
        }
      }
    },
    verifySlots() {
      this.$nextTick(() => {
        if (this.selectedLayout !== 'standard') {
          this.sectionsLayoutErrors = [];
          this.layoutSlotNames.forEach(slotName => {
            if(!document.getElementById(`sections-slot-region-${this.selectedLayout}-${slotName}`)) {
              this.errorInLayout = true;
              this.sectionsLayoutErrors.push(slotName.charAt(0).toUpperCase() + slotName.slice(1) + ' ' + this.$t('layoutErrors.regionNotConfigured'))
              this.sectionsLayoutErrors.push(`<slot name=\"${slotName}\"></slot> ${this.$t('layoutErrors.layoutTemp')}`)
              return;
            }
          })
        }
      })
    },
    logDrag(evt) {
      Object.keys(this.viewsPerRegions).forEach(slotName => {
        this.viewsPerRegions[slotName].forEach((view, index) => {
          if (view.region[this.selectedLayout]['slot'] !== slotName) {
            view.region[this.selectedLayout]['slot'] = slotName
          }
          view.region[this.selectedLayout]['weight'] = index
        })
      })
      this.computeLayoutData()
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
      const URL =  `${this.$sections.serverUrl}/project/${this.$sections.projectId}/page/${encodeURIComponent(this.pageName)}`;
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
          this.sectionsMainErrors = []
          this.sectionsPageLastUpdated = res.data.last_updated;
          this.pageId = res.data.id;
          this.sectionsPageName = res.data.page;
          this.pagePath = res.data.path;
          this.allSections = []
          this.showToast(
            "Success",
            "success",
            this.$t('createPageSuccess')
          );
        })
        .catch((err) => {
          this.loading = false
          let error = err.response.data.message
          if (err.response.data.errors && err.response.data.errors.path) {
            error = `${this.$t('pageUrl')} ${err.response.data.errors.path[0]}`
          }
          this.showToast(
            "Error creating page",
            "error",
            this.$t('createPageError') + this.pageName + "\n" + error,
            err.response.data.options
          );
        });
    },
    showToast(title, variant, message, options) {
      this.$toast[variant](options && Object.keys(options).length > 0 ? '🔗 ' + message : message, {
        position: "top-right",
        timeout: 5000,
        closeOnClick: false,
        pauseOnFocusLoss: true,
        pauseOnHover: true,
        draggable: true,
        draggablePercent: 0.6,
        showCloseButtonOnHover: false,
        hideProgressBar: false,
        closeButton: "button",
        icon: false,
        rtl: false,
        onClick: () => options && Object.keys(options).length > 0 ? window.open(`${options.link.root}${options.link.path}`, '_blank') : {}
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
          this.$t('noSectionsFolder')
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
              `nuxt-sections: ${fileName} ${this.$t('in')} ${path} ${this.$t('cannotRegisterComp')}`
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
          `${this.$sections.serverUrl}/project/${this.$sections.projectId}/page/${encodeURIComponent(this.pageName)}`;

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
              this.$t('oldPageVersion')
            );
          }
        })
        this.getUserData();
        this.verifySlots();
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
            this.$t('linkedSection')
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

        if (this.selectedLayout !== 'standard') {
          section.region = {};
          section.region[this.selectedLayout] = {
            slot: this.selectedSlotRegion,
            weight: Object.keys(
              this.displayVariations[this.selectedVariation].views
            ).length
          };
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
        this.computeLayoutData();
        if(showToast !== false) {
          this.showToast(
            "Success",
            "info",
            this.$t('successAddedSection')
          );
        }
      } catch (e) {
        this.showToast(
          "Error",
          "error",
          this.$t('previewSectionError')
        );
      }
    },
    mutateVariation(variationName) {
      this.invalidSectionsErrors = {}
      this.sectionsFormatErrors = {}
      const sections = [];
      let views = this.displayVariations[variationName].views;
      views = Object.values(views);
      let formatValdiation = true
      views.map((view) => {
        if(!view.error) {
          const refactorView = {
            id: view.id,
            weight: view.weight,
            name: view.name,
            type: view.type,
            linkedTo: view.linkedTo,
            region: view.region
          };
          if (view.settings && view.type === "configurable") {
            refactorView.name = view.nameID;
            const options = [];
            view.render_data.map((rData) => {
              if (!Array.isArray(rData.settings.image)) {
                formatValdiation = false
                this.showToast(
                  "",
                  "error",
                  this.$t('imageFieldValidation') + view.name
                );
                return;
              }
              options.push(rData.settings);
            });
            refactorView.options = options;
          } else if (view.settings) {
            refactorView.options = view.settings;
          }
          if (refactorView.id.startsWith("id-")) {
            delete refactorView.id;
          }
          sections.push({ ...refactorView });
        }
      });

      let integrityCheck = true
      if (sections.length > 0) {
        this.types.forEach(type => {
          if (type.fields && Array.isArray(type.fields) && type.fields.length > 0) {
            sections.forEach(section => {
              if (section.name === type.name) {
                if (Array.isArray(section.options)) {
                  type.fields.forEach(field => {
                    section.options.forEach(option => {
                      if (Object.keys(option).includes(field.name)) {
                        if(option[field.name] && (Array.isArray(option[field.name]) || typeof option[field.name] === 'object')) {
                          if (Array.isArray(option[field.name])) {
                            if ((!option[field.name][0].media_id || !option[field.name][0].url) && option[field.name].length !== 0) {
                              integrityCheck = false
                              this.loading = false;
                              this.showToast(
                                "Error saving your changes",
                                "error",
                                `${this.$t('wrongFieldName')} \`${field.name}\` ${this.$t('formatOfSection')} \`${section.name}\``
                              );
                              this.sectionsFormatErrors[section.weight] = `${this.$t('wrongFieldName')} \`${field.name}\` ${this.$t('formatOfSection')} \`${section.name}\``
                            }
                          } else if (typeof option[field.name] === 'object') {
                            if (!option[field.name].media_id || !option[field.name].url || Object.keys(option[field.name]).length === 0) {
                              integrityCheck = false
                              this.loading = false;
                              this.showToast(
                                "Error saving your changes",
                                "error",
                                `${this.$t('wrongFieldName')} \`${field.name}\` ${this.$t('formatOfSection')} \`${section.name}\``
                              );
                              this.sectionsFormatErrors[section.weight] = `${this.$t('wrongFieldName')} \`${field.name}\` ${this.$t('formatOfSection')} \`${section.name}\``
                            }
                          }
                        }
                      }
                    })
                  })
                } else {
                  integrityCheck = false
                  this.loading = false;
                  this.showToast(
                    "Error saving your changes",
                    "error",
                    `${this.$t('optionsFormat')} \`${section.name}\``
                  );
                  this.sectionsFormatErrors[section.weight] = `${this.$t('optionsFormat')} \`${section.name}\``
                }
              }
            })
          }
        })
      }

      if (integrityCheck === true && this.errorInLayout !== true) {
        const token = this.$cookies.get("sections-auth-token");
        const header = {
          token,
        };
        const config = {
          headers: sectionHeader(header),
        };

        const variables = {
          page: this.sectionsPageName,
          path: this.pagePath && this.pagePath !== "" ? this.pagePath.trim() : undefined,
          metadata: this.pageMetadata,
          variations: [],
          layout: this.selectedLayout,
          sections,
        };
        const URL =
          `${this.$sections.serverUrl}/project/${this.$sections.projectId}/page/${encodeURIComponent(this.sectionsPageName)}`;

        if (formatValdiation === true) {
          this.$axios
            .put(URL, variables, config)
            .then((res) => {
              if (res.data && res.data.error) {
                this.showToast("error", "error", res.data.error);
                return;
              }
              this.allSections = res.data.sections
              this.sectionsPageLastUpdated = res.data.last_updated
              this.displayVariations[variationName].altered = false;
              this.originalVariations = JSON.parse(
                JSON.stringify(this.displayVariations)
              );
              this.sectionslayout = res.data.layout;
              this.loading = false;
              if (res.data.invalid_sections && res.data.invalid_sections.length > 0) {
                this.showToast(
                  "Error",
                  "error",
                  this.$t('someSectionsNotSaved')
                );
                res.data.invalid_sections.forEach(section => {
                  this.invalidSectionsErrors[`${section.name}-${section.weight}`] = {
                    error: section.error,
                    weight: section.weight
                  }
                })
              } else {
                this.showToast(
                  "Success",
                  "success",
                  this.$t('successPageChanges')
                );
                this.layoutMode = false;
              }
              if (this.pagePath !== this.pageName) {
                this.$nuxt.context.redirect(this.pagePath)
              }
            })
            .catch((error) => {
              if(error.response.data.errors) {
                this.metadataErrors = error.response.data.errors
              } else {
                this.showToast(
                  "Error saving your changes",
                  "error",
                  error.response.data.message,
                  error.response.data.options
                );
              }
              this.loading = false;
            });
        } else this.loading = false;
      } else this.loading = false;
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
      this.selectedLayout = this.sectionslayout;
      this.computeLayoutData();
      this.showToast(
        "Revert Successful",
        "info",
        this.$t('revertPageSuccess')
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
      this.isDeleteSectionModalOpen = false;
      this.showToast(
        "Deleted",
        "info",
        this.$t('sectionRemoved')
      );
      this.computeLayoutData();
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
          this.showToast("Error", "error", this.$t('deleteSectionTypeError') + error.response.data.message);
          this.loading = false
          this.$emit("load", false);
        });
    },
    deleteSectionPage() {
      this.isDeletePageModalOpen = false
      this.loading = true
      this.$emit("load", true);
      const token = this.$cookies.get("sections-auth-token");
      const config = {
        headers: sectionHeader(({origin: this.$sections.projectUrl, token})),
      };
      const URL =
        `${this.$sections.serverUrl}/project/${this.$sections.projectId}/page/${this.pageId}`;
      this.$axios
        .delete(URL, config)
        .then((res) => {
          this.showToast(
            "Success",
            "info",
            res.data.message
          );
          this.loading = false
          this.$emit("load", false);
          setTimeout(() => window.location.reload(), 1000)
        })
        .catch((error) => {
          this.showToast("Error", "error", this.$t('deleteSectionPageError') + error.response.data.message);
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
          this.showToast("Error", "error", `${this.$t('authorizeError')} ${this.selectedAppName}: ` + error.response.data.message);
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
          this.showToast("Error", "error", `${this.$t('unAuthorizeError')} ${this.selectedAppName}: ` + error.response.data.message);
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
.sections-config .control-button.config-buttons {
  position: absolute;
  z-index: 999;
  left: 0;
  top: 60px;
}
.sections-config .control-button {
  position: fixed;
  z-index: 999;
  left: 0;
  top: 60px;
}
.section-view .controls {
  background: #f5f5f5;
  position: absolute !important;
  right: 10px !important;
  top: 10px;
  z-index: 40 !important;
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
.part2 .create-static-section {
  border-color: #257596;
  color: #257596;
  background: white;
  position: absolute;
  left: 0;
  padding: 0;
  display: flex;
  border-width: 2px;
  border: 2px solid #257596;
}
.part2 .create-static-section:hover {
  background: #257596;
  color: white;
}
.part2 .create-static-section:hover .btn-icon {
  background: white;
}
.part2 .create-static-section:hover svg {
  color: #257596;
}
.part2 .create-static-section .btn-icon {
  background: #257596;
  color: white;
  width: 48px;
  height: 36px;
  border-top-left-radius: 14px;
  border-bottom-left-radius: 14px;
}
.part2 .create-static-section .btn-text {
  padding-right: 10px;
}
.btn-text {
  font-size: 16px;
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
.part3 {
  margin-top: 3px;
  z-index: 40;
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
  margin-top: 8px;
  margin-right: 10px;
}
.section-modal-wrapper .header {
  margin: 20px 0 40px 0;
  display: flex;
  justify-content: center;
}
.section-modal-wrapper .sectionTypeHeader {
  display: flex;
  justify-content: center;
}
.section-modal-wrapper .title {
  width: 75%;
}
.section-modal-wrapper .closeIcon {
  position: absolute;
  top: 25px;
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
.flexSections {
  display: flex !important;
}
.relativeSections {
  position: relative !important;
}
.fullHeightSections {
  height: 100%;
}
.justify-between {
  justify-content: space-between;
}
.content-wrapper {
  overflow-y: scroll;
  height: 550px;
}
.deletePageLabel {
  size: 20px;
}
.deletePageConfirmation {
  margin: 20px 0 20px 0;
}
.metadataFieldsContainer {
  width: 780px
}
.metadataFieldsContainer input {
  font-size: 16px;
  padding-left: 16px;
}
.metadataFieldsContainer textarea {
  font-size: 16px;
  padding-left: 16px;
  max-height: 150px;
}
.section-modal-wrapper .body input {
  font-size: 16px;
  padding-left: 16px;
}
@media only screen and (max-height: 800px) {
  .content-wrapper {
    overflow-y: scroll;
    height: 450px;
  }
}

.Vue-Toastification__toast-body {
  cursor: pointer;
}

.metadataFields {
  justify-content: space-between;
}
.metadataColumns {
  width: 100%;
  padding: 4px;
}
.pagePathRequiredStyle {
  color: red;
}
.fieldsDescription {
  font-weight: lighter;
  font-size: 12px;
  color: gray;
  margin-bottom: 10px;
  text-align: start;
}
.view-component {
  overflow: auto;
}
.rounded-xl {
  border-radius: 0.75rem !important;
}
.sectionsFieldsLabels {
  margin-bottom: 5px;
  text-align: start;
  font-weight: 700;
}

.invalidSection {
  border: solid 2px red;
  margin-top: 5px;
  margin-bottom: 5px;
}

.layoutSelect-container {
  display: flex;
  align-items: center;
}

.layoutSelect-label {
  color: #4a5568;
  font-size: 0.875rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.layoutSelect-select-wrapper {
  position: relative;
  margin-left: 10px;
}

.layoutSelect-select {
  appearance: none;
  width: 100%;
  background-color: transparent;
  border: 1px solid #cbd5e0;
  color: #4a5568;
  padding: 0.5rem 0.75rem;
  padding-right: 2rem;
  border-radius: 16px;
  line-height: 1.25;
  outline: none;
}

.layoutSelect-select:focus {
  border-color: #718096;
}

.layoutSelect-arrow-icon {
  pointer-events: none;
  position: absolute;
  top: 3px;
  right: 0;
  display: flex;
  align-items: center;
  padding: 0.5rem;
  color: #4a5568;
}

.layoutSelect-arrow-icon svg {
  fill: currentColor;
  height: 1rem;
  width: 1rem;
}

.slot-name {
  align-self: center;
  color: #31a9db;
}

.custom-checkbox {
  align-self: center;
  display: flex;
  margin-left: 10px;
}

.custom-checkbox input[type="checkbox"] {
  width: 15px;
  height: 15px;
  margin: 5px;
}

.custom-checkbox .switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
  margin-left: 10px;
}

.custom-checkbox .switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.custom-checkbox .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.custom-checkbox .slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

.custom-checkbox input:checked + .slider {
  background-color: #31a9db;
}

.custom-checkbox input:focus + .slider {
  box-shadow: 0 0 1px #31a9db;
}

.custom-checkbox input:checked + .slider:before {
  -webkit-transform: translateX(16px);
  -ms-transform: translateX(16px);
  transform: translateX(16px);
}

/* Rounded sliders */
.custom-checkbox .slider.round {
  border-radius: 34px;
}

.custom-checkbox .slider.round:before {
  border-radius: 50%;
}

.highlited-regions {
  border: solid 1.5px #31a9db;
  margin: 2px;
}

.highlited-regions-plus {
  width: 100%;
  min-height: 20px;
  border: solid 1.5px #31a9db;
  margin: 2px 0 2px 0;
}

.not-found-error {
  width: 100%;
  justify-content: center;
  margin-top: 100px;
}

.not-found-error-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-icon {
  width: 200px;
}

</style>
