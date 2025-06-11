import {
  defineNuxtRouteMiddleware, getSectionProjectIdentity, parsePath, parseQS, sectionHeader, useApiRequest, abstractPathLanguage,
  useNuxtApp,
  useState
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
      language = app.$i18n.locale.value;
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
              let localization
              if (abstractedDefaultLocale && app.$i18n.availableLocales.includes(abstractedDefaultLocale)) {
                localization = abstractedDefaultLocale
              } else {
                localization = res.data.metadata.project_metadata.defaultLang
              }
              defaultLocale.value = localization
              app.$i18n.locale.value = defaultLocale.value
              await app.$i18n.setLocale(defaultLocale.value)
            }
            store.setPageData({
              res
            })
          },
          onError: (error) => {
            store.setPageData({
              error
            })
          }
        });
      } catch {}
    }
  } else {
    if (!abstractedDefaultLocale || (abstractedDefaultLocale && !app.$i18n.availableLocales.includes(abstractedDefaultLocale)) && from.fullPath === to.fullPath) {
      app.$i18n.locale.value = defaultLocale.value
      await app.$i18n.setLocale(defaultLocale.value)
    }
  }
})
