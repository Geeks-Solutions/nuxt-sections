import {
  defineNuxtRouteMiddleware,
  getSectionProjectIdentity,
  parsePath,
  parseQS,
  sectionHeader,
  useApiRequest,
  abstractPathLanguage,
  useNuxtApp,
  useState,
  importJs
} from "#imports";
import {useSectionsDataStore} from "../stores/sectionsDataStore";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const app: any = useNuxtApp()
  const defaultLocale = useState('defaultLocale', () => app.$i18n.locale.value);

  const route = to

  const pathMatch = Array.isArray(route.params.pathMatch)
    ? route.params.pathMatch.join('/')
    : route.params.pathMatch || ''
  const pageName = pathMatch || '/'

  const abstractedDefaultLocale = abstractPathLanguage(pageName).matchedLocale

  if (import.meta.server) {

    let hooksJs
    try {
      hooksJs = importJs(`/js/global-hooks`);
      if (hooksJs['init_params']) {
        const paramsUpdate = hooksJs['init_params'](app.$sections, {
          qs: route.query,
          headers: app.ssrContext && app.ssrContext.event.req ? app.ssrContext.event.req.headers : {},
          reqBody: app.ssrContext && app.ssrContext.event.req ? app.ssrContext.event.req.body : {},
          url: app.ssrContext && app.ssrContext.event.req && app.ssrContext.event.req.headers ? app.ssrContext.event.req.headers.host : window.location.host
        });
        if (paramsUpdate) {
          app.$sections = paramsUpdate;
        }
      }
    } catch {}

    const store = useSectionsDataStore()

    const scheme = app.ssrContext.event.req.headers['x-forwarded-proto'] || 'http';

    const websiteDomain = app.ssrContext.event.req.headers.host;

    const config = {
      headers: sectionHeader(({origin: `${scheme}://${websiteDomain}`})),
    };

    let URL = `${app.$sections.serverUrl}/project/${getSectionProjectIdentity()}/page/${parsePath(encodeURIComponent(pageName))}`;

    let payload : any = {};

    let language;
    try {
      language = abstractedDefaultLocale ? abstractedDefaultLocale : undefined;
    } catch {}

    if (app.$sections.queryStringSupport === "enabled") {
      const query_string = parseQS(encodeURIComponent(pathMatch || '/'), Object.keys(route.query).length !== 0, route.query);
      payload = {
        query_string: {
          ...query_string,
          language
        }
      };
    }

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

    const setupLocalization = async (lang: string) => {
      defaultLocale.value = lang
      let localization
      if (abstractedDefaultLocale && app.$i18n.availableLocales.includes(abstractedDefaultLocale)) {
        localization = abstractedDefaultLocale
      } else {
        localization = lang
      }
      app.$i18n.locale.value = localization
      await app.$i18n.setLocale(localization)
    }

    const optionsRes = await fetch(URL, {method: 'OPTIONS', ...config});
    if (optionsRes.status === 200) {
      try {
        await useApiRequest({
          url: URL,
          method: 'POST',
          body: payload,
          ...config,
          onSuccess: async (res) => {
            if (res.data.metadata.project_metadata && res.data.metadata.project_metadata.defaultLang) {
              await setupLocalization(res.data.metadata.project_metadata.defaultLang)
            }
            store.setPageData({
              res
            })
          },
          onError: async (error) => {
            if (error.response && error.response.data && error.response.data.options && error.response.data.options.project_metadata && error.response.data.options.project_metadata.defaultLang) {
              await setupLocalization(error.response.data.options.project_metadata.defaultLang)
            }
            store.setPageData({
              error
            })
          }
        });
      } catch {}
    }
  } else {
    if (abstractedDefaultLocale && app.$i18n.availableLocales.includes(abstractedDefaultLocale)) {
      app.$i18n.locale.value = abstractedDefaultLocale
      await app.$i18n.setLocale(abstractedDefaultLocale)
    } else {
      app.$i18n.locale.value = defaultLocale.value
      await app.$i18n.setLocale(defaultLocale.value)
    }
  }
})
