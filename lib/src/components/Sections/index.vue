<template>
  <div class="sections-container" :class="{'sections-container-edit-mode': isSideBarOpen === true}">
    <aside v-if="admin && editMode && isSideBarOpen === true && currentSection !== null" ref="resizeTarget"
           class="sections-aside">
      <div
        class="step-back-aside"
        v-if="currentSection && creationView"
        @click="backToAddSectionList = true; restoreType = 'section'; isRestoreSectionOpen = true;"
      >
        <BackIcon/>
      </div>
      <div class="closeIcon" @click="restoreType = 'section'; isRestoreSectionOpen = true">
        <CloseIcon/>
      </div>
      <a class="anchorIcon"
         :href="(currentSection.linked_to !== '' && currentSection.linked_to !== undefined) ? `#${currentSection.linked_to}-${currentSection.id}` : `#${currentSection.name}-${currentSection.id}`">
        <AnchorIcon
          :title="(currentSection.linked_to !== '' && currentSection.linked_to !== undefined) ? `Anchor id: #${currentSection.linked_to}-${currentSection.id}` : `Anchor id: #${currentSection.name}-${currentSection.id}`"
          class="edit-icon"/>
      </a>
      <div class="flexSections">
        <div :ref="currentSection.name === 'SimpleCTA' ? 'intro-simple-CTA-section-form' : undefined" class="component-view">
          <!-- we can use this short hand too -->
          <!-- <component :is="currentSection.type" :props="currentSection"  /> -->
          <Static
            v-if="currentSection.type === 'static'"
            :props="currentSection"
            @addSectionType="(section) => currentSection.instance === true ? (currentSection.linked_to !== '' && currentSection.linked_to !== undefined) ? updateGlobalType(section) : addNewGlobalType(section) : addSectionType(section)"
            :savedView="savedView"
            :creationView="creationView"
            :locales="locales"
            :default-lang="defaultLang"
            :translation-component-support="translationComponentSupport"
            :sections-user-id="sectionsUserId"
            :instance="currentSection.instance === true"
            :linked="currentSection.linked_to !== '' && currentSection.linked_to !== undefined"
            :is-side-bar-open="isSideBarOpen"
            @load="(value) => loading = value"
            @promote-section="currentSection = {...currentSection, instance: true}"
            @creationViewLoaded="updateCreationView"
          />
          <Dynamic
            v-if="currentSection.type === 'dynamic'"
            :props="currentSection"
            @addSectionType="(section) => currentSection.instance === true ? (currentSection.linked_to !== '' && currentSection.linked_to !== undefined) ? updateGlobalType(section) : addNewGlobalType(section) : addSectionType(section)"
            @errorAddingSection="errorAddingSection"
            :savedView="savedView"
            :headers="headers"
            :instance="currentSection.instance === true"
            :linked="currentSection.linked_to !== '' && currentSection.linked_to !== undefined"
            :base-path="pagePath"
            :is-side-bar-open="isSideBarOpen"
            @load="(value) => loading = value"
          />
          <Configurable
            v-if="currentSection.type === 'configurable'"
            ref="sections-configurable-type"
            @addSectionType="(section) => currentSection.instance === true ? (currentSection.linked_to !== '' && currentSection.linked_to !== undefined) ? updateGlobalType(section) : addNewGlobalType(section) : addSectionType(section)"
            @errorAddingSection="errorAddingSection"
            :props="currentSection"
            :savedView="savedView"
            :headers="headers"
            :locales="locales"
            :default-lang="defaultLang"
            :sections-user-id="sectionsUserId"
            :sections-configurable-type="sectionsConfigurableTypeReference"
            :translation-component-support="translationComponentSupport"
            :instance="currentSection.instance === true"
            :linked="currentSection.linked_to !== '' && currentSection.linked_to !== undefined"
            :base-path="pagePath"
            :is-side-bar-open="isSideBarOpen"
            @loadReference="sectionsConfigurableTypeReference = $refs['sections-configurable-type']"
            @load="(value) => loading = value"
            @promote-section="currentSection = {...currentSection, instance: true}"
          />
          <Local
            v-if="currentSection.type === 'local'"
            :props="currentSection"
            :savedView="savedView"
            :instance="currentSection.instance === true"
            :linked="currentSection.linked_to !== '' && currentSection.linked_to !== undefined"
            @addSectionType="(section) => currentSection.instance === true ? (currentSection.linked_to !== '' && currentSection.linked_to !== undefined) ? updateGlobalType(section) : addNewGlobalType(section) : addSectionType(section)"
          />
        </div>
      </div>
    </aside>
    <div
      v-if="admin && editMode && isSideBarOpen && currentSection !== null"
      class="sections-resize-handle--x"
      @mousedown="startTracking"
      data-target="aside"
    ></div>
    <main ref="sectionsMainTarget" class="sections-main">
      <div class="sections-config sections-justify-center">
        <div v-if="!pageNotFound">
          <!-- This is the Admin page section when admin user can edit/move/delete/create/add/import/export/restore sections to the page -->
          <button
            :ref="!editMode ? 'intro-edit-page' : undefined"
            @click="openEditMode()"
            v-if="admin && !isSideBarOpen"
            class="bg-blue control-button hide-mobile btn-text"
          >
            {{ !editMode ? $t("Edit page") : $t("View page") }}
          </button>
          <div class="bg-light-grey-hp hide-mobile section-wrapper">
            <div v-if="admin && editMode && !isSideBarOpen" class="sections-p-3 sections-text-center mainmsg sections-pt-3">
              {{ $t('changesPublished') }}
            </div>

            <div
              class="sections-pb-4 flexSections sections-flex-row sections-justify-center hide-mobile"
              v-if="admin && editMode && !isSideBarOpen"
            >
              <div ref="intro-top-bar" class="sections-pb-4 flexSections sections-flex-row sections-justify-center hide-mobile">
                <button
                  class="hp-button"
                  @click="layoutMode = !layoutMode"
                >
                  <div class="btn-text">{{ layoutMode === true ? $t("hideLayout") : $t("editLayout") }}</div>
                </button>
                <div v-if="layoutMode === true" class="layoutSelect-container">
                  <div class="layoutSelect-select-wrapper">
                    <select v-model="selectedLayout" id="select" name="select" class="layoutSelect-select"
                            @change="computeLayoutData">
                      <option disabled value="">-- Select layout --</option>
                      <option v-for="layout in availableLayouts" :value="layout">{{ layout }}</option>
                    </select>
                    <div class="layoutSelect-arrow-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M10 12L5 7h10l-5 5z"/>
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
                  <label for="highlightRegions"></label>
                </div>
                <div ref="intro-add-new-section">
                  <button
                    v-if="selectedLayout === 'standard'"
                    class="hp-button"
                    @click="
              (currentSection = null), (isModalOpen = true), (savedView = {}), (isCreateInstance = false), (isSideBarOpen = false), (runIntro('addNewSectionModal', introRerun))
            "
                  >
                    <div class="btn-icon plus-icon">
                      <PlusIcon/>
                    </div>
                    <div class="btn-text">{{ $t("Add") }}</div>
                  </button>
                </div>
                <button
                  class="hp-button"
                  @click="
              (currentSection = null), (isModalOpen = true), (savedView = {}), (isCreateInstance = true), (isSideBarOpen = false), (canPromote = false)
            "
                >
                  <div class="btn-icon plus-icon">
                    <PlusIcon/>
                  </div>
                  <div class="btn-text">{{ $t("createGlobal") }}</div>
                </button>
                <button
                  ref="intro-find-more-blobal"
                  class="hp-button globalTour"
                  @click="runIntro('globalTour', true)"
                >
                  <div class="btn-text intro">?</div>
                </button>
                <button ref="intro-save-changes" class="hp-button" @click="saveVariation">
                  <div class="btn-icon check-icon">
                    <CheckIcon/>
                  </div>
                  <div class="btn-text">{{ $t("Save") }}</div>
                </button>
                <button class="hp-button grey" @click="restoreType = 'page'; isRestoreSectionOpen = true">
                  <div class="btn-icon back-icon">
                    <BackIcon/>
                  </div>
                  <div class="btn-text">{{ $t("Restore") }}</div>
                </button>
              </div>
              <div class="flexSections control-button config-buttons" style="right: 0px; left: auto; top: 0;">
                <button
                  class="hp-button "
                  :class="selectedVariation === pageName ? 'danger' : 'grey'"
                  data-toggle="tooltip" data-placement="top" :title="$t('exportSectionsLabel')"
                  @click="exportSections"
                >
                  <ImportIcon/>
                </button>
                <a id="downloadAnchorElem" style="display:none"></a>
                <button
                  class="hp-button "
                  :class="selectedVariation === pageName ? 'danger' : 'grey'"
                  data-toggle="tooltip" data-placement="top" :title="$t('importSectionsLabel')"
                  @click="initImportSections"
                >
                  <ExportIcon/>
                </button>
                <button
                  class="hp-button danger"
                  data-toggle="tooltip" data-placement="top" :title="$t('deletePage')"
                  @click="isDeletePageModalOpen = true">
                  <TrashIcon class="trash-icon-style"/>
                </button>
                <button
                  class="hp-button "
                  :class="selectedVariation === pageName ? 'danger' : 'grey'"
                  data-toggle="tooltip" data-placement="top" :title="$t('settingsSectionsLabel')"
                  @click="metadataModal = true"
                >
                  <SettingsIcon/>
                </button>
                <input ref="jsonFilePick" type="file" @change="e => importSections(e)" style="display:none"/>
                <button
                  ref="intro-relaunch"
                  class="hp-button"
                  @click="runIntro('topBar', true)"
                >
                  <div class="btn-text intro">?</div>
                </button>
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
            class="bg-light-grey-hp sections-p-3 flexSections sections-flex-row sections-justify-center part2 hide-mobile"
            v-if="admin && editMode && !isSideBarOpen"
          >
            <button
              class="hp-button "
              :class="selectedVariation === pageName ? 'danger' : 'grey'"
              @click="selectedVariation = pageName"
            >
              <div class="btn-text">{{
                  decodeURIComponent(parsePath(encodeURIComponent(pageName))) + " " + "Main"
                }}
              </div>
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
                class="sync flexSections sections-flex-row sections-p-4 sections-justify-center"
                v-if="selectedVariation === v.pageName"
                @click="synch()"
              >
                <div class="icon" :class="{ synched }">
                  <SyncIcon/>
                </div>
                <span>{{ $t("Synchronise") }}</span>
              </div>
            </div>
          </div>

          <!-- ------------------------------------------------------------------------------------------- -->

          <!-- This is the 'add' section types popup that has a list of all section types added to the project and clicking on one of them opens the form of it to create and add it to the page -->
          <div v-if="isModalOpen && admin && editMode" ref="modal"
               class="sections-fixed section-modal-content sections-z-50 bg-grey sections-bg-opacity-25 sections-inset-0 modalContainer"
               aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div
              class="flexSections sections-items-center sections-justify-center sections-px-4 sections-pb-20 sections-text-center">
              <div class="section-modal-content sections-bg-white relativeSections sections-shadow rounded-xl">
                <div class="flexSections sections-flex-row relativeSections sections-justify-center">
                  <div v-if="!currentSection && isCreateInstance === false"
                       class="flexSections sections-flex-col sections-my-3 sections-gap-4">
                    <div class="flexSections sections-flex-row sections-justify-center">
                      <div ref="intro-available-sections" class="sections-text-center h2 sections-cursor-pointer"
                           :class="typesTab === 'types' ? 'selectedTypesTab' : ''" @click="typesTab = 'types'; runIntro('availableSectionOpened', introRerun)">
                        {{ $t("availableSections") }}
                      </div>
                      <div class="sections-text-center h2 sections-px-4">/</div>
                      <div class="sections-text-center h2 sections-cursor-pointer"
                           :class="typesTab === 'globalTypes' ? 'selectedTypesTab' : ''"
                           @click="typesTab = 'globalTypes'">
                        {{ $t("AddGlobal") }}
                      </div>
                      <div class="sections-text-center h2 sections-px-4">/</div>
                      <div ref="intro-inventory" class="sections-text-center h2 sections-cursor-pointer"
                           :class="typesTab === 'inventoryTypes' ? 'selectedTypesTab' : ''"
                           @click="typesTab = 'inventoryTypes'; sectionsFilterAppName = ''; runIntro('inventoryOpened')">
                        {{ $t("typeInventory") }}
                      </div>
                    </div>
                    <div class="flexSections sections-items-center sections-flex-row sections-gap-4">
                      <div>{{ $t('filterBy') }}</div>
                      <input
                        class="sections-py-4 sections-pl-6 sections-border rounded-xl sections-border-FieldGray sections-w-full focus:outline-none sectionsFilterName"
                        type="text"
                        :placeholder="$t('filterName')"
                        v-model="sectionsFilterName"
                      />
                      <div v-if="typesTab !== 'inventoryTypes'" class="relativeSections">
                        <select v-model="sectionsFilterAppName" id="select" name="select" class="layoutSelect-select">
                          <option disabled value="" class="sections-text-FieldGray">{{
                              `-- ${$t('sectionsAppName')} --`
                            }}
                          </option>
                          <option v-for="appName in appNames.filter((item, index) => appNames.indexOf(item) === index)"
                                  :value="appName">{{ appName }}
                          </option>
                        </select>
                        <div class="layoutSelect-arrow-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M10 12L5 7h10l-5 5z"/>
                          </svg>
                        </div>
                      </div>
                      <div class="slot-name sections-cursor-pointer" @click="clearSectionsFilters">
                        {{ $t('filterClear') }}
                      </div>
                    </div>
                  </div>
                  <div class="flexSections sections-flex-row sections-my-3 sections-pb-6 sections-justify-center"
                       v-else-if="!currentSection && isCreateInstance === true">
                    <div class="sections-text-center h2 sections-cursor-pointer selectSectionType">
                      {{ $t("selectSectionType") }}
                    </div>
                  </div>
                  <div class="closeIcon" @click="isModalOpen = false; isCreateInstance = false">
                    <CloseIcon/>
                  </div>
                </div>
                <div
                  class="step-back"
                  v-if="currentSection"
                  @click="currentSection = null"
                >
                  <BackIcon/>
                </div>

                <div
                  v-if="!currentSection && (typesTab === 'types' || typesTab === 'inventoryTypes') && isCreateInstance !== true"
                  class="sections-m-1 sections-p-1 type-items content-wrapper">
                  <div
                    class="section-item section-item-box"
                    v-for="(type, index) in typesTab === 'types' ? filteredTypes.filter(type => type.notCreated !== true && type.app_status !== 'disbaled' && type.app_status !== 'disabled') : filteredTypes.filter(type => type.notCreated === true || type.app_status === 'disbaled' || type.app_status === 'disabled')"
                    :key="type.name"
                    :ref="type.name === 'SimpleCTA' ? type.notCreated !== true ? 'intro-simple-CTA-section-available' : 'intro-simple-CTA-section-inventory' : undefined"
                  >
                    <div
                      v-if="type.type === 'local' || getComponent(type.name, type.type ? type.type : 'static', true).settings || getComponent(type.name, type.type, true).render_data"
                      :title="formatTexts(formatName(type.name), ' ')" class="text-capitalize section-item-title">
                      {{ formatTexts(formatName(type.name), " ") }}
                    </div>
                    <div v-if="type.access === 'private' && type.notCreated !== true" class="section-delete">
                      <div class="section-delete-icon" @click="openDeleteSectionTypeModal(type.name, index)">
                        <TrashIcon class="trash-icon-style"/>
                      </div>
                    </div>
                    <div v-else-if="type.notCreated === true" class="section-creation">
                      <div class="section-creation-icon">
                        <span class="toggleLabel">{{ $t('create') }}</span>
                        <label id="toggle-label" class="switch">
                          <input :checked="type.notCreated !== true" type="checkbox"
                                 @change="addNewStaticType(type.name)">
                          <span class="slider round"></span>
                        </label>
                      </div>
                    </div>
                    <div v-else-if="type.query_string_keys && type.query_string_keys.length > 0" class="section-info">
                      <ClickableTooltip :content="`query_string(s): ${type.query_string_keys.join(', ')}`" position="top">
                        <div class="section-info-icon">
                          <InfoIcon :title="`query_string(s): ${type.query_string_keys.join(', ')}`"
                                    class="info-icon-style" />
                        </div>
                      </ClickableTooltip>
                    </div>
                    <div v-else class="section-top-separator"></div>
                    <div class="section-item"
                         :class="[{active: type.notCreated !== true},{inactive: type.notCreated === true}]"
                         @click="type.notCreated !== true ? openCurrentSection(type) : null">
                      <SectionItem
                        v-if="type.name"
                        class="bg-light-blue"
                        :title="formatName(type.name)"
                        :component-item="getComponent(type.name, type.type ? type.type : 'static')"
                        :section="getComponent(type.name, type.type ? type.type : 'static', true)"
                        :active="type.notCreated !== true"
                      />
                    </div>
                    <div
                      v-if="type.type !== 'configurable' && type.type !== 'dynamic' && type.type !== 'local' && type.notCreated !== true"
                      class="flexSections sections-pl-2 sections-pb-1" style="font-size: 10px;">
                      {{ $t('by') + type.application }}
                    </div>
                    <div v-if="type.app_status === 'disbaled' || type.app_status === 'disabled'" class="section-delete">
                      <div class="section-delete-icon"
                           @click="openAuthConfigurableSectionTypeModal(type.application_id, index, type.requirements, type.name, type.application)">
                        <div class="flexSections justify-between sections-items-end">
                          <div v-if="type.type === 'configurable'" class="flexSections sections-pl-2 sections-pb-1"
                               style="font-size: 8px;">
                            {{ $t('by') + type.application }}
                          </div>
                          <div v-else></div>
                          <LockedIcon class="trash-icon-style sections-p-1"/>
                        </div>
                      </div>
                    </div>
                    <div v-else-if="type.type === 'configurable' || type.type === 'dynamic'" class="section-delete">
                      <div class="section-delete-icon"
                           @click="openUnAuthConfigurableSectionTypeModal(type.application_id, index, type.name, type.application)">
                        <div class="flexSections justify-between sections-items-end">
                          <div class="flexSections sections-pl-2 sections-pb-1" style="font-size: 8px;">
                            {{ $t('by') + type.application }}
                          </div>
                          <UnlockedIcon class="trash-icon-style sections-p-1"/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else-if="!currentSection && (typesTab === 'globalTypes' || isCreateInstance === true)"
                     class="m-1 p-1 type-items content-wrapper">
                  <div
                    v-if="isCreateInstance === false && globalTypes.filter(gt => gt.id !== undefined).length === 0 && loading === false">
                    <button
                      class="hp-button"
                      @click="
              (currentSection = null), (isModalOpen = true), (savedView = {}), (isCreateInstance = true), (isSideBarOpen = false), (canPromote = false)
            "
                    >
                      <div class="btn-icon plus-icon">
                        <PlusIcon/>
                      </div>
                      <div class="btn-text">{{ $t("createGlobal") }}</div>
                    </button>
                  </div>
                  <div
                    class="section-item section-item-box"
                    v-for="(type, index) in isCreateInstance === true ? filteredGlobalTypes.filter(gt => gt.notCreated === true) : filteredGlobalTypes.filter(gt => gt.id !== undefined)"
                    :key="`${type.name}-${index}`"
                  >
                    <div
                      v-if="type.type === 'local' || getComponent(type && type.section ? type.section.name : type.name, type.type, true).settings || getComponent(type && type.section ? type.section.name : type.name, type.type, true).render_data"
                      :title="formatTexts(formatName(type.name), ' ')" class="text-capitalize section-item-title">
                      {{ formatTexts(formatName(type.name), " ") }}
                    </div>
                    <div v-if="type.notCreated !== true" class="section-delete">
                      <div class="section-delete-icon" @click="openDeleteSectionTypeModal(type.name, index)">
                        <TrashIcon class="trash-icon-style"/>
                      </div>
                    </div>
                    <div v-if="type.query_string_keys && type.query_string_keys.length > 0" class="global-section-info">
                      <ClickableTooltip :content="`query_string(s): ${type.query_string_keys.join(', ')}`" position="top">
                        <div class="global-section-info-icon">
                          <InfoIcon :title="`query_string(s): ${type.query_string_keys.join(', ')}`"
                                    class="info-icon-style"/>
                        </div>
                      </ClickableTooltip>
                    </div>
                    <div v-else-if="isCreateInstance === true" class="section-top-separator"></div>
                    <div class="section-item" :class="{active: type.notCreated !== true || isCreateInstance === true}"
                         @click="type.notCreated === true ? openCurrentSection(type, true) : type.type === 'local' || type.type === 'dynamic' || type.type === 'configurable' ? openCurrentSection(type, true) : addSectionType({...type.section, id: 'id-' + Date.now(), weight: 'null', type: type.type, instance_name: type.name, fields: type.fields, query_string_keys: type.query_string_keys, dynamic_options: type.dynamic_options, render_data: type.section && type.section.options && type.section.options[0] ? [{settings: type.section.options[0]}] : undefined}, null, true)">
                      <SectionItem
                        v-if="type.name"
                        class="bg-light-blue"
                        :title="formatName(type.name)"
                        :component-item="getComponent(type && type.section ? type.section.name : type.name, type.type)"
                        :section="getComponent(type && type.section ? type.section.name : type.name, type.type, true)"
                        :active="true"
                      />
                    </div>
                    <div v-if="type.type !== 'configurable' && type.type !== 'dynamic' && type.type !== 'local'"
                         class="flexSections sections-pl-2 sections-pb-1" style="font-size: 10px;">
                      {{ $t('by') + type.application }}
                    </div>
                  </div>
                </div>
                <div v-else class="flexSections">
                  <div :ref="currentSection.name === 'SimpleCTA' ? 'intro-simple-CTA-section-form' : undefined" class="component-view">
                    <!-- we can use this short hand too -->
                    <!-- <component :is="currentSection.type" :props="currentSection"  /> -->
                    <Static
                      v-if="currentSection.type === 'static'"
                      :props="currentSection"
                      @addSectionType="(section) => currentSection.instance === true ? (currentSection.linked_to !== '' && currentSection.linked_to !== undefined) ? updateGlobalType(section) : addNewGlobalType(section) : addSectionType(section)"
                      :savedView="savedView"
                      :creationView="creationView"
                      :locales="locales"
                      :default-lang="defaultLang"
                      :translation-component-support="translationComponentSupport"
                      :sections-user-id="sectionsUserId"
                      :instance="currentSection.instance === true"
                      :linked="currentSection.linked_to !== '' && currentSection.linked_to !== undefined"
                      @load="(value) => loading = value"
                      @promote-section="currentSection = {...currentSection, instance: true}"
                      @creationViewLoaded="updateCreationView"
                    />
                    <Dynamic
                      v-if="currentSection.type === 'dynamic'"
                      :props="currentSection"
                      @addSectionType="(section) => currentSection.instance === true ? (currentSection.linked_to !== '' && currentSection.linked_to !== undefined) ? updateGlobalType(section) : addNewGlobalType(section) : addSectionType(section)"
                      @errorAddingSection="errorAddingSection"
                      :savedView="savedView"
                      :headers="headers"
                      :instance="currentSection.instance === true"
                      :linked="currentSection.linked_to !== '' && currentSection.linked_to !== undefined"
                      :base-path="pagePath"
                      @load="(value) => loading = value"
                    />
                    <Configurable
                      v-if="currentSection.type === 'configurable'"
                      ref="sections-configurable-type"
                      @addSectionType="(section) => currentSection.instance === true ? (currentSection.linked_to !== '' && currentSection.linked_to !== undefined) ? updateGlobalType(section) : addNewGlobalType(section) : addSectionType(section)"
                      @errorAddingSection="errorAddingSection"
                      :props="currentSection"
                      :savedView="savedView"
                      :headers="headers"
                      :locales="locales"
                      :default-lang="defaultLang"
                      :sections-user-id="sectionsUserId"
                      :sections-configurable-type="sectionsConfigurableTypeReference"
                      :translation-component-support="translationComponentSupport"
                      :instance="currentSection.instance === true"
                      :linked="currentSection.linked_to !== '' && currentSection.linked_to !== undefined"
                      :base-path="pagePath"
                      @loadReference="sectionsConfigurableTypeReference = $refs['sections-configurable-type']"
                      @load="(value) => loading = value"
                      @promote-section="currentSection = {...currentSection, instance: true}"
                    />
                    <Local
                      v-if="currentSection.type === 'local'"
                      :props="currentSection"
                      :savedView="savedView"
                      :instance="currentSection.instance === true"
                      :linked="currentSection.linked_to !== '' && currentSection.linked_to !== undefined"
                      @addSectionType="(section) => currentSection.instance === true ? (currentSection.linked_to !== '' && currentSection.linked_to !== undefined) ? updateGlobalType(section) : addNewGlobalType(section) : addSectionType(section)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ------------------------------------------------------------------------------------------- -->

          <!-- This is delete section types popup that opens when the admin click on the trash icon located at the top right of each section type inside the popup list above -->
          <div v-if="isDeleteModalOpen && admin && editMode" ref="modal"
               class="sections-fixed sections-z-50 sections-overflow-hidden bg-grey sections-bg-opacity-25 sections-inset-0 sections-p-8 sections-overflow-y-auto modalContainer"
               aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div
              class="flexSections fullHeightSections sections-items-center sections-justify-center sections-pt-4 sections-px-4 sections-pb-20 sections-text-center">
              <div
                class="section-modal-content sections-bg-white relativeSections sections-shadow rounded-xl sections-overflow-scroll">
                <div class="sections-text-center h4 sections-my-3  sections-pb-3">
                  {{
                    typesTab === 'types' ? $t("delete-section-type") + selectedSectionTypeName : $t("delete-global-section-type") + selectedSectionTypeName
                  }}
                </div>
                <div class="flexSections sections-flex-row">
                  <button
                    class="hp-button"
                    @click="typesTab === 'types' ? deleteSectionType(selectedSectionTypeName, selectedSectionTypeIndex) : deleteGlobalSectionType(selectedSectionTypeName, selectedSectionTypeIndex)"
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


          <div v-if="isRestoreSectionOpen && admin && editMode" ref="modal"
               class="sections-fixed sections-z-50 sections-overflow-hidden bg-grey sections-bg-opacity-25 sections-inset-0 sections-p-8 sections-overflow-y-auto modalContainer"
               aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div
              class="flexSections fullHeightSections sections-items-center sections-justify-center sections-pt-4 sections-px-4 sections-pb-20 sections-text-center">
              <div
                class="section-modal-content sections-bg-white relativeSections sections-shadow rounded-xl sections-overflow-scroll">
                <div class="sections-text-center h4 sections-my-3  sections-pb-3">
                  {{ $t("restoreSectionContent") }}
                </div>
                <div class="flexSections sections-flex-row">
                  <button
                    class="hp-button"
                    @click="restoreSectionContent()"
                  >
                    <div class="btn-text">
                      {{ $t("Confirm") }}
                    </div>
                  </button>
                  <button
                    class="hp-button"
                    @click="isRestoreSectionOpen = false"
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
          <div v-if="isDeletePageModalOpen && admin && editMode" ref="modal"
               class="sections-fixed sections-z-50 sections-overflow-hidden bg-grey sections-bg-opacity-25 sections-inset-0 sections-p-8 sections-overflow-y-auto modalContainer"
               aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div
              class="flexSections fullHeightSections sections-items-center sections-justify-center sections-pt-4 sections-px-4 sections-pb-20 sections-text-center">
              <div
                class="section-modal-content sections-bg-white relativeSections sections-shadow rounded-xl sections-overflow-scroll">
                <div class="flexSections sections-flex-row sections-justify-center sections-items-center">
                  <AlertIcon/>
                  <div class="sections-text-center h4 sections-my-3 sections-pb-3 deletePageLabel">
                    {{ $t("deletePage") }}
                  </div>
                </div>
                <div class="sections-text-center h4 sections-my-3  sections-pb-3 deletePageConfirmation">
                  {{ $t("delete-section-page") }}
                </div>
                <div class="flexSections sections-flex-row sections-justify-center">
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
          <div v-if="isDeleteSectionModalOpen && admin && editMode" ref="modal"
               class="fixed sections-z-50 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer"
               aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div
              class="flexSections fullHeightSections items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div class="section-modal-content bg-white relativeSections shadow rounded-xl overflow-scroll">
                <div class="flexSections flex-row justify-center items-center">
                  <AlertIcon/>
                  <div class="text-center h4 my-3 pb-3 deletePageLabel">
                    {{ $t("deleteSection") }} ({{ deletedSectionName }})
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
          <div v-if="isErrorsFormatModalOpen && admin && editMode" ref="modal"
               class="fixed z-50 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer"
               aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div
              class="flexSections fullHeightSections items-center sections-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div class="section-modal-content bg-white relativeSections shadow rounded-xl overflow-scroll">
                <div class="text-center flexSections sections-center h4 sectionTypeHeader">
                  <AlertIcon/>
                  <div class="closeIcon" @click="isErrorsFormatModalOpen = false">
                    <CloseIcon/>
                  </div>
                </div>
                <div class="text-center h4 my-3  pb-3 errorMessageDialog">
                  {{ displayedErrorFormat }}
                </div>
              </div>
            </div>
          </div>

          <!-- ------------------------------------------------------------------------------------------- -->

          <!-- This is the popup that has the required fields loaded from section response requirements in order to authorize configurable section types, it opens when clicking on the lock icon located at the bottom left of a section configurable type -->
          <div v-if="isAuthModalOpen && admin && editMode" ref="modal"
               class="sections-fixed sections-z-50 sections-overflow-hidden bg-grey sections-bg-opacity-25 sections-inset-0 sections-p-8 sections-overflow-y-auto modalContainer"
               aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div
              class="flexSections fullHeightSections sections-items-center sections-justify-center sections-pt-4 sections-px-4 sections-pb-20 sections-text-center">
              <div
                class="section-modal-content sections-bg-white relativeSections sections-shadow rounded-xl sections-overflow-scroll">
                <div class="sections-text-center h4 sections-my-3 sections-pb-4">
                  {{ $t("authorize-section-type") + selectedAppName }}
                </div>
                <div class="flexSections sections-flex-col sections-gap-4">
                  <div v-for="requiredInput in selectedSectionRequirements">
                    <input
                      class="sections-py-4 sections-pl-6 sections-border rounded-xl sections-border-FieldGray sections-h-48px sections-w-full focus:outline-none"
                      type="text"
                      :placeholder="requiredInput"
                      v-model="requirementsInputs[requiredInput]"
                    />
                  </div>

                  <div class="flexSections sections-flex-row">
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
          <div v-if="isUnAuthModalOpen && admin && editMode" ref="modal"
               class="sections-fixed sections-z-50 sections-overflow-hidden bg-grey sections-bg-opacity-25 sections-inset-0 sections-p-8 sections-overflow-y-auto modalContainer"
               aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div
              class="flexSections fullHeightSections sections-items-center sections-justify-center sections-pt-4 sections-px-4 sections-pb-20 sections-text-center">
              <div
                class="section-modal-content sections-bg-white relativeSections sections-shadow rounded-xl sections-overflow-scroll">
                <div class="sections-text-center h4 sections-my-3  sections-pb-3">
                  {{ $t("un-authorize-section-type") + selectedAppName }}
                </div>
                <div class="flexSections sections-flex-col sections-gap-4">

                  <div class="flexSections sections-flex-row">
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
          <div v-if="errorInViews === true  && admin" class="error-section-loaded">
            {{ $t('sectionsNotLoadedCorrectly') }}
          </div>
          <div v-if="errorInLayout === true && admin && editMode" class="views">
            <div class="flexSections not-found-error">
              <div class="flexSections not-found-error-column">
                <ErrorIcon class="error-icon"/>
                <div v-for="(error, index) in sectionsMainErrors" :key="`layout-error-${index}`"
                     class="mainmsg not-found-error-column">
                  {{ error }}
                </div>
                <div v-for="(layoutError, layoutIndex) in sectionsLayoutErrors"
                     :key="`layout-region-error-${layoutIndex}`" class="mainmsg not-found-error-column">
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
                v-for="(view, index) in alteredViews"
                :key="index"
                :id="(view.linked_to !== '' && view.linked_to !== undefined) ? `${view.linked_to}-${view.id}` : `${view.name}-${view.id}`"
                :class="{ [view.name]: true, 'view-in-edit-mode': editMode }"
              >
                <div class="section-view relativeSections">
                  <div
                    class="controls flexSections sections-flex-row sections-justify-center sections-p-1 rounded-xl sections-top-0 sections-right-2 sections-absolute hide-mobile"
                    v-if="admin && editMode && sectionOptions[view.id] && sectionOptions[view.id] === true && view.altered !== true"
                  >
                    <div v-if="sectionsFormatErrors[view.weight] || (view.error && view.status_code !== 404)"
                         @click="isErrorsFormatModalOpen = true; displayedErrorFormat = sectionsFormatErrors[view.weight] ? sectionsFormatErrors[view.weight] : view.error">
                      <AlertIcon/>
                    </div>
                    <div
                      @click="toggleSectionsOptions(view.id); edit(currentViews.find(vw => vw.id === view.id), view.linked_to !== '' && view.linked_to !== undefined ? `#${view.linked_to}-${view.id}` : `#${view.name}-${view.id}`)"
                      v-if="editable(view.type) || (view.linked_to !== '' && view.linked_to !== undefined)">
                      <EditIcon :color="(view.linked_to !== '' && view.linked_to !== undefined) ? '#FF0000' : undefined"
                                class="edit-icon"/>
                    </div>
                    <DragIcon class="drag-icon handle"/>
                    <div
                      @click="isDeleteSectionModalOpen = true; deletedSectionId = view.id; deletedSectionName = view.name;">
                      <TrashIcon class="trash-icon"/>
                    </div>
                    <div
                      @click="copyAnchor((view.linked_to !== '' && view.linked_to !== undefined) ? `#${view.linked_to}-${view.id}` : `#${view.name}-${view.id}`)">
                      <AnchorIcon
                        :title="(view.linked_to !== '' && view.linked_to !== undefined) ? `Anchor id: #${view.linked_to}-${view.id}, ${$t('clickToCopy')}` : `Anchor id: #${view.name}-${view.id}, ${$t('clickToCopy')}`"
                        class="edit-icon"/>
                    </div>
                  </div>
                  <div v-if="admin && editMode && view.altered !== true" @click="toggleSectionsOptions(view.id)"
                       class="controls optionsSettings flexSections sections-flex-row sections-justify-center sections-p-1 rounded-xl sections-top-0 sections-right-2 sections-absolute settings-icon-wrapper">
                    <SettingsIcon :color="'currentColor'" class="settings-icon"/>
                  </div>
                  <div class="view-component"
                       :class="admin && editMode && invalidSectionsErrors[`${view.name}-${view.weight}`] && invalidSectionsErrors[view.name].error && invalidSectionsErrors[`${view.name}-${view.weight}`].weight === view.weight ? 'invalidSection' : ''"
                       :style="{ background: viewsBgColor }">
                    <div
                      v-if="admin && editMode && invalidSectionsErrors[`${view.name}-${view.weight}`] && invalidSectionsErrors[`${view.name}-${view.weight}`].error && invalidSectionsErrors[`${view.name}-${view.weight}`].weight === view.weight"
                      class="error-section-loaded">
                      {{ $t('invalidSectionsError') + invalidSectionsErrors[`${view.name}-${view.weight}`].error }}
                    </div>
                    <div v-else-if="admin && editMode && (view.error && view.status_code !== 404)"
                         class="error-section-loaded error-section-empty">
                    </div>
                    <component
                      v-if="view.settings || view.type === 'local' || view.type === 'dynamic'"
                      :is="getComponent(view.name, view.type)"
                      :section="view"
                      :lang="lang"
                      :locales="locales"
                      :default-lang="defaultLang"
                      @refresh-section="(data) => refreshSectionView(view, data)"
                    />
                  </div>
                </div>
              </section>
              <!-- </transition-group> -->
            </draggable>
          </div>
          <div v-else>
            <component :is="getSelectedLayout()" :lang="lang" :locales="locales" :default-lang="defaultLang">
              <template v-for="slotName in layoutSlotNames" v-slot:[slotName]>
                <!-- Empty div injected to verify the slots              -->
                <div class="flexSections flex-col">
                  <div :id="`sections-slot-region-${selectedLayout}-${slotName}`"></div>
                  <div v-if="admin && editMode"
                       class="bg-light-grey-hp p-3 flexSections flex-row justify-center part3 hide-mobile">
                    <button
                      class="hp-button"
                      @click.stop.prevent="
              (currentSection = null), (isModalOpen = true), (savedView = {}), (selectedSlotRegion = slotName)
            "
                    >
                      <div class="btn-icon plus-icon">
                        <PlusIcon/>
                      </div>
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
                        v-for="(view, index) in alteredViewsPerRegions[slotName]"
                        v-if="view.region[selectedLayout].slot === slotName"
                        :key="index"
                        :id="(view.linked_to !== '' && view.linked_to !== undefined) ? `${view.linked_to}-${view.id}` : `${view.name}-${view.id}`"
                        :class="{ [view.name]: true, 'view-in-edit-mode': editMode, 'highlited-regions': highlightRegions }"
                      >
                        <div class="section-view relativeSections">
                          <div
                            class="controls flexSections flex-row justify-center p-1 rounded-xl top-0 right-2 absolute z-9 hide-mobile"
                            v-if="admin && editMode && sectionOptions[view.id] && sectionOptions[view.id] === true && view.altered !== true"
                          >
                            <div v-if="sectionsFormatErrors[view.weight] || (view.error && view.status_code !== 404)"
                                 @click="isErrorsFormatModalOpen = true; displayedErrorFormat = sectionsFormatErrors[view.weight] ? sectionsFormatErrors[view.weight] : view.error">
                              <AlertIcon/>
                            </div>
                            <div
                              @click="toggleSectionsOptions(view.id); edit(viewsPerRegions[view.region[selectedLayout].slot].find(vw => vw.id === view.id), view.linked_to !== '' && view.linked_to !== undefined ? `#${view.linked_to}-${view.id}` : `#${view.name}-${view.id}`); selectedSlotRegion = slotName"
                              v-if="editable(view.type) || (view.linked_to !== '' && view.linked_to !== undefined)">
                              <EditIcon
                                :color="(view.linked_to !== '' && view.linked_to !== undefined) ? '#FF0000' : undefined"
                                class="edit-icon"/>
                            </div>
                            <DragIcon class="drag-icon handle"/>
                            <div
                              @click="isDeleteSectionModalOpen = true; deletedSectionId = view.id; deletedSectionName = view.name;">
                              <TrashIcon class="trash-icon"/>
                            </div>
                            <div
                              @click="copyAnchor((view.linked_to !== '' && view.linked_to !== undefined) ? `#${view.linked_to}-${view.id}` : `#${view.name}-${view.id}`)">
                              <AnchorIcon
                                :title="(view.linked_to !== '' && view.linked_to !== undefined) ? `Anchor id: #${view.linked_to}-${view.id}, ${$t('clickToCopy')}` : `Anchor id: #${view.name}-${view.id}, ${$t('clickToCopy')}`"
                                class="edit-icon"/>
                            </div>
                          </div>
                          <div v-if="admin && editMode && view.altered !== true" @click="toggleSectionsOptions(view.id)"
                               class="controls optionsSettings flexSections sections-flex-row sections-justify-center sections-p-1 rounded-xl sections-top-0 sections-right-2 sections-absolute settings-icon-wrapper">
                            <SettingsIcon :color="'currentColor'" class="settings-icon"/>
                          </div>
                          <div class="view-component"
                               :class="admin && editMode && invalidSectionsErrors[`${view.name}-${view.weight}`] && invalidSectionsErrors[`${view.name}-${view.weight}`].error && invalidSectionsErrors[`${view.name}-${view.weight}`].weight === view.weight ? 'invalidSection' : ''"
                               :style="{ background: viewsBgColor }">
                            <div
                              v-if="admin && editMode && invalidSectionsErrors[`${view.name}-${view.weight}`] && invalidSectionsErrors[`${view.name}-${view.weight}`].error && invalidSectionsErrors[`${view.name}-${view.weight}`].weight === view.weight"
                              class="error-section-loaded">
                              {{
                                $t('invalidSectionsError') + invalidSectionsErrors[`${view.name}-${view.weight}`].error
                              }}
                            </div>
                            <component
                              v-if="view.settings || view.type === 'local' || view.type === 'dynamic'"
                              :is="getComponent(view.name, view.type)"
                              :section="view"
                              :lang="lang"
                              :locales="locales"
                              :default-lang="defaultLang"
                              @refresh-section="(data) => refreshSectionView(view, data)"
                            />
                          </div>
                        </div>
                      </section>
                      <!-- </transition-group> -->
                    </draggable>
                  </div>
                  <section v-if="creationView === true && admin && editMode && selectedLayout !== 'standard' && selectedSlotRegion === slotName" :id="`${currentSection.name}-${currentSection.id}`" :class="`creation-view-${selectedLayout}-${slotName}`">
                    <component :is="getCreationComponent" :section="createdView" :lang="lang" :locales="locales" :default-lang="defaultLang" ref="creationComponent" />
                  </section>
                </div>
              </template>
            </component>
          </div>

          <section v-if="creationView === true && admin && editMode && selectedLayout === 'standard'" :id="`${currentSection.name}-${currentSection.id}`" class="creation-view-standard">
            <component :is="getCreationComponent" :section="createdView" :lang="lang" :locales="locales" :default-lang="defaultLang" ref="creationComponent" />
          </section>

          <!-- ------------------------------------------------------------------------------------------- -->

          <!-- This is the popup to create a new static section type     -->
          <div v-if="staticModal && admin && editMode" :modal-class="'section-modal-main-wrapper'" ref="modal"
               class="sections-fixed sections-z-50 sections-overflow-hidden bg-grey sections-bg-opacity-25 sections-inset-0 sections-p-8 sections-overflow-y-auto modalContainer"
               aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div
              class="flexSections fullHeightSections sections-items-center sections-justify-center sections-pt-4 sections-px-4 sections-pb-20 sections-text-center">
              <div
                class="section-modal-content sections-bg-white relativeSections sections-shadow rounded-xl sections-overflow-scroll">
                <div class="section-modal-wrapper">
                  <div class="sections-text-center h4 sectionTypeHeader">
                    <div class="title">{{ $t("section-title") }}:</div>
                    <div class="closeIcon" @click="staticModal = false">
                      <CloseIcon/>
                    </div>
                  </div>
                  <div class="flexSections sections-w-full sections-justify-center">
                    <div class="body" style="text-align: start;">
                      <div class="sectionsFieldsLabels">
                        {{ $t("section-input-title") }}
                      </div>
                      <input
                        class="sections-py-4 sections-pl-6 sections-border rounded-xl sections-border-FieldGray sections-h-48px sections-w-full focus:outline-none"
                        type="text"
                        v-model="sectionTypeName"
                      />
                      <div class="sections-mt-2 sectionsFieldsLabels">
                        {{ $t("fieldNames") }}
                      </div>
                      <div class="fieldsDescription">
                        {{ $t("fieldDesc") }}
                      </div>
                      <div v-for="(field,k) in fieldsInputs" :key="k"
                           class="flexSections sections-flex-col sections-mb-4">
                        <div class="flexSections">
                          <input
                            v-model="field.name"
                            class="sections-py-4 sections-pl-6 sections-border rounded-xl sections-border-FieldGray sections-h-48px sections-w-full focus:outline-none"
                            type="text"
                            :placeholder="`${$t('field')} #${k+1}`"
                          />
                          <span class="flexSections sections-flex-row sections-pl-2 sections-items-center">
                        <span v-show="k || ( !k && fieldsInputs.length > 1)"
                              class="sections-cursor-pointer sections-text-3xl" @click="removeField(k)">-</span>
                        <span v-show="k === fieldsInputs.length - 1"
                              class="sections-cursor-pointer sections-text-3xl sections-pl-3"
                              @click="addField(k)">+</span>
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
          <div v-if="metadataModal && admin && editMode" :modal-class="'section-modal-main-wrapper'" ref="modal"
               class="sections-fixed sections-z-50 sections-overflow-hidden bg-grey sections-bg-opacity-25 sections-inset-0 sections-p-8 modalContainer"
               aria-labelledby="modal-title" role="dialog" aria-modal="true"
               :class="$sections.cname === 'active' ? 'sections-overflow-y-auto' : ''">
            <div
              class="flexSections fullHeightSections sections-items-center sections-justify-center sections-pt-4 sections-px-4 sections-pb-20 sections-text-center">
              <div class="section-modal-content sections-bg-white relativeSections sections-shadow rounded-xl"
                   :class="$sections.cname === 'active' ? 'sections-overflow-scroll' : ''">
                <div class="section-modal-wrapper">
                  <div class="sections-text-center h4 sectionTypeHeader">
                    <div class="title">{{ $t("Metadata") }}</div>
                    <div class="closeIcon" @click="metadataModal = false; metadataFormLang = $i18n.locale.toString()">
                      <CloseIcon/>
                    </div>
                  </div>
                  <TranslationComponent v-if="translationComponentSupport && locales.length > 1" :locales="locales" :default-lang="defaultLang"
                                        @setFormLang="(locale) => metadataFormLang = locale"/>
                  <div class="flexSections sections-w-full sections-justify-center"
                       :class="$sections.cname === 'active' ? 'sections-page-settings' : ''">
                    <div class="body metadataFieldsContainer">
                      <div class="flexSections sections-flex-row sections-gap-4">
                        <div class='sections-w-full'>
                          <div class="sectionsFieldsLabels">
                            {{ $t("projectId") }}: {{ $sections.projectId }}
                          </div>
                          <div class="sectionsFieldsLabels">
                            {{ $t("pageUrl") }}
                          </div>
                          <div class="fieldsDescription">
                            {{ $t("pathFieldDesc") }}
                          </div>
                          <input
                            class="sections-py-4 sections-pl-6 sections-border rounded-xl sections-border-FieldGray sections-h-48px sections-w-full focus:outline-none"
                            type="text"
                            v-model="pagePath"
                          />
                          <span class="pagePathRequiredStyle"
                                v-show="metadataErrors.path[0] !== ''">{{ metadataErrors.path[0] }}</span>
                          <div class="flexSections metadataFields">
                            <div class="metadataColumns">
                              <div class="sections-mt-2 sectionsFieldsLabels">
                                {{ $t("pageTitle") }}
                              </div>
                              <input
                                class="sections-py-4 sections-pl-6 sections-border rounded-xl sections-border-FieldGray sections-h-48px sections-w-full focus:outline-none"
                                type="text"
                                v-model="pageMetadata[metadataFormLang].title"
                              />
                              <div class="sections-mt-2 sectionsFieldsLabels">
                                {{ $t("pageSeoDesc") }}
                              </div>
                              <textarea
                                class="sections-py-4 sections-pl-6 sections-border rounded-xl sections-border-FieldGray sections-w-full focus:outline-none"
                                type="text"
                                v-model="pageMetadata[metadataFormLang].description"
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <div class="sections-mt-2 sectionsFieldsLabels">
                            {{ $t('CSS') }}
                          </div>
                          <UploadMedia :is-document="true" :media-label="''" :upload-text="$t('mediaComponent.Upload')"
                                       :change-text="$t('mediaComponent.Change')" :seo-tag="$t('mediaComponent.seoTag')"
                                       :media="pageMetadata['media'] && Object.keys(pageMetadata['media']).length > 0 ? [pageMetadata['media']] : []"
                                       @uploadContainerClicked="selectedMediaType = 'media'; $refs.sectionsMediaComponent.openModal(pageMetadata['media'] && Object.keys(pageMetadata['media']).length > 0 ? pageMetadata['media'].media_id : null, 'document')"
                                       @removeUploadedImage="removeMedia('media')"/>
                          <MediaComponent ref="sectionsMediaComponent" :sections-user-id="sectionsUserId"
                                          @emittedMedia="(mediaObject) => selectedCSS(mediaObject, selectedMediaType)"></MediaComponent>
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
          <div v-if="staticSuccess && admin && editMode" :modal-class="'section-modal-main-wrapper'" ref="modal"
               class="sections-fixed sections-z-50 sections-overflow-hidden bg-grey sections-bg-opacity-25 sections-inset-0 sections-p-8 sections-overflow-y-auto modalContainer"
               aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div
              class="flexSections fullHeightSections sections-items-center sections-justify-center sections-pt-4 sections-px-4 sections-pb-20 sections-text-center">
              <div
                class="section-modal-content sections-bg-white relativeSections sections-shadow rounded-xl sections-overflow-scroll">
                <div class="section-modal-wrapper success-section-type">
                  <div class="sections-text-center h4 header">
                    <div class="icon-head">
                      <CelebrateIcon/>
                    </div>
                    <div class="title">
                      {{
                        typesTab === 'types' || typesTab === 'inventoryTypes' ? $t("success-section-title") : $t("success-global-section-title")
                      }}
                    </div>
                    <div class="closeIcon" @click="staticSuccess = false">
                      <CloseIcon/>
                    </div>
                  </div>
                  <div v-if="typesTab === 'types' || typesTab === 'inventoryTypes'"
                       class="flexSections sections-w-full sections-justify-center">
                  </div>
                  <div class="footer">
                    <button class="hp-button" @click="staticSuccess = false; runIntro('sectionCreationConfirmed', introRerun)">
                      <div class="btn-icon check-icon"></div>
                      <div class="btn-text">{{ $t("Done") }}</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ------------------------------------------------------------------------------------------- -->

          <Loading :loading="loading"/>
        </div>
        <div v-else>
          <!-- This is to show the create a new page button when the page requested is not found     -->
          <button ref="intro-create-page" v-if="admin && errorResponseStatus !== 401" class="hp-button btn-text" @click="createNewPage">
            {{ $t("Create New Page") }}
          </button>
          <div
            v-if="(errorResponseStatus === 404 || errorResponseStatus === 401) && (errorRegisteredPage === 'page_not_found' || errorRegisteredPage === 'project_not_found')">
            <component :is="registeredPage(errorResponseStatus === 404 ? 'page_not_found' : 'project_not_found')"
                       :error-response="errorResponseData" :error-response-status="errorResponseStatus"/>
          </div>
          <div v-else-if="errorResponseStatus !== 0" class="flexSections not-found-error">
            <div class="flexSections not-found-error-column">
              <ErrorIcon class="error-icon"/>
              <div v-for="(error, index) in sectionsMainErrors" :key="index" class="mainmsg not-found-error-column">
                {{ error }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Vue from "vue";
import {
  formatName,
  formatTexts,
  importComp,
  parsePath,
  parseQS,
  validateQS,
  sectionHeader,
  populateWithDummyValues,
  importJs,
  dummyDataPresets
} from "../../utils";
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
import InfoIcon from "../../base/icons/info.vue";
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
import UploadMedia from "../../components/Medias/UploadMedia";
import MediaComponent from "../../components/Medias/MediaComponent";
import ClickableTooltip from "../../components/Tooltip/ClickableTooltip";

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
    ErrorIcon,
    InfoIcon,
    UploadMedia,
    MediaComponent,
    ClickableTooltip
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
    },
    sectionsPageData: {
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
      ],
      link: [
        this.projectMetadata['selectedCSSPreset'] && this.projectMetadata['selectedCSSPreset'].name && this.projectMetadata['selectedCSSPreset'].name !== 'Other' && this.projectMetadata['selectedCSSPreset'].name !== 'None' ? {
          rel: 'stylesheet',
          href: this.projectMetadata['selectedCSSPreset'].url
        } : this.projectMetadata['selectedCSSPreset'] && this.projectMetadata['selectedCSSPreset'].name && this.projectMetadata['selectedCSSPreset'].name !== 'None' && this.projectMetadata['media'] && this.projectMetadata['media'].url ? {
          rel: 'stylesheet',
          href: this.projectMetadata['media'].url
        } : {},
        this.pageMetadata['media'] && this.pageMetadata['media'].url ? {
          rel: 'stylesheet',
          href: this.pageMetadata['media'].url
        } : {},
        this.projectMetadata['favicon'] && this.projectMetadata['favicon'].url ? {
          rel: 'icon',
          type: 'image/png',
          href: this.projectMetadata['favicon'].url
        } : {},
      ]
    }
  },
  data() {
    return {
      locales: ['en', 'fr'],
      translationComponentSupport: true,
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
      typesTab: 'types',
      globalTypes: [],
      types: [],
      sectionTypes: [],
      sectionsQsKeys: [],
      originalVariations: {},
      updatedVariations: {},
      // current visible views
      views: {},
      getSections: [],
      loading: false,
      dragging: false,
      currentSection: null,
      isCreateInstance: false,
      isModalOpen: false,
      isSideBarOpen: false,
      backToAddSectionList: false,
      isDeleteModalOpen: false,
      isRestoreSectionOpen: false,
      restoreType: 'section',
      isDeletePageModalOpen: false,
      isDeleteSectionModalOpen: false,
      deletedSectionId: null,
      deletedSectionName: null,
      isErrorsFormatModalOpen: false,
      isAuthModalOpen: false,
      isUnAuthModalOpen: false,
      synched: false,
      createdView: {},
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
      projectMetadata: {},
      metadataErrors: {
        path: [""]
      },
      sectionsError: "",
      sectionsErrorOptions: null,
      sectionsAdminError: "",
      renderSectionError: "",
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
      errorInViews: false,
      highlightRegions: false,
      sectionsMainErrors: [],
      sectionsLayoutErrors: [],
      availableSectionsForms: [],
      sectionsConfigurableTypeReference: null,
      supportedLanguages: [
        {id: 'fr', label: 'French (fr)', selected: false},
        {id: 'en', label: 'English (en)', selected: false}
      ],
      selectedLanguages: [],
      defaultLang: 'en',
      selectedMediaType: 'media',
      resizeData: {
        tracking: false,
        startWidth: null,
        startCursorScreenX: null,
        handleWidth: 10,
        resizeTarget: null,
        parentElement: null,
        maxWidth: null,
      },
      errorResponseStatus: 0,
      errorRegisteredPage: '',
      errorResponseData: null,
      sectionOptions: {},
      sectionsFilterName: '',
      sectionsFilterAppName: '',
      appNames: [],
      sectionsWebsiteDomain: '',
      pageData: null,
      canPromote: false,
      intro: null,
      currentPages: null,
      introRerun: false,
      creationView: false
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
      else return {name: "default", pageName: this.pageName};
    },
    currentViews: {
      get() {
        let views = [];
        views = Object.values(
          this.displayVariations[this.selectedVariation].views
        );
        views = views.sort(function (a, b) {
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
    alteredViews() {
      let alteredSections = null
      let hooksJs = importJs(`/js/global-hooks`)
      if (hooksJs['page_pre_render'] && this.pageData) {
        if (typeof hooksJs['page_pre_render'] === 'function') {
          alteredSections = hooksJs['page_pre_render'](JSON.parse(JSON.stringify(this.pageData)), JSON.parse(JSON.stringify(this.currentViews)), this.sectionsWebsiteDomain, this.$sections, this.$config)
        }
      }
      if (alteredSections) {
        return alteredSections
      } else {
        return this.currentViews
      }
    },
    alteredViewsPerRegions() {
      let alteredSections = null
      let hooksJs = importJs(`/js/global-hooks`)
      if (hooksJs['page_pre_render'] && this.pageData && this.viewsPerRegions && Object.keys(this.viewsPerRegions).length > 0) {
        if (typeof hooksJs['page_pre_render'] === 'function') {
          alteredSections = hooksJs['page_pre_render'](JSON.parse(JSON.stringify(this.pageData)), JSON.parse(JSON.stringify(this.viewsPerRegions)), this.sectionsWebsiteDomain, this.$sections, this.$config)
        }
      }
      if (alteredSections) {
        return alteredSections
      } else {
        return this.viewsPerRegions
      }
    },
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
    filteredTypes() {
      return this.types.filter(item => {
        const nameMatch = this.sectionsFilterName
          ? item.name.toLowerCase().includes(this.sectionsFilterName.toLowerCase())
          : true;

        const appNameMatch = this.sectionsFilterAppName
          ? item.application && item.application.toLowerCase().includes(this.sectionsFilterAppName.toLowerCase())
          : true;

        return nameMatch && appNameMatch;
      });
    },
    filteredGlobalTypes() {
      return this.globalTypes.filter(item => {
        const nameMatch = this.sectionsFilterName
          ? item.name.toLowerCase().includes(this.sectionsFilterName.toLowerCase())
          : true;

        const appNameMatch = this.sectionsFilterAppName
          ? item.application && item.application.toLowerCase().includes(this.sectionsFilterAppName.toLowerCase())
          : true;

        return nameMatch && appNameMatch;
      });
    },
    getCreationComponent() {
      try {
        const path = `/views/${this.currentSection.name}_${this.currentSection.type}`;
        return importComp(path);
      } catch {
        return ''
      }
    }
  },
  async mounted() {
    if (this.admin) {
      this.initiateIntroJs()
    }

    if (this.sectionsError !== "" && !this.registeredPage(this.errorResponseStatus === 404 ? 'page_not_found' : 'project_not_found')) {
      this.showToast("Error", "error", this.$t('loadPageError') + this.sectionsError, this.sectionsErrorOptions);
    } else if (this.sectionsAdminError !== "") {
      this.showToast("Error", "error", this.sectionsAdminError);
    }
    if (this.renderSectionError !== "") {
      this.showToast("Error", "error", this.renderSectionError);
    }
    if (this.$sections.cname === "active" && this.$nuxt[`$${this._sectionsOptions.cookiesAlias}`].get("sections-project-id")) {
      this.$sections.projectId = this.$nuxt[`$${this._sectionsOptions.cookiesAlias}`].get("sections-project-id")
    }

    if (this.projectMetadata['activateCookieControl'] === true) {
      this.$nuxt.$emit('activateCookieControl', this.projectMetadata['gtmId'], true)
    }
  },
  beforeDestroy() {
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.stopTracking);
  },
  async fetch() {
    this.getAvailableLayouts()
    this.getAvailableSections()
    this.sectionsMainErrors = []
    this.metadataFormLang = this.$i18n.locale.toString()
    this.locales.forEach(lang => {
      this.pageMetadata[lang] = {
        title: "",
        description: ""
      }
    })
    if (this.$sections.projectLocales && this.$sections.projectLocales !== '' && this.$sections.projectLocales.includes(',')) {
      this.translationComponentSupport = true
      this.locales = []
      this.locales = this.$sections.projectLocales.split(',')
      this.metadataFormLang = this.$i18n.locale.toString()
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

    let websiteDomain = ""
    const isServer = process.server;
    const scheme = isServer ? this.$nuxt.context.req.headers['x-forwarded-proto'] || 'http' : window.location.protocol.replace(':', '');

    if (inBrowser) {
      websiteDomain = window.location.host
    } else {
      websiteDomain = this.$nuxt.context.req.headers.host
    }
    this.sectionsWebsiteDomain = websiteDomain

    this.$sections.projectUrl = websiteDomain

    const config = {
      headers: sectionHeader(((inBrowser) ? {} : {origin: `${scheme}://${websiteDomain}`})),
    };

    let URL = `${this.$sections.serverUrl}/project/${this.getSectionProjectIdentity()}/page/${parsePath(encodeURIComponent(this.pageName))}`;

    let payload = {}

    let language = undefined
    try {
      language = this.$i18n.locale
    } catch {
    }

    if (this.$sections.queryStringSupport && this.$sections.queryStringSupport === "enabled") {
      let query_string = parseQS(encodeURIComponent(this.$route.params.pathMatch ? this.$route.params.pathMatch : '/'), Object.keys(this.$route.query).length !== 0, this.$route.query)
      payload = {
        query_string: {
          ...query_string,
          language
        }
      }
    }

    let hooksJs = importJs(`/js/global-hooks`)
    if (hooksJs['page_pre_load']) {
      if (hooksJs['page_pre_load'](payload)) {
        payload = hooksJs['page_pre_load'](payload)
      }
    }

    if (this.sectionsPageData) {
      const res = this.sectionsPageData.res
      const error = this.sectionsPageData.error
      if (res) {
        this.initializeSections(res);
        this.$nuxt.$emit('sectionsLoaded', 'pageMounted');
      } else if (error) {
        if (error.response.status === 400) {
          const res = error.response;
          this.initializeSections(res);
          return;
        }
        this.errorResponseStatus = error.response.status
        if ((this.errorResponseStatus === 404 || this.errorResponseStatus === 401) && this.registeredPage(this.errorResponseStatus === 404 ? 'page_not_found' : 'project_not_found')) {
          this.errorRegisteredPage = this.errorResponseStatus === 404 ? 'page_not_found' : 'project_not_found'
          this.errorResponseData = error.response.data
        } else if (error.response.data.error) {
          this.showToast("Error", "error", this.$t('loadPageError') + error.response.data.error);
        } else {
          this.showToast("Error", "error", this.$t('loadPageError') + error.response.data.message, error.response.data.options);
        }
        this.loading = false;
        this.pageNotFound = true;
        if (this.errorResponseStatus === 404) {
          this.sectionsMainErrors.push(this.$t('404NotFound'));
        }
        this.$emit("load", false);
      }
    } else if (inBrowser) {
      try {
        const res = await this.$axios.post(URL, payload, config)
        this.initializeSections(res);
        this.$nuxt.$emit('sectionsLoaded', 'pageMounted');
      } catch (error) {
        if (error.response.status === 400) {
          const res = error.response;
          this.initializeSections(res);
          return;
        }
        this.errorResponseStatus = error.response.status
        if ((this.errorResponseStatus === 404 || this.errorResponseStatus === 401) && this.registeredPage(this.errorResponseStatus === 404 ? 'page_not_found' : 'project_not_found')) {
          this.errorRegisteredPage = this.errorResponseStatus === 404 ? 'page_not_found' : 'project_not_found'
          this.errorResponseData = error.response.data
        } else if (error.response.data.error) {
          this.showToast("Error", "error", this.$t('loadPageError') + error.response.data.error);
        } else {
          this.showToast("Error", "error", this.$t('loadPageError') + error.response.data.message, error.response.data.options);
        }
        this.loading = false;
        this.pageNotFound = true;
        if (this.errorResponseStatus === 404) {
          this.sectionsMainErrors.push(this.$t('404NotFound'));
        }
        this.$emit("load", false);
      }
    } else {
      const optionsRes = await this.$axios.options(URL, config)
      if (optionsRes.status === 200) {
        try {
          const res = await this.$axios.post(URL, payload, config)
          this.initializeSections(res);
        } catch (error) {
          if (error.response.status === 400) {
            const res = error.response;
            this.initializeSections(res);
            return;
          }
          if (error.response.status === 404) {
            this.$nuxt.context.res.statusCode = 404
          }

          this.errorResponseStatus = error.response.status
          if ((this.errorResponseStatus === 404 || this.errorResponseStatus === 401) && this.registeredPage(this.errorResponseStatus === 404 ? 'page_not_found' : 'project_not_found')) {
            this.errorRegisteredPage = this.errorResponseStatus === 404 ? 'page_not_found' : 'project_not_found'
            this.errorResponseData = error.response.data
          } else if (error.response.data.error) {
            this.sectionsError = error.response.data.error
          } else {
            this.sectionsError = error.response.data.message
            this.sectionsErrorOptions = error.response.data.options
          }
          this.loading = false;
          this.pageNotFound = true;
          if (this.errorResponseStatus === 404) {
            this.sectionsMainErrors.push(this.$t('404NotFound'));
          }
          this.$emit("load", false);
        }
      }
    }
    if (this.projectMetadata && this.projectMetadata['languages'] && this.projectMetadata['languages'].length > 0) {
      this.locales = []
      this.locales = this.projectMetadata['languages']
    }
    this.computeLayoutData()
  },
  watch: {
    isModalOpen(value) {
      const body = document.querySelector("body");
      if (value === true) {
        body.style.overflow = "hidden";
      } else {
        body.style.overflow = "auto";
      }
    }
  },
  methods: {
    parsePath,
    initializeSections(res) {
      this.$nuxt.$emit('page_pre_render', res)
      const sections = res.data.sections;
      this.pageData = res.data;
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
      if (res.data.metadata.project_metadata && res.data.metadata.project_metadata.media) {
        this.$set(this.projectMetadata, 'media', res.data.metadata.project_metadata.media)
      }
      if (res.data.metadata.project_metadata && res.data.metadata.project_metadata.selectedCSSPreset) {
        this.$set(this.projectMetadata, 'selectedCSSPreset', res.data.metadata.project_metadata.selectedCSSPreset)
      }
      if (res.data.metadata.project_metadata && res.data.metadata.project_metadata.favicon) {
        this.$set(this.projectMetadata, 'favicon', res.data.metadata.project_metadata.favicon)
      }
      if (res.data.metadata.project_metadata && res.data.metadata.project_metadata.languages) {
        this.$set(this.projectMetadata, 'languages', res.data.metadata.project_metadata.languages)
        this.selectedLanguages = res.data.metadata.project_metadata.languages
      }
      if (res.data.metadata.project_metadata && res.data.metadata.project_metadata.defaultLang) {
        this.$set(this.projectMetadata, 'defaultLang', res.data.metadata.project_metadata.defaultLang)
        this.defaultLang = res.data.metadata.project_metadata.defaultLang
      }
      if (res.data.metadata.project_metadata && res.data.metadata.project_metadata.activateCookieControl === true) {
        this.$set(this.projectMetadata, 'activateCookieControl', res.data.metadata.project_metadata.activateCookieControl, true)
        this.$set(this.projectMetadata, 'gtmId', res.data.metadata.project_metadata.gtmId)
      }
      if (res.data.metadata.media) {
        this.$set(this.pageMetadata, 'media', res.data.metadata.media)
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
          if (section.render_data[0].settings && section.render_data[0].settings.image && !Array.isArray(section.render_data[0].settings.image)) {
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
        if (section.query_string_keys && section.query_string_keys.length > 0) {
          this.sectionsQsKeys.push(...section.query_string_keys)
        }
        if (section.id) {
          views[section.id] = section;
        } else {
          views["test"] = section;
        }

        this.sectionOptions[section.id] = false

        if (section.error || (section.settings === null || section.settings === undefined)) {
          this.errorInViews = true;
        } else {
          this.errorInViews = false
        }
        sections.forEach((section) => {
          if (section.status_code === 404) {
            this.errorInViews = false;
          } else {
            this.errorInViews = false
          }
        })
      });
      this.sectionOptions = {...this.sectionOptions}
      this.$set(this.displayVariations, this.activeVariation.pageName, {
        name: this.activeVariation.pageName,
        views: {...views},
      });
      this.selectedVariation = this.activeVariation.pageName;
      this.loading = false;
      this.$emit("load", true);
      this.sectionsPageLastUpdated = res.data.last_updated;
    },
    selectedCSS(mediaObject, mediaFieldName) {
      const media = {
        media_id: "",
        url: "",
        seo_tag: "",
        filename: "",
        headers: {}
      };
      media.filename = mediaObject.files[0].filename;
      media.media_id = mediaObject.id;
      media.url = mediaObject.files[0].url;
      media.seo_tag = mediaObject.seo_tag;
      if (mediaObject.files[0].headers) {
        media.headers = mediaObject.files[0].headers
      }
      this.$set(this.pageMetadata, mediaFieldName, media);
      this.$refs.sectionsMediaComponent.closeModal()
    },
    removeMedia(media) {
      this.pageMetadata[media] = {}
    },
    updatePageMetaData() {
      this.loading = true
      this.metadataErrors.path[0] = ''

      const sections = [];
      let views = this.originalVariations[this.pageName].views;
      views = Object.values(views);
      views.forEach((view) => {
        if (!view.error || view.status_code === 404) {
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
              options.push(rData.settings);
            });
            refactorView.options = options;
          } else if (view.settings) {
            refactorView.options = view.settings;
          }
          if (view.type === 'dynamic' || view.type === 'local') {
            refactorView.options = []
          }
          if (refactorView.id && refactorView.id.startsWith("id-")) {
            delete refactorView.id;
          }
          if (view.linked_to) {
            sections.push({
              ...{
                weight: view.weight,
                linked_to: view.linked_to,
                region: view.region ? view.region : {}
              }
            });
          } else {
            sections.push({...refactorView});
          }
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

      if (pagePath !== '/') {

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
        metadata: {...this.pageMetadata},
        variations: [],
        layout: this.sectionslayout,
        sections
      };
      const URL =
        `${this.$sections.serverUrl}/project/${this.$sections.projectId}/page/${parsePath(encodeURIComponent(this.sectionsPageName))}`;

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
          this.metadataFormLang = this.$i18n.locale.toString()
          this.showToast(
            "Success",
            "success",
            this.$t('successSettingsChanges')
          );
          if (pagePath !== this.pageName) {
            let baseURL = window.location.origin;
            let routerBase = this.$router.options.base
            if (routerBase) {
              while (routerBase.endsWith('/')) {
                routerBase = routerBase.slice(0, -1);
              }
              baseURL = baseURL + routerBase
            }
            window.location.replace(`${baseURL}/${pagePath}`);
          } else {
            window.location.reload()
          }
        })
        .catch((error) => {
          this.loading = false
          if (error.response.data.errors) {
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
        this.fieldsInputs.push({type: "image", name: ""});
      }
    },
    removeField(index) {
      this.fieldsInputs.splice(index, 1);
    },
    checkToken() {
      const auth_code = this.$route.query.auth_code;
      if (this.$sections.cname === "active") {
        if (this.$nuxt[`$${this._sectionsOptions.cookiesAlias}`].get("sections-project-id")) {
          this.$sections.projectId = this.$nuxt[`$${this._sectionsOptions.cookiesAlias}`].get("sections-project-id")
        } else {
          const project_id = this.$route.query.project_id;
          this.$sections.projectId = project_id
          this.$nuxt[`$${this._sectionsOptions.cookiesAlias}`].set("sections-project-id", project_id);
        }
      }
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
            date.setDate(date.getDate() + 14);
            date.setHours(date.getHours() - 4)
            this.$nuxt[`$${this._sectionsOptions.cookiesAlias}`].set("sections-auth-token", token, {
              expires: date,
              path: '/'
            });
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
        .catch((error) => {
          this.loading = false
          this.$emit("load", false);
          this.$cookies.remove('sections-auth-token');
          this.admin = false
          this.showToast("Error", "error", this.$t('tokenInvalidReconnect'));
        });
    },
    exportSections() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.allSections));
      const dlAnchorElem = document.getElementById('downloadAnchorElem');
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", `${this.pagePath}.json`);
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
            if ((sectionTypeObject.access === 'private' || sectionTypeObject.access === 'public_scoped') && sectionTypeObject.app_status !== 'enabled') {
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
    updateGlobalType(section) {
      if (section.type === 'configurable') {
        this.sectionTypeName = section.nameID;
      } else if (section && section.name) {
        this.sectionTypeName = section.name;
      }
      if (this.sectionTypeName !== "") {

        if (this.selectedLayout !== 'standard') {
          section.region = {};
          section.region[this.selectedLayout] = {
            slot: this.selectedSlotRegion,
            weight: Object.keys(
              this.displayVariations[this.selectedVariation].views
            ).length
          };
        } else {
          section.region = {}
        }

        const token = this.$cookies.get("sections-auth-token");
        const config = {
          headers: sectionHeader({token}),
        };
        const URL =
          `${this.$sections.serverUrl}/project/${this.$sections.projectId}/global-instances/${section.instance_name}`;
        this.loading = true;

        this.$axios.put(URL, {
          "section": {
            "name": this.sectionTypeName,
            "options": section.type === 'configurable' ? [section.settings] : section.settings,
            "type": section.type
          },
          "auto_insertion": section.auto_insertion
        }, config).then(() => {
          this.sectionTypeName = "";
          this.currentSection = null
          this.isModalOpen = false
          this.isSideBarOpen = false
          this.loading = false
          this.showToast(
            "Success",
            "success",
            this.$t('globalTypeUpdated')
          );
        })
          .catch((error) => {
            this.loading = false;
            this.showToast("Error", "error", this.$t('updateSectionTypeError') + error.response.data.message, error.response.data.options);
          });
      } else {
        this.loading = false;
        this.showToast("Error", "error", this.$t('enterSectionTypeName'));
      }
    },
    addNewGlobalType(section) {
      if (section.type === 'configurable') {
        this.sectionTypeName = section.nameID;
      } else if (section && section.name) {
        this.sectionTypeName = section.name;
      }
      if (this.sectionTypeName !== "") {

        const token = this.$cookies.get("sections-auth-token");
        const config = {
          headers: sectionHeader({token}),
        };
        const URL =
          `${this.$sections.serverUrl}/project/${this.$sections.projectId}/global-instances/${section.instance_name}`;
        this.loading = true;

        this.$axios.post(URL, {
          "section": {
            "name": this.sectionTypeName,
            "options": section.type === 'configurable' ? [section.settings] : section.settings,
            "type": section.type
          },
          "auto_insertion": section.auto_insertion
        }, config).then(() => {
          this.globalTypes = [];
          this.getGlobalSectionTypes();
          this.staticSuccess = true;
          this.sectionTypeName = "";
          this.fieldsInputs = [
            {
              type: "image",
              name: ""
            }
          ]

          if (this.canPromote === true) {
            section.linkedTo = section.instance_name;
            section.linked_to = section.instance_name;
            section.instance = true;
            this.$set(
              this.displayVariations[this.selectedVariation].views,
              section.id,
              section
            );
            this.displayVariations[this.selectedVariation].altered = true;
            this.showToast(
              "Success",
              "info",
              this.$t('successAddedSection')
            );
          }

          this.currentSection = null
          this.isCreateInstance = false
          this.isSideBarOpen = false
          this.typesTab = 'globalTypes'
        })
          .catch((error) => {
            this.loading = false;
            this.showToast("Error", "error", this.$t('createSectionTypeError') + error.response.data.message, error.response.data.options);
          });
      } else {
        this.loading = false;
        this.showToast("Error", "error", this.$t('enterSectionTypeName'));
      }
    },
    addNewStaticType(name) {
      if (name) {
        this.sectionTypeName = name;
      }
      if (this.sectionTypeName !== "") {
        const token = this.$cookies.get("sections-auth-token");
        const config = {
          headers: sectionHeader({token}),
        };
        const URL =
          `${this.$sections.serverUrl}/project/${this.$sections.projectId}/section-types/${this.sectionTypeName}`;
        this.loading = true;

        let fieldsDeclaration = this.fieldsInputs

        if (name) {
          let path = "";
          path = `/forms/${this.sectionTypeName}`;
          let formComp = importComp(path);
          if (formComp.props && formComp.props.mediaFields) {
            fieldsDeclaration = formComp.props.mediaFields;
          }
        }

        fieldsDeclaration = fieldsDeclaration.filter(field => field.name.trim() !== '')

        this.$axios.post(URL, {
          "fields": fieldsDeclaration
        }, config).then(() => {
          this.types = [];
          this.globalTypes = [];
          this.getSectionTypes();
          this.staticSuccess = true;
          this.sectionTypeName = "";
          this.fieldsInputs = [
            {
              type: "image",
              name: ""
            }
          ]
        })
          .catch((error) => {
            this.loading = false;
            this.types = [];
            this.globalTypes = [];
            this.getSectionTypes();
            this.showToast("Error", "error", this.$t('createSectionTypeError') + error.response.data.message, error.response.data.options);
          });
      } else {
        this.loading = false;
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
    getComponent(sectionName, sectionType, returnProps) {
      let hooksJs = importJs(`/js/global-hooks`)
      if (hooksJs['section_pre_render'] && hooksJs['section_pre_render']({sectionName, sectionType})) {
        return hooksJs['section_pre_render']({sectionName, sectionType})
      } else if (returnProps === true) {
        let path = "";
        if (sectionName && sectionName.includes(":") && sectionName.includes("_-_")) {
          path = `/views/${sectionName.split(":")[1].split("_-_")[0]}_${sectionType}`;
        } else if (sectionName && sectionName.includes(":")) {
          path = `/views/${sectionName.split(":")[1]}_${sectionType}`;
        } else if (sectionName && sectionName.includes("_-_")) {
          path = `/views/${sectionName.split("_-_")[0]}_${sectionType}`;
        } else {
          path = `/views/${sectionName}_${sectionType}`;
        }
        const moduleData = importComp(path);
        if (moduleData && moduleData.props && moduleData.props.viewStructure && (moduleData.props.viewStructure.settings || moduleData.props.viewStructure.render_data)) {
          return {
            settings: populateWithDummyValues(moduleData.props.viewStructure.settings, dummyDataPresets),
            render_data: populateWithDummyValues(moduleData.props.viewStructure.render_data, dummyDataPresets),
            type: sectionType
          }
        } else return {type: sectionType}
      } else if (this.$sections.cname === "active") {
        let path = "";
        if (sectionName && sectionName.includes(":") && sectionName.includes("_-_")) {
          path = `/views/${sectionName.split(":")[1].split("_-_")[0]}_${sectionType}`;
          // if (process.client) {
          //   Vue.component(`${sectionName.split(":")[1].split("_-_")[0]}_${sectionType}`, {
          //     extends: importComp(path)
          //   })
          // }
          return importComp(path)
        } else if (sectionName && sectionName.includes(":")) {
          path = `/views/${sectionName.split(":")[1]}_${sectionType}`;
          // if (process.client) {
          //   Vue.component(`${sectionName.split(":")[1]}_${sectionType}`, {
          //     extends: importComp(path)
          //   })
          // }
          return importComp(path)
        } else if (sectionName && sectionName.includes("_-_")) {
          path = `/views/${sectionName.split("_-_")[0]}_${sectionType}`;
          // if (process.client) {
          //   Vue.component(`${sectionName.split("_-_")[0]}_${sectionType}`, {
          //     extends: importComp(path)
          //   })
          // }
          return importComp(path)
        } else {
          path = `/views/${sectionName}_${sectionType}`;
          // if (process.client) {
          //   Vue.component(`${sectionName}_${sectionType}`, {
          //     extends: importComp(path)
          //   })
          // }
          return importComp(path)
        }
      } else {
        let path = "";
        if (sectionName && sectionName.includes(":") && sectionName.includes("_-_")) {
          path = `/views/${sectionName.split(":")[1].split("_-_")[0]}_${sectionType}`;
          return importComp(path);
        } else if (sectionName && sectionName.includes(":")) {
          path = `/views/${sectionName.split(":")[1]}_${sectionType}`;
          return importComp(path);
        } else if (sectionName && sectionName.includes("_-_")) {
          path = `/views/${sectionName.split("_-_")[0]}_${sectionType}`;
          return importComp(path);
        } else {
          path = `/views/${sectionName}_${sectionType}`;
          return importComp(path);
        }
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
        console.warn(this.$t('noLayoutsFolder'));
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
          if (!view.region || !view.region[this.selectedLayout] || !view.region[this.selectedLayout]['slot']) {
            if (!view.region) {
              view['region'] = {}
            }
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
          this.viewsPerRegions[slotName] = this.viewsPerRegions[slotName].sort(function (a, b) {
            return a.region[selectedLay].weight - b.region[selectedLay].weight;
          });
        })

        this.viewsPerRegions = {...this.viewsPerRegions}

        if (this.admin && this.editMode) {
          this.verifySlots();
        }
      }
    },
    verifySlots() {
      this.$nextTick(() => {
        if (this.selectedLayout !== 'standard') {
          this.sectionsLayoutErrors = [];
          this.layoutSlotNames.forEach(slotName => {
            if (!document.getElementById(`sections-slot-region-${this.selectedLayout}-${slotName}`)) {
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
          if (view.region[this.selectedLayout] === undefined) {
            view.region[this.selectedLayout] = {}
          }
          if (view.region[this.selectedLayout]['slot'] === undefined) {
            view.region[this.selectedLayout]['slot'] = ''
          }
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
      const URL = `${this.$sections.serverUrl}/project/${this.$sections.projectId}/page/${parsePath(encodeURIComponent(this.pageName))}`;
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
          this.runIntro('editPage')
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
    getAvailableSections() {
      try {
        const form_sections = require.context(`@/sections/forms`, false, /\.vue$/)
        const forms_count = form_sections.keys().length
        if (forms_count > 0) {
          const form_names = form_sections.keys().map((filename) => {
            const name = filename.replace(/^\.\/(.+)\.vue$/, '$1');
            return name;
          });
          this.availableSectionsForms.push(...form_names)
        }
      } catch (error) {
        console.warn(this.$t('noFormsFolder'));
      }
    },
    async initiateIntroJs() {
      try {
        const token = this.$cookies.get("sections-auth-token");
        const response = await this.$axios.get(`${this.$sections.serverUrl}/project/${this.getSectionProjectIdentity()}/dashboard`, {
          headers: sectionHeader({ token })
        }).catch((error) => {
          this.loading = false
          this.$emit("load", false);
          this.$cookies.remove('sections-auth-token');
          this.admin = false
          this.showToast("Error", "error", this.$t('tokenInvalidReconnect'));
        });
        this.currentPages = response.data.current_pages
        if (this.currentPages !== null && this.currentPages === 0) {
          if (this.pageNotFound) {
            await this.runIntro('createPage')
          }
        }
      } catch {
      }
    },
    async runIntro(topic, rerun) {
      if (this.intro && topic === 'globalTour') {
        this.intro.setDontShowAgain(true)
      }
      if (rerun === true) {
        this.introRerun = true
      } else {
        this.introRerun = false
      }
      if ((this.currentPages !== null && this.currentPages === 0) || rerun === true) {
        if (this.intro) {
          this.intro.exit(true)
        }
        let introJs = await import('intro.js/minified/intro.min.js');
        await import('intro.js/minified/introjs.min.css');
        this.intro = null
        this.intro = introJs.default()
        this.intro.setOption("dontShowAgain", true)
        this.intro.setOption("nextLabel", this.$t('intro.nextLabel'))
        this.intro.setOption("prevLabel", this.$t('intro.prevLabel'))
        this.intro.setOption("doneLabel", this.$t('intro.doneLabel'))
        this.intro.setOption("dontShowAgainLabel", this.$t('intro.dontShowAgainLabel'))
        if (rerun === true) {
          if (topic === 'globalTour') {
            this.intro.setOption("dontShowAgain", false)
            this.intro.onexit(() => {
              this.intro.setDontShowAgain(true)
              this.introRerun = false
            });
          } else {
            if (topic === 'topBar') {
              this.intro.setDontShowAgain(false)
            }
            this.intro.setOption("dontShowAgain", true)
          }
        }
        if (topic !== 'inventoryOpened' && topic !== 'availableSectionOpened') {
          this.addIntroSteps(topic, rerun)
        } else if (topic === 'inventoryOpened' && this.$refs['intro-simple-CTA-section-inventory'] && this.$refs['intro-simple-CTA-section-inventory'][0]) {
          this.addIntroSteps(topic, rerun)
        } else if (topic === 'availableSectionOpened' && this.$refs['intro-simple-CTA-section-available'] && this.$refs['intro-simple-CTA-section-available'][0]) {
          this.addIntroSteps(topic, rerun)
        }
      }
    },
    addIntroSteps(topic, rerun) {
      if ((this.currentPages !== null && this.currentPages === 0) || rerun === true) {
        this.intro.setOptions({
          steps: this.introSteps(topic)
        })
        this.intro.refresh(true)
        this.intro.start()
        if (topic === 'addNewSectionModal' || topic === 'sectionCreationConfirmed') {
          window.runIntro = this.runIntro.bind(this);
          window.introRerun = this.introRerun;
          window.setTypesTab = (value) => {
            this.typesTab = value;
          };
        } else if (topic === 'inventoryOpened') {
          window.addNewStaticType = this.addNewStaticType.bind(this);
          window.closeIntro = () => {
            this.intro.exit(true)
          };
        } else if (topic === 'availableSectionOpened') {
          window.simpleCTAType = this.filteredTypes.filter(type => type.notCreated !== true && type.app_status !== 'disbaled' && type.app_status !== 'disabled').find(type => type.name === 'SimpleCTA')
          window.openCurrentSection = this.openCurrentSection.bind(this);
          window.introRerun = this.introRerun
          window.closeIntro = () => {
            this.intro.exit(true)
          };
        }
      }
    },
    introSteps(topic) {
      const simpleCTAIndex = this.filteredTypes.filter(type => type.notCreated === true || type.app_status === 'disbaled' || type.app_status === 'disabled').findIndex(type => type.name === 'SimpleCTA')
      switch (topic) {
        case 'createPage':
          return [
            {
              element: this.$refs['intro-create-page'],
              intro: this.$t('intro.createPage')
            }
          ]
        case 'editPage':
          return [
            {
              element: this.$refs['intro-edit-page'],
              intro: this.$t('intro.editPage')
            }
          ]
        case 'topBar':
          return [
            {
              element: this.$refs['intro-top-bar'],
              intro: this.$t('intro.topBarButtons')
            },
            {
              element: this.$refs['intro-add-new-section'],
              intro: this.$t('intro.addNewSection')
            }
          ]
        case 'addNewSectionModal':
          return [
            {
              element: this.$refs['intro-available-sections'],
              intro: this.$t('intro.availableSections')
            },
            {
              element: this.$refs['intro-inventory'],
              intro: simpleCTAIndex === -1 ? this.$t('intro.inventoryDesc') : `${this.$t('intro.inventory')} <span class="sections-cursor-pointer underline text-Blue" onclick="setTypesTab('inventoryTypes'); runIntro('inventoryOpened');">${this.$t('intro.checkIt')}</span>`
            }
          ]
        case 'inventoryOpened':
          return [
            {
              element: this.$refs['intro-simple-CTA-section-inventory'][0],
              intro: `${this.$t('intro.simpleCTA')} <span class="sections-cursor-pointer underline text-Blue" onclick="addNewStaticType('SimpleCTA'); closeIntro();">${this.$t('intro.createSection')}</span>`
            }
          ]
        case 'sectionCreationConfirmed':
          return [
            {
              element: this.$refs['intro-available-sections'],
              intro: `${this.$t('intro.simpleCTAInstalled')} <span class="sections-cursor-pointer underline text-Blue" onclick="setTypesTab('types'); runIntro('availableSectionOpened', introRerun);">${this.$t('intro.openAvailableSections')}</span>`
            }
          ]
        case 'availableSectionOpened':
          return [
            {
              element: this.$refs['intro-simple-CTA-section-available'][0],
              intro: `${this.$t('intro.clickSimpleCTA')} <span class="sections-cursor-pointer underline text-Blue" onclick="openCurrentSection(simpleCTAType); runIntro('sectionFormOpened', introRerun);">${this.$t('intro.here')}</span>`
            }
          ]
        case 'sectionFormOpened':
          return [
            {
              element: this.$refs['intro-simple-CTA-section-form'],
              intro: this.$t('intro.simpleCTAForm')
            }
          ]
        case 'sectionSubmitted':
          return [
            {
              element: this.$refs['intro-save-changes'],
              intro: this.$t('intro.saveChanges')
            }
          ]
        case 'pageSaved':
          return [
            {
              element: this.$refs['intro-relaunch'],
              intro: this.$t('intro.relaunch')
            },
            {
              element: this.$refs['intro-find-more-blobal'],
              intro: this.$t('intro.findMoreGlobal')
            }
          ]
        case 'globalTour':
          return [
            {
              intro: this.$t('intro.globalSections')
            },
            {
              intro: this.$t('intro.creatingGlobalSection')
            },
            {
              intro: this.$t('intro.promoteSection')
            }
          ]
      }
    },
    getSectionProjectIdentity() {
      if (this.$sections.cname === "active") {
        const inBrowser = typeof window !== 'undefined';
        let websiteDomain = ""
        if (inBrowser) {
          websiteDomain = window.location.host
        } else {
          websiteDomain = this.$nuxt.context.req.headers.host
        }
        return websiteDomain
      } else {
        return this.$sections.projectId
      }
    },
    async renderConfigurableSection(gt, options) {
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
          name: gt.section.name,
          weight: 1,
          options: options
        },
        base_path: this.pagePath
      };

      let language = undefined
      try {
        language = this.$i18n.locale
      } catch {
      }

      if (this.$sections.queryStringSupport && this.$sections.queryStringSupport === "enabled") {
        variables["query_string"] = parseQS(encodeURIComponent(this.$route.params.pathMatch ? this.$route.params.pathMatch : '/'), Object.keys(this.$route.query).length !== 0, this.$route.query)
        if (gt.query_string_keys && gt.query_string_keys.length > 0) {
          variables["query_string"] = {
            ...variables["query_string"],
            ...validateQS(variables["query_string"], gt.query_string_keys, this.editMode),
            language
          }
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
            this.errorAddingSection({
              closeModal: false,
              title: "Error adding " + gt.name,
              message: res.data.error
            })
            return;
          }
          this.addSectionType({
            name: gt.section.name,
            type: 'configurable',
            settings: options[0],
            id: this.id,
            weight: this.weight,
            render_data: res.data.render_data,
            fields: gt.fields,
            query_string_keys: gt.query_string_keys,
            dynamic_options: gt.dynamic_options,
            auto_insertion: gt.auto_insertion,
            instance_name: gt.name
          })
        })
        .catch((e) => {
          if (e.response.status === 404) {
            this.$emit('addSectionType', {
              name: gt.section.name,
              type: 'configurable',
              settings: options[0],
              id: this.id,
              weight: this.weight,
              render_data: e.response.data.render_data,
              fields: gt.fields,
              query_string_keys: gt.query_string_keys,
              dynamic_options: gt.dynamic_options,
              auto_insertion: gt.auto_insertion,
              instance_name: gt.name
            })
          } else {
            this.$emit('errorAddingSection', {
              closeModal: false,
              title: "Error adding " + gt.name,
              message: e.response.data.error ? e.response.data.error : this.$t('saveConfigSectionError')
            })
          }
          this.$emit("load", false);
        });
    },
    async renderDynamicSection(name, instanceName, gt) {
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
        },
        base_path: this.pagePath
      };

      let language = undefined
      try {
        language = this.$i18n.locale
      } catch {
      }

      if (this.$sections.queryStringSupport && this.$sections.queryStringSupport === "enabled") {
        variables["query_string"] = parseQS(encodeURIComponent(this.$route.params.pathMatch ? this.$route.params.pathMatch : '/'), Object.keys(this.$route.query).length !== 0, this.$route.query)
        if (gt.query_string_keys && gt.query_string_keys.length > 0) {
          variables["query_string"] = {
            ...variables["query_string"],
            ...validateQS(variables["query_string"], gt.query_string_keys, this.editMode),
            language
          }
        }
      }

      const URL =
        `${this.$sections.serverUrl}/project/${this.$sections.projectId}/section/render`;
      this.$axios
        .post(URL, variables, config)
        .then((res) => {
          if (res.data && res.data.error) {
            this.$emit('errorAddingSection', {
              closeModal: true,
              title: "Error adding " + instanceName,
              message: res.data.error
            })
            this.$emit("load", false);
            return;
          }
          this.addSectionType({
            name: name,
            type: 'dynamic',
            id: this.id,
            weight: this.weight,
            render_data: res.data.render_data,
            query_string_keys: res.data.query_string_keys,
            instance_name: instanceName
          })
          this.$emit("load", false);
        })
        .catch((e) => {
          if (e.response.status === 404) {
            this.$emit('addSectionType', {
              name: name,
              type: 'dynamic',
              id: this.id,
              weight: this.weight,
              render_data: e.response.data.render_data,
              query_string_keys: e.response.data.query_string_keys,
              instance_name: instanceName
            })
          } else {
            if (e.response.data.error) {
              this.$emit('errorAddingSection', {
                closeModal: true,
                title: "Error adding " + instanceName,
                message: e.response.data.error
              })
            } else {
              this.$emit('errorAddingSection', {
                closeModal: true,
                title: "Error adding " + instanceName,
                message: this.$t('saveConfigSectionError')
              })
            }
          }
          this.$emit("load", false);
        });
    },
    getGlobalSectionTypes(autoLoad) {
      if (this.globalTypes && this.globalTypes.length) {
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
        `${this.$sections.serverUrl}/project/${this.$sections.projectId}/global-instances`;
      this.$axios
        .get(url, config)
        .then(async (res) => {
          res.data.data.map((d) => {
            this.globalTypes.push({
              regions: d.regions,
              auto_insertion: d.auto_insertion,
              section: d.section,
              pages: d.pages,
              name: d.name,
              id: d.id,
              type: this.types.find(t => t.name === d.section.name) ? this.types.find(t => t.name === d.section.name).type : undefined,
              query_string_keys: this.types.find(t => t.name === d.section.name) && this.types.find(t => t.name === d.section.name).query_string_keys ? this.types.find(t => t.name === d.section.name).query_string_keys : undefined,
              fields: this.types.find(t => t.name === d.section.name) && this.types.find(t => t.name === d.section.name).fields ? this.types.find(t => t.name === d.section.name).fields : undefined,
              dynamic_options: this.types.find(t => t.name === d.section.name) && this.types.find(t => t.name === d.section.name).dynamic_options ? this.types.find(t => t.name === d.section.name).dynamic_options : undefined,
              application: this.types.find(t => t.name === d.section.name) && this.types.find(t => t.name === d.section.name).application ? this.types.find(t => t.name === d.section.name).application : undefined,
            });
          });
          this.types.forEach(type => {
            this.globalTypes.push({
              name: type.name,
              type: type.type,
              application: type.application,
              notCreated: type.notCreated !== true && type.app_status !== 'disbaled' && type.app_status !== 'disabled'
            })
          })
          this.loading = false
          if (autoLoad === true) {
            if (this.allSections.length === 0 && this.globalTypes && this.globalTypes.length > 0) {
              for (const gt of this.globalTypes.filter(gt => gt.auto_insertion === true)) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                if (gt.type === 'configurable') {
                  await this.renderConfigurableSection(gt, gt.section.options)
                } else if (gt.type === 'dynamic') {
                  await this.renderDynamicSection(gt.section.name, gt.name, gt)
                } else {
                  this.addSectionType({
                    ...gt.section,
                    id: 'id-' + Date.now(),
                    weight: 'null',
                    type: gt.type,
                    instance_name: gt.name,
                    fields: gt.fields,
                    query_string_keys: gt.query_string_keys,
                    dynamic_options: gt.dynamic_options,
                    render_data: gt.section && gt.section.options && gt.section.options[0] ? [{settings: gt.section.options[0]}] : undefined
                  }, false, true)
                }
              }
            }
          }
          this.$emit("load", false);
        })
        .catch((error) => {
          this.loading = false
          this.$emit("load", false);
          this.showToast("Error", "error", error.toString());
        });
    },
    getSectionTypes(autoLoad) {
      if (this.types && this.types.length) {
        return;
      }
      this.loading = true;
      this.appNames = []
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
            if (d.application) {
              this.appNames.push(d.application)
            }
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
              requirements: d.requirements,
              query_string_keys: d.query_string_keys,
              notCreated: false
            });
          });
          this.availableSectionsForms.forEach(name => {
            const found = this.types.find(element => element.name.includes(':') ? element.name.split(':')[1] === name : element.name === name)
            if (!found) {
              this.types.push({
                name,
                notCreated: true
              })
            }
          });
          this.types = [...this.types, ...this.addSystemTypes()];
          this.loading = false
          this.$emit("load", false);
          this.getGlobalSectionTypes(autoLoad);
        })
        .catch((error) => {
          this.loading = false
          this.$emit("load", false);
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
        {...external_types},
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
      this.getSectionTypes(true);
      if (!this.originalVariations[this.selectedVariation]) {
        this.originalVariations = JSON.parse(
          JSON.stringify(this.displayVariations)
        );
      }

      this.editMode = !this.editMode;

      if (this.editMode === true) {

        this.runIntro('topBar')

        this.loading = true;
        const inBrowser = typeof window !== 'undefined';
        const config = {
          headers: sectionHeader(((inBrowser) ? {} : {origin: this.$sections.projectUrl})),
        };

        const URL =
          `${this.$sections.serverUrl}/project/${this.$sections.projectId}/page/${parsePath(encodeURIComponent(this.pageName))}`;

        let payload = {}

        let language = undefined
        try {
          language = this.$i18n.locale
        } catch {
        }

        if (this.$sections.queryStringSupport && this.$sections.queryStringSupport === "enabled") {
          let query_string = parseQS(encodeURIComponent(this.$route.params.pathMatch ? this.$route.params.pathMatch : '/'), Object.keys(this.$route.query).length !== 0, this.$route.query)
          payload = {
            query_string: {
              ...query_string,
              language
            }
          }
          if (this.sectionsQsKeys && this.sectionsQsKeys.length > 0) {
            payload["query_string"] = {
              ...payload["query_string"],
              ...validateQS(payload["query_string"], this.sectionsQsKeys, this.editMode)
            }
          }
        }

        await this.$axios.post(URL, payload, config).then((res) => {
          this.loading = false;
          if (res.data.last_updated > this.sectionsPageLastUpdated) {
            this.showToast(
              "Warning",
              "warning",
              this.$t('oldPageVersion')
            );
          }
          this.initializeSections(res);
          this.computeLayoutData()
        }).catch(() => {
        })
        this.getUserData();
        this.verifySlots();
      }

    },
    formatName,
    formatTexts,
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
    addSectionType(section, showToast, instance) {
      try {
        if (this.savedView.linkedTo) {
          const confirmed = window.confirm(
            this.$t('linkedSection')
          );
          if (!confirmed) {
            return;
          }
        }
        if (section.weight === null || section.weight === "null" || section.weight === undefined) {
          section.weight = Object.keys(
            this.displayVariations[this.selectedVariation].views
          ).length;
        }

        if (this.selectedLayout !== 'standard') {
          if (section.region === undefined || section.region === null || section.region[this.selectedLayout] === undefined || section.region[this.selectedLayout] === null) {
            section.region = {};
          }
          section.region[this.selectedLayout] = {
            slot: this.selectedSlotRegion,
            weight: section.region && section.region[this.selectedLayout] && section.region[this.selectedLayout].weight !== undefined && section.region[this.selectedLayout].weight !== null ? section.region[this.selectedLayout].weight : this.viewsPerRegions[this.selectedSlotRegion] ? this.viewsPerRegions[this.selectedSlotRegion].length : Object.keys(
              this.displayVariations[this.selectedVariation].views
            ).length
          };
        }

        if (instance === true || (section.type === 'local' && section.instance_name) || (section.type === 'dynamic' && section.instance_name) || (section.type === 'configurable' && section.instance_name)) {
          section.linkedTo = section.instance_name;
          section.linked_to = section.instance_name;
          section.instance = true;
          section.settings = (section.type === 'dynamic' || section.type === 'configurable') && section.render_data && section.render_data[0] && section.render_data[0].settings ? section.render_data[0].settings : section.options
        } else {
          section.linkedTo = "";
          section.linked_to = "";
        }

        this.$set(
          this.displayVariations[this.selectedVariation].views,
          section.id,
          section
        );

        if (section.name === 'SimpleCTA') {
          this.runIntro('sectionSubmitted', this.introRerun)
        }

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
        this.isSideBarOpen = false;
        this.savedView = {};
        this.createdView = {}
        this.creationView = false
        this.loading = false;

        this.computeLayoutData();
        if (showToast !== false) {
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
    async refreshSectionView(sectionView, data) {
      let sectionDatas = []
      sectionDatas = this.allSections.filter(section => section.query_string_keys && section.query_string_keys.length > 0 && Object.keys(data.qs).some(qsItem => section.query_string_keys.includes(qsItem)))

      const config = {
        headers: sectionHeader({}),
      };

      let variables = {
        base_path: this.pagePath
      }

      let language = undefined
      try {
        language = this.$i18n.locale
      } catch {
      }

      if (this.$sections.queryStringSupport && this.$sections.queryStringSupport === "enabled") {
        variables["query_string"] = parseQS(encodeURIComponent(this.$route.params.pathMatch ? this.$route.params.pathMatch : '/'), Object.keys(this.$route.query).length !== 0, this.$route.query)
        if (data.qs) {
          variables["query_string"] = {...variables["query_string"], ...data.qs}
        }
        variables["query_string"] = {
          ...variables["query_string"],
          language
        }
      }

      const URL = `${this.$sections.serverUrl}/project/${this.getSectionProjectIdentity()}/section/render`;

      for (const sectionData of sectionDatas) {
        const sectionName = sectionData.nameID ? sectionData.nameID : sectionData.name
        variables['section'] = {
          name: sectionName,
          weight: sectionData.weight
        };
        if (sectionData.type === 'configurable') {
          variables['section']['options'] = [sectionData.render_data[0].settings]
        }
        const inBrowser = typeof window !== 'undefined';
        if (inBrowser) {
          try {
            const res = await this.$axios.post(URL, variables, config)
            if (res.data && res.data.error) {
              this.$nuxt.$emit('sectionViewRefreshed', {error: res.data})
              this.renderSectionError = `${sectionName}: ${res.data.error}`
              this.showToast("Error", "error", this.renderSectionError);
            } else {
              const index = this.currentViews.findIndex(view => view.name === sectionData.name);
              if (index !== -1) {
                const updatedViews = [...this.currentViews];
                updatedViews[index] = {
                  ...updatedViews[index],
                  render_data: res.data.render_data,
                };

                this.currentViews = updatedViews;
              }
              this.$nuxt.$emit('sectionViewRefreshed', res.data)
            }
          } catch (e) {
            this.$nuxt.$emit('sectionViewRefreshed', {error: e.response.data})
            this.renderSectionError = `${sectionName}: ${e.response.data.error}`
            this.showToast("Error", "error", this.renderSectionError);
          }
        } else {
          const optionsRes = await this.$axios.options(URL, config)
          if (optionsRes.status === 200) {
            try {
              const res = await this.$axios.post(URL, variables, config)
              if (res.data && res.data.error) {
                this.$nuxt.$emit('sectionViewRefreshed', res.data)
                this.renderSectionError = `${sectionName}: ${res.data.error}`
              } else {
                const index = this.currentViews.findIndex(view => view.name === sectionData.name);
                if (index !== -1) {
                  const updatedViews = [...this.currentViews];
                  updatedViews[index] = {
                    ...updatedViews[index],
                    render_data: res.data.render_data,
                  };

                  this.currentViews = updatedViews;
                }
                this.$nuxt.$emit('sectionViewRefreshed', res.data)
              }
            } catch (e) {
              this.$nuxt.$emit('sectionViewRefreshed', {error: e.response.data})
              this.renderSectionError = `${sectionName}: ${e.response.data.error}`
            }
          }
        }
      }
      this.computeLayoutData()
    },
    mutateVariation(variationName) {
      this.invalidSectionsErrors = {}
      this.sectionsFormatErrors = {}
      const sections = [];
      const qsKeys = [];
      let views = this.displayVariations[variationName].views;
      views = Object.values(views);
      let formatValdiation = true
      views.map((view) => {
        if (!view.error || view.status_code === 404) {
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
              if (rData.settings.image && !Array.isArray(rData.settings.image)) {
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
          if (view.type === 'dynamic' || view.type === 'local') {
            refactorView.options = []
          }
          if (refactorView.id && refactorView.id.startsWith("id-")) {
            delete refactorView.id;
          }
          if (view.linked_to) {
            sections.push({
              ...{
                weight: view.weight,
                linked_to: view.linked_to,
                region: view.region ? view.region : {}
              }
            });
          } else {
            sections.push({...refactorView});
          }
          if (view.query_string_keys && view.query_string_keys.length > 0) {
            qsKeys.push(...view.query_string_keys)
          }
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
                        if (option[field.name] && (Array.isArray(option[field.name]) || typeof option[field.name] === 'object') && (field.type === 'image' || field.type === 'media')) {
                          if (Array.isArray(option[field.name])) {
                            if ((field.type === 'image' || field.type === 'media') && (!option[field.name][0].media_id || !option[field.name][0].url) && option[field.name].length !== 0) {
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

        let variables = {
          page: this.sectionsPageName,
          path: this.pagePath && this.pagePath !== "" ? this.pagePath.trim() : undefined,
          metadata: this.pageMetadata,
          variations: [],
          layout: this.selectedLayout,
          sections,
        };

        if (this.$sections.queryStringSupport && this.$sections.queryStringSupport === "enabled") {
          variables["query_string"] = parseQS(encodeURIComponent(this.$route.params.pathMatch ? this.$route.params.pathMatch : '/'), Object.keys(this.$route.query).length !== 0, this.$route.query)
          if (qsKeys && qsKeys.length > 0) {
            variables["query_string"] = {
              ...variables["query_string"],
              ...validateQS(variables["query_string"], qsKeys, this.editMode)
            }
          }
        }

        const URL =
          `${this.$sections.serverUrl}/project/${this.$sections.projectId}/page/${parsePath(encodeURIComponent(this.sectionsPageName))}`;

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
              this.runIntro('pageSaved', this.introRerun)
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
              this.$nuxt.$emit('sectionsLoaded', 'pageSaved');
            })
            .catch((error) => {
              if (error.response.data.errors) {
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
    edit(view, viewAnchor) {
      if (this.isSideBarOpen !== true) {
        this.canPromote = true
        this.types.map((type) => {
          if (view.type === "configurable") {
            if (type.name.split(":")[1] === view.name) {
              view.fields = type.fields;
              view.multiple = type.multiple;
              view.application_id = type.application_id;
              if (type.dynamic_options) {
                view.dynamic_options = true;
              }
            }
          } else {
            if (type.name === view.name) {
              view.fields = type.fields;
              view.multiple = type.multiple;
              if (type.dynamic_options) {
                view.dynamic_options = true;
              }
            }
          }
        });
        if (view.linked_to !== "") {
          view.instance = true
        }

        this.currentSection = view;
        this.savedView = view;
        this.isSideBarOpen = true;
        this.$nextTick(() => {
          this.resizeData.parentElement = this.$refs.resizeTarget.parentElement;
          this.resizeData.resizeTarget = this.$refs.resizeTarget;
          setTimeout(() => {
            if (this.$refs.resizeTarget) {
              this.$refs.resizeTarget.scrollTo({
                top: 0
              });
            }
          }, 600);
          window.addEventListener("mousemove", this.onMouseMove);
          window.addEventListener("mouseup", this.stopTracking);
        })
        setTimeout(() => {
          if (this.$refs.sectionsMainTarget) {
            const targetElement = this.$refs.sectionsMainTarget.querySelector(viewAnchor);
            if (targetElement) {
              const targetPosition = targetElement.offsetTop; // Get the vertical position of the element
              this.$refs.sectionsMainTarget.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
              });
            }
          }
        }, 600);
      } else if (this.currentSection.name !== view.name) {
        this.showToast(
          "Edit",
          "error",
          this.$t("editingSection")
        );
      }
      this.updatedVariations = JSON.parse(
        JSON.stringify(this.displayVariations)
      );
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
    toggleSectionsOptions(viewId) {
      this.$set(this.sectionOptions, viewId, !this.sectionOptions[viewId])
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
    deleteGlobalSectionType(sectionTypeName, index) {
      this.isDeleteModalOpen = false
      this.loading = true
      this.$emit("load", true);
      const token = this.$cookies.get("sections-auth-token");
      const config = {
        headers: sectionHeader(({origin: this.$sections.projectUrl, token})),
      };
      const URL =
        `${this.$sections.serverUrl}/project/${this.$sections.projectId}/global-instances/${sectionTypeName}`;
      this.$axios
        .delete(URL, config)
        .then((res) => {
          this.showToast(
            "Success",
            "info",
            res.data.message
          );
          this.globalTypes.splice(index, 1)
          this.globalTypes = [];
          this.getGlobalSectionTypes()
        })
        .catch((error) => {
          this.showToast("Error", "error", this.$t('deleteSectionTypeError') + error.response.data.message);
          this.loading = false
          this.$emit("load", false);
        });
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
          this.types = [];
          this.globalTypes = []
          this.getSectionTypes()
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

      for (let requiredItem of this.selectedSectionRequirements) {
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
          this.types.filter(type => type.application_id === sectionAppId).forEach(type => {
            type.app_status = "enabled"
          })
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
          this.types.filter(type => type.application_id === sectionAppId).forEach(type => {
            type.app_status = "disabled"
          })
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
    openCurrentSection(type, global) {
      if (global === true) {
        this.currentSection = {
          ...this.types.find(t => t.name === type.name),
          ...type,
          name: type.section && type.section.name ? type.section.name : type.name,
          instance_name: type.name,
          instance: type.notCreated === true,
          render_data: type.section && type.section.options && type.section.options[0] ? [{settings: type.section.options[0]}] : undefined,
          addToPage: type.type === 'configurable' ? true : undefined
        }
        if (!this.currentSection.linked_to) {
          this.currentSection.linked_to = ""
        }
        if (type.type === 'configurable') {
          this.savedView = this.currentSection
        }
      } else if (type.app_status === 'disbaled' || type.app_status === 'disabled') {
        this.showToast("Authorisation warning", "warning", this.$t("authorizeFirst"));
      } else {
        if (type.type === 'static' || type.type === 'configurable') {
          this.isModalOpen = false
          this.isSideBarOpen = true

          this.currentSection = {...type, creation: true, id: 'creation-view'}
          this.createdView = this.currentSection
          this.creationView = true
          this.sideBarSizeManagement()
        } else {
          this.currentSection = {...type, creation: true}
        }
      }
    },
    updateCreationView(settings) {
      this.createdView.settings = settings;
      this.createdView = {...this.createdView}
    },
    sideBarSizeManagement() {
      try {
        this.$nextTick(() => {
          this.resizeData.parentElement = this.$refs.resizeTarget.parentElement;
          this.resizeData.resizeTarget = this.$refs.resizeTarget;
          setTimeout(() => {
            if (this.$refs.resizeTarget) {
              this.$refs.resizeTarget.scrollTo({
                top: 0
              });
            }
            if (this.$refs.sectionsMainTarget) {
              this.$refs.sectionsMainTarget.scrollTo({
                top: this.$refs.sectionsMainTarget.scrollHeight,
                behavior: 'smooth'
              });
            }
          }, 600);
          window.addEventListener("mousemove", this.onMouseMove);
          window.addEventListener("mouseup", this.stopTracking);
        })
      } catch {}
    },
    startTracking(event) {
      if (event.button !== 0) return;

      event.preventDefault();
      const handleElement = event.currentTarget;

      const targetSelector = handleElement.getAttribute("data-target");
      const targetElement = this.$refs.resizeTarget.closest(targetSelector);

      if (!targetElement) {
        return;
      }

      this.resizeData.startWidth = targetElement.offsetWidth;
      this.resizeData.startCursorScreenX = event.screenX;
      this.resizeData.resizeTarget = targetElement;
      this.resizeData.maxWidth =
        this.resizeData.parentElement.offsetWidth - this.resizeData.handleWidth;
      this.resizeData.tracking = true;
    },
    onMouseMove(event) {
      if (!this.resizeData.tracking) return;

      const cursorScreenXDelta =
        event.screenX - this.resizeData.startCursorScreenX;
      const newWidth = Math.min(
        this.resizeData.startWidth + cursorScreenXDelta,
        this.resizeData.maxWidth
      );

      this.resizeData.resizeTarget.style.width = `${newWidth}px`;
    },
    stopTracking() {
      if (this.resizeData.tracking) {
        this.resizeData.tracking = false;
      }
    },
    restoreSectionContent() {
      this.isSideBarOpen = false;
      this.isCreateInstance = false;
      this.isRestoreSectionOpen = false;
      if (this.creationView === true) {
        this.createdView = {}
        this.creationView = false
        if (this.backToAddSectionList === true) {
          this.backToAddSectionList = false;
          this.currentSection = null
          this.isModalOpen = true
          this.savedView = {}
          this.isCreateInstance = false
          this.isSideBarOpen = false
        }
      } else if (this.restoreType === 'section') {
        this.restoreSection();
      } else {
        this.restoreVariations()
      }
    },
    restoreSection() {
      this.displayVariations[this.selectedVariation].altered = false;
      this.$set(
        this.displayVariations[this.selectedVariation].views,
        this.currentSection.id,
        this.updatedVariations[this.selectedVariation].views[this.currentSection.id]
      );
      this.updatedVariations = JSON.parse(
        JSON.stringify(this.displayVariations)
      );
      this.currentViews = this.displayVariations[this.selectedVariation].views;
    },
    registeredPage(type) {
      let path = `/page_components/${type}`
      return importComp(path);
    },
    clearSectionsFilters() {
      this.sectionsFilterName = ''
      this.sectionsFilterAppName = ''
    },
  }
}
</script>

<style>
.sections-config {
  min-height: 100vh;
}

.sections-config .control-button.config-buttons {
  position: absolute;
  z-index: 190;
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
  right: 45px !important;
  top: 10px;
  z-index: 50 !important;
  --tw-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);
  box-shadow: 0 0 rgba(0, 0, 0, 0), 0 0 rgba(0, 0, 0, 0), 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 rgba(0, 0, 0, 0)), var(--tw-ring-shadow, 0 0 rgba(0, 0, 0, 0)), var(--tw-shadow);
  border-width: 1px;
}

.section-view .controls.optionsSettings {
  background: #f5f5f5;
  position: absolute !important;
  right: 8px !important;
  top: 10px;
  z-index: 50 !important;
}

.section-view .controls svg {
  cursor: pointer;
  width: 40px;
  height: 40px;
  color: #31a9db;
  margin: 3px;
}

.section-view .controls svg.settings-icon {
  cursor: pointer;
  width: 15px;
  height: 15px;
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

.sections-config button {
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

.hp-button.globalTour {
  margin-left: 0;
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

.btn-text.intro {
  width: 20px;
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

.section-creation {
  text-align: -webkit-right;
  background: #adadad;
  height: 40px;
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
  width: 100%;
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

.synched

@-moz-keyframes spin {
  100% {
    -moz-transform: rotate(360deg);
  }
}

.synched

@-webkit-keyframes spin {
  100% {
    -webkit-transform: rotate(360deg);
  }
}

.synched

@keyframes spin {
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
  height: 330px;
  margin: 0px;
}

.modalContainer .section-item.active {
  margin: 10px 0px;
  border: 1px solid #31a9db;
}

.modalContainer .section-item.inactive {
  border: 1px solid #adadad;
}

.modalContainer .section-item .section-item-title {
  font-size: 16px;
  position: absolute;
  padding: 3px;
  place-content: center;
  width: 300px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 300px;
  white-space: nowrap;
}

.modalContainer .section-item-box {
  display: flex;
  flex-direction: column;
  background: #31a9db;
  color: white;
  position: relative;
}

.modalContainer .type-items {
  display: grid;
  grid-template-columns: repeat(2, 330px);
  grid-gap: 25px;
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

.sections-z-50 {
  z-index: 20000000000  !important;
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

.errorMessageDialog {
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

@media only screen and (max-height: 850px) {
  .content-wrapper {
    overflow-y: scroll;
    height: 350px;
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

.section-item .section-creation-icon {
  cursor: pointer;
  margin-top: 3px;
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.section-item .toggleLabel {
  color: white;
  font-size: 12px;
}

.section-item .switch {
  position: relative;
  display: inline-block;
  width: 30px;
  height: 18px;
  top: 1px;
  right: 2px;
}

/* Hide default HTML checkbox */
.section-item .switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.section-item .slider {
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

.section-item .slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  right: 14px;
  top: 2px;
  background-color: white;
  transition: .4s;
}

.section-item input:checked + .slider {
  background-color: #2196F3;
}

.section-item input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

.section-item input:checked + .slider:before {
  -webkit-transform: translateX(12px);
  -ms-transform: translateX(12px);
  transform: translateX(12px);
}

/* Rounded sliders */
.section-item .slider.round {
  border-radius: 34px;
}

.section-item .slider.round:before {
  border-radius: 50%;
}

.error-section-empty {
  height: 60px;
}

.sections-center {
  justify-content: center;
}

.section-info {
  text-align: -webkit-right;
}

.global-section-info {
  text-align: -webkit-left;
  position: absolute;
}

.section-info-icon {
  cursor: pointer;
  margin-top: 3px;
  margin-right: 2px;
}

.section-top-separator {
  margin-top: 3px;
  height: 20px;
}

.global-section-info-icon {
  cursor: pointer;
  margin-top: 3px;
  margin-left: 2px;
}

.info-icon-style {
  height: 20px;
  width: 20px;
  color: white;
}

.h2 {
  font-size: 1.1rem;
}

.selectedTypesTab {
  color: #31a9db;
  text-decoration: underline;
}

.selectSectionType {
  width: 500px;
}

.global-sections-first-row {
  display: flex;
  align-items: center;
  justify-content: center;
  color: red;
}

.global-sections-second-row {
  color: red;
}

.global-sections-pages-link {
  font-size: 14px;
  color: red;
  margin: 0 5px;
  cursor: pointer;
  text-decoration: underline;
}

.global-sections-popup {
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  padding: 10px;
  position: absolute;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 400px;
  overflow-y: scroll;
  color: red;
}

.global-sections-popup ul {
  list-style-type: none;
  padding: 0;
}

.global-sections-popup li {
  padding: 5px 0;
  white-space: nowrap;
}

.ql-editor p img {
  display: inline;
}

.pagesReference {
  font-size: 14px;
  color: red;
}

.view-in-edit-mode {
  min-height: 54px;
}

.sections-justify-center {
  justify-content: center;
}

.sections-items-center {
  align-items: center;
}

.sections-flex-row {
  flex-direction: row;
}

.sections-text-center {
  text-align: center;
}

.sections-text-3xl {
  font-size: 30px;
}

.sections-cursor-pointer {
  cursor: pointer;
}

.sections-pt-3 {
  padding-top: 12px;
}

.sections-pt-4 {
  padding-top: 16px;
}

.sections-pb-1 {
  padding-bottom: 4px;
}

.sections-pb-3 {
  padding-bottom: 12px;
}

.sections-pb-4 {
  padding-bottom: 16px;
}

.sections-pb-6 {
  padding-bottom: 24px;
}

.sections-pb-20 {
  padding-bottom: 80px;
}

.sections-pl-2 {
  padding-left: 8px;
}

.sections-pl-3 {
  padding-left: 12px;
}

.sections-pr-3 {
  padding-right: 12px;
}

.sections-pl-4 {
  padding-left: 16px;
}

.sections-p-2 {
  padding: 8px;
}

.sections-pl-6 {
  padding-left: 24px;
}

.sections-p-1 {
  padding: 4px;
}

.sections-p-3 {
  padding: 12px;
}

.sections-p-4 {
  padding: 16px;
}

.sections-p-8 {
  padding: 32px;
}

.sections-m-1 {
  margin: 4px;
}

.sections-mt-2 {
  margin-top: 8px;
}

.sections-mb-4 {
  margin-bottom: 16px;
}

.sections-bg-white {
  background-color: white;
}

.sections-px-4 {
  padding-left: 16px;
  padding-right: 16px;
}

.sections-py-4 {
  padding-top: 16px;
  padding-bottom: 16px;
}

.sections-my-3 {
  margin-top: 12px;
  margin-bottom: 12px;
}

.sections-bg-opacity-25 {
  --tw-bg-opacity: 0.25;
}

.sections-inset-0 {
  inset: 0px;
}

.sections-fixed {
  position: fixed;
}

.sections-absolute {
  position: absolute;;
}

.sections-shadow {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.sections-overflow-hidden {
  overflow: hidden;
}

.sections-overflow-y-auto {
  overflow-y: auto;
}

.sections-overflow-scroll {
  overflow: scroll;
}

.sections-top-0 {
  top: 0px;
}

.sections-right-2 {
  right: 8px;
}

.sections-items-end {
  align-items: end;
}

.sections-flex-col {
  flex-direction: column;
}

.sections-gap-4 {
  gap: 16px;
}

.sections-border {
  border-width: 1px;
}

.sections-border-FieldGray {
  border-color: #C2C2C2;
}

.sections-bg-FieldGray {
  background-color: #C2C2C2;
}

.sections-text-FieldGray {
  color: #C2C2C2;
}

.sections-h-48px {
  height: 48px;
}

.sections-w-full {
  width: 100%;
}

.sections-borders-bottom {
  border-radius: 0 0 0.75rem 0.75rem;
}

.sections-borders-top {
  border-radius: 0.75rem 0.75rem 0 0;
}

.sections-checkbox {
  width: 20px;
}

.gtmError {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  color: rgb(216, 42, 42);
}

@media (min-width: 768px) {
  .md\:flex-row {
    flex-direction: row !important;
  }
}

@media only screen and (max-height: 800px) {
  .sections-page-settings {
    overflow: scroll;
    max-height: 350px;
  }
}

.sections-container {
  overflow: hidden;
  background-color: white;

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-content: stretch;
  align-items: stretch;
}

.sections-container-edit-mode {
  height: 100vh;
}

.sections-container > .sections-aside {
  order: 0;
  flex: 0 0 auto;
  align-self: auto;
  padding: 10px;
  overflow: auto;

  /* Make the sidebar sticky */
  position: sticky;
  top: 0;
  height: 100vh; /* Ensures it stays full height */
  width: 527px;
  min-width: 422px;
  max-width: 50%;
  z-index: 100000000000000;
}

.sections-aside
.closeIcon {
  position: absolute;
  right: 10px;
  cursor: pointer;
}

.sections-aside
.closeIcon svg {
  width: 35px;
  height: 35px;
  color: #31a9db;
}

.sections-aside
.closeIcon svg:hover {
  color: darken(#31a9db, 10%);
}

.sections-aside
.anchorIcon {
  position: absolute;
  right: 55px;
  top: 16px;
  cursor: pointer;
}

.sections-aside
.anchorIcon svg {
  width: 25px;
  height: 25px;
  color: #31a9db;
}

.sections-aside
.anchorIcon svg:hover {
  color: darken(#31a9db, 10%);
}

.sections-container > .sections-main {
  order: 0;
  flex: 1 1 auto;
  align-self: auto;
  overflow: auto;
}

.sections-resize-handle--x {
  flex: 0 0 auto;
  position: relative;
  box-sizing: border-box;
  width: 3px;
  height: 100%;
  border-left-width: 1px;
  border-left-style: solid;
  border-left-color: black;
  border-right-width: 1px;
  border-right-style: solid;
  border-right-color: black;
  cursor: ew-resize;

  user-select: none;
}

.sections-resize-handle--x::before,
.sections-resize-handle--x::after {
  content: "";
  position: absolute;
  z-index: 1;
  top: 50%;
  height: 18px;
  width: 2px;
  margin-top: -9px;
  border-style: solid;
}

.sections-resize-handle--x::before {
  right: 100%;
  border-left-color: black;
  border-left-width: 1px;
}

.sections-resize-handle--x::after {
  left: 100%;
  border-right-color: black;
  border-right-width: 1px;
}

.metadata-media .css-preset {
  cursor: pointer;
  text-decoration: underline;
  color: #31a9db;
  font-size: 14px;
  align-content: center;
}

.sections-required-field-error {
  padding-top: 4px;
  color: rgb(216, 42, 42);
  font-size: 14px;
}

.section-modal-content .sectionsFilterName {
  height: 38px;
  width: 200px;
}

.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.fieldsets .controls {
  --tw-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);
  box-shadow: 0 0 rgba(0, 0, 0, 0), 0 0 rgba(0, 0, 0, 0), 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 rgba(0, 0, 0, 0)), var(--tw-ring-shadow, 0 0 rgba(0, 0, 0, 0)), var(--tw-shadow);
  border-width: 1px;
}
.fieldsets .controls svg {
  cursor: pointer;
  color: #31a9db;
  margin: 3px;
}
.sections-container .sections-aside .step-back-aside {
  cursor: pointer;
  color: #31a9db;
  position: absolute;
}
.sections-container .sections-aside .step-back-aside svg {
  width: 35px;
  height: 35px;
  transition: 0.2s;
}
.ql-editor.ql-snow img {
  display: inline !important;
}
.cssClassesInput {
  padding-top: 1rem;
  padding-bottom: 1rem;
  padding-left: 1.5rem;
  border: 1px solid #C2C2C2;
  border-radius: 0.75rem;
  height: 48px;
  width: 100%;
  outline: none;
}
section .ql-editor.ql-snow.grey-bg {
  background: grey;
}
</style>
