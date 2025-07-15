<template>
  <SectionsAdmin
    v-if="admin"
    :server-page-data="serverPageData"
    :page-name="pageName"
    :admin="admin"
    :variations="variations"
    :headers="headers"
    :reactive-trigger="reactiveTrigger"
    :lang="lang"
    :editor-options="editorOptions"
    :views-bg-color="viewsBgColor"
    :_sections-options="_sectionsOptions"
    :sections-page-data="sectionsPageData"
  ></SectionsAdmin>
  <div v-else class="sections-container">
    <main ref="sectionsMainTarget" class="sections-main">
      <div class="sections-config sections-justify-center">
        <div v-if="!pageNotFound">
          <div v-if="selectedLayout === 'standard'" class="views">
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
                  :class="{ [view.name]: true }"
                >
                  <div class="section-view relativeSections">
                    <div class="view-component"
                         :style="{ background: viewsBgColor }">
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
              <template v-for="slotName in layoutSlotNames" v-slot:[slotName]>
                <!-- Empty div injected to verify the slots              -->
                <div class="flexSections flex-col">
                  <div :id="`sections-slot-region-${selectedLayout}-${slotName}`"></div>
                  <div class="views">
                    <draggable
                      v-model="alteredViewsPerRegions[slotName]"
                      group="people"
                      @start="drag = true; highlightRegions = true;"
                      @end="drag = false; highlightRegions = false;"
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
                          :class="{ [view.name]: true, 'highlited-regions': highlightRegions }"
                        >
                          <div class="section-view relativeSections">
                            <div class="view-component"
                                 :style="{ background: viewsBgColor }">
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
                </div>
              </template>
            </component>
          </div>
        </div>
        <div v-else>
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
</template>

<script setup>
import {useSectionsDataStore} from "../../stores/sectionsDataStore.js";
import {
  computed,
  getSectionProjectIdentity,
  importComp,
  importJs,
  navigateTo,
  onBeforeUnmount,
  onMounted,
  onBeforeMount,
  onServerPrefetch,
  parsePath,
  parseQS,
  ref,
  provide,
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
  useState, validateQS
} from '#imports';

const {
  pageName,
  admin,
  variations,
  lang,
  viewsBgColor,
  sectionsPageData
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
  }
});
const emit = defineEmits(['load']);
const store = useSectionsDataStore()
const nuxtApp = useNuxtApp();
const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const localePath = useLocalePath()
const config = useRuntimeConfig();

const locales = ref(['en', 'fr']);
const translationComponentSupport = ref(true);
const sectionInPage = ref([]);
const pageNotFound = useState('pageNotFound', () => false);
const selectedVariation = ref(pageName);
const editMode = ref(false);
const sectionsQsKeys = useState('sectionsQsKeys', () => ([]));
const loading = useState('loading', () =>false);
const sectionsMainTarget = ref(null)
const currentSettingsTab = ref("page_settings");
const displayVariations = useState('displayVariations', () => ({
  [pageName]: {
    name: pageName,
    views: {},
    altered: false,
  },
}));
const sectionsPageLastUpdated = useState('sectionsPageLastUpdated', () => null);
const allSections = useState('allSections', () => ({}));
const pageId = ref("");
const pagePath = useState('pagePath', () => "");
const sectionsPageName = ref("");
const pageMetadata = useState('pageMetadata', () => ({}));
const projectMetadata = ref({});
const sectionsError = useState('sectionsError', () => "");
const sectionsErrorOptions = ref(null);
const renderSectionError = useState("renderSectionError", () => "");
const computedSEO = useState("computedSEO", () => ({
  title: '',
  description: '',
  image: ''
}));
const layoutSlotNames = ref([]);
const selectedLayout = useState('selectedLayout', () => 'standard');
const originalMetaData = useState('originalMetaData', () => {});
const originalBuilderSettings = useState('originalBuilderSettings', () => {});
const viewsPerRegions = ref({});
const sectionsLayout = ref('standard');
const errorInLayout = ref(false);
const errorInViews = ref(false);
const highlightRegions = ref(false);
const sectionsMainErrors = useState('sectionsMainErrors', () => ([]));
const sectionsLayoutErrors = ref([]);
const selectedLanguages = ref([]);
const defaultLang = useState('defaultLang', () => 'en');
const errorResponseStatus = useState('errorResponseStatus', () => (0));
const errorRegisteredPage = useState('errorRegisteredPage', () => (''));
const errorResponseData = useState('errorResponseData', () => null);
const sectionOptions = ref({});
const sectionsWebsiteDomain = ref('');
const pageData = useState('pageData', () => null);
const drag = ref(false);
const fetchedOnServer = useState('fetchedOnServer', () => false);
const pathMatch = Array.isArray(route.params.pathMatch)
  ? route.params.pathMatch.join('/')
  : route.params.pathMatch || ''

const seoSectionsSupport = ref({})

const sectionsQueryStringLanguageSupport = ref([])

