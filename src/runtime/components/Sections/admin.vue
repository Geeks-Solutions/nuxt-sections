<template>
  <div>
    <div class="sections-container sections-container-edit-mode">
      <aside v-if="(admin && editMode && isSideBarOpen === true && (currentSection !== null || metadataModal === true || sectionsThemeModal === true)) || (admin && isSideBarOpen === true && dynamicSideComponent === true)" ref="resizeTarget"
             class="sections-aside" :class="{'sections-aside-z': introSectionFormStep === true}">
        <div
          class="step-back-aside"
          v-if="currentSection && creationView"
          @click="backToAddSectionList = true; restoreType = 'section'; isRestoreSectionOpen = true;"
        >
          <LazyBaseIconsBack/>
        </div>
        <div v-if="currentSection" class="closeIcon" @click="restoreType = 'section'; isRestoreSectionOpen = true">
          <LazyBaseIconsClose/>
        </div>
        <a
          v-if="currentSection"
          class="anchorIcon"
          :href="(currentSection.linked_to !== '' && currentSection.linked_to !== undefined) ? `#${currentSection.linked_to}-${currentSection.id}` : `#${currentSection.name}-${currentSection.id}`">
          <LazyBaseIconsAnchor
            :title="(currentSection.linked_to !== '' && currentSection.linked_to !== undefined) ? `Anchor id: #${currentSection.linked_to}-${currentSection.id}` : `Anchor id: #${currentSection.name}-${currentSection.id}`"
            class="edit-icon"/>
        </a>
        <div v-if="currentSection" :ref="currentSection.name === 'SimpleCTA' ? 'intro-simple-CTA-section-form' : undefined" :class="currentSection.name === 'SimpleCTA' ? 'intro-simple-CTA-section-form' : ''" class="flexSections component-view-wrapper">
          <div class="component-view">
            <!-- we can use this short hand too -->
            <!-- <component :is="currentSection.type" :props="currentSection"  /> -->
            <LazyBaseTypesStatic
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
            <LazyBaseTypesDynamic
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
            <LazyBaseTypesConfigurable
              v-if="currentSection.type === 'configurable'"
              ref="sectionsConfigurableType"
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
              @loadReference="sectionsConfigurableTypeReference.value = sectionsConfigurableType"
              @load="(value) => loading = value"
              @promote-section="currentSection = {...currentSection, instance: true}"
            />
            <LazyBaseTypesLocal
              v-if="currentSection.type === 'local'"
              :props="currentSection"
              :savedView="savedView"
              :instance="currentSection.instance === true"
              :linked="currentSection.linked_to !== '' && currentSection.linked_to !== undefined"
              @addSectionType="(section) => currentSection.instance === true ? (currentSection.linked_to !== '' && currentSection.linked_to !== undefined) ? updateGlobalType(section) : addNewGlobalType(section) : addSectionType(section)"
            />
          </div>
        </div>

        <div v-if="!currentSection && metadataModal === true" class="section-modal-wrapper">
          <div class="sections-text-center h4 sectionTypeHeader">
            <div class="title">{{ settingsTabTitle(currentSettingsTab) }}</div>
            <div class="closeIcon" @click="closeMetadataModal">
              <LazyBaseIconsClose/>
            </div>
          </div>
          <LazyTranslationsTranslationComponent v-if="translationComponentSupport && locales.length > 1 && currentSettingsTab === 'page_settings'" :locales="locales" :default-lang="defaultLang"
                                                @setFormLang="(locale) => metadataFormLang = locale"/>
          <div v-if="currentSettingsTab === 'page_settings'" class="flexSections sections-w-full sections-justify-center"
               :class="nuxtApp.$sections.cname === 'active' ? 'sections-page-settings' : ''">
            <div class="body metadataFieldsContainer">
              <div class="flexSections sections-flex-row sections-gap-4 metadataFieldsContainerRow">
                <div class="sections-w-full sectionsFieldsLabelsWrapper">
                  <div class="sectionsFieldsLabels">
                    {{ $t("projectId") }}: {{ nuxtApp.$sections.projectId }}
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
                  <div>
                    <div class="sections-mt-2 sectionsFieldsLabels">
                      {{ $t('Image Metatag') }}
                    </div>
                    <LazyMediasUploadMedia :media-label="''" :upload-text="$t('mediaComponent.Upload')"
                                           :change-text="$t('mediaComponent.Change')" :seo-tag="$t('mediaComponent.seoTag')"
                                           :media="pageMetadata['mediaMetatag'] && Object.keys(pageMetadata['mediaMetatag']).length > 0 ? [pageMetadata['mediaMetatag']] : []"
                                           @uploadContainerClicked="selectedMediaType = 'mediaMetatag'; $refs.sectionsMediaComponent.openModal(pageMetadata['mediaMetatag'] && Object.keys(pageMetadata['mediaMetatag']).length > 0 ? pageMetadata['mediaMetatag'].media_id : null)"
                                           @removeUploadedImage="removeMedia('mediaMetatag')"/>
                  </div>
                  <div>
                    <div class="sections-mt-2 sectionsFieldsLabels">
                      {{ $t('CSS') }}
                    </div>
                    <LazyMediasUploadMedia :is-document="true" :media-label="''" :upload-text="$t('mediaComponent.Upload')"
                                           :change-text="$t('mediaComponent.Change')" :seo-tag="$t('mediaComponent.seoTag')"
                                           :media="pageMetadata['media'] && Object.keys(pageMetadata['media']).length > 0 ? [pageMetadata['media']] : []"
                                           @uploadContainerClicked="selectedMediaType = 'media'; $refs.sectionsMediaComponent.openModal(pageMetadata['media'] && Object.keys(pageMetadata['media']).length > 0 ? pageMetadata['media'].media_id : null, 'document')"
                                           @removeUploadedImage="removeMedia('media')" />
                    <LazyMediasMediaComponent ref="sectionsMediaComponent" :sections-user-id="sectionsUserId"
                                              @emittedMedia="(mediaObject) => selectedCSS(mediaObject, selectedMediaType)"></LazyMediasMediaComponent>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="currentSettingsTab === 'page_settings'" class="footer">
            <button class="hp-button" @click="updatePageMetaData">
              <div class="btn-icon check-icon"></div>
              <div class="btn-text">
                {{ $t("Save") }}
              </div>
            </button>
          </div>
          <div v-if="currentSettingsTab !== 'page_settings'">
            <component :is="getBuilderComponentForm(currentSettingsTab)"
                       :updated-builder-settings-prop="updatedBuilderSettingsPerTab"
                       :builder-settings-prop="originalBuilderSettings"
                       :sections-user-id="sectionsUserId"
                       @settings-updated="builderSettingUpdated"></component>
            <div class="footer">
              <button class="hp-button" @click="updateBuilderSettingsMetaData">
                <div class="btn-icon check-icon"></div>
                <div class="btn-text">
                  {{ $t("Save") }}
                </div>
              </button>
            </div>
          </div>
        </div>

        <div v-if="!currentSection && sectionsThemeModal === true" class="section-modal-wrapper sections-themes">
          <div v-if="sectionsThemeComponents[currentSectionData.section.name].length > 1" class="sections-theme-settings-tabs">
            <div v-for="tab in sectionsThemeComponents[currentSectionData.section.name]"
                 :key="`sections-theme-settings-tab-${tab}`"
                 class="sections-theme-settings-tab"
                 :class="{'active-tab': currentThemeTab.id === tab.id}"
                 @click="switchThemeTab(tab)">
              <div>
                {{ tab.name }}
              </div>
              <LazyTooltipClickableTooltip
                v-if="unsavedThemeSettingsError[tab.id]"
                :content="$t('sectionsSettings.save_page_settings')"
                color="#f59e0b"
                position="left">
                <div class="section-info-icon">
                  <LazyBaseIconsAlert :title="$t('sectionsSettings.save_page_settings')"
                                      color="#f59e0b"
                                      class="info-icon-style" />
                </div>
              </LazyTooltipClickableTooltip>
            </div>
          </div>
          <div
            v-if="!currentSection && currentSectionData.section && sectionsThemeModal === true"
            class="anchorIcon"
            @click="themeScrollToSection">
            <LazyBaseIconsAnchor
              :title="(currentSectionData.section.linked_to !== '' && currentSectionData.section.linked_to !== undefined) ? `Anchor id: #${currentSectionData.section.linked_to}-${currentSectionData.section.id}` : `Anchor id: #${currentSectionData.section.name}-${currentSectionData.section.id}`"
              class="edit-icon"/>
          </div>
          <div class="sections-text-center h4 sectionTypeHeader">
            <div class="title">{{ currentThemeTab.name }}</div>
            <div class="closeIcon" @click="closeSectionThemeModal">
              <LazyBaseIconsClose/>
            </div>
          </div>
          <div class="section-theme-component-wrapper">
            <component :is="getDynamicComponent(currentThemeTab.path)"
                       :original-theme-settings-prop="currentSectionData.originalTheme"
                       :theme-settings-prop="currentSectionData.currentTheme"
                       :sections-user-id="sectionsUserId"
                       :section-data="currentSectionData.section"
                       @section-theme-updated="sectionThemeUpdated"></component>
            <div class="footer">
              <button class="hp-button" @click="updateSectionsThemes">
                <div class="btn-icon check-icon"></div>
                <div class="btn-text">
                  {{ $t("Save") }}
                </div>
              </button>
            </div>
          </div>
        </div>

        <div v-if="!currentSection && dynamicSideComponent === true" class="section-modal-wrapper dynamic-side-component">
          <div class="dynamic-side-component-wrapper">
            <component :is="getDynamicComponent(dynamicSideBarComponentPath)"></component>
          </div>
        </div>

      </aside>
      <div
        v-if="(admin && editMode && isSideBarOpen === true && (currentSection !== null || metadataModal === true || sectionsThemeModal === true)) || (admin && isSideBarOpen === true && dynamicSideComponent === true)"
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
              class="intro-edit-page sections-bg-blue control-button hide-mobile btn-text edit-page"
              :title="!editMode ? $t('Edit page') : $t('View page')"
            >
              <LazyBaseIconsEdit v-if="!editMode" />
              <LazyBaseIconsEye v-else />
            </button>
            <div class="bg-light-grey-hp hide-mobile section-wrapper config-wrapper">
              <div
                class="flexSections sections-flex-row sections-justify-center hide-mobile edit-mode-wrapper"
                v-if="admin && editMode && !isSideBarOpen"
              >
                <div class="flexSections sections-flex-row sections-justify-center top-bar-wrapper">

                  <div class="flexSections top-bar-page-content-wrapper">
                    <LazyBaseHelperComponentsBurgerMenu class="pages-list">
                      <template #trigger>
                        <button
                          class="hp-button"
                          type="button"
                        >
                          <div class="btn-text">{{ $t("myPages") }}</div>
                        </button>
                      </template>
                      <template #content>
                        <button
                          v-for="page in myPages"
                          :key="`sections-page-${page.path}`"
                          class="hp-button"
                          type="button"
                          @click="openMyPage(page)"
                        >
                          <div class="btn-text sections-no-wrap">{{ page.page }}</div>
                        </button>
                      </template>
                    </LazyBaseHelperComponentsBurgerMenu>

                    <button
                      class="hp-button"
                      type="button"
                      @click="isCreatePageModalOpen = true"
                    >
                      <div class="plus-icon">
                        <LazyBaseIconsPlus/>
                      </div>
                    </button>

                    <LazyBaseHelperComponentsBurgerMenu>
                      <template #content>
                        <button
                          class="hp-button"
                          :class="selectedVariation === pageName ? 'danger' : 'grey'"
                          data-toggle="tooltip" data-placement="top" :title="$t('importSectionsLabel')"
                          @click="initImportSections"
                        >
                          <LazyBaseIconsExport/>
                          <span class="sections-pl-2 sections-no-wrap">{{ $t('importSectionsLabel') }}</span>
                        </button>
                        <input ref="jsonFilePick" type="file" @change="e => importSections(e)" style="display:none"/>
                        <button
                          class="hp-button"
                          :class="selectedVariation === pageName ? 'danger' : 'grey'"
                          data-toggle="tooltip" data-placement="top" :title="$t('exportSectionsLabel')"
                          @click="exportSections"
                        >
                          <LazyBaseIconsImport/>
                          <span class="sections-pl-2 sections-no-wrap">{{ $t('exportSectionsLabel') }}</span>
                        </button>
                        <a id="downloadAnchorElem" style="display:none"></a>
                        <button
                          class="hp-button"
                          :class="selectedVariation === pageName ? 'danger' : 'grey'"
                          data-toggle="tooltip" data-placement="top" :title="$t('settingsSectionsLabel')"
                          @click="switchSettingsTab('page_settings'); openMetaDataModal()"
                        >
                          <LazyBaseIconsSettings/>
                          <span class="sections-pl-2 sections-no-wrap">{{ $t('settingsSectionsLabel') }}</span>
                        </button>
                        <button
                          class="hp-button danger"
                          data-toggle="tooltip" data-placement="top" :title="$t('deletePage')"
                          @click="isDeletePageModalOpen = true">
                          <LazyBaseIconsTrash class="trash-icon-style"/>
                          <span class="sections-pl-2 sections-no-wrap">{{ $t('deletePage') }}</span>
                        </button>
                        <div class="flexSections sections-flex-col">
                          <button
                            class="hp-button sections-no-wrap layout-btn"
                            @click="layoutMode = !layoutMode"
                          >
                            <div class="btn-text">{{ layoutMode === true ? $t("hideLayout") : $t("editLayout") }}</div>
                          </button>
                          <div v-if="layoutMode === true" class="flexSections sections-flex-row sections-gap-4 layout-region-wrapper">
                            <div class="layoutSelect-container">
                              <div class="layoutSelect-select-wrapper">
                                <select v-model="selectedLayout" id="select" name="select" class="layoutSelect-select"
                                        @change="computeLayoutData">
                                  <option disabled value="">-- Select layout --</option>
                                  <option v-for="layout in availableLayouts" :key="`layout-${layout}`" :value="layout">{{ layout }}</option>
                                </select>
                                <div class="layoutSelect-arrow-icon">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M10 12L5 7h10l-5 5z"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <div class="custom-checkbox">
                              <span class="mainmsg">{{ $t('highlightRegions') }}</span>
                              <label class="switch">
                                <input type="checkbox" id="highlightRegions" v-model="highlightRegions">
                                <span class="slider round"></span>
                              </label>
                              <label for="highlightRegions"></label>
                            </div>
                          </div>
                        </div>
                      </template>
                    </LazyBaseHelperComponentsBurgerMenu>
                  </div>

                  <div class="sections-config-separator"></div>

                  <div ref="intro-top-bar" class="intro-top-bar flexSections top-bar-page-content-wrapper">
                    <div :ref="selectedLayout === 'standard' ? 'intro-add-new-section' : ''" :class="selectedLayout === 'standard' ? 'intro-add-new-section' : ''">
                      <button
                        v-if="selectedLayout === 'standard'"
                        class="hp-button"
                        @click="
              (currentSection = null), (isModalOpen = true), (savedView = {}), (isCreateInstance = false), (isSideBarOpen = false), (runIntro('addNewSectionModal', introRerun.value))
            "
                      >
                        <div class="btn-icon plus-icon">
                          <LazyBaseIconsPlus/>
                        </div>
                        <div class="btn-text">{{ $t("Add") }}</div>
                      </button>
                    </div>

                    <button ref="intro-save-changes" class="intro-save-changes hp-button" :class="{'pageHasNoChanges': pageHasNoChanges}" :disabled="pageHasNoChanges" @click="saveVariation">
                      <div class="save-icon">
                        <LazyBaseIconsFloppy :title="$t('Save')" />
                      </div>
                    </button>

                    <button class="hp-button grey" :class="{'pageHasNoChanges': pageHasNoChanges}" :disabled="pageHasNoChanges" @click="restoreType = 'page'; isRestoreSectionOpen = true">
                      <div class="save-icon">
                        <LazyBaseIconsRestore :title="$t('Restore')" />
                      </div>
                    </button>

                    <LazyBaseHelperComponentsBurgerMenu>
                      <template #content>
                        <div class="flexSections">
                          <button
                            class="hp-button sections-no-wrap"
                            @click="
              (currentSection = null), (isModalOpen = true), (savedView = {}), (isCreateInstance = true), (isSideBarOpen = false), (canPromote = false), (sectionsFilterName = ''), (sectionsFilterAppName = '')
            "
                          >
                            <div class="btn-icon plus-icon">
                              <LazyBaseIconsPlus/>
                            </div>
                            <div class="btn-text">{{ $t("createGlobal") }}</div>
                          </button>
                          <button
                            v-if="!guideConfig.disabled"
                            ref="intro-find-more-blobal"
                            class="intro-find-more-blobal hp-button globalTour"
                            @click="runIntro('globalTour', true, null, 'global-content-guide-btn')"
                          >
                            <div class="btn-text intro">?</div>
                          </button>
                        </div>
                      </template>
                    </LazyBaseHelperComponentsBurgerMenu>
                  </div>

                  <div class="sections-config-separator"></div>

                  <component :is="getDynamicComponent(sectionsOptionsComponentPath)" />

                  <div v-show="sectionsOptionsComponentPath !== ''" class="sections-config-separator"></div>

                  <div class="flexSections top-bar-page-content-wrapper">
                    <button
                      v-if="!guideConfig.disabled"
                      ref="intro-relaunch"
                      class="intro-relaunch hp-button"
                      @click="runIntro('topBar', true, null, 'relaunch-guide-btn')"
                    >
                      <div class="btn-text intro">?</div>
                    </button>

                    <LazyBaseHelperComponentsBurgerMenu class="settings">
                      <template #trigger>
                        <button
                          class="hp-button"
                          type="button"
                        >
                          <div class="save-icon">
                            <LazyBaseIconsSettings />
                          </div>
                        </button>
                      </template>
                      <template #content>
                        <button
                          v-for="tab in updatedPageSettingsTabs.filter(tab => tab !== 'page_settings').reverse()"
                          :key="`page-settings-tab-${tab}`"
                          class="hp-button "
                          :class="selectedVariation === pageName ? 'danger' : 'grey'"
                          data-toggle="tooltip" data-placement="top" :title="settingsTabTitle(tab)"
                          @click="switchSettingsTab(tab); openMetaDataModal()"
                        >
                          <LazyBaseIconsSettings/>
                          <span class="sections-pl-2 sections-no-wrap">{{ settingsTabTitle(tab) }}</span>
                        </button>
                        <button
                          v-if="admin"
                          class="sections-bg-blue sections-logout-btn"
                          @click="logoutUser"
                        >
                          {{ $t("Logout") }}
                        </button>
                      </template>
                    </LazyBaseHelperComponentsBurgerMenu>
                  </div>

                </div>
              </div>
              <div v-if="admin && editMode && !isSideBarOpen && sectionsChanged" class="sections-p-3 sections-text-center mainmsg sections-pt-3">
                {{ $t('changesPublished') }}
              </div>
            </div>

            <!-- ------------------------------------------------------------------------------------------- -->

            <!-- This is the 'add' section types popup that has a list of all section types added to the project and clicking on one of them opens the form of it to create and add it to the page -->
            <div v-if="isModalOpen && admin && editMode" ref="modal"
                 class="sections-fixed section-modal-content sections-z-200 bg-grey sections-bg-opacity-25 sections-inset-0 modalContainer prime"
                 aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div
                class="flexSections sections-items-center sections-justify-center sections-px-4 sections-pb-20 sections-text-center inner-modal-conatiner">
                <div class="section-modal-content sections-bg-white relativeSections sections-shadow rounded-xl">
                  <div class="flexSections sections-flex-row relativeSections sections-justify-center">
                    <div v-if="!currentSection && isCreateInstance === false"
                         class="flexSections sections-flex-col sections-my-3 sections-gap-4">
                      <div class="flexSections sections-items-center sections-flex-row sections-gap-4 section-types-filter">
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
                    <div v-else-if="!currentSection && isCreateInstance === true" class="flexSections sections-flex-row sections-my-3 sections-pb-6 sections-justify-center">
                      <div class="sections-text-center h2 sections-cursor-pointer selectSectionType">
                        {{ $t("selectSectionType") }}
                      </div>
                    </div>
                    <div class="closeIcon" @click="isModalOpen = false; isCreateInstance = false">
                      <LazyBaseIconsClose/>
                    </div>
                  </div>
                  <div
                    class="step-back"
                    v-if="currentSection"
                    @click="currentSection = null"
                  >
                    <LazyBaseIconsBack/>
                  </div>

                  <div v-if="!currentSection && (typesTab === 'types' || typesTab === 'inventoryTypes') && isCreateInstance !== true && filteredGlobalTypes.filter(gt => gt.id !== undefined)?.length > 0" class="flexSections sections-flex-row my-global-content" @click="showMyGlobal = !showMyGlobal">
                    <span>{{ $t('myGlobal') }}</span>
                    <span class="sections-pl-2">{{ showMyGlobal ? 'v' : '>' }}</span>
                  </div>

                  <div
                    v-if="!currentSection && (typesTab === 'types' || typesTab === 'inventoryTypes') && isCreateInstance !== true"
                    ref="intro-available-sections" class="intro-available-sections sections-m-1 sections-p-1 type-items content-wrapper">

                    <div
                      v-for="(type, index) in  [...showMyGlobal ? filteredGlobalTypes.filter(gt => gt.id !== undefined) : [], ...filteredTypes.filter(type => type.notCreated !== true && type.app_status !== 'disbaled' && type.app_status !== 'disabled'), ...filteredTypes.filter(type => type.notCreated === true || type.app_status === 'disbaled' || type.app_status === 'disabled')]"
                      :key="type.name"
                      class="section-item section-item-box"
                      :class="[type.id === 'addition-empty' ? 'addition-empty' : '', showMyGlobal && index < filteredGlobalTypes.filter(gt => gt.id !== undefined).length ? 'global' : '']"
                    >
                      <div
                        v-if="type.type === 'local' || componentsSetupData(type.section?.name || type.name, type.type ? type.type : 'static').settings || componentsSetupData(type.section?.name || type.name, type.type).render_data"
                        :title="formatTexts(formatName(type.name), ' ')" class="text-capitalize section-item-title">
                        {{ formatTexts(formatName(type.name), " ") }}
                      </div>
                      <div v-if="(type.access === 'private' && type.notCreated !== true) || (type.notCreated !== true && type.section)" class="section-delete">
                        <div class="section-delete-icon" @click="openDeleteSectionTypeModal(type.name, index, showMyGlobal && index < filteredGlobalTypes.filter(gt => gt.id !== undefined).length)">
                          <LazyBaseIconsTrash class="trash-icon-style"/>
                        </div>
                      </div>
                      <div v-else-if="type.query_string_keys && type.query_string_keys.length > 0" class="section-info">
                        <LazyTooltipClickableTooltip :content="`query_string(s): ${type.query_string_keys.join(', ')}`" position="top">
                          <div class="section-info-icon">
                            <LazyBaseIconsInfo :title="`query_string(s): ${type.query_string_keys.join(', ')}`"
                                               class="info-icon-style" />
                          </div>
                        </LazyTooltipClickableTooltip>
                      </div>
                      <div v-else class="section-top-separator"></div>
                      <div
                        class="section-item active"
                        @click="showMyGlobal && index < filteredGlobalTypes.filter(gt => gt.id !== undefined).length ? type.notCreated === true ? openCurrentSection(type, true) : type.type === 'local' || type.type === 'dynamic' || type.type === 'configurable' ? openCurrentSection(type, true) : addSectionType({...type.section, id: 'id-' + Date.now(), weight: 'null', type: type.type, instance_name: type.name, fields: type.fields, query_string_keys: type.query_string_keys, dynamic_options: type.dynamic_options, render_data: type.section && type.section.options && type.section.options[0] ? [{settings: type.section.options[0]}] : undefined}, null, true) : type.notCreated !== true ? openCurrentSection(type) : openCurrentSection(type, false, true) ">
                        <LazyBaseSubTypesSectionItem
                          v-if="type.name"
                          :title="formatName(type.name)"
                          :component-item="getComponent(type.section?.name || type.name, type.type ? type.type : 'static')"
                          :section="componentsSetupData(type.section?.name || type.name, type.type ? type.type : 'static')"
                          :active="true"
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
                            <LazyBaseIconsLocked class="trash-icon-style sections-p-1"/>
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
                            <LazyBaseIconsUnlocked class="trash-icon-style sections-p-1"/>
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
              (currentSection = null), (isModalOpen = true), (savedView = {}), (isCreateInstance = true), (isSideBarOpen = false), (canPromote = false), (sectionsFilterName = ''), (sectionsFilterAppName = '')
            "
                      >
                        <div class="btn-icon plus-icon">
                          <LazyBaseIconsPlus/>
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
                        v-if="type.type === 'local' || componentsSetupData(type && type.section ? type.section.name : type.name, type.type).settings || componentsSetupData(type && type.section ? type.section.name : type.name, type.type).render_data"
                        :title="formatTexts(formatName(type.name), ' ')" class="text-capitalize section-item-title">
                        {{ formatTexts(formatName(type.name), " ") }}
                      </div>
                      <div v-if="type.notCreated !== true" class="section-delete">
                        <div class="section-delete-icon" @click="openDeleteSectionTypeModal(type.name, index)">
                          <LazyBaseIconsTrash class="trash-icon-style"/>
                        </div>
                      </div>
                      <div v-if="type.query_string_keys && type.query_string_keys.length > 0" class="global-section-info">
                        <LazyTooltipClickableTooltip :content="`query_string(s): ${type.query_string_keys.join(', ')}`" position="top">
                          <div class="global-section-info-icon">
                            <LazyBaseIconsInfo :title="`query_string(s): ${type.query_string_keys.join(', ')}`"
                                               class="info-icon-style"/>
                          </div>
                        </LazyTooltipClickableTooltip>
                      </div>
                      <div v-else-if="isCreateInstance === true" class="section-top-separator"></div>
                      <div class="section-item" :class="{active: type.notCreated !== true || isCreateInstance === true}"
                           @click="type.notCreated === true ? openCurrentSection(type, true) : type.type === 'local' || type.type === 'dynamic' || type.type === 'configurable' ? openCurrentSection(type, true) : addSectionType({...type.section, id: 'id-' + Date.now(), weight: 'null', type: type.type, instance_name: type.name, fields: type.fields, query_string_keys: type.query_string_keys, dynamic_options: type.dynamic_options, render_data: type.section && type.section.options && type.section.options[0] ? [{settings: type.section.options[0]}] : undefined}, null, true)">
                        <LazyBaseSubTypesSectionItem
                          v-if="type.name"
                          :title="formatName(type.name)"
                          :component-item="getComponent(type && type.section ? type.section.name : type.name, type.type)"
                          :section="componentsSetupData(type && type.section ? type.section.name : type.name, type.type)"
                          :active="true"
                        />
                      </div>
                      <div v-if="type.type !== 'configurable' && type.type !== 'dynamic' && type.type !== 'local'"
                           class="flexSections sections-pl-2 sections-pb-1" style="font-size: 10px;">
                        {{ $t('by') + type.application }}
                      </div>
                    </div>
                  </div>
                  <div v-else :ref="currentSection.name === 'SimpleCTA' ? 'intro-simple-CTA-section-form' : undefined" :class="currentSection.name === 'SimpleCTA' ? 'intro-simple-CTA-section-form' : ''" class="flexSections component-view-wrapper">
                    <div class="component-view">
                      <!-- we can use this short hand too -->
                      <!-- <component :is="currentSection.type" :props="currentSection"  /> -->
                      <LazyBaseTypesStatic
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
                      <LazyBaseTypesDynamic
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
                      <LazyBaseTypesConfigurable
                        v-if="currentSection.type === 'configurable'"
                        ref="sectionsConfigurableType"
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
                        @loadReference="sectionsConfigurableTypeReference.value = sectionsConfigurableType"
                        @load="(value) => loading = value"
                        @promote-section="currentSection = {...currentSection, instance: true}"
                      />
                      <LazyBaseTypesLocal
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
                 class="sections-fixed sections-z-200 sections-overflow-hidden bg-grey sections-bg-opacity-25 sections-inset-0 sections-p-8 sections-overflow-y-auto modalContainer"
                 aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div
                class="flexSections fullHeightSections sections-items-center sections-justify-center sections-pt-4 sections-px-4 sections-pb-20 sections-text-center">
                <div
                  class="section-modal-content sections-bg-white relativeSections sections-shadow rounded-xl sections-overflow-scroll">
                  <div class="sections-text-center h4 sections-my-3  sections-pb-3">
                    {{
                      showMyGlobal && deletingGlobalInstance ? $t("delete-global-section-type") + selectedSectionTypeName : $t("delete-section-type") + selectedSectionTypeName
                    }}
                  </div>
                  <div class="flexSections sections-flex-row">
                    <button
                      class="hp-button"
                      @click="showMyGlobal && deletingGlobalInstance ? deleteGlobalSectionType(selectedSectionTypeName, selectedSectionTypeIndex) : deleteSectionType(selectedSectionTypeName, selectedSectionTypeIndex)"
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
                 class="sections-fixed sections-z-200 sections-overflow-hidden bg-grey sections-bg-opacity-25 sections-inset-0 sections-p-8 sections-overflow-y-auto modalContainer"
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
                      @click="restoreSectionContent(metadataModal, sectionsThemeModal)"
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
                 class="sections-fixed sections-z-200 sections-overflow-hidden bg-grey sections-bg-opacity-25 sections-inset-0 sections-p-8 sections-overflow-y-auto modalContainer"
                 aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div
                class="flexSections fullHeightSections sections-items-center sections-justify-center sections-pt-4 sections-px-4 sections-pb-20 sections-text-center">
                <div
                  class="section-modal-content sections-bg-white relativeSections sections-shadow rounded-xl sections-overflow-scroll">
                  <div class="flexSections sections-flex-row sections-justify-center sections-items-center">
                    <LazyBaseIconsAlert/>
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
                 class="fixed sections-z-200 overflow-hidden bg-grey bg-opacity-25 inset-0 p-8 overflow-y-auto modalContainer"
                 aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div
                class="flexSections fullHeightSections items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="section-modal-content bg-white relativeSections shadow rounded-xl overflow-scroll">
                  <div class="flexSections flex-row justify-center items-center">
                    <LazyBaseIconsAlert/>
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
                    <LazyBaseIconsAlert/>
                    <div class="closeIcon" @click="isErrorsFormatModalOpen = false">
                      <LazyBaseIconsClose/>
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
                 class="sections-fixed sections-z-200 sections-overflow-hidden bg-grey sections-bg-opacity-25 sections-inset-0 sections-p-8 sections-overflow-y-auto modalContainer"
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
                 class="sections-fixed sections-z-200 sections-overflow-hidden bg-grey sections-bg-opacity-25 sections-inset-0 sections-p-8 sections-overflow-y-auto modalContainer"
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


            <!-- This is the popup that opens when clicking on the plus icon located near the my pages button -->
            <div v-if="isCreatePageModalOpen && admin && editMode"
                 class="sections-fixed sections-z-200 sections-overflow-hidden bg-grey sections-bg-opacity-25 sections-inset-0 sections-p-8 sections-overflow-y-auto modalContainer createPageContainer"
                 aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div
                class="flexSections fullHeightSections sections-items-center sections-justify-center sections-pt-4 sections-px-4 sections-pb-20 sections-text-center">
                <div
                  class="sections-bg-white relativeSections sections-shadow rounded-xl sections-p-4">

                  <div class="closeIcon regular" @click="isCreatePageModalOpen = false">
                    <LazyBaseIconsClose/>
                  </div>
                  <div class="sections-text-center sections-popup-title sections-pb-3">
                    {{ $t("Create New Page") }}
                  </div>
                  <div class="flexSections sections-flex-col">

                    <div class="fieldsDescription">
                      {{ $t("namePathFieldDesc") }}
                    </div>

                    <div class="sectionsFieldsLabels">
                      {{ $t("pageName") }}
                    </div>
                    <input
                      class="sections-py-4 sections-pl-6 sections-border rounded-xl sections-border-FieldGray sections-h-48px sections-w-full focus:outline-none"
                      type="text"
                      v-model="createPageName"
                    />
                    <span class="pagePathRequiredStyle"
                          v-show="createPageNameError !== ''">{{ createPageNameError }}</span>
                    <div class="sectionsFieldsLabels sections-pt-3">
                      {{ $t("pageUrl") }}
                    </div>
                    <input
                      class="sections-py-4 sections-pl-6 sections-border rounded-xl sections-border-FieldGray sections-h-48px sections-w-full focus:outline-none"
                      type="text"
                      v-model="createPagePath"
                    />
                    <span class="pagePathRequiredStyle"
                          v-show="createPagePathError !== ''">{{ createPagePathError }}</span>

                    <div class="flexSections sections-flex-row sections-justify-end">
                      <button class="hp-button" @click="createNewPage(null, null, null, true)">
                        <div class="btn-text">
                          {{ $t("create") }}
                        </div>
                      </button>
                      <button class="hp-button" @click="isCreatePageModalOpen = false">
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
                  <LazyBaseIconsError class="error-icon"/>
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
                v-model="alteredViews"
                group="people"
                @start="drag = true"
                @end="drag = false"
                handle=".handle"
                item-key="id"
              >
                <!-- <transition-group> -->
                <template #item="{ element: view, index }">
                  <section
                    :key="index"
                    :section-id="view.id"
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
                          <LazyBaseIconsAlert/>
                        </div>
                        <div
                          @click="toggleSectionsOptions(view.id); edit(currentViews.find(vw => vw.id === view.id), view.linked_to !== '' && view.linked_to !== undefined ? `#${view.linked_to}-${view.id}` : `#${view.name}-${view.id}`)"
                          v-if="editable(view.type) || (view.linked_to !== '' && view.linked_to !== undefined)">
                          <LazyBaseIconsEdit :color="(view.linked_to !== '' && view.linked_to !== undefined) ? '#FF0000' : undefined"
                                             class="edit-icon"/>
                        </div>
                        <LazyBaseIconsDrag class="drag-icon handle"/>
                        <div
                          @click="isDeleteSectionModalOpen = true; deletedSectionId = view.id; deletedSectionName = view.name;">
                          <LazyBaseIconsTrash class="trash-icon"/>
                        </div>
                        <div
                          @click="copyAnchor((view.linked_to !== '' && view.linked_to !== undefined) ? `#${view.linked_to}-${view.id}` : `#${view.name}-${view.id}`, $event)">
                          <LazyBaseIconsAnchor
                            :title="(view.linked_to !== '' && view.linked_to !== undefined) ? `Anchor id: #${view.linked_to}-${view.id}, ${$t('clickToCopy')}` : `Anchor id: #${view.name}-${view.id}, ${$t('clickToCopy')}`"
                            class="edit-icon"/>
                        </div>
                        <div
                          v-if="seoSectionsSupport[view.name]"
                          @click="seoBtnClicked(view.id)">
                          <div :title="pageMetadata.seo && pageMetadata.seo[view.id] === true ? $t('seoDisable') : $t('seoEnable')" class="seo-btn" :class="{'enabled': pageMetadata.seo && pageMetadata.seo[view.id] === true}">SEO</div>
                        </div>
                        <div
                          v-if="sectionsThemeComponents[view.name] && !view.id.startsWith('id-')"
                          @click="toggleSectionsOptions(view.id); openSectionThemeModal(currentViews.find(vw => vw.id === view.id), sectionsThemeComponents[view.name])">
                          <LazyBaseIconsPaintBursh />
                        </div>
                      </div>
                      <div v-if="admin && editMode && view.altered !== true && !isSideBarOpen" :title="(view.linked_to !== '' && view.linked_to !== undefined) ? `${view.linked_to} (${view.id})` : `${view.name} (${view.id})`" @click="toggleSectionsOptions(view.id)"
                           class="controls optionsSettings sections-flex-row sections-justify-center sections-p-1 rounded-xl sections-top-0 sections-right-2 sections-absolute settings-icon-wrapper sections-cursor-pointer" :class="{'flexSections': !isSideBarOpen}">
                        <LazyBaseIconsSettings :color="'currentColor'" class="settings-icon"/>
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
                          :is="getComponent(view.name, view.type, view)"
                          :section="view"
                          :lang="lang"
                          :locales="locales"
                          :default-lang="defaultLang"
                          @seo-support="seoSectionsSupport[view.name] = true;"
                          @refresh-section="(data) => refreshSectionView(view, data)"
                        />
                      </div>
                    </div>
                  </section>
                </template>
                <!-- </transition-group> -->
              </draggable>
            </div>
            <div v-else>
              <component :is="getSelectedLayout()" :lang="lang" :locales="locales" :default-lang="defaultLang">
                <template v-for="(slotName, slotIdx) in layoutSlotNames" v-slot:[slotName]>
                  <!-- Empty div injected to verify the slots              -->
                  <div class="flexSections flex-col">
                    <div :id="`sections-slot-region-${selectedLayout}-${slotName}`"></div>
                    <div v-if="admin && editMode && !isSideBarOpen"
                         :ref="selectedLayout !== 'standard' && slotIdx === 0 ? 'intro-add-new-section' : ''" :class="selectedLayout !== 'standard' && slotIdx === 0 ? 'intro-add-new-section' : ''"
                         class="bg-light-grey-hp p-3 flexSections flex-row justify-center part3 hide-mobile">
                      <button
                        class="hp-button"
                        @click.stop.prevent="
              (currentSection = null), (isModalOpen = true), (savedView = {}), (selectedSlotRegion = slotName), (runIntro('addNewSectionModal', introRerun.value)), (checkIntroLastStep('addNewSectionModal'))
            "
                      >
                        <div class="btn-icon plus-icon">
                          <LazyBaseIconsPlus/>
                        </div>
                        <div class="btn-text">{{ $t("Add") }}</div>
                      </button>
                      <div class="slot-name">
                        {{ $t(slotName.toUpperCase()) }}
                      </div>
                    </div>
                    <div class="views">
                      <draggable
                        v-model="alteredViewsPerRegions[slotName]"
                        group="people"
                        @start="drag = true; highlightRegions = true;"
                        @end="drag = false; highlightRegions = false;"
                        @change="(evt) => logDrag(evt, slotName)"
                        handle=".handle"
                        item-key="id"
                        :class="{ 'highlighted-regions-plus': alteredViewsPerRegions[slotName].length === 0 && highlightRegions, }"
                      >
                        <!-- <transition-group> -->
                        <template #item="{ element: view, index }">
                          <section
                            v-if="view.region[selectedLayout].slot === slotName"
                            :key="index"
                            :section-id="view.id"
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
                                  <LazyBaseIconsAlert/>
                                </div>
                                <div
                                  @click="toggleSectionsOptions(view.id); edit(viewsPerRegions[view.region[selectedLayout].slot].find(vw => vw.id === view.id), view.linked_to !== '' && view.linked_to !== undefined ? `#${view.linked_to}-${view.id}` : `#${view.name}-${view.id}`); selectedSlotRegion = slotName"
                                  v-if="editable(view.type) || (view.linked_to !== '' && view.linked_to !== undefined)">
                                  <LazyBaseIconsEdit
                                    :color="(view.linked_to !== '' && view.linked_to !== undefined) ? '#FF0000' : undefined"
                                    class="edit-icon"/>
                                </div>
                                <LazyBaseIconsDrag class="drag-icon handle"/>
                                <div
                                  @click="isDeleteSectionModalOpen = true; deletedSectionId = view.id; deletedSectionName = view.name;">
                                  <LazyBaseIconsTrash class="trash-icon"/>
                                </div>
                                <div
                                  @click="copyAnchor((view.linked_to !== '' && view.linked_to !== undefined) ? `#${view.linked_to}-${view.id}` : `#${view.name}-${view.id}`, $event)">
                                  <LazyBaseIconsAnchor
                                    :title="(view.linked_to !== '' && view.linked_to !== undefined) ? `Anchor id: #${view.linked_to}-${view.id}, ${$t('clickToCopy')}` : `Anchor id: #${view.name}-${view.id}, ${$t('clickToCopy')}`"
                                    class="edit-icon"/>
                                </div>
                                <div
                                  v-if="seoSectionsSupport[view.name]"
                                  @click="seoBtnClicked(view.id)">
                                  <div :title="pageMetadata.seo && pageMetadata.seo[view.id] === true ? $t('seoDisable') : $t('seoEnable')" class="seo-btn" :class="{'enabled': pageMetadata.seo && pageMetadata.seo[view.id] === true}">SEO</div>
                                </div>
                                <div
                                  v-if="sectionsThemeComponents[view.name] && !view.id.startsWith('id-')"
                                  @click="toggleSectionsOptions(view.id); openSectionThemeModal(viewsPerRegions[view.region[selectedLayout].slot].find(vw => vw.id === view.id), sectionsThemeComponents[view.name])">
                                  <LazyBaseIconsPaintBursh />
                                </div>
                              </div>
                              <div v-if="admin && editMode && view.altered !== true && !isSideBarOpen" :title="(view.linked_to !== '' && view.linked_to !== undefined) ? `${view.linked_to} (${view.id})` : `${view.name} (${view.id})`" @click="toggleSectionsOptions(view.id)"
                                   class="controls optionsSettings sections-flex-row sections-justify-center sections-p-1 rounded-xl sections-top-0 sections-right-2 sections-absolute settings-icon-wrapper sections-cursor-pointer" :class="{'flexSections': !isSideBarOpen}">
                                <LazyBaseIconsSettings :color="'currentColor'" class="settings-icon"/>
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
                                  :is="getComponent(view.name, view.type, view)"
                                  :section="view"
                                  :lang="lang"
                                  :locales="locales"
                                  :default-lang="defaultLang"
                                  @seo-support="seoSectionsSupport[view.name] = true;"
                                  @refresh-section="(data) => refreshSectionView(view, data)"
                                />
                              </div>
                            </div>
                          </section>
                        </template>
                        <!-- </transition-group> -->
                      </draggable>
                    </div>
                    <section v-if="creationView === true && admin && editMode && selectedLayout !== 'standard' && selectedSlotRegion === slotName" :id="`${currentSection.name}-${currentSection.id}`" :section-id="currentSection.id" :class="`creation-view-${selectedLayout}-${slotName}`">
                      <component :is="getCreationComponent" :section="createdView" :lang="lang" :locales="locales" :default-lang="defaultLang" ref="creationComponent" />
                    </section>
                  </div>
                </template>
              </component>
            </div>

            <section v-if="creationView === true && admin && editMode && selectedLayout === 'standard'" :id="`${currentSection.name}-${currentSection.id}`" :section-id="currentSection.id" class="creation-view-standard">
              <component :is="getCreationComponent" :section="createdView" :lang="lang" :locales="locales" :default-lang="defaultLang" ref="creationComponent" />
            </section>

            <!-- ------------------------------------------------------------------------------------------- -->

            <!-- This is the popup to create a new static section type     -->
            <div v-if="staticModal && admin && editMode" :modal-class="'section-modal-main-wrapper'" ref="modal"
                 class="sections-fixed sections-z-200 sections-overflow-hidden bg-grey sections-bg-opacity-25 sections-inset-0 sections-p-8 sections-overflow-y-auto modalContainer"
                 aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div
                class="flexSections fullHeightSections sections-items-center sections-justify-center sections-pt-4 sections-px-4 sections-pb-20 sections-text-center">
                <div
                  class="section-modal-content sections-bg-white relativeSections sections-shadow rounded-xl sections-overflow-scroll">
                  <div class="section-modal-wrapper">
                    <div class="sections-text-center h4 sectionTypeHeader">
                      <div class="title">{{ $t("section-title") }}:</div>
                      <div class="closeIcon" @click="staticModal = false">
                        <LazyBaseIconsClose/>
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

            <!-- This is popup to show the successfully created new static section message      -->
            <div v-if="staticSuccess && admin && editMode" :modal-class="'section-modal-main-wrapper'" ref="modal"
                 class="sections-fixed sections-z-200 sections-overflow-hidden bg-grey sections-bg-opacity-25 sections-inset-0 sections-p-8 sections-overflow-y-auto modalContainer"
                 aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div
                class="flexSections fullHeightSections sections-items-center sections-justify-center sections-pt-4 sections-px-4 sections-pb-20 sections-text-center">
                <div
                  class="section-modal-content sections-bg-white relativeSections sections-shadow rounded-xl sections-overflow-scroll">
                  <div class="section-modal-wrapper success-section-type">
                    <div class="sections-text-center h4 header">
                      <div class="icon-head">
                        <LazyBaseIconsCelebrate/>
                      </div>
                      <div class="title">
                        {{
                          typesTab === 'types' || typesTab === 'inventoryTypes' ? $t("success-section-title") : $t("success-global-section-title")
                        }}
                      </div>
                      <div class="closeIcon" @click="staticSuccess = false">
                        <LazyBaseIconsClose/>
                      </div>
                    </div>
                    <div v-if="typesTab === 'types' || typesTab === 'inventoryTypes'"
                         class="flexSections sections-w-full sections-justify-center">
                    </div>
                    <div class="footer">
                      <button class="hp-button" @click="staticSuccess = false;">
                        <div class="btn-icon check-icon"></div>
                        <div class="btn-text">{{ $t("Done") }}</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ------------------------------------------------------------------------------------------- -->

            <LazyBaseIconsLoading :loading="loading"/>
          </div>
          <div v-else>
            <!-- This is to show the create a new page button when the page requested is not found     -->
            <button ref="intro-create-page" v-if="admin && errorResponseStatus !== 401" class="intro-create-page hp-button btn-text" @click="createNewPage">
              {{ $t("Create New Page") }}
            </button>
            <div
              v-if="(errorResponseStatus === 404 || errorResponseStatus === 401) && (errorRegisteredPage === 'page_not_found' || errorRegisteredPage === 'project_not_found')">
              <component :is="registeredPage(errorResponseStatus === 404 ? 'page_not_found' : 'project_not_found')"
                         :error-response="errorResponseData" :error-response-status="errorResponseStatus"/>
            </div>
            <div v-else-if="errorResponseStatus !== 0" class="flexSections not-found-error">
              <div class="flexSections not-found-error-column">
                <LazyBaseIconsError class="error-icon"/>
                <div v-for="(error, index) in sectionsMainErrors" :key="index" class="mainmsg not-found-error-column">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import {useSectionsDataStore} from "../../stores/sectionsDataStore.js";