const originalThemeSettings = ref({})

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
const initializeSectionsCMSEvents = () => {
  if (!window.SectionsCMS) {
    window.SectionsCMS = ref({})
    window.SectionsCMS.value.reRenderSection = (data) => refreshSectionView('SectionView', data)
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
    locales.value = projectMetadata.value['languages'];
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
    originalBuilderSettings.value = res.data.metadata.project_metadata
    try {
      const builderHooksJavascript = importJs(`/builder/settings/builder-hooks`);
      if (builderHooksJavascript['initialize_builder_settings']) {
        builderHooksJavascript['initialize_builder_settings'](originalBuilderSettings.value, useHead, currentSettingsTab.value);
      }
    } catch {}
  }

  if (res.data.metadata && res.data.metadata.sections_builder) {
    console.log("GOT HERE", res.data.metadata.sections_builder)
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
      views["test"] = section
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
  selectedVariation.value = activeVariation.value.pageName
  loading.value = false

  // In Nuxt 3, we use emit from defineEmits()
  // This would need to be passed through from the parent component
  // For now, I'll comment it out
  emit("load", false)

  sectionsPageLastUpdated.value = res.data.last_updated
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
const sanitizeURL = async () => {
  const updatedQuery = { ...route.query }
  delete updatedQuery.auth_code
  delete updatedQuery.project_id
  await router.replace({path: useRoute().path, query: updatedQuery})
}
const checkToken = async () => {
  const auth_code = route.query.auth_code

  const date = new Date()
  date.setDate(date.getDate() + 14)
  date.setHours(date.getHours() - 4)

  if (nuxtApp.$sections.cname === "active") {
    if (useCookie("sections-project-id").value) {
      nuxtApp.$sections.projectId = useCookie("sections-project-id").value
    } else {
      const project_id = route.query.project_id
      nuxtApp.$sections.projectId = project_id
      useCookie("sections-project-id", {
        expires: date,
        path: '/'
      }).value = project_id
    }
  }

  if (auth_code) {
    const config = {
      headers: sectionHeader({}),
    }

    const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/token/${auth_code}`

    try {
      await useApiRequest({
        url: URL,
        method: 'GET',
        ...config, // Assuming config contains headers etc.
        onSuccess: async (res) => {
          const token = res.data.token // Assuming the token is in res.data.token

          useCookie("sections-auth-token", {
            expires: date,
            path: '/'
          }).value = token

          await sanitizeURL()
          loading.value = false
        },
        onError: (err) => {
          loading.value = false
          renderSectionError.value = err.response?.data?.token
        }
      });
    } catch {
       loading.value = false
    }
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
const trackSectionComp = (sectionName, sectionType) => {
  if (!sectionInPage.value.includes(sectionName)) {
    sectionInPage.value.push(sectionName)
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
const registeredPage = (type) => {
  let path = `/page_components/${type}`;
  // Assuming importComp is a global function or defined elsewhere
  // In Nuxt 3, you might use defineAsyncComponent instead
  return importComp(path).component;
};
const fire_js = (event_name, event_data) => {
  if (process.client) {
    const event = new CustomEvent(event_name, { detail: event_data });
    window.dispatchEvent(event);
  }
};

// Lifecycle hooks
onMounted(async () => {
  computedSEO.value.title = ""
  await fetchData()

  if ((errorResponseStatus.value === 429 && sectionsError.value !== "") || sectionsError.value !== "" && !registeredPage(errorResponseStatus.value === 404 ? 'page_not_found' : 'project_not_found')) {
    showToast("Error", "error", i18n.t('loadPageError') + sectionsError.value, sectionsErrorOptions.value);
  }
  if (renderSectionError.value !== "") {
    showToast("Error", "error", renderSectionError.value);
  }
  if (nuxtApp.$sections.cname === "active" && useCookie(`sections-project-id`).value) {
    nuxtApp.$sections.projectId = useCookie(`sections-project-id`).value;
  }
  fire_js("page_payload_postprocess", document.documentElement.outerHTML);
});

onBeforeMount(() => {
  initializeSectionsCMSEvents();
})

onBeforeUnmount(() => {
  fetchedOnServer.value = false
});

const serverPageData = store.getPageData
if (serverPageData) {
  fetchedOnServer.value = true;
  if (serverPageData.res && !admin) {
    initializeSections(serverPageData.res, true)
  } else if (serverPageData.error && !admin) {
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

  if (isServer && !admin) {
    await checkToken();
  } else {
    const auth_code = route.query.auth_code
    if (auth_code) {
      await sanitizeURL()
    }
  }

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

  const config = {
    headers: sectionHeader(((inBrowser) ? {} : {origin: `${scheme}://${websiteDomain}`})),
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
  if (sectionsPageData && !admin) {
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
  } else if (inBrowser && fetchedOnServer.value === false) {
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
    if (!admin) {
      store.setPageData(null);
    }
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

</script>