import {
  computed,
  dummyDataPresets,
  formatName,
  formatTexts,
  getSectionProjectIdentity,
  importComp,
  importJs,
  navigateTo,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onBeforeMount,
  onServerPrefetch,
  parsePath,
  parseQS,
  populateWithDummyValues,
  reactive,
  ref,
  provide,
  useScript,
  sectionHeader,
  showToast,
  useApiRequest,
  useCookie,
  useHead,
  useI18n,
  useLocalePath,
  useNuxtApp,
  useRoute,
  useRouter,
  useRuntimeConfig,
  useState,
  validateQS,
  watch
} from '#imports';
import { createMedia, getUser, requestVerification } from "../../utils/SectionsCMSBridge/functions.js"
import {camelCase, upperFirst, isEqual} from 'lodash-es';
import {getMySectionsPages} from "../../utils/helpers.js";

const {
  pageName,
  admin,
  variations,
  headers,
  reactiveTrigger,
  lang,
  editorOptions,
  viewsBgColor,
  _sectionsOptions,
  sectionsPageData,
  serverPageData
} = defineProps({
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
  },
  serverPageData: {
    type: Object
  }
});
const emit = defineEmits(['load', 'user-logged-out']);
const store = useSectionsDataStore()
const nuxtApp = useNuxtApp();
const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const localePath = useLocalePath()
const config = useRuntimeConfig();

// Data properties converted to refs
const locales = ref(['en', 'fr']);
const translationComponentSupport = ref(true);
const staticSuccess = ref(false);
const sectionTypeName = ref("");
const staticModal = ref(false);
const metadataModal = ref(false);
const sectionInPage = ref([]);
const pageNotFound = useState('pageNotFound', () => false);
const dismissCountDown = ref(0);
const editMode = useState('editMode', () => false);
const selectedVariation = ref(pageName);
const typesTab = ref('types');
const globalTypes = useState('globalTypes', () => ([]));
const types = useState('types', () => ([]));
const sectionsQsKeys = useState('sectionsQsKeys', () => ([]));
const originalVariations = ref({});
const updatedVariations = ref({});
// current visible views
const views = ref({});
const getSections = ref([]);
const loading = useState('loading', () => false);
const currentSection = ref(null);
const isCreateInstance = ref(false);
const isModalOpen = ref(false);
const isSideBarOpen = ref(false);
const sectionsChanged = ref(false);
const backToAddSectionList = ref(false);
const isDeleteModalOpen = ref(false);
const deletingGlobalInstance = ref(false);
const isRestoreSectionOpen = ref(false);
const restoreType = ref('section');
const isDeletePageModalOpen = ref(false);
const isDeleteSectionModalOpen = ref(false);
const deletedSectionId = ref(null);
const deletedSectionName = ref(null);
const isErrorsFormatModalOpen = ref(false);
const isAuthModalOpen = ref(false);
const isUnAuthModalOpen = ref(false);
const isCreatePageModalOpen = ref(false);
const showMyGlobal = ref(false);
const synched = ref(false);
const createdView = ref({});
const savedView = ref({});
const myPages = useState('myPages', () => ([]));
const createPageName = ref("")
const createPagePath = ref("")
const createPageNameError = ref("")
const createPagePathError = ref("")

const menuManager = { current: ref(null) }
provide("menuManager", menuManager)

const sectionsMediaComponent = ref(null)
const jsonFilePick = ref(null)
const resizeTarget = ref(null)
const sectionsMainTarget = ref(null)
const componentsSetup = ref({});
const currentSettingsTab = ref("page_settings");
const settingsTabs = ref([
  "page_settings"
])

const updatedPageSettingsTabs = computed(()=> {
  let builderSettingsTabs
  try {
    const builderSettingsFiles = import.meta.glob('/sections/builder/settings/*.vue')
    builderSettingsTabs = Object.keys(builderSettingsFiles).map((filename) => {
      return filename.replace(/^.*\/(.+)\.vue$/, '$1')
    })
  } catch {}
  if (admin && editMode.value && builderSettingsTabs && builderSettingsTabs.length > 0) {
    return [
      ...settingsTabs.value,
      ...builderSettingsTabs
    ]
  } else {
    return [
      ...settingsTabs.value,
    ]
  }
});
const unsavedSettingsError = ref({})


// Display variations object
const displayVariations = useState('displayVariations', () => ({
  [pageName]: {
    name: pageName,
    views: {},
    altered: false,
  },
}));

const pageHasNoChanges = computed(() => {
  if (displayVariations.value[selectedVariation.value]?.views && originalVariations.value[selectedVariation.value]?.views) {
    return isEqual(Object.values(displayVariations.value[selectedVariation.value].views).map(view => {
      return {
        ...view,
        fields: undefined,
        multiple: undefined,
        instance: undefined,
        region: view.region || undefined
      }
    }), Object.values(originalVariations.value[selectedVariation.value].views).map(view => {
      return {
        ...view,
        fields: undefined,
        multiple: undefined,
        instance: undefined,
        region: view.region || undefined
      }
    })) && selectedLayout.value === sectionsLayout.value
  } else return true
})

const selectedSectionTypeName = ref("");
const selectedAppName = ref("");
const selectedSectionTypeIndex = ref("");
const selectedSectionTypeAppId = ref("");
const selectedSectionRequirements = ref([]);
const sectionsPageLastUpdated = useState('sectionsPageLastUpdated', () => null);
const requirementsInputs = ref({});
const allSections = useState('allSections', () => ([]));
const pageId = ref("");
const pagePath = useState('pagePath', () => "");
const sectionsPageName = ref("");
const pageMetadata = useState('pageMetadata', () => ({}));
const projectMetadata = ref({});
const builderSettingsPayload = ref({});
let metadataErrors = ref({
  path: [""]
});
const sectionsError = useState('sectionsError', () => "");
const sectionsErrorOptions = ref(null);
const renderSectionError = useState("renderSectionError", () => "");
const fieldsInputs = ref([
  {
    type: "image",
    name: ""
  }
]);
const metadataFormLang = ref('');
const computedSEO = useState("computedSEO", () => ({
  title: '',
  description: '',
  image: ''
}));
const sectionsUserId = useState('sectionsUserId',() => '');
const displayedErrorFormat = ref('');
const invalidSectionsErrors = ref({});
const sectionsFormatErrors = ref({});
const layoutSlotNames = ref([]);
const availableLayouts = ref(['standard']);
const selectedLayout = useState('selectedLayout', () => 'standard');
const originalMetaData = useState('originalMetaData', () => {});
const originalBuilderSettings = useState('originalBuilderSettings', () => {});
const updatedBuilderSettingsPerTab = ref({})
const updatedBuilderSettings = ref({})
const viewsPerRegions = ref({});
const sectionsLayout = ref('standard');
const selectedSlotRegion = ref('');
const layoutMode = ref(false);
const errorInLayout = ref(false);
const errorInViews = ref(false);
const highlightRegions = ref(false);
const sectionsMainErrors = useState('sectionsMainErrors', () => ([]));
const sectionsLayoutErrors = ref([]);
const availableSectionsForms = ref([]);
const sectionsConfigurableType = ref(null);
const sectionsConfigurableTypeReference = ref({});
const supportedLanguages = ref([
  {id: 'fr', label: 'French (fr)', selected: false},
  {id: 'en', label: 'English (en)', selected: false}
]);
const selectedLanguages = ref([]);
const defaultLang = useState('defaultLang', () => 'en');
const selectedMediaType = ref('media');
const resizeData = ref({
  tracking: false,
  startWidth: null,
  startCursorScreenX: null,
  handleWidth: 10,
  resizeTarget: null,
  parentElement: null,
  maxWidth: null,
});
const errorResponseStatus = useState('errorResponseStatus', () => (0));
const errorRegisteredPage = useState('errorRegisteredPage', () => (''));
const errorResponseData = useState('errorResponseData', () => null);
const sectionOptions = ref({});
const sectionsFilterName = ref('');
const sectionsFilterAppName = ref('');
const appNames = ref([]);
const sectionsWebsiteDomain = ref('');
const pageData = useState('pageData', () => null);
const canPromote = ref(false);
const intro = ref(null);
const currentPages = useState('currentPages', () => null);
const introRerun = reactive({value: false});
const introSectionFormStep = ref(false);
const creationView = ref(false);
const drag = ref(false);
const fetchedOnServer = useState('fetchedOnServer', () => false);
const pathMatch = Array.isArray(route.params.pathMatch)
  ? route.params.pathMatch.join('/')
  : route.params.pathMatch || ''

const seoSectionsSupport = ref({})

const sectionsQueryStringLanguageSupport = ref([])

const unsavedThemeSettingsError = ref({})

const originalThemeSettings = ref({})

const themeSettingsPayload = ref({})

const currentSectionData = ref({})

const sectionsThemeComponents = ref({})

const sectionsThemeModal = ref(false)

const dynamicSideComponent = ref(false)

const dynamicSideBarComponentPath = ref('')

const sectionsOptionsComponentPath = useState('sectionsOptionsComponentPath', () =>(''))

const currentThemeTab = ref({})

const guideConfig = useState('guideConfig', () => {
  const defaultConfig = {
    disabled: false,
    autoStart: true,
    override: false
  }
  try {
    const hooksJs = importJs('/js/global-hooks') // assuming this is sync
    if (hooksJs?.guide_config) {
      const config = hooksJs.guide_config()
      if (config && typeof config === 'object') {
        return {
          ...defaultConfig,
          ...config
        }
      } else return defaultConfig
    } else {
      return defaultConfig
    }
  } catch {
    return defaultConfig
  }
})

// Computed properties
const activeVariation = computed(() => {
  // If variation true return its page name
  const activeVar = variations.filter((variation) => variation.active);
  if (activeVar.length === 1) return activeVar[0];
  else if (activeVar.length > 1) {
    return activeVar[0];
  }
  // otherwise return the default pageName prop
  else return {name: "default", pageName: pageName};
});

const currentViews = computed({
  get() {
    let views = [];
    if (displayVariations.value[selectedVariation.value] && displayVariations.value[selectedVariation.value].views) {
      views = Object.values(
        displayVariations.value[selectedVariation.value].views
      );
      views = views.sort(function (a, b) {
        return a.weight - b.weight;
      });
    }

    return views.filter(view => view.altered !== true);
  },
  set(newValue) {
    for (let index = 0; index < newValue.length; index++) {
      const replacement = newValue[index];
      replacement.weight = index;
      // Using Vue.set equivalent in Vue 3
      displayVariations.value[selectedVariation.value].views[newValue[index].id] = replacement;
    }
  },
});

const alteredViews = computed({
  get: () => {
    let alteredSections = null;
    let hooksJs = importJs(`/js/global-hooks`);
    if (hooksJs && hooksJs['page_pre_render'] && pageData.value) {
      if (typeof hooksJs['page_pre_render'] === 'function') {
        alteredSections = hooksJs['page_pre_render'](
          JSON.parse(JSON.stringify(pageData.value)),
          JSON.parse(JSON.stringify(currentViews.value)),
          sectionsWebsiteDomain.value,
          nuxtApp.$sections,
          config
        );
      }
    }
    if (alteredSections) {
      fire_js("page_payload_preprocess", alteredSections);
      return alteredSections;
    } else {
      fire_js("page_payload_preprocess", currentViews.value);
      return currentViews.value;
    }
  },
  set: (newValue) => {
    currentViews.value = newValue
  }
});

const alteredViewsPerRegions = computed({
  get: () => {
    let alteredSections = null;
    let hooksJs = importJs(`/js/global-hooks`);
    if (hooksJs && hooksJs['page_pre_render'] && pageData.value && viewsPerRegions.value && Object.keys(viewsPerRegions.value).length > 0) {
      if (typeof hooksJs['page_pre_render'] === 'function') {
        alteredSections = hooksJs['page_pre_render'](
          JSON.parse(JSON.stringify(pageData.value)),
          JSON.parse(JSON.stringify(viewsPerRegions.value)),
          sectionsWebsiteDomain.value,
          nuxtApp.$sections,
          config
        );
      }
    }
    if (alteredSections) {
      fire_js("page_payload_preprocess", alteredSections);
      return alteredSections;
    } else {
      fire_js("page_payload_preprocess", viewsPerRegions.value);
      return viewsPerRegions.value;
    }
  },
  set: (newValue) => {
    viewsPerRegions.value = newValue
  }
});

const id = computed(() => {
  if (savedView.value.id) {
    return savedView.value.id;
  }
  return "id-" + Date.now();
});

const weight = computed(() => {
  if (savedView.value.weight) {
    return savedView.value.weight;
  }
  return null;
});

const filteredTypes = computed(() => {
  types.value.forEach((type) => {
    getComponentSetup(type && type.section ? type.section.name : type.name, type.type ? type.type : 'static')
  })
  return types.value.filter(item => {
    const nameMatch = sectionsFilterName.value
      ? item.name.toLowerCase().includes(sectionsFilterName.value.toLowerCase())
      : true;

    const appNameMatch = sectionsFilterAppName.value
      ? item.application && item.application.toLowerCase().includes(sectionsFilterAppName.value.toLowerCase())
      : true;

    return nameMatch && appNameMatch;
  });
});

const filteredGlobalTypes = computed(() => {
  // run setup
  globalTypes.value.forEach((type) => {
    getComponentSetup(
      type?.section ? type.section.name : type.name,
      type?.type ?? 'static'
    )
  })

  // filter logic
  const filtered = globalTypes.value.filter(item => {
    const nameMatch = sectionsFilterName.value
      ? item.name.toLowerCase().includes(sectionsFilterName.value.toLowerCase())
      : true;

    const appNameMatch = sectionsFilterAppName.value
      ? item.application?.toLowerCase().includes(sectionsFilterAppName.value.toLowerCase())
      : true;

    return nameMatch && appNameMatch;
  });

  // check if odd → push empty object
  if (filtered.filter(gt => gt.id !== undefined).length % 2 !== 0) {
    filtered.push({
      id: "addition-empty",
      name: "addition-empty",
      type: "static",
      application: "addition-empty",
      notCreated: true
    })
  }

  return filtered;
});

const getCreationComponent = computed(() => {
  try {
    const path = getComponentPath(currentSection.value.name, currentSection.value.type);
    return importComp(path).component;
  } catch {
    return '';
  }
});

// Head management
useHead(() => {
  const baseURL = process.server
    ? (nuxtApp.ssrContext.event.req.headers['x-forwarded-proto'] || 'http') + '://' + nuxtApp.ssrContext.event.req?.headers.host
    : window.location.origin;

  const fullURL = baseURL + route.fullPath;

  return {
    htmlAttrs: {
      lang: i18n.locale.value
    },
    title: computedSEO.value.title,
    meta: [
      computedSEO.value.description ? {
        hid: 'description',
        name: 'description',
        content: computedSEO.value.description
      } : {},
      { hid: "og:title", property: "og:title", content: computedSEO.value.title },
      computedSEO.value.description ? { hid: "og:description", property: "og:description", content: computedSEO.value.description } : {},
      computedSEO.value.image ? {
        hid: "og:image",
        property: "og:image",
        content: computedSEO.value.image.url ? computedSEO.value.image.url : computedSEO.value.image
      } : {},
      { hid: "og:url", property: "og:url", content: fullURL },
    ],
    link: [
      projectMetadata.value['selectedCSSPreset'] && projectMetadata.value['selectedCSSPreset'].name && projectMetadata.value['selectedCSSPreset'].name !== 'Other' && projectMetadata.value['selectedCSSPreset'].name !== 'None' ? {
        rel: 'stylesheet',
        href: projectMetadata.value['selectedCSSPreset'].url
      } : projectMetadata.value['selectedCSSPreset'] && projectMetadata.value['selectedCSSPreset'].name && projectMetadata.value['selectedCSSPreset'].name !== 'None' && projectMetadata.value['media'] && projectMetadata.value['media'].url ? {
        rel: 'stylesheet',
        href: projectMetadata.value['media'].url
      } : {},
      pageMetadata.value['media'] && pageMetadata.value['media'].url ? {
        id: 'page-selected-css',
        rel: 'stylesheet',
        href: pageMetadata.value['media'].url
      } : {},
      projectMetadata.value['favicon'] && projectMetadata.value['favicon'].url ? {
        rel: 'icon',
        type: 'image/png',
        href: projectMetadata.value['favicon'].url
      } : {},
    ]
  };
});

// Methods (now as regular functions)
const seoBtnClicked = (id) => {
  if (!pageMetadata.value.seo) {
    pageMetadata.value.seo = {}
  }
  if (pageMetadata.value.seo[id] === true) {
    delete pageMetadata.value.seo[id];
  } else {
    pageMetadata.value.seo[id] = true;
  }
  updatePageMetaData(true);
}
const initializeSectionsCMSEvents = () => {
  if (!window.SectionsCMS) {
    window.SectionsCMS = ref({})
    window.SectionsCMS.value.reRenderSection = (data) => refreshSectionView('SectionView', data)
  } else {
    if (admin) {
      window.SectionsCMS.value.openEditMode = openEditMode
      window.SectionsCMS.value.runIntro = (topic, rerun, lastSavedTopic) => runIntro(topic, rerun, lastSavedTopic)
      window.SectionsCMS.value.addNewStaticType = (name, payload) => addNewStaticType(name, payload, true)
      window.SectionsCMS.value.addNewGlobalType = (instance_name, payload) => addNewGlobalType(null, instance_name, payload, true)
      window.SectionsCMS.value.updateProjectMetadata = (payload) => updateProjectMetadata(payload, true)
      window.SectionsCMS.value.createNewPage = (page_name, payload) => createNewPage(page_name, payload, true)
      window.SectionsCMS.value.createMedia = (payload) => createMedia(payload, true)
      window.SectionsCMS.value.getUser = (payload) => getUser(payload, true)
      window.SectionsCMS.value.requestVerification = (payload) => requestVerification(payload, true)
    }
  }
}
const initializeSections = (res, skipHook) => {
  if (skipHook !== true) {
    nuxtApp.callHook('page_pre_render', res)
  }
  const sections = res.data.sections
  pageData.value = res.data
  allSections.value = res.data.sections
  pageId.value = res.data.id
  pagePath.value = res.data.path
  sectionsPageName.value = res.data.page
  sectionsLayout.value = res.data.layout
  selectedLayout.value = res.data.layout
  originalMetaData.value = res.data.metadata
  originalMetaData.value.pagePath = res.data.path

  if (res.data.metadata.project_metadata && res.data.metadata.project_metadata.languages) {
    projectMetadata.value.languages = res.data.metadata.project_metadata.languages
    selectedLanguages.value = res.data.metadata.project_metadata.languages
  }

  if (projectMetadata.value && projectMetadata.value['languages'] && projectMetadata.value['languages'].length > 0) {
    if (projectMetadata.value['languages'].length > 1) {
      translationComponentSupport.value = true;
    } else {
      translationComponentSupport.value = false;
    }
    locales.value = [];
    locales.value = [...projectMetadata.value['languages']];
  }

  for (const langKey of locales.value) {
    pageMetadata.value[langKey] = {
      title: '',
      description: ''
    }
    if (!pageMetadata.value[langKey]) {
      pageMetadata.value[langKey] = {
        title: '',
        description: ''
      }
    }
    if (res.data.metadata && res.data.metadata[langKey] && res.data.metadata[langKey].title) {
      pageMetadata.value[langKey].title = res.data.metadata[langKey].title
    }
    if (res.data.metadata && res.data.metadata[langKey] && res.data.metadata[langKey].description) {
      pageMetadata.value[langKey].description = res.data.metadata[langKey].description
    }
  }

  if (res.data.metadata.project_metadata && res.data.metadata.project_metadata.media) {
    projectMetadata.value.media = res.data.metadata.project_metadata.media
  }
  if (res.data.metadata.project_metadata && res.data.metadata.project_metadata.selectedCSSPreset) {
    projectMetadata.value.selectedCSSPreset = res.data.metadata.project_metadata.selectedCSSPreset
  }
  if (res.data.metadata.project_metadata && res.data.metadata.project_metadata.favicon) {
    projectMetadata.value.favicon = res.data.metadata.project_metadata.favicon
  }
  if (res.data.metadata.project_metadata && res.data.metadata.project_metadata.defaultLang) {
    projectMetadata.value.defaultLang = res.data.metadata.project_metadata.defaultLang
    defaultLang.value = res.data.metadata.project_metadata.defaultLang
  }
  if (res.data.metadata.project_metadata && res.data.metadata.project_metadata.activateCookieControl !== undefined && res.data.metadata.project_metadata.activateCookieControl !== null) {
    projectMetadata.value.activateCookieControl = res.data.metadata.project_metadata.activateCookieControl
  }
  if (res.data.metadata.project_metadata && res.data.metadata.project_metadata.gtmId !== undefined && res.data.metadata.project_metadata.gtmId !== null) {
    projectMetadata.value.gtmId = res.data.metadata.project_metadata.gtmId
  }
  if (res.data.metadata.media) {
    pageMetadata.value.media = res.data.metadata.media
  }
  if (res.data.metadata.seo) {
    pageMetadata.value.seo = res.data.metadata.seo
  }

  if (res.data.metadata && res.data.metadata.project_metadata) {
    originalBuilderSettings.value = {...res.data.metadata.project_metadata}
    try {
      const builderHooksJavascript = importJs(`/builder/settings/builder-hooks`);
      if (builderHooksJavascript['initialize_builder_settings']) {
        builderHooksJavascript['initialize_builder_settings'](originalBuilderSettings.value, useHead, currentSettingsTab.value);
      }
    } catch {}
  }

  if (res.data.metadata && res.data.metadata.sections_builder) {
    originalThemeSettings.value = {...res.data.metadata.sections_builder}
    try {
      const builderHooksJavascript = importJs(`/theme/theme-hooks`);
      if (builderHooksJavascript['initialize_theme_settings']) {
        builderHooksJavascript['initialize_theme_settings'](originalThemeSettings.value, useHead);
      }
    } catch {}
  }

  if (!computedSEO.value.title && pageMetadata.value[lang]) {
    computedSEO.value.title = pageMetadata.value[lang].title
  }
  if (!computedSEO.value.description && pageMetadata.value[lang]) {
    computedSEO.value.description = pageMetadata.value[lang].description
  }
  if (!computedSEO.value.image && res.data.metadata.mediaMetatag) {
    pageMetadata.value.mediaMetatag = res.data.metadata.mediaMetatag
    computedSEO.value.image = res.data.metadata.mediaMetatag
  }

  const views = {}
  sections.map((section) => {
    trackSectionComp(section.name, section.type)

    if (section.type === "configurable") {
      if (section.render_data && section.render_data[0] && section.render_data[0].settings && section.render_data[0].settings.image && !Array.isArray(section.render_data[0].settings.image)) {
        section.render_data[0].settings.image = []
      }
      if (section.render_data && section.render_data[0] && section.render_data[0].settings) {
        section.settings = section.render_data[0].settings
      }
      section.nameID = section.name
      section.name = section.name.split(":")[1]
    } else if (section.settings) {
      section.settings = isJsonString(section.settings) ? JSON.parse(section.settings) : section.settings
    }

    if (section.query_string_keys && section.query_string_keys.length > 0) {
      sectionsQsKeys.value.push(...section.query_string_keys)
    }

    if (section.id) {
      views[section.id] = section
    } else {
      section.id = `test-${section.weight}`
      views[section.id] = section
    }

    sectionOptions[section.id] = false

    if (section.error || (section.settings === null || section.settings === undefined)) {
      errorInViews.value = true
    } else {
      errorInViews.value = false
    }

    sections.forEach((section) => {
      if (section.status_code === 404) {
        errorInViews.value = false
      } else {
        errorInViews.value = false
      }
    })
  })

  displayVariations.value[activeVariation.value.pageName] = {
    name: activeVariation.value.pageName,
    views: {...views},
  }
  if (!originalVariations.value[activeVariation.value.pageName]) {
    originalVariations.value = JSON.parse(
      JSON.stringify(displayVariations.value)
    )
  }
  selectedVariation.value = activeVariation.value.pageName
  loading.value = false

  // In Nuxt 3, we use emit from defineEmits()
  // This would need to be passed through from the parent component
  // For now, I'll comment it out
  emit("load", false)

  sectionsPageLastUpdated.value = res.data.last_updated

  const hooksJs = importJs(`/js/global-hooks`)
  if (hooksJs && hooksJs['section_page_initialization_completed'] && hooksJs['section_page_initialization_completed'](res, i18n, useCookie, route)) {
    return hooksJs['section_page_initialization_completed'](res, i18n, useCookie, route)
  }
}
const sectionsPageErrorManagement = (error, server, skipHook) => {
  const pagePath = `/${decodeURIComponent(pathMatch ? pathMatch : '/')}`;
  if (error.response && error.response.data && error.response.status && error.response.status === 404 && error.response.data.options && error.response.data.options.project_metadata && error.response.data.options.project_metadata.pagePath404 && error.response.data.options.project_metadata.pagePath404 !== '' && error.response.data.options.project_metadata.pagePath404 !== pagePath && !useCookie("sections-auth-token").value) {
    pageNotFoundManagement(error);
    return;
  }
  if (error.response.status === 400) {
    const res = error.response;
    initializeSections(res);
    return;
  }
  if (error.response.status === 404 && server && skipHook !== true) {
    if (nuxtApp.ssrContext) {
      nuxtApp.ssrContext.event.res.statusCode = 404;
    }
  }

  errorResponseStatus.value = error.response.status;
  if ((errorResponseStatus.value === 404 || errorResponseStatus.value === 401) && registeredPage(errorResponseStatus.value === 404 ? 'page_not_found' : 'project_not_found')) {
    errorRegisteredPage.value = errorResponseStatus.value === 404 ? 'page_not_found' : 'project_not_found';
    errorResponseData.value = error.response.data;
  } else if (error.response.data.error) {
    sectionsError.value = error.response.data.error;
  } else {
    sectionsError.value = error.response.data.message;
    sectionsErrorOptions.value = error.response.data.options;
  }

  loading.value = false;
  pageNotFound.value = true;
  if (errorResponseStatus.value === 404) {
    sectionsMainErrors.value.push(i18n.t('404NotFound'));
  }
  emit("load", false);
}
const pageNotFoundManagement = (error) => {
  if (error.response.data.error) {
    sectionsError.value = error.response.data.error
  } else {
    sectionsError.value = error.response.data.message
    sectionsErrorOptions.value = error.response.data.options
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.ssrContext.event.res.statusCode = 404
  }
  navigateTo(localePath(error.response.data.options.project_metadata.pagePath404))
  // if (server) {
  //   if (error.response.data.error) {
  //     sectionsError.value = error.response.data.error
  //   } else {
  //     sectionsError.value = error.response.data.message
  //     sectionsErrorOptions.value = error.response.data.options
  //   }
  //   nuxtApp.ssrContext.event.res.statusCode = 404
  //   navigateTo(localePath(error.response.data.options.project_metadata.pagePath404))
  // } else {
  //   if (error.response.data.error) {
  //     showToast("Error", "error", i18n.t('loadPageError') + error.response.data.error)
  //   } else {
  //     showToast("Error", "error", i18n.t('loadPageError') + error.response.data.message, error.response.data.options)
  //   }
  //   navigateTo(route.localePath(error.response.data.options.project_metadata.pagePath404))
  // }
}
const selectedCSS = (mediaObject, mediaFieldName) => {
  const media = {
    media_id: "",
    url: "",
    seo_tag: "",
    filename: "",
    headers: {}
  }
  media.filename = mediaObject.files[0].filename
  media.media_id = mediaObject.id
  media.url = mediaObject.files[0].url
  media.seo_tag = mediaObject.seo_tag
  if (mediaObject.files[0].headers) {
    media.headers = mediaObject.files[0].headers
  }
  pageMetadata.value[mediaFieldName] = media
  // In Nuxt 3, we use template refs differently
  // This would need adjustment based on how you're using refs
  sectionsMediaComponent.value.closeModal()
}
const removeMedia = (media) => {
  pageMetadata.value[media] = {}
  if (media === 'media') {
    const cssLink = document.getElementById('page-selected-css');
    if (cssLink) {
      cssLink.remove()
    }
  }
}
const unsavedSettings = (tab) => {
  if (tab === 'page_settings') {
    try {
      let originalSettings = {}
      locales.value.forEach(locale => {
        if (originalMetaData.value[locale]) {
          originalSettings[locale] = originalMetaData.value[locale]
        } else {
          originalSettings[locale] = {
            title: '',
            description: ''
          }
        }
        if (!originalSettings[metadataFormLang.value]) {
          originalSettings[metadataFormLang.value] = {
            title: '',
            description: ''
          }
        }
      })
      originalSettings.pagePath = originalMetaData.value.pagePath
      originalSettings.media = originalMetaData.value.media
      originalSettings.mediaMetatag = originalMetaData.value.mediaMetatag
      if (!originalSettings.media) {
        originalSettings.media = {}
      }
      if (!originalSettings.mediaMetatag) {
        originalSettings.mediaMetatag = {}
      }
      let updatedSettings = {}
      updatedSettings = {
        ...pageMetadata.value,
        pagePath: pagePath.value
      }
      if (!updatedSettings.media) {
        updatedSettings.media = {}
      }
      if (!updatedSettings.mediaMetatag) {
        updatedSettings.mediaMetatag = {}
      }

      unsavedSettingsError.value[tab] = !isEqual(originalSettings, updatedSettings)

      return unsavedSettingsError.value[tab]
    } catch {
      unsavedSettingsError.value[tab] = false
      return false
    }
  } else {
    try {

      const builderHooksJavascript = importJs(`/builder/settings/builder-hooks`);
      if (builderHooksJavascript['handle_unsaved_settings']) {
        unsavedSettingsError.value[tab] = builderHooksJavascript['handle_unsaved_settings'](isEqual, originalBuilderSettings.value, updatedBuilderSettingsPerTab.value[tab], tab);
      } else {
        unsavedSettingsError.value[tab] = false
      }

      return unsavedSettingsError.value[tab]
    } catch {
      unsavedSettingsError.value[tab] = false
      return false
    }
  }
}
const getBuilderComponentForm = (component_name) => {
  const path = `/builder/settings/${component_name}`;
  return importComp(path).component;
};
const switchSettingsTab = (tab) => {
  unsavedSettings(currentSettingsTab.value)
  currentSettingsTab.value = tab
}
const builderSettingUpdated = (settings) => {
  if (!projectMetadata.value.builder) {
    projectMetadata.value.builder = {
      builder_settings: {}
    }
  } else if (!projectMetadata.value.builder.builder_settings) {
    projectMetadata.value.builder.builder_settings = {}
  }

  try {
    const builderHooksJavascript = importJs(`/builder/settings/builder-hooks`);
    if (builderHooksJavascript['builder_settings_payload']) {
      builderSettingsPayload.value = builderHooksJavascript['builder_settings_payload'](originalBuilderSettings.value, settings, currentSettingsTab.value);
    }
  } catch {}

  updatedBuilderSettings.value = settings
  updatedBuilderSettingsPerTab.value[currentSettingsTab.value] = settings
}
const updateBuilderSettingsMetaData = () => {
  updateProjectMetadata()
}
const updateProjectMetadata = async (payload, external_call) => {
  if (external_call !== true) {
    loading.value = true
  }

  const token = useCookie("sections-auth-token").value
  const config = {
    headers: sectionHeader({ token }),
    external_call
  }

  const variables = {
    metadata: external_call === true ? payload.metadata || {} : {
      ...builderSettingsPayload.value
    }
  }

  const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}`

  try {
    const res = await useApiRequest({
      url: URL,
      method: 'PUT',
      body: variables,
      ...config,
      onSuccess: (res) => {
        loading.value = false

        if (external_call !== true) {
          if (res.data && res.data.message) {
            showToast("error", "error", res.data.message)
            return
          }

          unsavedSettingsError.value[currentSettingsTab.value] = false

          const hasUnsavedSettings = Object.values(unsavedSettingsError.value).includes(true)

          if (!hasUnsavedSettings) {
            metadataModal.value = false;
            isSideBarOpen.value = false;
          }

          if (res.data.metadata && res.data.metadata && res.data.metadata) {
            originalBuilderSettings.value = {...res.data.metadata}
          }

          showToast(
            "Success",
            "success",
            i18n.t('successSettingsChanges')
          )
        }

      },
      onError: (error) => {
        loading.value = false
        if (external_call !== true) {
          if (error.response.data.errors) {
            metadataErrors.value = error.response.data.errors
          } else {
            showToast(
              "Error saving your changes",
              "error",
              error.response.data.message,
              error.response.data.options
            )
          }
        }
      }
    });
    if (external_call === true) {
      return res
    }
  } catch (e) {
    loading.value = false
    if (external_call === true) {
      return e
    }
  }
}
const updatePageMetaData = async (seo, themeData) => {
  loading.value = true
  metadataErrors.value.path[0] = ''

  const sections = []
  let views = originalVariations.value[pageName].views
  views = Object.values(views)
  views.forEach((view) => {
    if (!view.error || view.status_code === 404) {
      const refactorView = {
        id: view.id,
        weight: view.weight,
        name: view.name,
        type: view.type,
        linkedTo: view.linkedTo,
        region: view.region
      }
      if (view.settings && view.type === "configurable") {
        refactorView.name = view.nameID
        const options = []
        view.render_data.map((rData) => {
          options.push(rData.settings)
        })
        refactorView.options = options
      } else if (view.settings) {
        refactorView.options = view.settings
      }
      if (view.type === 'dynamic' || view.type === 'local') {
        refactorView.options = []
      }
      if (view.private_data) {
        refactorView.private_data = view.private_data
      }
      if (refactorView.id && refactorView.id.startsWith("id-")) {
        delete refactorView.id
      }
      if (view.linked_to) {
        sections.push({
          ...{
            id: view.id.startsWith('id-') ? undefined : view.id,
            weight: view.weight,
            linked_to: view.linked_to,
            region: view.region ? view.region : {}
          }
        })
      } else {
        sections.push({...refactorView})
      }
    }
  })

  const token = useCookie("sections-auth-token").value
  const config = {
    headers: sectionHeader({ token }),
  }

  let updatedPagePath = pagePath.value && pagePath.value !== "" ? pagePath.value.trim() : ""

  if (updatedPagePath !== '/') {
    // Split the URL into individual path segments
    const pathSegments = updatedPagePath.split('/')

    // Filter out empty segments and remove duplicates
    const uniquePathSegments = pathSegments.filter((segment, index) => segment !== '' && segment !== pathSegments[index - 1])

    // Reconstruct the URL with the unique path segments
    updatedPagePath = updatedPagePath.endsWith('/') ? '/' + uniquePathSegments.join('/') + '/' : '/' + uniquePathSegments.join('/')

    if (updatedPagePath[0] && updatedPagePath[0] === '/') {
      updatedPagePath = updatedPagePath.replace(/^\/+/, '')
    }
    while (updatedPagePath.endsWith('//')) {
      updatedPagePath = updatedPagePath.slice(0, -1)
    }
  }

  const variables = {
    page: sectionsPageName.value,
    path: updatedPagePath,
    metadata: {
      ...pageMetadata.value,
      sections_builder: themeData ? themeData : originalThemeSettings.value
    },
    variations: [],
    layout: sectionsLayout.value,
    sections
  }

  const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/page/${parsePath(encodeURIComponent(sectionsPageName.value))}`

  try {
    await useApiRequest({
      url: URL,
      method: 'PUT',
      body: variables,
      ...config,
      onSuccess: (res) => {
        loading.value = false

        if (res.data && res.data.error) {
          showToast("error", "error", res.data.error)
          return
        }

        if (res.data.metadata.seo) {
          pageMetadata.value.seo = res.data.metadata.seo;
        }
        originalMetaData.value = res.data.metadata
        originalMetaData.value.pagePath = res.data.path

        sectionsPageLastUpdated.value = res.data.last_updated

        if (themeData) {
          unsavedThemeSettingsError.value[currentThemeTab.value.id] = false

          const hasUnsavedSettings = Object.values(unsavedThemeSettingsError.value).includes(true)

          if (!hasUnsavedSettings) {
            sectionsThemeModal.value = false;
            isSideBarOpen.value = false;
          }

          if (res.data.metadata && res.data.metadata && res.data.metadata.sections_builder) {
            originalThemeSettings.value = {...res.data.metadata.sections_builder}
          }
        } else {
          unsavedSettingsError.value['page_settings'] = false

          metadataModal.value = false
          isSideBarOpen.value = false;
          metadataFormLang.value = i18n.locale.value.toString()
        }

        showToast(
          "Success",
          "success",
          i18n.t('successSettingsChanges')
        )

        let reloadPage = true
        try {
          const hooksJs = importJs(`/js/global-hooks`)
          if (hooksJs && hooksJs['reload_page_on_path_update'] && hooksJs['reload_page_on_path_update'](useCookie)) {
            reloadPage = hooksJs['reload_page_on_path_update'](useCookie)
          }
        } catch {}

        if (updatedPagePath !== sectionsPageName.value) {
          let baseURL = window.location.origin
          let routerBase = router.options.base

          if (routerBase) {
            while (routerBase.endsWith('/')) {
              routerBase = routerBase.slice(0, -1)
            }
            baseURL = baseURL + routerBase
          }

          if (seo !== true && !themeData && reloadPage) {
            window.location.replace(`${baseURL}/${updatedPagePath}`)
          }
        } else {
          if (seo !== true && !themeData && reloadPage) {
            window.location.reload()
          }
        }
      },
      onError: (error) => {
        loading.value = false
        if (error.response.data.errors) {
          metadataErrors.value = error.response.data.errors
        } else {
          showToast(
            "Error saving your changes",
            "error",
            error.response.data.message,
            error.response.data.options
          )
        }
      }
    });
  } catch {
    loading.value = false
  }
}
const addField = (index) => {
  if (fieldsInputs.value[index].name.trim() !== '') {
    fieldsInputs.value.push({type: "image", name: ""})
  }
}
const removeField = (index) => {
  fieldsInputs.value.splice(index, 1)
}
const getUserData = async () => {
  const config = {
    headers: sectionHeader({token: useCookie("sections-auth-token").value}),
  }

  const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/user`

  try {
    await useApiRequest({
      url: URL,
      method: 'GET',
      ...config,
      onSuccess: (res) => {
        sectionsUserId.value = res.data.id // Assuming user ID is in res.data.id
        loading.value = false
      },
      onError: (error) => {
        loading.value = false
        // In Nuxt 3, we use emit from defineEmits()
        emit("load", false)
        clearCookies()
        showToast("Error", "error", i18n.t('tokenInvalidReconnect'))
      }
    });
  } catch {
    loading.value = false
  }
}
const exportSections = () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({layout: selectedLayout.value, sections: allSections.value}))
  const dlAnchorElem = document.getElementById('downloadAnchorElem')
  dlAnchorElem.setAttribute("href", dataStr)
  dlAnchorElem.setAttribute("download", `${pagePath.value}.json`)
  dlAnchorElem.click()
}
const initImportSections = () => {
  if (Object.keys(displayVariations.value[selectedVariation.value].views).length > 0) {
    showToast(
      "Warning",
      "warning",
      i18n.t('importSections')
    )
  } else {
    // In Nuxt 3, we use template refs differently
    jsonFilePick.value.click()
  }
}
const importSections = (e) => {
  const jsonFile = e.target.files[0]
  const reader = new FileReader()
  reader.readAsText(jsonFile, "UTF-8")
  reader.onload = (evt) => {
    const jsonFileResult = evt.target.result
    const parsedImport = JSON.parse(jsonFileResult)
    const sections = parsedImport.sections
    selectedLayout.value = parsedImport.layout
    let sectionsNames = []

    sections.forEach((section) => {
      sectionsNames.push(section.name)
      if (section.type === "configurable") {
        const sectionTypeObject = types.value.find(type => type.name === section.nameID)
        if ((sectionTypeObject.access === 'private' || sectionTypeObject.access === 'public_scoped') && sectionTypeObject.app_status !== 'enabled') {
          showToast(
            "Warning",
            "warning",
            `${i18n.t('activateConfigSections')} ${section.name} ${i18n.t('forProject')}`
          )
        }
      }
      if (section.linked_to && section.linked_to !== "") {
        section.instance_name = section.linked_to
        section.options = section.settings
      }
      if (section.region && section.region[selectedLayout.value] && section.region[selectedLayout.value].slot) {
        selectedSlotRegion.value = section.region[selectedLayout.value].slot
      }
      addSectionType(section, false, section.linked_to && section.linked_to !== "")
    })

    showToast(
      "Success",
      "info",
      `${i18n.t('successImported')} ${sectionsNames.length} sections: ${sectionsNames.join(', ')}`
    )
  }
}
const isJsonString = (str) => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}
const updateGlobalType = async (section) => {
  if (section.type === 'configurable') {
    sectionTypeName.value = section.nameID
  } else if (section && section.name) {
    sectionTypeName.value = section.name
  }

  if (sectionTypeName.value !== "") {
    if (selectedLayout.value !== 'standard') {
      section.region = {}
      section.region[selectedLayout.value] = {
        slot: selectedSlotRegion.value,
        weight: Object.keys(
          displayVariations.value[selectedVariation.value].views
        ).length
      }
    } else {
      section.region = {}
    }

    const token = useCookie("sections-auth-token").value
    const config = {
      headers: sectionHeader({token}),
    }

    const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/global-instances/${section.instance_name}`
    loading.value = true

    try {
      await useApiRequest({
        url: URL,
        method: 'PUT',
        body: {
          "section": {
            "name": sectionTypeName.value,
            "options": section.type === 'configurable' ? [section.settings] : section.settings,
            "private_data": section.private_data ?? {},
            "type": section.type
          },
          "auto_insertion": section.auto_insertion
        },
        ...config,
        onSuccess: () => {
          sectionTypeName.value = ""
          currentSection.value = null
          isModalOpen.value = false
          isSideBarOpen.value = false
          loading.value = false

          showToast(
            "Success",
            "success",
            i18n.t('globalTypeUpdated')
          )
        },
        onError: (error) => {
          loading.value = false
          showToast("Error", "error", i18n.t('updateSectionTypeError') + error.response.data.message, error.response.data.options)
        }
      });
    } catch {
      loading.value = false;
    }
  } else {
    loading.value = false
    showToast("Error", "error", i18n.t('enterSectionTypeName'))
  }
}
const addNewGlobalType = async (section, instance_name, payload, external_call) => {
  if (external_call === true) {
    if (payload.section) {
      sectionTypeName.value = payload.section.name
      section = payload.section
      section.instance_name = instance_name
    }
  } else {
    if (section.type === 'configurable') {
      sectionTypeName.value = section.nameID
    } else if (section && section.name) {
      sectionTypeName.value = section.name
    }
  }

  if (sectionTypeName.value !== "") {
    const token = useCookie("sections-auth-token").value
    const config = {
      headers: sectionHeader({token}),
      external_call
    }

    const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/global-instances/${section.instance_name}`
    if (external_call !== true) {
      loading.value = true
    }

    try {
      const res = await useApiRequest({
        url: URL,
        method: 'POST',
        body: {
          "section": {
            "name": sectionTypeName.value,
            "options": section.type === 'configurable' ? [section.settings] : section.settings,
            "private_data": section.private_data ?? {},
            "type": section.type
          },
          "auto_insertion": section.auto_insertion
        },
        ...config,
        onSuccess: async () => {
          if (external_call !== true) {
            globalTypes.value = []
            await getGlobalSectionTypes() // assuming this function is defined elsewhere
            staticSuccess.value = true
            sectionTypeName.value = ""
            fieldsInputs.value = [
              {
                type: "image",
                name: ""
              }
            ]

            if (canPromote.value === true) {
              section.linkedTo = section.instance_name
              section.linked_to = section.instance_name
              section.instance = true

              section.region = displayVariations.value[selectedVariation.value].views[section.id].region
              displayVariations.value[selectedVariation.value].views[section.id] = section
              displayVariations.value[selectedVariation.value].altered = true

              await computeLayoutData()

              showToast(
                "Success",
                "info",
                i18n.t('successAddedSection')
              )
            }

            currentSection.value = null
            isCreateInstance.value = false
            isSideBarOpen.value = false
            showMyGlobal.value = true
          } else {
            loading.value = false
          }
        },
        onError: (error) => {
          loading.value = false
          if (external_call !== true) {
            showToast("Error", "error", i18n.t('createSectionTypeError') + error.response.data.message, error.response.data.options)
          }
        }
      });
      if (external_call === true) {
        return res
      }
    } catch (e) {
      loading.value = false;
      if (external_call === true) {
        return e
      }
    }
  } else {
    loading.value = false
    showToast("Error", "error", i18n.t('enterSectionTypeName'))
  }
}
const addNewStaticType = async (name, payload, external_call, createSection) => {
  if (name) {
    sectionTypeName.value = name
  }

  if (sectionTypeName.value !== "") {
    const token = useCookie("sections-auth-token").value
    const config = {
      headers: sectionHeader({token}),
      external_call
    }

    const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/section-types/${sectionTypeName.value}`
    if (external_call !== true) {
      loading.value = true
    }

    let fieldsDeclaration = fieldsInputs.value

    if (name && external_call !== true) {

      const formComp = await importComp(`/forms/${sectionTypeName.value}`).setup?.then(d => d.default)

      if (formComp.props && formComp.props.mediaFields) {
        if (formComp.props.mediaFields.default && formComp.props.mediaFields.default()) {
          fieldsDeclaration = formComp.props.mediaFields.default()
        } else {
          fieldsDeclaration = formComp.props.mediaFields
        }
      }
    }

    fieldsDeclaration = external_call === true && payload.fields ? payload.fields : fieldsDeclaration.filter(field => field.name.trim() !== '')

    try {
      const res = await useApiRequest({
        url: URL,
        method: 'POST',
        body: {
          "fields": fieldsDeclaration
        },
        ...config,
        onSuccess: async () => {
          if (external_call !== true) {
            types.value = []
            globalTypes.value = []
            if (createSection !== true) {
              await getSectionTypes()
            }
            staticSuccess.value = true
            sectionTypeName.value = ""
            fieldsInputs.value = [
              {
                type: "image",
                name: ""
              }
            ]
          } else {
            loading.value = false
          }
        },
        onError: async (error) => { // Make onError async if getSectionTypes is called
          loading.value = false
          if (external_call !== true) {
            types.value = []
            globalTypes.value = []
            await getSectionTypes() // Call even on error? Review this logic.
            showToast("Error", "error", i18n.t('createSectionTypeError') + error.response.data.message, error.response.data.options)
          }
        }
      });
      if (createSection === true) {
        await getSectionTypes()
      }
      if (external_call === true) {
        return res
      }
    } catch(e) {
      loading.value = false;
      if (external_call === true) {
        return e
      }
    }
  } else {
    loading.value = false
    showToast("Error", "error", i18n.t('enterSectionTypeName'))
  }
}
const openStaticSection = () => {
  staticModal.value = true
}
const trackSectionComp = (sectionName, sectionType) => {
  if (sectionName && !sectionInPage.value.includes(sectionName)) {
    sectionInPage.value.push(sectionName)
    const name = upperFirst(
      camelCase(
        // Gets the file name regardless of folder depth
        sectionName
          .split("/")
          .pop()
          .replace(/\.\w+$/, "")
      )
    )
  }
}
const getComponentPath = (sectionName, sectionType) => {
  let path = ""
  if (sectionName && sectionName.includes(":") && sectionName.includes("_-_")) {
    path = `/views/${sectionName.split(":")[1].split("_-_")[0]}_${sectionType}`
  } else if (sectionName && sectionName.includes(":")) {
    path = `/views/${sectionName.split(":")[1]}_${sectionType}`
  } else if (sectionName && sectionName.includes("_-_")) {
    path = `/views/${sectionName.split("_-_")[0]}_${sectionType}`
  } else {
    path = `/views/${sectionName}_${sectionType}`
  }
  return path
}
const componentsSetupData = (sectionName, sectionType) => {
  let path = getComponentPath(sectionName, sectionType)
  if (componentsSetup.value[path]) {
    return componentsSetup.value[path]
  } else return {}
}
const getComponentSetup = async (sectionName, sectionType) => {
  let path = getComponentPath(sectionName, sectionType)
  const moduleData = await importComp(path).setup?.then(d => d.default)
  if (moduleData && moduleData.props && moduleData.props.viewStructure &&
    (moduleData.props.viewStructure.settings || moduleData.props.viewStructure.render_data)) {
    const setupData = {
      settings: populateWithDummyValues(moduleData.props.viewStructure.settings, dummyDataPresets),
      render_data: populateWithDummyValues(moduleData.props.viewStructure.render_data, dummyDataPresets),
      type: sectionType
    }
    componentsSetup.value[path] = setupData
    return setupData
  } else {
    const setupData = {type: sectionType}
    componentsSetup.value[path] = setupData
    return setupData
  }
}
const sectionSEO = ref({
  title: "",
  description: "",
  image: ""
})
const seoManagement = (view, sectionHooksJs) => {
  try {
    if (view && pageMetadata.value.seo && pageMetadata.value.seo[view.id] === true) {
      if (sectionHooksJs && sectionHooksJs['seo_management']) {
        const seo = JSON.parse(JSON.stringify(sectionHooksJs['seo_management'](view, i18n.locale.value)))

        Array.from(['title', 'description', 'image']).forEach((key) => {
          if (seo[key] && !sectionSEO.value[key]) {
            sectionSEO.value[key] = seo[key];
            computedSEO.value[key] = seo[key];
          }
        });
      }
    }
  } catch {}
}
const parseSectionName = (sectionName) => {
  let parsedSectionName = ""
  if (sectionName && sectionName.includes(":") && sectionName.includes("_-_")) {
    parsedSectionName = `${sectionName.split(":")[1].split("_-_")[0]}`
  } else if (sectionName && sectionName.includes(":")) {
    parsedSectionName = `${sectionName.split(":")[1]}`
  } else if (sectionName && sectionName.includes("_-_")) {
    parsedSectionName = `${sectionName.split("_-_")[0]}`
  } else {
    parsedSectionName = `${sectionName}`
  }
  return parsedSectionName
}
const getComponent = (sectionName, sectionType, view) => {
  const hooksJs = importJs(`/js/global-hooks`)
  const sectionHooksJs = importJs(`/forms/${parseSectionName(sectionName)}_hooks`)
  seoManagement(view, sectionHooksJs)
  if (hooksJs && hooksJs['section_pre_render'] && hooksJs['section_pre_render']({sectionName, sectionType})) {
    return hooksJs['section_pre_render']({sectionName, sectionType})
  } else if (nuxtApp.$sections.cname === "active") {
    const path = getComponentPath(sectionName, sectionType)
    if (sectionName && sectionName.includes(":") && sectionName.includes("_-_")) {
      return importComp(path).component
    } else if (sectionName && sectionName.includes(":")) {
      return importComp(path).component
    } else if (sectionName && sectionName.includes("_-_")) {
      return importComp(path).component
    } else {
      return importComp(path).component
    }
  } else {
    const path = getComponentPath(sectionName, sectionType)
    if (sectionName && sectionName.includes(":") && sectionName.includes("_-_")) {
      return importComp(path).component
    } else if (sectionName && sectionName.includes(":")) {
      return importComp(path).component
    } else if (sectionName && sectionName.includes("_-_")) {
      return importComp(path).component
    } else {
      return importComp(path).component
    }
  }
}
const getAvailableLayouts = () => {
  try {
    // In Nuxt 3, you'd typically use import.meta.glob instead of require.context
    const layoutFiles = import.meta.glob('/sections/layouts/*.vue')
    const layoutNames = Object.keys(layoutFiles).map((filename) => {
      return filename.replace(/^.*\/(.+)\.vue$/, '$1')
    })
    availableLayouts.value.push(...layoutNames)
  } catch (error) {
    console.warn(i18n.t('noLayoutsFolder'))
  }
}
const getSelectedLayout = () => {
  let path = `/layouts/${selectedLayout.value}`
  if (selectedLayout.value === 'standard') {
    return 'div'
  } else return importComp(path).component
}
const computeLayoutData = async () => {
  const slotNameExample = 'i.e. slotNames: { type: Array, default() { return [\'region1\'] }}'
  errorInLayout.value = false

  if (selectedLayout.value !== 'standard') {
    sectionsMainErrors.value = []
    sectionsLayoutErrors.value = []
    let path = `/layouts/${selectedLayout.value}`
    layoutSlotNames.value = []

    let layoutComp = await importComp(path).setup?.then(d => d.default)
    if (!layoutComp?.props) {
      errorInLayout.value = true
      sectionsMainErrors.value.push(i18n.t('layoutErrors.missingComp'))
      return
    } else if (!layoutComp.props.slotNames) {
      errorInLayout.value = true
      sectionsMainErrors.value.push(i18n.t('layoutErrors.missingProp'))
      sectionsMainErrors.value.push(slotNameExample)
      return
    } else if (!layoutComp.props.slotNames.type || layoutComp.props.slotNames.type !== Array || !layoutComp.props.slotNames.default) {

      errorInLayout.value = true
      sectionsMainErrors.value.push(i18n.t('layoutErrors.propArray'))
      sectionsMainErrors.value.push(slotNameExample)
      return
    }

    try {
      layoutSlotNames.value = [...layoutComp.props.slotNames.default()]
    } catch {
      errorInLayout.value = true
      sectionsMainErrors.value.push(i18n.t('layoutErrors.propArray'))
      sectionsMainErrors.value.push(slotNameExample)
      return
    }

    if (!layoutComp.props.slotNames.default()[0]) {
      errorInLayout.value = true
      sectionsMainErrors.value.push(i18n.t('layoutErrors.propArray'))
      sectionsMainErrors.value.push(slotNameExample)
      return
    }

    let views = []
    views = Object.values(
      displayVariations.value[selectedVariation.value].views
    )

    views.map(view => {
      if (!view.region || !view.region[selectedLayout.value] || !view.region[selectedLayout.value]['slot']) {
        if (!view.region) {
          view['region'] = {}
        }
        view.region[selectedLayout.value] = {
          slot: layoutSlotNames.value[0],
          weight: view.weight
        }
      }
    })

    layoutSlotNames.value.forEach(slotName => {
      viewsPerRegions.value[slotName] = []
      views.forEach(view => {
        if (view.region[selectedLayout.value].slot === slotName) {
          viewsPerRegions.value[slotName].push(view)
        }
      })

      let selectedLay = selectedLayout.value
      viewsPerRegions.value[slotName] = viewsPerRegions.value[slotName].sort(function (a, b) {
        return a.region[selectedLay].weight - b.region[selectedLay].weight
      })
    })

    viewsPerRegions.value = {...viewsPerRegions.value}

    if (admin && editMode.value) {
      verifySlots()
    }
  }
}
const verifySlots = () => {
  setTimeout(() => {
    nextTick(() => {
      if (selectedLayout.value !== 'standard') {
        sectionsLayoutErrors.value = []
        layoutSlotNames.value.forEach(slotName => {
          if (!document.getElementById(`sections-slot-region-${selectedLayout.value}-${slotName}`)) {
            errorInLayout.value = true
            sectionsLayoutErrors.value.push(slotName.charAt(0).toUpperCase() + slotName.slice(1) + ' ' + i18n.t('layoutErrors.regionNotConfigured'))
            sectionsLayoutErrors.value.push(`<slot name=\"${slotName}\"></slot> ${i18n.t('layoutErrors.layoutTemp')}`)
            return
          }
        })
      }
    })
  }, 500)
}
// Alternative simpler approach using array insertion
const sanitizeWeightsByInsertion = (views, layoutKey, targetSlot, priorityViewId, priorityWeight) => {
  // Get all views in the target slot except the priority view
  const otherViews = Object.entries(views)
    .filter(([id, view]) =>
      view.region?.[layoutKey]?.slot === targetSlot && id !== priorityViewId
    )
    .map(([id, view]) => ({ id, view }))
    .sort((a, b) => (a.view.region[layoutKey].weight || 0) - (b.view.region[layoutKey].weight || 0))

  // Insert the priority view at the specified position
  const priorityView = { id: priorityViewId, view: views[priorityViewId] }
  const finalOrder = [...otherViews]
  finalOrder.splice(priorityWeight, 0, priorityView)

  // Reassign weights starting from 0
  finalOrder.forEach((item, index) => {
    views[item.id].region[layoutKey].weight = index
  })
}
const logDrag = (evt, slotName) => {
  if (evt.added) {
    const viewId = evt.added.element.id
    displayVariations.value[selectedVariation.value].views[viewId].region[selectedLayout.value].slot = slotName
    displayVariations.value[selectedVariation.value].views[viewId].region[selectedLayout.value].weight = evt.added.newIndex

    sanitizeWeightsByInsertion(
      displayVariations.value[selectedVariation.value].views,
      selectedLayout.value,
      slotName,
      viewId,
      evt.added.newIndex
    )

    displayVariations.value[selectedVariation.value].altered = true
  } else if (evt.moved) {
    const viewId = evt.moved.element.id
    displayVariations.value[selectedVariation.value].views[viewId].region[selectedLayout.value].weight = evt.moved.newIndex

    const movedSlot = displayVariations.value[selectedVariation.value].views[viewId].region[selectedLayout.value].slot

    sanitizeWeightsByInsertion(
      displayVariations.value[selectedVariation.value].views,
      selectedLayout.value,
      movedSlot,
      viewId,
      evt.moved.newIndex
    )

    displayVariations.value[selectedVariation.value].altered = true
  }
  computeLayoutData()
}
const createNewPage = async (page_name, payload, external_call, custom) => {

  createPagePathError.value = ""
  createPageNameError.value = ""
  if (custom && (!createPagePath.value.trim() || !createPageName.value.trim())) {
    if (!createPagePath.value.trim()) {
      createPagePathError.value = i18n.t('requiredField')
    }
    if (!createPageName.value.trim()) {
      createPageNameError.value = i18n.t('requiredField')
    }
    return
  }

  if (custom && myPages.value) {
    if (myPages.value.map(mp => mp.page).includes(createPageName.value.trim())) {
      showToast(
        "Error creating page",
        "error",
        i18n.t('createPageError') + createPageName.value + "\n:" + i18n.t('pageNameExist')
      )
      return
    }
  }

  if (external_call !== true) {
    loading.value = true
  }

  const token = useCookie('sections-auth-token').value

  const header = { token }
  const config = {
    headers: sectionHeader(header),
    external_call
  }

  const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/page/${parsePath(encodeURIComponent(external_call === true ? page_name : custom ? createPageName.value : pageName))}`

  let updatedPagePath = createPagePath.value && createPagePath.value !== "" ? createPagePath.value.trim() : ""

  if (custom && updatedPagePath !== '/') {
    // Split the URL into individual path segments
    const pathSegments = updatedPagePath.split('/')

    // Filter out empty segments and remove duplicates
    const uniquePathSegments = pathSegments.filter((segment, index) => segment !== '' && segment !== pathSegments[index - 1])

    // Reconstruct the URL with the unique path segments
    updatedPagePath = updatedPagePath.endsWith('/') ? '/' + uniquePathSegments.join('/') + '/' : '/' + uniquePathSegments.join('/')

    if (updatedPagePath[0] && updatedPagePath[0] === '/') {
      updatedPagePath = updatedPagePath.replace(/^\/+/, '')
    }
    while (updatedPagePath.endsWith('//')) {
      updatedPagePath = updatedPagePath.slice(0, -1)
    }
  }

  try {
    const res = await useApiRequest({
      url: URL,
      method: 'PUT',
      body: external_call === true ? payload || {
        variations: [],
        sections: []
      } : { // No need to stringify, useApiRequest handles it
        variations: [],
        sections: [],
        path : custom ? updatedPagePath : undefined
      },
      ...config,
      onSuccess: (res) => {
        loading.value = false
        if (custom) {
          showToast(
            "Success",
            "success",
            i18n.t('createPageSuccess')
          )
          myPages.value.push({
            id: createPageName.value,
            page: createPageName.value,
            path: createPagePath.value,
          })
          window.location.replace(`${window.location.origin}/${updatedPagePath}`)
        } else if (external_call !== true) {
          pageNotFound.value = false
          sectionsMainErrors.value = []
          sectionsPageLastUpdated.value = res.data.last_updated
          pageId.value = res.data.id
          sectionsPageName.value = res.data.page
          pagePath.value = res.data.path
          allSections.value = []
          runIntro('editPage')
          showToast(
            "Success",
            "success",
            i18n.t('createPageSuccess')
          )
        }
      },
      onError: (err) => {
        loading.value = false
        if (external_call !== true) {
          let errorMsg = err.response.data.message
          if (err.response.data.errors && err.response.data.errors.path) {
            errorMsg = `${i18n.t('pageUrl')} ${err.response.data.errors.path[0]}`
          }
          showToast(
            "Error creating page",
            "error",
            i18n.t('createPageError') + pageName + "\n" + errorMsg,
            err.response.data.options
          )
        }
      }
    });
    if (external_call === true) {
      return res
    }
  } catch (e) {
    loading.value = false;
    if (external_call === true) {
      return e
    }
  }
}
const getAvailableSections = () => {
  try {
    // Use import.meta.glob instead of require.context
    const formSections = import.meta.glob('/sections/forms/*.vue')
    const formNames = Object.keys(formSections).map((filename) => {
      return filename.replace(/^.*\/(.+)\.vue$/, '$1')
    })
    availableSectionsForms.value.push(...formNames)
  } catch (error) {
    console.warn(i18n.t('noFormsFolder'))
  }
}
const initiateIntroJs = async () => {
  try {
    const token = useCookie('sections-auth-token').value

    try {
      await useApiRequest({
        url: `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/dashboard`,
        method: 'GET',
        headers: sectionHeader({ token }),
        onSuccess: async (response) => { // Make onSuccess async
          if (response.data.package_name) {
            useCookie('package_name').value = response.data.package_name
          }
          currentPages.value = response.data.current_pages
          if (currentPages.value !== null && currentPages.value === 0) {
            if (pageNotFound.value && guideConfig.value.autoStart === true) {
              await runIntro('createPage') // Await intro run
            }
          }
        },
        onError: (error) => {
          loading.value = false
          emit("load", false)
          clearCookies()
          showToast("Error", "error", i18n.t('tokenInvalidReconnect'))
        }
      });
    } catch {
      loading.value = false;
      emit("load", false);
    }
  } catch {} // Outer catch remains for potential errors before API call
}
const runIntro = async (topic, rerun, lastSavedTopic, action) => {
  if (guideConfig.value.disabled === true) {
    return
  }
  if (guideConfig.value.override === true) {
    await nuxtApp.callHook('start-guide', topic, action)
    return
  }
  if (guideConfig.value.autoStart === false && action !== 'global-content-guide-btn' && action !== 'relaunch-guide-btn') {
    return
  } else if (guideConfig.value.autoStart === false && (action === 'global-content-guide-btn' || action === 'relaunch-guide-btn')) {
    guideConfig.value.autoStart = true
  }
  if (intro.value && topic === 'globalTour') {
    intro.value.setDontShowAgain(true)
    useCookie('intro-last-step').value = null
  }

  if (rerun === true) {
    introRerun.value = true
  } else {
    introRerun.value = false
  }

  if ((currentPages.value !== null && currentPages.value === 0) || rerun === true) {
    if (topic && lastSavedTopic !== true) {
      useCookie('intro-last-step').value = topic
    }
    if (intro.value) {
      intro.value.exit(true)
    }

    // Dynamic imports in Nuxt 3
    const introJsModule = await import('intro.js/minified/intro.min.js')
    await import('intro.js/minified/introjs.min.css')

    intro.value = null
    intro.value = introJsModule.default()

    intro.value.setOption("dontShowAgain", true)
    intro.value.setOption("nextLabel", i18n.t('intro.nextLabel'))
    intro.value.setOption("prevLabel", i18n.t('intro.prevLabel'))
    intro.value.setOption("doneLabel", i18n.t('intro.doneLabel'))
    intro.value.setOption("dontShowAgainLabel", i18n.t('intro.dontShowAgainLabel'))

    if (rerun === true) {
      if (topic === 'globalTour') {
        intro.value.setOption("dontShowAgain", false)
        intro.value.onexit(() => {
          intro.value.setDontShowAgain(true)
          introRerun.value = false
        })
      } else {
        if (topic === 'topBar') {
          intro.value.setDontShowAgain(false)
        }
        intro.value.setOption("dontShowAgain", true)
      }
    }

    addIntroSteps(topic, rerun)
  }
  // The below code is used to attach click event listeners to the guide close button and overlay
  // It is used to prevent the guide from automatically proceeding into next steps of different guides
  setTimeout(() => {
    const skipButton = document.querySelector('a.introjs-skipbutton');
    const introOverlay = document.querySelector('div.introjs-overlay');

    function handleSkipClick() {
      currentPages.value = 1
      introRerun.value = false
      if (useCookie('intro-last-step').value && useCookie('intro-last-step').value === 'addNewSectionModal') {
        useCookie('intro-last-step').value = null
      }
    }

// First, remove any previously attached instance of this exact handler
    if (skipButton) {
      skipButton.removeEventListener('click', handleSkipClick);
      skipButton.addEventListener('click', handleSkipClick);
    }
    if (introOverlay) {
      introOverlay.removeEventListener('click', handleSkipClick);
      introOverlay.addEventListener('click', handleSkipClick);
    }
  }, 200)
}
const addIntroSteps = (topic, rerun) => {
  if ((currentPages.value !== null && currentPages.value === 0) || rerun === true) {
    intro.value.setOptions({
      steps: introSteps(topic)
    })
    intro.value.refresh(true)
    intro.value.start()

    if (topic === 'addNewSectionModal') {
      window.runIntro = runIntro
      window.introRerun = introRerun.value
      window.closeIntro = () => {
        intro.value.exit(true)
      }
    }
  }
}
const introSteps = (topic) => {
  switch (topic) {
    case 'createPage':
      return [
        {
          element: document.querySelector('.intro-create-page'),
          intro: i18n.t('intro.createPage')
        }
      ]
    case 'editPage':
      return [
        {
          element: document.querySelector('.intro-edit-page'),
          intro: i18n.t('intro.editPage')
        }
      ]
    case 'topBar':
      return [
        {
          element: document.querySelector('.intro-top-bar'),
          intro: i18n.t('intro.topBarButtons')
        },
        {
          element: document.querySelector('.intro-add-new-section'),
          intro: i18n.t('intro.addNewSection')
        }
      ]
    case 'addNewSectionModal':
      return [
        {
          element: document.querySelector('.intro-available-sections'),
          intro: i18n.t('intro.availableSections')
        }
      ]
    case 'globalTour':
      return [
        {
          intro: i18n.t('intro.globalSections')
        },
        {
          intro: i18n.t('intro.creatingGlobalSection')
        },
        {
          intro: i18n.t('intro.promoteSection')
        }
      ]
  }
}
const renderConfigurableSection = async (gt, options) => {
  emit("load", true)
  loading.value = true
  const token = useCookie('sections-auth-token').value

  const header = { token }
  const config = {
    headers: sectionHeader(header)
  }

  const variables = {
    section: {
      name: gt.section.name,
      weight: 1,
      options: options
    },
    base_path: pagePath.value
  }

  let language = undefined
  const locale = i18n.locale.value
  if (locale) {
    language = locale.value
  }

  const route = useRoute()

  if (nuxtApp.$sections.queryStringSupport && nuxtApp.$sections.queryStringSupport === "enabled") {
    variables["query_string"] = parseQS(
      encodeURIComponent(pathMatch ? pathMatch : '/'),
      Object.keys(route.query).length !== 0,
      route.query
    )

    if (gt.query_string_keys && gt.query_string_keys.length > 0) {
      variables["query_string"] = {
        ...variables["query_string"],
        ...validateQS(variables["query_string"], gt.query_string_keys, editMode.value),
        language
      }
    }
  }

  const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/section/render`

  try {
    await useApiRequest({
      url: URL,
      method: 'POST',
      body: variables,
      ...config,
      onSuccess: (res) => {
        emit("load", false)
        loading.value = false

        if (res.data && res.data.error) {
          errorAddingSection({
            closeModal: false,
            title: "Error adding " + gt.name,
            message: res.data.error
          })
          return
        }

        addSectionType({
          name: gt.section.name,
          type: 'configurable',
          settings: options[0],
          private_data: gt.section.private_data ?? {},
          id: id.value,
          weight: weight.value,
          render_data: res.data.render_data,
          fields: gt.fields,
          query_string_keys: gt.query_string_keys,
          dynamic_options: gt.dynamic_options,
          auto_insertion: gt.auto_insertion,
          instance_name: gt.name
        })
      },
      onError: (e) => {
        emit("load", false)
        loading.value = false
        if (e.response.status === 404) {
          // Assuming addSectionType should be called even on 404 based on original logic
          addSectionType({ // Changed from emit('addSectionType', ...) to direct call
            name: gt.section.name,
            type: 'configurable',
            settings: options[0],
            private_data: gt.section.private_data ?? {},
            id: id.value,
            weight: weight.value,
            render_data: e.response.data.render_data,
            fields: gt.fields,
            query_string_keys: gt.query_string_keys,
            dynamic_options: gt.dynamic_options,
            auto_insertion: gt.auto_insertion,
            instance_name: gt.name
          })
        } else {
          errorAddingSection({ // Changed from emit('errorAddingSection', ...)
            closeModal: false,
            title: "Error adding " + gt.name,
            message: e.response.data.error ? e.response.data.error : i18n.t('saveConfigSectionError')
          })
        }
      }
    });
  } catch {
    emit("load", false); // Ensure loading state is reset on unexpected errors
    loading.value = false
  }
}
const renderDynamicSection = async (name, instanceName, gt) => {
  emit("load", true)
  loading.value = true

  const token = useCookie('sections-auth-token').value

  const header = { token }
  const config = {
    headers: sectionHeader(header)
  }

  const variables = {
    section: {
      name,
      weight: 1
    },
    base_path: pagePath.value
  }

  let language = undefined
  const { locale } = useI18n()
  if (locale) {
    language = locale.value
  }

  const route = useRoute()

  if (nuxtApp.$sections.queryStringSupport && nuxtApp.$sections.queryStringSupport === "enabled") {
    variables["query_string"] = parseQS(
      encodeURIComponent(pathMatch ? pathMatch : '/'),
      Object.keys(route.query).length !== 0,
      route.query
    )

    if (gt.query_string_keys && gt.query_string_keys.length > 0) {
      variables["query_string"] = {
        ...variables["query_string"],
        ...validateQS(variables["query_string"], gt.query_string_keys, editMode.value),
        language
      }
    }
  }

  const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/section/render`

  try {
    await useApiRequest({
      url: URL,
      method: 'POST',
      body: variables,
      ...config,
      onSuccess: (res) => {
        emit("load", false)
        loading.value = false

        if (res.data && res.data.error) {
          errorAddingSection({ // Changed from emit
            closeModal: true,
            title: "Error adding " + instanceName,
            message: res.data.error
          })
          return
        }

        addSectionType({
          name: name,
          type: 'dynamic',
          id: id.value,
          weight: weight.value,
          render_data: res.data.render_data,
          query_string_keys: res.data.query_string_keys, // Assuming these come from res.data
          instance_name: instanceName
        })
      },
      onError: (e) => {
        emit("load", false)
        loading.value = false
        if (e.response.status === 404) {
          addSectionType({ // Changed from emit
            name: name,
            type: 'dynamic',
            id: id.value,
            weight: weight.value,
            render_data: e.response.data.render_data,
            query_string_keys: e.response.data.query_string_keys, // Assuming these come from error response
            instance_name: instanceName
          })
        } else {
          if (e.response.data.error) {
            errorAddingSection({ // Changed from emit
              closeModal: true,
              title: "Error adding " + instanceName,
              message: e.response.data.error
            })
          } else {
            errorAddingSection({ // Changed from emit
              closeModal: true,
              title: "Error adding " + instanceName,
              message: i18n.t('saveConfigSectionError')
            })
          }
        }
      }
    });
  } catch {
    emit("load", false);
    loading.value = false
  }
}
const getGlobalSectionTypes = async (autoLoad) => {
  if (globalTypes.value && globalTypes.value.length) {
    return
  }

  loading.value = true
  const token = useCookie("sections-auth-token").value
  const config = {
    headers: sectionHeader({
      token,
    }),
  }

  const url = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/global-instances`

  try {
    await useApiRequest({
      url: url,
      method: 'GET',
      ...config,
      onSuccess: async (res) => { // Make onSuccess async
        res.data.data.forEach((d) => { // Add type annotation if possible
          globalTypes.value.push({
            regions: d.regions,
            auto_insertion: d.auto_insertion,
            section: d.section,
            pages: d.pages,
            name: d.name,
            id: d.id,
            type: types.value.find(t => t.name === d.section.name)?.type, // Use optional chaining
            query_string_keys: types.value.find(t => t.name === d.section.name)?.query_string_keys,
            fields: types.value.find(t => t.name === d.section.name)?.fields,
            dynamic_options: types.value.find(t => t.name === d.section.name)?.dynamic_options,
            application: types.value.find(t => t.name === d.section.name)?.application,
          })
        })

        types.value.forEach(type => {
          globalTypes.value.push({
            name: type.name,
            type: type.type,
            application: type.application,
            notCreated: type.notCreated !== true && type.app_status !== 'disbaled' && type.app_status !== 'disabled'
          })
        })

        if (autoLoad === true) {
          if (allSections.value.length === 0 && globalTypes.value && globalTypes.value.length > 0) {
            for (const gt of globalTypes.value.filter(gt => gt.auto_insertion === true)) {
              loading.value = true
              await new Promise((resolve) => setTimeout(resolve, 100)) // Keep delay if needed
              if (gt.type === 'configurable') {
                await renderConfigurableSection(gt, gt.section.options)
              } else if (gt.type === 'dynamic') {
                await renderDynamicSection(gt.section.name, gt.name, gt)
              } else {
                addSectionType({
                  ...gt.section,
                  id: 'id-' + Date.now(),
                  weight: 'null',
                  type: gt.type,
                  instance_name: gt.name,
                  fields: gt.fields,
                  query_string_keys: gt.query_string_keys,
                  dynamic_options: gt.dynamic_options,
                  render_data: gt.section?.options?.[0] ? [{settings: gt.section.options[0]}] : undefined // Optional chaining
                }, false, true)
              }
            }
          }
        }
        loading.value = false
        emit("load", false)
      },
      onError: (error) => {
        loading.value = false
        emit("load", false)
        showToast("Error", "error", error.toString()) // Use error.toString() or access specific message
      }
    });
  } catch {
    loading.value = false;
    emit("load", false);
  }
}
const getSectionTypes = async (autoLoad) => {
  if (types.value && types.value.length) {
    return
  }

  loading.value = true
  appNames.value = []

  const token = useCookie("sections-auth-token").value
  const config = {
    headers: sectionHeader({
      token,
    }),
  }

  const url = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/section-types`

  try {
    await useApiRequest({
      url: url,
      method: 'GET',
      ...config,
      onSuccess: async (res) => {
        res.data.data.forEach((d) => { // Add type annotation if possible
          if (d.application) {
            appNames.value.push(d.application)
          }
          trackSectionComp(d.name, d.type)
          types.value.push({
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
          })
        })

        availableSectionsForms.value.forEach(name => {
          const found = types.value.find(element => element.name.includes(':') ? element.name.split(':')[1] === name : element.name === name)
          if (!found) {
            types.value.push({
              name,
              notCreated: true
            })
          }
        })

        types.value = [...types.value, ...addSystemTypes()]
        loading.value = false
        emit("load", false)
        await getGlobalSectionTypes(autoLoad) // Await this call
      },
      onError: (error) => {
        loading.value = false
        emit("load", false)
        // Handle error appropriately, e.g., show a toast
        showToast("Error", "error", "Failed to load section types");
      }
    });
  } catch {
    loading.value = false;
    emit("load", false);
  }
}
const addSystemTypes = () => {
  let staticTypes = []
  // In Nuxt 3, we need to use a different approach for importing files
  // This is an example of how you might approach this
  // You'll need to adapt this based on your actual project structure
  const internalViews = import.meta.glob('../../../src/configs/views/*.vue')
  let externalViews = {}
  let externalPath = ""

  try {
    externalViews = import.meta.glob('/sections/views/*.vue')
    externalPath = '/sections/views'
  } catch (error) {
    throw new Error(i18n.t('noSectionsFolder'))
  }

  staticTypes = buildComp(staticTypes, {...externalViews}, "external", externalPath)
  staticTypes = buildComp(staticTypes, internalViews, "internal", "internal:path")

  return [...new Set(staticTypes)]
}
const buildComp = (staticTypes, views, compType, path) => {
  let names = staticTypes.map((obj) => {
    return obj.name
  })

  Object.keys(views).forEach((fileName) => {
    const splitName = fileName.split("_")
    const type = splitName[1]
    const mainName = splitName[0]

    if (type) {
      if (type == "local.vue") {
        const name = camelCase(
          mainName
            .split("/")
            .pop()
            .replace(/\.\w+$/, "")
        )

        if (!names.includes(name)) {
          trackSectionComp(name, "local")
          staticTypes.push({
            name,
            type: 'local',
            compType,
          })
          names.push(name)
        }
      }
    } else {
      if (fileName.includes(".vue")) {
        console.error(
          `nuxt-sections: ${fileName} ${i18n.t('in')} ${path} ${i18n.t('cannotRegisterComp')}`
        )
      }
    }
  })

  return staticTypes
}
const openEditMode = async () => {

  try {
    const hooksJs = importJs(`/js/global-hooks`)
    if (hooksJs && hooksJs['pre_open_edit_mode'] && hooksJs['pre_open_edit_mode'](useCookie)) {
      const disableEditMode = hooksJs['pre_open_edit_mode'](useCookie)
      if (disableEditMode === true) {
        return
      }
    }
  } catch {}

  await getSectionTypes(true)
  if (!originalVariations.value[selectedVariation.value]) {
    originalVariations.value = JSON.parse(
      JSON.stringify(displayVariations.value)
    )
  }

  editMode.value = !editMode.value

  if (editMode.value === true) {
    if (selectedLayout.value === 'standard') {
      setTimeout(async () => {
        await nextTick()
        checkIntroLastStep('topBar')
        await runIntro('topBar', introRerun.value)
      }, 900)
    }

    loading.value = true
    const inBrowser = typeof window !== 'undefined'

    const token = useCookie("sections-auth-token").value;

    const config = {
      headers: sectionHeader((inBrowser) ? { token } : {origin: nuxtApp.$sections.projectUrl, token}),
    }

    const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/page/${parsePath(encodeURIComponent(pageName))}`

    let payload = {}

    let language = undefined
    try {
      language = i18n.locale.value
    } catch {
    }

    if (nuxtApp.$sections.queryStringSupport && nuxtApp.$sections.queryStringSupport === "enabled") {
      let query_string = parseQS(encodeURIComponent(pathMatch ? pathMatch : '/'), Object.keys(route.query).length !== 0, route.query)
      payload = {
        query_string: {
          ...query_string,
          language
        }
      }
      if (sectionsQsKeys.value && sectionsQsKeys.value.length > 0) {
        payload["query_string"] = {
          ...payload["query_string"],
          ...validateQS(payload["query_string"], sectionsQsKeys.value, editMode.value)
        }
      }
    }

    try {
      await useApiRequest({
        url: URL,
        method: 'POST',
        body: payload,
        ...config,
        onSuccess: async (res) => { // Make onSuccess async
          if (res.data.last_updated > sectionsPageLastUpdated.value) {
            showToast(
              "Warning",
              "warning",
              i18n.t('oldPageVersion')
            )
          }
          initializeSections(res)
          await computeLayoutData() // Await this call
          loading.value = true
          await getUserData() // Await this call
          loading.value = true
          try {
            const token = useCookie("sections-auth-token").value
            const res = await getMySectionsPages(sectionHeader({token}))
            if (res) {
              myPages.value = res
            }
          } catch {}
          loading.value = false
          verifySlots() // Assuming this is synchronous or doesn't need awaiting
          if (selectedLayout.value !== 'standard') {
            setTimeout(async () => {
              await nextTick()
              checkIntroLastStep('topBar')
              await runIntro('topBar', introRerun.value)
            }, 900)
          }
        },
        onError: () => {
          loading.value = false; // Ensure loading is stopped on error
        }
      });
    } catch {
      loading.value = false;
    }
  }
}
const editable = (sectionType) => {
  switch (sectionType) {
    case "local":
    case "dynamic":
      return false
    case "static":
    case "configurable":
      return true
  }
}
const synch = () => {
  synched.value = true
  // get all existing linked to
  const currentVariationView = displayVariations.value[
    selectedVariation.value
    ].views

  // remove all existing linked to
  const withoutLinkedToValueList = Object.values(
    currentVariationView
  ).filter((view) => !view.linkedTo)

  // get default original values from the main
  let defaultVariationViews = Object.values(
    // we use an intermediary json object to deep clone the array
    JSON.parse(JSON.stringify(displayVariations.value[pageName].views))
  )

  // update the cloned list with a linkedTo id
  defaultVariationViews = defaultVariationViews.map((view) => {
    view.linkedTo = view.id
    view.id = "id-" + view.id
    return view
  })

  // get the new added sections to this variation
  const finalSections = [
    ...withoutLinkedToValueList,
    ...defaultVariationViews,
  ]

  const finalViews = {}
  finalSections.map((section) => {
    finalViews[section.id] = section
  })

  displayVariations.value[selectedVariation.value].views = finalViews

  setTimeout(() => {
    synched.value = false
  }, 1000)
}
const addSectionType = (section, showToastBool = true, instance = false) => {
  try {
    if (savedView.value.linkedTo) {
      const confirmed = window.confirm(
        i18n.t('linkedSection')
      )
      if (!confirmed) {
        return
      }
    }

    if (section.weight === null || section.weight === "null" || section.weight === undefined) {
      section.weight = Object.keys(
        displayVariations.value[selectedVariation.value].views
      ).length
    }

    if (selectedLayout.value !== 'standard') {
      if (section.region === undefined || section.region === null || section.region[selectedLayout.value] === undefined || section.region[selectedLayout.value] === null) {
        section.region = {}
      }
      section.region[selectedLayout.value] = {
        slot: selectedSlotRegion.value,
        weight: section.region && section.region[selectedLayout.value] && section.region[selectedLayout.value].weight !== undefined && section.region[selectedLayout.value].weight !== null ? section.region[selectedLayout.value].weight : viewsPerRegions.value[selectedSlotRegion.value] ? viewsPerRegions.value[selectedSlotRegion.value].length : Object.keys(
          displayVariations.value[selectedVariation.value].views
        ).length
      }
    }

    if (instance === true || (section.type === 'local' && section.instance_name) || (section.type === 'dynamic' && section.instance_name) || (section.type === 'configurable' && section.instance_name)) {
      section.linkedTo = section.instance_name
      section.linked_to = section.instance_name
      section.instance = true
      section.settings = (section.type === 'dynamic' || section.type === 'configurable') && section.render_data && section.render_data[0] && section.render_data[0].settings ? section.render_data[0].settings : section.options
    } else {
      section.linkedTo = ""
      section.linked_to = ""
    }

    displayVariations.value[selectedVariation.value].views[section.id] = section

    if (selectedVariation.value === pageName) {
      // We check if there are variations that contains a section linked to the one we just edited
      // If there are, we edit them too so they stay in sync
      variations.map((variation) => {
        const newViews = Object.values(
          displayVariations.value[variation.pageName].views
        ).map((sectionVariation) => {
          if (sectionVariation.linkedTo === section.id)
            sectionVariation.settings = section.settings
          return sectionVariation
        })
        displayVariations.value[variation.pageName].views = {...newViews}
      })
    }

    currentViews.value = displayVariations.value[selectedVariation.value].views
    displayVariations.value[selectedVariation.value].altered = true
    isModalOpen.value = false
    isSideBarOpen.value = false
    savedView.value = {}
    createdView.value = {}
    creationView.value = false
    loading.value = false

    computeLayoutData()
    if (showToastBool !== false) {
      sectionsChanged.value = true
      showToast(
        "Success",
        "info",
        i18n.t('successAddedSection')
      )
    }
  } catch (e) {
    showToast(
      "Error",
      "error",
      i18n.t('previewSectionError')
    )
  }
}
const refreshSectionView = async (sectionView, data) => {
  let sectionDatas = []
  const reRenderMultipleSections = data.sections && Array.isArray(data.sections) && data.sections.length > 0

  if (reRenderMultipleSections === true) {
    sectionDatas = allSections.value.filter(section => {
      const valueToCompare = section.nameID || section.name
      return data.sections.some(filteredSection => {
        if (filteredSection.id) {
          return filteredSection.id === section.id
        }
        return filteredSection.name === valueToCompare
      })
    })
    sectionDatas.map(section => {
      const valueToCompare = section.nameID || section.name
      const sectionTarget = data.sections.find(sec => sec.name === valueToCompare)
      const sectionTargetByID = data.sections.find(sec => sec.id === section.id)
      if (sectionTargetByID && sectionTargetByID.id) {
        section.qs = sectionTargetByID && sectionTargetByID.qs ? sectionTargetByID.qs : null
      } else {
        section.qs = sectionTarget && sectionTarget.qs ? sectionTarget.qs : null
      }
      section.renderOptions = sectionTargetByID && sectionTargetByID.options ? sectionTargetByID.options : null
      section.renderID = sectionTargetByID && sectionTargetByID.id ? sectionTargetByID.id : null
      return section
    })
  } else {
    sectionDatas = allSections.value.filter(section => (section.query_string_keys && section.query_string_keys.length > 0 && Object.keys(data.qs).some(qsItem => section.query_string_keys.includes(qsItem))) || (data.qs.language && sectionsQueryStringLanguageSupport.value.includes(section.name)))
  }

  const config = {
    headers: sectionHeader({}),
  }

  let variables = {
    base_path: pagePath.value
  }

  let language = undefined
  try {
    language = i18n.locale.value
  } catch {
  }

  if (nuxtApp.$sections.queryStringSupport && nuxtApp.$sections.queryStringSupport === "enabled") {
    variables["query_string"] = parseQS(encodeURIComponent(pathMatch ? pathMatch : '/'), Object.keys(route.query).length !== 0, route.query)
    if (sectionsQsKeys.value && sectionsQsKeys.value.length > 0) {
      variables["query_string"] = {
        ...variables["query_string"],
        ...validateQS(variables["query_string"], sectionsQsKeys.value, editMode.value)
      }
    }
    const hooksJs = importJs(`/js/global-hooks`);
    if (hooksJs && hooksJs['page_pre_load']) {
      // Call only once and check the result
      const hookResult = hooksJs['page_pre_load'](variables);

      if (hookResult && typeof hookResult === 'object') {
        // Ensure we only take serializable data
        try {
          variables = JSON.parse(JSON.stringify(hookResult));
        } catch {}
      }
    }
    if (data.qs) {
      variables["query_string"] = {...variables["query_string"], ...data.qs}
    }
    variables["query_string"] = {
      ...variables["query_string"],
      language
    }
  }

  const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/section/render`

  const seen = new Set()
  sectionDatas = sectionDatas.filter(section => {
    const key = section.nameID || section.name
    return seen.has(key) && section.type !== 'configurable' ? false : seen.add(key)
  })

  for (const sectionData of sectionDatas) {
    const sectionName = sectionData.nameID ? sectionData.nameID : sectionData.name
    variables['section'] = {
      name: sectionName,
      weight: sectionData.weight
    }

    if (sectionData.type === 'configurable') {
      if (sectionData.renderOptions) {
        variables['section']['options'] = sectionData.renderOptions
      } else {
        variables['section']['options'] = [sectionData.render_data[0].settings]
      }
    }

    if (nuxtApp.$sections.queryStringSupport && nuxtApp.$sections.queryStringSupport === "enabled" && reRenderMultipleSections === true) {
      variables["query_string"] = parseQS(encodeURIComponent(pathMatch ? pathMatch : '/'), Object.keys(route.query).length !== 0, route.query)
      if (sectionData.qs) {
        variables["query_string"] = {...variables["query_string"], ...sectionData.qs}
      }
    }

    const inBrowser = typeof window !== 'undefined'
    if (inBrowser) {
      try {
        await useApiRequest({
          url: URL,
          method: 'POST',
          body: variables,
          ...config,
          onSuccess: (res) => {
            if (res.data && res.data.error) {
              nuxtApp.callHook('sectionViewRefreshed', {error: res.data})
              renderSectionError.value = `${sectionName}: ${res.data.error}`
              showToast("Error", "error", renderSectionError.value)
            } else {
              if (sectionData.type === 'configurable' && sectionData.renderID) {
                currentViews.value = currentViews.value.map(view => {
                  if (view.type === 'configurable' && sectionData.renderID && sectionData.renderID === view.id) {
                    return {
                      ...view,
                      render_data: res.data.render_data,
                    }
                  }
                  return view
                })
              } else {
                currentViews.value = currentViews.value.map(view => {
                  if (view.name === sectionData.name) {
                    return {
                      ...view,
                      render_data: res.data.render_data,
                    }
                  }
                  return view
                })
              }
              nuxtApp.callHook('sectionViewRefreshed', res.data)
            }
          },
          onError: (e) => {
            nuxtApp.callHook('sectionViewRefreshed', {error: e.response.data})
            renderSectionError.value = `${sectionName}: ${e.response.data.error}`
            showToast("Error", "error", renderSectionError.value)
          }
        });
      } catch {}
    } else {
      // Keep OPTIONS check separate as useApiRequest doesn't explicitly handle it
      const optionsRes = await fetch(URL, {method: 'OPTIONS', ...config});

      if (optionsRes.status === 200) {
        try {
          await useApiRequest({
            url: URL,
            method: 'POST',
            body: variables,
            ...config,
            onSuccess: (res) => {
              if (res.data && res.data.error) {
                nuxtApp.callHook('sectionViewRefreshed', res.data)
                renderSectionError.value = `${sectionName}: ${res.data.error}`
              } else {
                const index = currentViews.value.findIndex(view => view.name === sectionData.name)
                if (index !== -1) {
                  const updatedViews = [...currentViews.value]
                  updatedViews[index] = {
                    ...updatedViews[index],
                    render_data: res.data.render_data,
                  }
                  currentViews.value = updatedViews
                }
                nuxtApp.callHook('sectionViewRefreshed', res.data)
              }
            },
            onError: (e) => {
              nuxtApp.callHook('sectionViewRefreshed', {error: e.response.data})
              renderSectionError.value = `${sectionName}: ${e.response.data.error}`
            }
          });
        } catch {}
      }
    }
  }
  await computeLayoutData()
}
const mutateVariation = async (variationName) => {
  const invalidSectionsErrors = reactive({});
  const sectionsFormatErrors = reactive({});
  let sections = [];
  const qsKeys = [];
  let views = displayVariations.value[variationName].views;
  views = Object.values(views);
  let formatValdiation = true;

  views.filter(view => view.altered !== true).map((view) => {
    if (!view.error || view.status_code === 404) {
      const refactorView = {
        id: view.id,
        weight: view.weight,
        name: view.name,
        type: view.type,
        linkedTo: view.linkedTo,
        region: view.region,
        private_data: view.private_data ?? {}
      };

      if (view.settings && view.type === "configurable") {
        refactorView.name = view.nameID;
        const options = [];

        view.render_data.map((rData) => {
          if (((rData.private_data && Object.keys(rData.private_data).length > 0 && rData.private_data.image && !Array.isArray(rData.private_data.image))) || (rData.settings.image && !Array.isArray(rData.settings.image))) {
            formatValdiation = false;
            showToast(
              "",
              "error",
              i18n.t('imageFieldValidation') + view.name
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
        refactorView.options = [];
      }

      if (refactorView.id && refactorView.id.startsWith("id-")) {
        delete refactorView.id;
      }

      if (view.linked_to) {
        sections.push({
          ...{
            id: view.id.startsWith('id-') ? undefined : view.id,
            weight: view.weight,
            linked_to: view.linked_to,
            region: view.region ? view.region : {}
          }
        });
      } else {
        sections.push({...refactorView});
      }

      if (view.query_string_keys && view.query_string_keys.length > 0) {
        qsKeys.push(...view.query_string_keys);
      }
    }
  });

  let integrityCheck = true;

  if (sections.length > 0) {
    function validateData(section, option, field) {
      if (Object.keys(option).includes(field.name)) {
        if (option[field.name] && (Array.isArray(option[field.name]) || typeof option[field.name] === 'object') && (field.type === 'image' || field.type === 'media')) {
          if (Array.isArray(option[field.name])) {
            if ((field.type === 'image' || field.type === 'media') && (!option[field.name][0] || !option[field.name][0].media_id || !option[field.name][0].url) && option[field.name].length !== 0) {
              integrityCheck = false;
              loading.value = false;
              showToast(
                "Error saving your changes",
                "error",
                `${i18n.t('wrongFieldName')} \`${field.name}\` ${i18n.t('formatOfSection')} \`${section.name}\``
              );
              sectionsFormatErrors[section.weight] = `${i18n.t('wrongFieldName')} \`${field.name}\` ${i18n.t('formatOfSection')} \`${section.name}\``;
            }
          } else if (typeof option[field.name] === 'object') {
            if (!option[field.name].media_id || !option[field.name].url || Object.keys(option[field.name]).length === 0) {
              integrityCheck = false;
              loading.value = false;
              showToast(
                "Error saving your changes",
                "error",
                `${i18n.t('wrongFieldName')} \`${field.name}\` ${i18n.t('formatOfSection')} \`${section.name}\``
              );
              sectionsFormatErrors[section.weight] = `${i18n.t('wrongFieldName')} \`${field.name}\` ${i18n.t('formatOfSection')} \`${section.name}\``;
            }
          }
        }
      }
    }
    types.value.forEach(type => {
      if (type.fields && Array.isArray(type.fields) && type.fields.length > 0) {
        sections.forEach(section => {
          if (section.name === type.name) {
            if (section.private_data && Object.keys(section.private_data).length > 0) {
              type.fields.forEach(field => {
                validateData(section, section.private_data, field)
              });
            } else if (Array.isArray(section.options)) {
              type.fields.forEach(field => {
                section.options.forEach(option => {
                  validateData(section, option, field)
                });
              });
            } else {
              integrityCheck = false;
              loading.value = false;
              showToast(
                "Error saving your changes",
                "error",
                `${i18n.t('optionsFormat')} \`${section.name}\``
              );
              sectionsFormatErrors[section.weight] = `${i18n.t('optionsFormat')} \`${section.name}\``;
            }
          }
        });
      }
    });
  }

  // This function is used to make sure the sections has no duplicate weights and correctly sorted to preserve order
  function sanitizeWeights(sectionsData) {
    // Sort by weight first, to preserve order
    sectionsData.sort((a, b) => a.weight - b.weight);

    // Reassign weights sequentially
    sectionsData.forEach((section, index) => {
      section.weight = index + 1;
    });

    return sectionsData;
  }
  if (selectedLayout.value === 'standard') {
    sections = sanitizeWeights(sections)
  }

  if (integrityCheck === true && errorInLayout.value !== true) {
    const token = useCookie("sections-auth-token").value;
    const header = {
      token,
    };
    const config = {
      headers: sectionHeader(header),
    };

    let variables = {
      page: sectionsPageName.value,
      path: pagePath.value && pagePath.value !== "" ? pagePath.value.trim() : undefined,
      metadata: {
        ...pageMetadata.value,
        sections_builder: originalThemeSettings.value ? originalThemeSettings.value : undefined
      },
      variations: [],
      layout: selectedLayout.value,
      sections,
    };

    if (nuxtApp.$sections.queryStringSupport && nuxtApp.$sections.queryStringSupport === "enabled") {
      const route = useRoute();
      variables["query_string"] = parseQS(
        encodeURIComponent(pathMatch ? pathMatch : '/'),
        Object.keys(route.query).length !== 0,
        route.query
      );

      if (qsKeys && qsKeys.length > 0) {
        variables["query_string"] = {
          ...variables["query_string"],
          ...validateQS(variables["query_string"], qsKeys, editMode.value)
        };
      }
    }

    const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/page/${parsePath(encodeURIComponent(sectionsPageName.value))}`;

    if (formatValdiation === true) {
      try {
        await useApiRequest({
          url: URL,
          method: 'PUT',
          body: variables,
          ...config,
          onSuccess: async (res) => {
            if (res.data && res.data.error) {
              showToast("error", "error", res.data.error);
              loading.value = false; // Stop loading on handled error
              return;
            }
            allSections.value = res.data.sections;
            sectionsPageLastUpdated.value = res.data.last_updated;
            sectionsLayout.value = res.data.layout;

            const updatedViews = {}
            let views = displayVariations.value[variationName].views;
            if (selectedLayout.value === 'standard') {
              views = sanitizeWeights(Object.values(views));
            } else {
              views = Object.values(views);
            }
            allSections.value.map((section) => {
              const foundView = views.find(view => view.weight === section.weight)
              if (foundView) {
                updatedViews[section.id] = {
                  ...foundView,
                  id: section.id
                }
              } else {
                if (section.type === "configurable") {
                  if (section.render_data && section.render_data[0] && section.render_data[0].settings && section.render_data[0].settings.image && !Array.isArray(section.render_data[0].settings.image)) {
                    section.render_data[0].settings.image = []
                  }
                  if (section.render_data && section.render_data[0] && section.render_data[0].settings) {
                    section.settings = section.render_data[0].settings
                  }
                  section.nameID = section.name
                  section.name = section.name.split(":")[1]
                } else if (section.settings) {
                  section.settings = isJsonString(section.settings) ? JSON.parse(section.settings) : section.settings
                }

                if (section.query_string_keys && section.query_string_keys.length > 0) {
                  sectionsQsKeys.value.push(...section.query_string_keys)
                }
                updatedViews[section.id] = section
              }
            })

            originalVariations.value[activeVariation.value.pageName] = {
              name: activeVariation.value.pageName,
              views: {...JSON.parse(JSON.stringify(updatedViews))},
            }
            displayVariations.value[activeVariation.value.pageName] = {
              name: activeVariation.value.pageName,
              views: {...updatedViews},
            }
            displayVariations.value[variationName].altered = false;

            await computeLayoutData()

            loading.value = false;

            if (res.data.invalid_sections && res.data.invalid_sections.length > 0) {
              showToast(
                "Error",
                "error",
                i18n.t('someSectionsNotSaved')
              );
              res.data.invalid_sections.forEach((section) => { // Add type if possible
                invalidSectionsErrors[`${section.name}-${section.weight}`] = {
                  error: section.error,
                  weight: section.weight
                };
              });
            } else {
              sectionsChanged.value = false;
              showToast(
                "Success",
                "success",
                i18n.t('successPageChanges')
              );
              layoutMode.value = false;
            }
            nuxtApp.callHook('sectionsLoaded', 'pageSaved');
          },
          onError: (error) => {
            loading.value = false;
            if (error.response.data.errors) {
              metadataErrors.value = error.response.data.errors;
            } else {
              showToast(
                "Error saving your changes",
                "error",
                error.response.data.message,
                error.response.data.options
              );
            }
          }
        });
      } catch {
        loading.value = false;
      }
    } else {
      loading.value = false; // Ensure loading stops if format validation fails
    }
  } else {
    loading.value = false; // Ensure loading stops if integrity check or layout error occurs
  }
};
const saveVariation = () => {
  loading.value = true;
  // initialize the new views
  mutateVariation(pageName);
  variations.map((variation) => {
    mutateVariation(variation.pageName);
  });
};
const edit = (view, viewAnchor) => {
  if (isSideBarOpen.value !== true) {
    canPromote.value = true;
    types.value.map((type) => {
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
      view.instance = true;
    }

    currentSection.value = view;
    savedView.value = view;
    isSideBarOpen.value = true;

    nextTick(() => {
      resizeData.value.parentElement = resizeTarget.value.parentElement;
      resizeData.value.resizeTarget = resizeTarget.value;
      setTimeout(() => {
        if (resizeTarget.value) {
          resizeTarget.value.scrollTo({
            top: 0
          });
        }
      }, 600);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", stopTracking);
    });

    setTimeout(() => {
      if (sectionsMainTarget.value) {
        const safeViewAnchor = `${viewAnchor.replace(/ /g, '\\ ')}`;
        const targetElement = sectionsMainTarget.value.querySelector(`[id="${safeViewAnchor.substring(1)}"]`);
        if (targetElement) {
          const targetPosition = targetElement.offsetTop;
          sectionsMainTarget.value.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    }, 600);
  } else if (currentSection.value.name !== view.name) {
    showToast(
      "Edit",
      "error",
      i18n.t("editingSection")
    );
  }

  updatedVariations.value = JSON.parse(
    JSON.stringify(displayVariations.value)
  );
};
const restoreVariations = () => {
  displayVariations.value = JSON.parse(
    JSON.stringify(originalVariations.value)
  );
  selectedLayout.value = sectionsLayout.value;
  computeLayoutData();
  showToast(
    "Revert Successful",
    "info",
    i18n.t('revertPageSuccess')
  );
};
const toggleSectionsOptions = (viewId) => {
  for (const key in sectionOptions.value) {
    if (key !== viewId) {
      sectionOptions.value[key] = false
    }
  }
  sectionOptions.value[viewId] = !sectionOptions.value[viewId];
};
const deleteView = (id) => {
  if (selectedVariation.value === pageName) {
    // Check if there are variations that contain a section linked to the one we are about to delete
    // If there are, we unlink them
    variations.map((variation) => {
      const newViews = Object.values(
        displayVariations.value[variation.pageName].views
      ).map((section) => {
        if (section.linkedTo === id) section.linkedTo = "";
        return section;
      });
      displayVariations.value[variation.pageName].views = { ...newViews };
    });
  }
  // Then we remove the variation we want to delete
  delete displayVariations.value[selectedVariation.value].views[id];
  // Below 2 lines are added to refresh the section views and have the list reactive to the deletion update
  displayVariations.value[selectedVariation.value].views = { ...displayVariations.value[selectedVariation.value].views };
  displayVariations.value[selectedVariation.value].altered = true;
  isDeleteSectionModalOpen.value = false;
  try {
    const builderHooksJavascript = importJs(`/theme/theme-hooks`);
    if (builderHooksJavascript['section_removed']) {
      const updatedMetaData = builderHooksJavascript['section_removed'](originalThemeSettings.value, id);
      if (updatedMetaData) {
        originalThemeSettings.value = updatedMetaData
      }
    }
  } catch {}
  showToast(
    "Deleted",
    "info",
    i18n.t('sectionRemoved')
  );
  computeLayoutData();
};
const copyAnchor = (anchor, event) => {
  try {
    if (window.location.protocol.replace(':', '') === 'http') {
      showToast("", "error", i18n.t('copyAnchorFailed'));
      return;
    }

    navigator.clipboard.writeText(anchor);

    const tooltip = document.createElement("div");
    tooltip.innerText = i18n.t("anchorCopied");
    tooltip.className = "anchor-copied-tooltip";
    document.body.appendChild(tooltip);
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
    setTimeout(() => {
      tooltip.classList.add("copied-opacity-100");
    }, 10);
    setTimeout(() => {
      tooltip.classList.remove("copied-opacity-100");
      setTimeout(() => tooltip.remove(), 300);
    }, 1500);
  } catch {
    showToast("", "error", i18n.t('copyAnchorFailed'));
  }
};
const errorAddingSection = (error) => {
  isModalOpen.value = !error.closeModal;
  showToast(error.title, "error", error.message);
};
const deleteGlobalSectionType = async (sectionTypeName, index) => {
  isDeleteModalOpen.value = false;
  loading.value = true;

  const emit = (event, payload) => nuxtApp.hook(event, () => payload);
  emit("load", true);

  const token = useCookie("sections-auth-token").value;
  const config = {
    headers: sectionHeader({ origin: nuxtApp.$sections.projectUrl, token }),
  };

  const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/global-instances/${sectionTypeName}`;

  try {
    await useApiRequest({
      url: URL,
      method: 'DELETE',
      ...config,
      onSuccess: async (res) => { // Make onSuccess async
        if (res.data) {
          showToast(
            "Success",
            "info",
            res.data.message
          );
          // The splice logic might be incorrect if index refers to the original array before filtering/mapping
          // Consider re-fetching or filtering based on ID instead of index if issues arise.
          // globalTypes.value.splice(index, 1); // Original logic kept for now
          globalTypes.value = []; // Clear and re-fetch seems safer
          await getGlobalSectionTypes(); // Await the fetch
          loading.value = false; // Set loading false after success operations
          emit("load", false); // Emit load false after success operations
        } else {
          loading.value = false;
          emit("load", false);
        }
      },
      onError: (error) => {
        showToast("Error", "error", i18n.t('deleteSectionTypeError') + error.response.data.message);
        loading.value = false;
        emit("load", false);
      }
    });
  } catch {
    loading.value = false;
    emit("load", false);
  }
};
const deleteSectionType = async (sectionTypeName, index) => {
  isDeleteModalOpen.value = false;
  loading.value = true;

  const emit = (event, payload) => nuxtApp.hook(event, () => payload);
  emit("load", true);

  const token = useCookie("sections-auth-token").value;
  const config = {
    headers: sectionHeader({ origin: nuxtApp.$sections.projectUrl, token }),
  };

  const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/section-types/${sectionTypeName}`;

  try {
    await useApiRequest({
      url: URL,
      method: 'DELETE',
      ...config,
      onSuccess: async (res) => { // Make onSuccess async
        if (res.data) {
          showToast(
            "Success",
            "info",
            res.data.message
          );
          // Similar index concern as deleteGlobalSectionType
          // types.value.splice(index, 1); // Original logic
          types.value = []; // Clear and re-fetch seems safer
          globalTypes.value = [];
          await getSectionTypes(); // Await the fetch
          loading.value = false; // Set loading false after success operations
          emit("load", false); // Emit load false after success operations
        } else {
          loading.value = false;
          emit("load", false);
        }
      },
      onError: (error) => {
        showToast("Error", "error", i18n.t('deleteSectionTypeError') + error.response.data.message);
        loading.value = false;
        emit("load", false);
      }
    });
  } catch {
    loading.value = false;
    emit("load", false);
  }
};
const deleteSectionPage = async () => {
  isDeletePageModalOpen.value = false;
  loading.value = true;

  const emit = (event, payload) => nuxtApp.hook(event, () => payload);
  emit("load", true);

  const token = useCookie("sections-auth-token").value;
  const config = {
    headers: sectionHeader({ origin: nuxtApp.$sections.projectUrl, token }),
  };

  const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/page/${pageId.value}`;

  try {
    await useApiRequest({
      url: URL,
      method: 'DELETE',
      ...config,
      onSuccess: (res) => {
        if (res.data) {
          showToast(
            "Success",
            "info",
            res.data.message
          );
          loading.value = false;
          emit("load", false);
          setTimeout(() => window.location.reload(), 1000); // Keep reload if intended
        } else {
          loading.value = false;
          emit("load", false);
        }
      },
      onError: (error) => {
        showToast("Error", "error", i18n.t('deleteSectionPageError') + error.response.data.message);
        loading.value = false;
        emit("load", false);
      }
    });
  } catch {
    loading.value = false;
    emit("load", false);
  }
};
const authorizeSectionType = async (sectionAppId, index) => {
  isDeleteModalOpen.value = false;
  loading.value = true;

  const emit = (event, payload) => nuxtApp.hook(event, () => payload);
  emit("load", true);

  const token = useCookie("sections-auth-token").value;
  const config = {
    headers: sectionHeader({ origin: nuxtApp.$sections.projectUrl, token }),
  };

  const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/authorization_fields/${sectionAppId}`;

  let authorization_fields = {};

  for (let requiredItem of selectedSectionRequirements.value) {
    authorization_fields[requiredItem] = requirementsInputs.value[requiredItem];
  }

  const data = {
    authorization_fields
  };

  try {
    await useApiRequest({
      url: URL,
      method: 'PUT',
      body: data,
      ...config,
      onSuccess: (res) => {
        if (res.data) { // Check if res.data exists, though success implies it should
          showToast(
            "Success",
            "info",
            i18n.t("authorizeSuccess", { appName: selectedAppName.value })
          );
          isAuthModalOpen.value = false;
          requirementsInputs.value = {};
          // Update local state optimistically or re-fetch types
          types.value.filter(type => type.application_id === sectionAppId).forEach(type => {
            type.app_status = "enabled";
          });
          loading.value = false;
          emit("load", false);
        } else {
          loading.value = false;
          emit("load", false);
        }
      },
      onError: (error) => {
        showToast("Error", "error", `${i18n.t('authorizeError')} ${selectedAppName.value}: ` + error.response.data.message);
        loading.value = false;
        emit("load", false);
      }
    });
  } catch {
    loading.value = false;
    emit("load", false);
  }
};
const unAuthorizeSectionType = async (sectionAppId, index) => {
  isDeleteModalOpen.value = false;
  loading.value = true;

  const emit = (event, payload) => nuxtApp.hook(event, () => payload);
  emit("load", true);

  const token = useCookie("sections-auth-token").value;
  const config = {
    headers: sectionHeader({ origin: nuxtApp.$sections.projectUrl, token }),
  };

  const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}`;

  let data = {
    configured_fields: {
      [sectionAppId]: {
        app_status: "disabled"
      }
    }
  };

  try {
    await useApiRequest({
      url: URL,
      method: 'PUT',
      body: data,
      ...config,
      onSuccess: (res) => {
        if (res.data) { // Check if res.data exists
          showToast(
            "Success",
            "info",
            i18n.t("unAuthorizeSuccess", { appName: selectedAppName.value })
          );
          isUnAuthModalOpen.value = false;
          // Update local state optimistically or re-fetch types
          types.value.filter(type => type.application_id === sectionAppId).forEach(type => {
            type.app_status = "disabled";
          });
          loading.value = false;
          emit("load", false);
        } else {
          loading.value = false;
          emit("load", false);
        }
      },
      onError: (error) => {
        showToast("Error", "error", `${i18n.t('unAuthorizeError')} ${selectedAppName.value}: ` + error.response.data.message);
        loading.value = false;
        emit("load", false);
      }
    });
  } catch {
    loading.value = false;
    emit("load", false);
  }
};
const openDeleteSectionTypeModal = (sectionTypeName, index, global) => {
  deletingGlobalInstance.value = global
  selectedSectionTypeName.value = sectionTypeName;
  selectedSectionTypeIndex.value = index;
  isDeleteModalOpen.value = true;
};
const openAuthConfigurableSectionTypeModal = (sectionAppId, index, requirements, sectionTypeName, applicationName) => {
  selectedSectionTypeAppId.value = sectionAppId;
  selectedSectionTypeIndex.value = index;
  selectedSectionRequirements.value = requirements;
  selectedSectionTypeName.value = sectionTypeName;
  selectedAppName.value = applicationName;
  isAuthModalOpen.value = true;
};
const openUnAuthConfigurableSectionTypeModal = (sectionAppId, index, sectionTypeName, applicationName) => {
  selectedSectionTypeAppId.value = sectionAppId;
  selectedSectionTypeIndex.value = index;
  selectedSectionTypeName.value = sectionTypeName;
  selectedAppName.value = applicationName;
  isUnAuthModalOpen.value = true;
};
const openMetaDataModal = () => {
  if (!pageMetadata.value[metadataFormLang.value]) {
    pageMetadata.value[metadataFormLang.value] = {
      title: '',
      description: ''
    }
  }
  currentSection.value = null;
  nextTick(() => {
    metadataModal.value = true;
    isSideBarOpen.value = true;
    sideBarSizeManagement();
  })
}
const openCurrentSection = async (type, global, createSection) => {

  if (createSection) {
    await addNewStaticType(type.name, null, null, createSection)
  }

  if (global === true) {
    currentSection.value = {
      ...types.value.find(t => t.name === type.name),
      ...type,
      name: type.section && type.section.name ? type.section.name : type.name,
      instance_name: type.name,
      instance: type.notCreated === true,
      render_data: type.section && type.section.options && type.section.options[0] ? [{ settings: type.section.options[0] }] : undefined,
      addToPage: type.type === 'configurable' && isCreateInstance.value === false ? true : undefined
    };

    if (!currentSection.value.linked_to) {
      currentSection.value.linked_to = "";
    }

    if (type.type === 'configurable') {
      savedView.value = currentSection.value;
    }
  } else if (type.app_status === 'disbaled' || type.app_status === 'disabled') {
    showToast("Authorisation warning", "warning", i18n.t("authorizeFirst"));
  } else {
    if ((type.type === 'static' || type.type === 'configurable') || createSection) {
      isModalOpen.value = false;
      isSideBarOpen.value = true;

      nextTick(() => {
        try {
          if (createSection && Array.isArray(filteredTypes.value) && filteredTypes.value.length > 0) {
            const foundType = filteredTypes.value.find(t => t.name === type.name)
            if (foundType) {
              currentSection.value = { ...foundType, creation: true, id: 'creation-view' };
            }
          } else {
            currentSection.value = { ...type, creation: true, id: 'creation-view' };
          }
        } catch {
          currentSection.value = { ...type, creation: true, id: 'creation-view' };
        }
        createdView.value = currentSection.value;
        creationView.value = true;
        sideBarSizeManagement();
      })
    } else {
      currentSection.value = { ...type, creation: true };
    }
  }
};
const updateCreationView = (settings) => {
  createdView.value.settings = settings;
  createdView.value = { ...createdView.value };
};
const sideBarSizeManagement = () => {
  try {
    nextTick(() => {
      resizeData.value.parentElement = resizeTarget.value.parentElement;
      resizeData.value.resizeTarget = resizeTarget.value;
      setTimeout(() => {
        if (resizeTarget.value) {
          resizeTarget.value.scrollTo({
            top: 0
          });
        }
        if (sectionsMainTarget.value && currentSection.value) {
          const safeViewAnchor = `#${`${currentSection.value.name}-${currentSection.value.id}`.replace(/ /g, '\\ ')}`;
          const targetElement = sectionsMainTarget.value.querySelector(`[id="${safeViewAnchor.substring(1)}"]`);
          if (targetElement) {
            const targetPosition = targetElement.offsetTop;
            sectionsMainTarget.value.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          } else {
            sectionsMainTarget.value.scrollTo({
              top: sectionsMainTarget.value.scrollHeight,
              behavior: 'smooth'
            });
          }
        }
      }, 600);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", stopTracking);
    });
  } catch {}
};
const startTracking = (event) => {
  if (event.button !== 0) return;

  event.preventDefault();
  const handleElement = event.currentTarget;

  const targetSelector = handleElement.getAttribute("data-target");
  const targetElement = resizeTarget.value.closest(targetSelector);

  if (!targetElement) {
    return;
  }

  resizeData.value.startWidth = targetElement.offsetWidth;
  resizeData.value.startCursorScreenX = event.screenX;
  resizeData.value.resizeTarget = targetElement;
  resizeData.value.maxWidth =
    resizeData.value.parentElement.offsetWidth - resizeData.value.handleWidth;
  resizeData.value.tracking = true;
};
const onMouseMove = (event) => {
  if (!resizeData.value.tracking) return;

  const cursorScreenXDelta =
    event.screenX - resizeData.value.startCursorScreenX;
  const newWidth = Math.min(
    resizeData.value.startWidth + cursorScreenXDelta,
    resizeData.value.maxWidth
  );

  resizeData.value.resizeTarget.style.width = `${newWidth}px`;
};
const stopTracking = () => {
  if (resizeData.value.tracking) {
    resizeData.value.tracking = false;
  }
};
const settingsTabTitle = (tab) => {
  try {
    const builderHooksJavascript = importJs(`/builder/settings/builder-hooks`);
    if (builderHooksJavascript['update_tab_title'] && builderHooksJavascript['update_tab_title'](tab)) {
      return builderHooksJavascript['update_tab_title'](tab);
    } else if (tab === 'page_settings') {
      return i18n.t("Metadata")
    } else {
      return tab
    }
  } catch {
    if (tab === 'page_settings') {
      return i18n.t("Metadata")
    } else {
      return tab
    }
  }
}
const closeMetadataModal = () => {
  const hasUnsavedSettings = updatedPageSettingsTabs.value.some(tab =>
    unsavedSettings(tab)
  );

  if (hasUnsavedSettings) {
    isRestoreSectionOpen.value = true;
  } else {
    metadataModal.value = false;
    isSideBarOpen.value = false;
    metadataFormLang.value = i18n.locale.value.toString();
  }
}
const restoreSectionContent = (metadataModalOpened, sectionsThemeModalOpened) => {
  if (metadataModalOpened === true) {
    metadataModal.value = false;
    isSideBarOpen.value = false;
    isRestoreSectionOpen.value = false;
    updatedPageSettingsTabs.value.forEach(tab => {
      try {
        const builderHooksJavascript = importJs(`/builder/settings/builder-hooks`);
        if (builderHooksJavascript['reset_builder_settings']) {
          const settingsReset = builderHooksJavascript['reset_builder_settings'](originalBuilderSettings.value, tab);
          updatedBuilderSettings.value = settingsReset;
          updatedBuilderSettingsPerTab.value[tab] = settingsReset;
        }
      } catch {}
    })
    metadataFormLang.value = i18n.locale.value.toString();
    unsavedSettingsError.value = {}
    currentSettingsTab.value = "page_settings"

    pageMetadata.value = originalMetaData.value
    pagePath.value = originalMetaData.value.pagePath
    if (pageMetadata.value.pagePath) {
      delete pageMetadata.value.pagePath
    }
  } else if (sectionsThemeModalOpened) {
    sectionsThemeModal.value = false;
    isSideBarOpen.value = false;
    isRestoreSectionOpen.value = false;
    sectionsThemeComponents.value[currentSectionData.value.section.name].forEach(tab => {
      try {
        const builderHooksJavascript = importJs(`/theme/theme-hooks`);
        if (builderHooksJavascript['reset_theme_settings']) {
          const settingsReset = builderHooksJavascript['reset_theme_settings'](originalThemeSettings.value, currentSectionData.value.section, tab.id);
          currentSectionData.value.currentTheme[tab.id] = settingsReset
        }
      } catch {}
    })
    unsavedThemeSettingsError.value = {}
    currentThemeTab.value = {}
    currentSectionData.value = {};
  } else {
    isSideBarOpen.value = false;
    isCreateInstance.value = false;
    isRestoreSectionOpen.value = false;
    if (creationView.value === true) {
      createdView.value = {};
      creationView.value = false;
      if (backToAddSectionList.value === true) {
        backToAddSectionList.value = false;
        currentSection.value = null;
        isModalOpen.value = true;
        savedView.value = {};
        isCreateInstance.value = false;
        isSideBarOpen.value = false;
      }
    } else if (restoreType.value === 'section') {
      restoreSection();
    } else {
      restoreVariations();
    }
  }
};
const restoreSection = () => {
  displayVariations.value[selectedVariation.value].altered = false;

  // In Nuxt 3, we don't need $set anymore, we can directly modify reactive objects
  displayVariations.value[selectedVariation.value].views[currentSection.value.id] =
    updatedVariations.value[selectedVariation.value].views[currentSection.value.id];

  if (selectedLayout.value !== 'standard') {
    try {
      const index = viewsPerRegions.value[selectedSlotRegion.value]
        .findIndex(view => view.id === currentSection.value.id);

      viewsPerRegions.value[selectedSlotRegion.value][index] =
        updatedVariations.value[selectedVariation.value].views[currentSection.value.id];
    } catch {}
  }

  updatedVariations.value = JSON.parse(
    JSON.stringify(displayVariations.value)
  );
  currentViews.value = displayVariations.value[selectedVariation.value].views;
};
const registeredPage = (type) => {
  let path = `/page_components/${type}`;
  // Assuming importComp is a global function or defined elsewhere
  // In Nuxt 3, you might use defineAsyncComponent instead
  return importComp(path).component;
};
const clearSectionsFilters = () => {
  sectionsFilterName.value = '';
  sectionsFilterAppName.value = '';
};
const fire_js = (event_name, event_data) => {
  if (process.client) {
    const event = new CustomEvent(event_name, { detail: event_data });
    window.dispatchEvent(event);
  }
};
const clearCookies = () => {
  useCookie('sections-auth-token').value = null
  useCookie('sections-project-id').value = null
  useCookie('package_name').value = null

  try {
    const hooksJs = importJs(`/js/global-hooks`)
    if (hooksJs && hooksJs['clear_cookies'] && hooksJs['clear_cookies'](useCookie)) {
      return hooksJs['clear_cookies'](useCookie)
    }
  } catch {}
}
const logoutUser = () => {
  clearCookies()
  emit("user-logged-out", [
    projectMetadata.value['selectedCSSPreset'] && projectMetadata.value['selectedCSSPreset'].name && projectMetadata.value['selectedCSSPreset'].name !== 'Other' && projectMetadata.value['selectedCSSPreset'].name !== 'None' ? {
      rel: 'stylesheet',
      href: projectMetadata.value['selectedCSSPreset'].url
    } : projectMetadata.value['selectedCSSPreset'] && projectMetadata.value['selectedCSSPreset'].name && projectMetadata.value['selectedCSSPreset'].name !== 'None' && projectMetadata.value['media'] && projectMetadata.value['media'].url ? {
      rel: 'stylesheet',
      href: projectMetadata.value['media'].url
    } : {},
    pageMetadata.value['media'] && pageMetadata.value['media'].url ? {
      id: 'page-selected-css',
      rel: 'stylesheet',
      href: pageMetadata.value['media'].url
    } : {},
    projectMetadata.value['favicon'] && projectMetadata.value['favicon'].url ? {
      rel: 'icon',
      type: 'image/png',
      href: projectMetadata.value['favicon'].url
    } : {},
  ])
  window.location.reload()
}
const checkIntroLastStep = (topic) => {
  if (useCookie('intro-last-step').value && useCookie('introjs-dontShowAgain').value !== true && useCookie('intro-last-step').value === topic) {
    runIntro(useCookie('intro-last-step').value, true, true)
  }
}
const openSectionThemeModal = (section, themeComponents) => {
  currentThemeTab.value = themeComponents[0]
  currentSectionData.value = {
    section,
    themeComponents,
    currentTheme: {},
    originalTheme: originalThemeSettings.value ?? {}
  };
  currentSection.value = null;
  nextTick(() => {
    sectionsThemeModal.value = true
    isSideBarOpen.value = true
    sideBarSizeManagement();
  })
}
const closeSectionThemeModal = () => {
  const hasUnsavedSettings = sectionsThemeComponents.value[currentSectionData.value.section.name].some(tab =>
    unsavedThemeSettings(tab.id)
  );

  if (hasUnsavedSettings) {
    isRestoreSectionOpen.value = true;
  } else {
    sectionsThemeModal.value = false
    isSideBarOpen.value = false
    currentThemeTab.value = {}
    currentSectionData.value = {};
  }
}
const getDynamicComponent = (component_path) => {
  const path = `${component_path}`;
  return importComp(path).component;
};
const unsavedThemeSettings = (tab) => {
  try {
    const builderHooksJavascript = importJs(`/theme/theme-hooks`);
    if (builderHooksJavascript['handle_unsaved_settings']) {
      unsavedThemeSettingsError.value[tab] = builderHooksJavascript['handle_unsaved_settings'](isEqual, originalThemeSettings.value, currentSectionData.value.currentTheme, tab, currentSectionData.value.section);
    } else {
      unsavedThemeSettingsError.value[tab] = false
    }

    return unsavedThemeSettingsError.value[tab]
  } catch {
    unsavedThemeSettingsError.value[tab] = false
    return false
  }
}
const switchThemeTab = (tab) => {
  currentSectionData.value.originalTheme = originalThemeSettings.value ?? {}
  unsavedThemeSettings(currentThemeTab.value.id)
  currentThemeTab.value = tab
}
const sectionThemeUpdated = (settings) => {
  try {
    const builderHooksJavascript = importJs(`/theme/theme-hooks`);
    if (builderHooksJavascript['theme_settings_payload']) {
      themeSettingsPayload.value = builderHooksJavascript['theme_settings_payload'](originalThemeSettings.value, settings, currentThemeTab.value.id, currentSectionData.value.section);
    }
  } catch {}

  if (!currentSectionData.value.currentTheme[currentThemeTab.value.id]) {
    currentSectionData.value.currentTheme[currentThemeTab.value.id] = {}
  }
  currentSectionData.value.currentTheme[currentThemeTab.value.id][currentSectionData.value.section.id] = settings
}
const updateSectionsThemes = () => {
  updatePageMetaData(false, themeSettingsPayload.value)
}
const themeScrollToSection = () => {
  const section = currentSectionData.value.section

  const id = section.linked_to !== '' && section.linked_to !== undefined
    ? `${section.linked_to}-${section.id}`
    : `${section.name}-${section.id}`

  const target = document.getElementById(id)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

const openMyPage = (page) => {
  router.push(page.path)
}

// Lifecycle hooks
onMounted(async () => {
  computedSEO.value.title = ""
  await fetchData()
  if (admin) {
    await initiateIntroJs();
  }

  if (renderSectionError.value !== "") {
    showToast("Error", "error", renderSectionError.value);
  }
  if (nuxtApp.$sections.cname === "active" && useCookie(`sections-project-id`).value) {
    nuxtApp.$sections.projectId = useCookie(`sections-project-id`).value;
  }
  fire_js("page_payload_postprocess", document.documentElement.outerHTML);

  if (useCookie('introjs-dontShowAgain').value === true) {
    useCookie('intro-last-step').value = null
  }
  if (!pageNotFound.value) {
    checkIntroLastStep('editPage')
  }

  try {
    const hooksJs = importJs('/js/global-hooks') // assuming this is sync
    if (hooksJs?.library_sections_theme_components) {
      const config = hooksJs.library_sections_theme_components(i18n.t)
      if (config && typeof config === 'object' && config.sectionName && config.themeComponents) {
        sectionsThemeComponents.value[config.sectionName] = config.themeComponents
      }
    }
  } catch {}
});

onBeforeMount(() => {
  initializeSectionsCMSEvents();
})

onBeforeUnmount(() => {
  fetchedOnServer.value = false
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", stopTracking);
});

// Watchers
watch(isModalOpen, (value) => {
  const body = document.querySelector("body");
  if (value === true) {
    body.style.overflow = "hidden";
  } else {
    body.style.overflow = "auto";
  }
});

if (serverPageData) {
  fetchedOnServer.value = true;
  if (serverPageData.res) {
    initializeSections(serverPageData.res, true)
  } else if (serverPageData.error) {
    sectionsPageErrorManagement(serverPageData.error, true, true)
  }
}

// Fetch data (initial data loading)
const fetchData = async () => {
  try {
    let hooksJavascript = importJs(`/js/global-hooks`);
    if (hooksJavascript['init_params']) {
      const paramsUpdate = hooksJavascript['init_params'](nuxtApp.$sections, {
        qs: route.query,
        headers: nuxtApp.ssrContext && nuxtApp.ssrContext.event.req ? nuxtApp.ssrContext.event.req.headers : {},
        reqBody: nuxtApp.ssrContext && nuxtApp.ssrContext.event.req ? nuxtApp.ssrContext.event.req.body : {},
        url: nuxtApp.ssrContext && nuxtApp.ssrContext.event.req && nuxtApp.ssrContext.event.req.headers ? nuxtApp.ssrContext.event.req.headers.host : window.location.host
      });
      if (paramsUpdate) {
        nuxtApp.$sections = paramsUpdate;
      }
    }
  } catch {}

  if (admin === true) {
    getAvailableLayouts();
    getAvailableSections();
    metadataFormLang.value = i18n.locale.value.toString();
  }

  if (nuxtApp.$sections.projectLocales && nuxtApp.$sections.projectLocales !== '' && nuxtApp.$sections.projectLocales.includes(',')) {
    translationComponentSupport.value = true;
    locales.value = [];
    locales.value = nuxtApp.$sections.projectLocales.split(',');
    locales.value.forEach(lang => {
      pageMetadata.value[lang] = {
        title: "",
        description: ""
      };
    });
  }

  // We check if this is running in the browser or not
  // because during SSR no cors preflight request is sent
  const inBrowser = process.client;

  let websiteDomain = "";
  const isServer = process.server;

  const scheme = isServer
    ? nuxtApp.ssrContext.event.req.headers['x-forwarded-proto'] || 'http'
    : window.location.protocol.replace(':', '');

  if (inBrowser) {
    websiteDomain = window.location.host;
  } else {
    websiteDomain = nuxtApp.ssrContext.event.req.headers.host;
  }
  sectionsWebsiteDomain.value = websiteDomain;

  nuxtApp.$sections.projectUrl = websiteDomain;

  const token = useCookie("sections-auth-token").value;

  const config = {
    headers: sectionHeader(((inBrowser) ? { token } : {origin: `${scheme}://${websiteDomain}`, token})),
  };

  let URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/page/${parsePath(encodeURIComponent(pageName))}`;

  let payload = {};

  let language = undefined;
  try {
    language = i18n.locale.value;
  } catch {
  }

  if (nuxtApp.$sections.queryStringSupport && nuxtApp.$sections.queryStringSupport === "enabled") {
    let query_string = parseQS(
      encodeURIComponent(pathMatch ? pathMatch : '/'),
      Object.keys(route.query).length !== 0,
      route.query
    );
    payload = {
      query_string: {
        ...query_string,
        language
      }
    };
  }

  let hooksJs = importJs(`/js/global-hooks`);
  if (hooksJs && hooksJs['page_pre_load']) {
    // Call only once and check the result
    const hookResult = hooksJs['page_pre_load'](payload);

    if (hookResult && typeof hookResult === 'object') {
      // Ensure we only take serializable data
      try {
        payload = JSON.parse(JSON.stringify(hookResult));
      } catch {}
    }
  }

  let refetchClientSide = false
  if (hooksJs && hooksJs['refetch_client_side'] && hooksJs['refetch_client_side'](useCookie)) {
    refetchClientSide = hooksJs['refetch_client_side'](useCookie)
  }

  if (sectionsPageData) {
    loading.value = true;
    sectionsError.value = "";
    sectionsMainErrors.value = [];
    const res = sectionsPageData.res;
    const error = sectionsPageData.error;
    if (res) {
      initializeSections(res);
      nuxtApp.callHook('sectionsLoaded', 'pageMounted');
    } else if (error) {
      sectionsPageErrorManagement(error)
    }
  } else if ((inBrowser && fetchedOnServer.value === false) || (inBrowser && refetchClientSide)) {
    loading.value = true;
    sectionsError.value = "";
    sectionsMainErrors.value = [];
    await useApiRequest({
      url: URL,
      method: 'POST',
      body: payload,
      ...config,
      onSuccess: (res) => {
        initializeSections(res);
        nuxtApp.callHook('sectionsLoaded', 'pageMounted');
      },
      onError: (error) => {
        sectionsPageErrorManagement(error)
      }
    });
  } else if (!inBrowser && !serverPageData) {
    loading.value = true;
    sectionsError.value = "";
    sectionsMainErrors.value = [];
    fetchedOnServer.value = true;
    const optionsRes = await fetch(URL, {method: 'OPTIONS', ...config});
    if (optionsRes.status === 200) {
      try {
        await useApiRequest({
          url: URL,
          method: 'POST',
          body: payload,
          ...config,
          onSuccess: (res) => {
            initializeSections(res);
          },
          onError: (error) => {
            sectionsPageErrorManagement(error, true)
          }
        });
      } catch {}
    }
  } else if (serverPageData) {
    if (serverPageData.res) {
      nuxtApp.callHook('page_pre_render', serverPageData.res)
    } else if (serverPageData.error && serverPageData.error.response.status === 404) {
      if (nuxtApp.ssrContext) {
        nuxtApp.ssrContext.event.res.statusCode = 404;
      }
    }
    store.setPageData(null)
  } else {
    loading.value = false;
  }
  await computeLayoutData();
};

onServerPrefetch(async () => {await fetchData()});

// Sections DI / providers
provide('languageSupport', (sectionName) => {
  if (!sectionsQueryStringLanguageSupport.value.includes(sectionName)) {
    sectionsQueryStringLanguageSupport.value.push(sectionName)
  }
})

provide('sectionsThemeComponents', (sectionName, themeComponents) => {
  sectionsThemeComponents.value[sectionName] = themeComponents
})

const scriptLinksArray = ref([])
const scriptPromises = Object.create(null)

function loadScriptWithUniqueness(src, uniqueness = true) {

  function cleanUrl(src) {
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
      const url = new URL(src, base)
      url.search = ''
      url.hash = ''
      return url.toString()
    } catch {
      // fallback if URL constructor fails
      return src.split('#')[0].split('?')[0]
    }
  }

  if (typeof window === 'undefined') return Promise.resolve() // SSR no-op

  const cleaned = cleanUrl(src)
  const key = uniqueness ? cleaned : src // uniqueness ignores query/hash by design

  if (uniqueness) {
    // if already loading/loaded, return same promise (prevents race)
    if (scriptPromises[key]) return scriptPromises[key]

    // track cleaned link once
    if (!scriptLinksArray.value.includes(cleaned)) {
      scriptLinksArray.value.push(cleaned)
    }

    const { load } = useScript(src)
    scriptPromises[key] = load()
      .catch(err => {
        // allow retry on failure
        delete scriptPromises[key]
      })
    return scriptPromises[key]
  }

  // uniqueness = false -> don't check array or cache; still store cleaned (duplicates allowed)
  scriptLinksArray.value.push(cleaned)
  const { load } = useScript(src)
  return load()
}

provide('loadScript', loadScriptWithUniqueness)

if (!useNuxtApp().$sideBarComponent) {
  useNuxtApp().provide('sideBarComponent', {
    show: () => {
      currentSection.value = null;
      nextTick(() => {
        dynamicSideComponent.value = true;
        isSideBarOpen.value = true;
        sideBarSizeManagement();
      })
    },
    hide: () => {
      dynamicSideComponent.value = false;
      isSideBarOpen.value = false;
    },
    setPath: (path) => {
      dynamicSideBarComponentPath.value = path
    }
  })
}

if (!useNuxtApp().$sectionsOptionsComponent) {
  useNuxtApp().provide('sectionsOptionsComponent', {
    setPath: (path) => {
      sectionsOptionsComponentPath.value = path
    }
  })
}

</script>

<style>
.sections-config {
  min-height: 100vh;
}

.sections-config .config-buttons {
  height: max-content;
}

.sections-config .control-button {
  position: fixed;
  z-index: 190;
  left: 0;
  top: 0;
}

.sections-config .control-button.edit-page {
  opacity: 60%;
  min-width: 36px;
  min-height: 36px;
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
  opacity: 60%;
}

.section-view .controls svg {
  cursor: pointer;
  width: 40px;
  height: 40px;
  color: #03b1c7;
  margin: 3px;
}

.section-view .controls svg.settings-icon {
  cursor: pointer;
  width: 15px;
  height: 15px;
  color: #03b1c7;
  margin: 3px;
}

.sections-bg-blue {
  background: #03b1c7;
  color: white;
  border: none;
  outline: none !important;
  transition: 0.2s;
}

.sections-bg-blue:hover {
  background: #0881b3;
  transition: 0.2s;
}

.sections-config button, .section-modal-wrapper .footer button {
  width: auto;
  min-width: auto;
  border-radius: 16px;
  height: auto;
  padding: 6px 8px;
  min-height: auto;
  margin: 10px;
}

.sections-config .config-wrapper button {
  height: 36px;
}

button svg {
  width: 20px;
  height: 20px;
}

button .save-icon svg {
  width: 22px;
  height: 22px;
}

.hp-button {
  outline: none;
  max-width: 1000px;
  display: flex;
  background: #03b1c7;
  border: none;
  color: white;
  align-items: center;
  justify-content: center;
}

.hp-button.pageHasNoChanges {
  opacity: 50%;
  cursor: default;
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

.hp-button:hover .hp-button-label {
  max-width: 200px;
  margin-left: 8px;
}

.hp-button-label {
  max-width: 0;
  overflow: hidden;
  white-space: nowrap;
  margin-left: 0;
  transition: max-width 0.4s ease, margin-left 0.4s ease;
}

.section-wrapper {
  position: relative;
}

.section-wrapper .edit-mode-wrapper {
  align-items: center;
  margin-left: 48px;
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

.sections-no-wrap {
  white-space: nowrap;
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

.pageSettingsModalContainer {
  padding: 20px;
  position: fixed !important;
  inset: 0;
  z-index: 191;
}

.modalContainer {
  padding: 20px;
  position: fixed !important;
  inset: 0;
  z-index: 10;
}

.modalContainer .section-item {
  width: 100%;
  height: 330px;
  margin: 0px;
}

.modalContainer .section-item.active {
  margin: 10px 0px;
  border: 1px solid #03b1c7;
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
  background: #03b1c7;
  color: white;
  position: relative;
}

.modalContainer .section-item-box.global {
  box-shadow: 0 0 0 20px lightgrey;
}

.section-item.section-item-box.addition-empty {
  background: lightgrey;
}

.section-item.section-item-box.addition-empty * {
  visibility: hidden;
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
  color: #03b1c7;
}

.modalContainer
.closeIcon svg:hover {
  color: darken(#03b1c7, 10%);
}

.widthSpace {
  width: 45px;
}

.sections-z-200 {
  z-index: 200;
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
  color: #03b1c7;
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
  color: #03b1c7;
  position: absolute;
  top: 25px;
  right: 10px;
  cursor: pointer;
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
  display: block;
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
  width: 95vw;
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
  text-align: start;
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

.metadataFieldsContainerRow {
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
}

.sectionsFieldsLabelsWrapper {
  max-width: 240px;
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

.sections-config-separator {
  align-content: center;
  border-right: 1px solid #03b1c7;
  margin: 16px 10px;
}

.sections-config button.layout-btn {
  margin-top: 0;
}

.layout-region-wrapper {
  background: white;
  border-radius: 16px;
  padding: 10px;
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
}

.layoutSelect-select {
  appearance: none;
  width: auto;
  background-color: white;
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
  color: #03b1c7;
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
  background-color: #03b1c7;
}

.custom-checkbox input:focus + .slider {
  box-shadow: 0 0 1px #03b1c7;
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
  border: solid 1.5px #03b1c7;
  margin: 2px;
}

.highlighted-regions-plus {
  width: 100%;
  min-height: 20px;
  border: solid 1.5px #03b1c7;
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
  color: #03b1c7;
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

.sections-justify-end {
  justify-content: flex-end;
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
  width: 100%;
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
  max-width: calc(100% - 375px - 3px); /* 375px being the mobile min width and 3px being the width size of the resize handle */
  z-index: 190;
  background: white;
}
.sections-container > .sections-aside-z {
  z-index: 9999999;
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
  color: #03b1c7;
}

.closeIcon.regular svg {
  width: 35px;
  height: 35px;
  color: #03b1c7;
}

.sections-aside
.closeIcon svg:hover {
  color: darken(#03b1c7, 10%);
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
  color: #03b1c7;
}

.sections-aside
.anchorIcon svg:hover {
  color: darken(#03b1c7, 10%);
}

.sections-container > .sections-main {
  order: 0;
  flex: 1 1 auto;
  align-self: auto;
  overflow: auto;
  container: sections-main / inline-size;
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
  color: #03b1c7;
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
  color: #03b1c7;
  margin: 3px;
}
.sections-container .sections-aside .step-back-aside {
  cursor: pointer;
  color: #03b1c7;
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
.copied-opacity-100 {
  opacity: 1 !important;
}
.anchor-copied-tooltip {
  position: fixed;
  background-color: #03b1c7;
  color: white;
  font-size: 0.75rem;
  padding: 0.5rem 0.5rem;
  border-radius: 0.25rem;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  z-index: 50;
  transform: translate(-100%, -100%);
  pointer-events: none;
  white-space: nowrap;
}
.section-view .controls .seo-btn {
  padding: 0rem 0.5rem;
  border: 2px solid #03b1c7;
  border-radius: 4px;
  color: #03b1c7;
  text-align: center;
  align-content: center;
  cursor: pointer;
  height: 40px;
  font-size: 23px;
  transition: background-color 0.3s, color 0.3s;
  margin: 3px;
}
.section-view .controls .seo-btn.enabled {
  background-color: #03b1c7;
  color: white;
}
@media only screen and (max-width: 400px) {
  .sections-aside .component-view {
    width: 350px;
  }
  .sections-aside .component-view-wrapper {
    width: 350px;
  }
}
@media only screen and (max-width: 768px) {
  .section-wrapper .edit-mode-wrapper {
    flex-direction: column-reverse;
  }
  .sections-config .config-buttons {
    flex-direction: column-reverse;
    align-items: center;
  }
  .intro-top-bar {
    flex-direction: column;
    align-items: center;
  }
  .section-wrapper .edit-mode-wrapper {
    margin-left: 0
  }
  .sections-container > .sections-aside {
    min-width: fit-content;
  }
  .sections-aside .component-view .element-type {
    padding-top: 30px;
  }
  .sections-aside .component-view-wrapper {
    width: 410px;
  }
  .metadataFieldsContainerRow {
    flex-direction: column;
  }
  .section-modal-content.page-settings {
    min-width: 320px;
    max-height: 600px;
  }
  .hp-button.danger {
    height: 36px;
  }
}

.page-settings-tabs, .sections-theme-settings-tabs {
  display: flex;
  flex-direction: column;
  width: max-content; /* Adjust as needed */
  border: 1px solid #03b1c7;
  border-radius: 8px;
  font-family: sans-serif;
  margin-bottom: 8px;
}

.page-settings-tab, .sections-theme-settings-tab {
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 8px;
  cursor: pointer;
  border-bottom: 1px solid #03b1c7;
  color: #03b1c7;
  transition: background-color 0.3s, color 0.3s;
}

.page-settings-tab:last-child, .sections-theme-settings-tab:last-child {
  border-bottom: none;
}

/* Optional: Add 'active' style with a class like 'active-tab' */
.page-settings-tab.active-tab, .sections-theme-settings-tab.active-tab {
  background-color: #03b1c7;
  color: white;
  font-weight: bold;
}
.page-settings-tab:first-child.active-tab, .sections-theme-settings-tab:first-child.active-tab {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}
.page-settings-tab:last-child.active-tab, .sections-theme-settings-tab:last-child.active-tab {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
.section-modal-wrapper.sections-themes .closeIcon {
  top: 11px;
}
.dynamic-side-component, .dynamic-side-component-wrapper {
  height: 100%;
}

.my-global-content {
  cursor: pointer;
  text-decoration: underline;
  color: #03B1C7;
  margin-left: 10px;
  width: max-content;
}

.sections-logout-btn {
  background: black;
  font-size: 13px;
  border-radius: 5px;
  padding: 3px 6px;
  margin: 0 10px;
  display: flex;
  align-items: center;
}

.sections-popup-title {
  font-size: 24px;
}

@media screen and (max-width: 768px) {
  .sections-container .component-view {
    margin: 0;
    width: 100%;
  }
  .sections-container>aside.sections-aside {
    min-width: 100%;
  }
  aside.sections-aside .component-view-wrapper {
    width: auto;
  }
  .section-types-tabs, .type-items.content-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: start;
    gap: 10px;
  }
  .section-types-filter {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .section-modal-content {
    padding: 10px;
    width: 100%;
  }
  .modalContainer .closeIcon, .modalContainer .closeIcon svg {
    height: 25px;
    width: 25px;
    right: 0;
  }
  .selectSectionType {
    width: 100%;
    padding-top: 15px;
  }
  .translationWrapper {
    margin: 10px 0 0 0 !important;
  }
  main.sections-main .input.wyzywig-wrapper {
    margin: 0 !important;
  }
  .modalContainer.prime, .inner-modal-conatiner {
    padding: 0;
  }
  .intro-available-sections {
    margin-top: 20px;
  }
  .top-bar-wrapper {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .top-bar-page-content-wrapper {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .layout-region-wrapper {
    flex-wrap: wrap;
  }
  .sections-config-separator {
    display: none;
  }
}
</style>
