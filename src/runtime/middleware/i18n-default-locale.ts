// This file defines a Nuxt route middleware responsible for:
// - Loading and preparing section data on server-side render (SSR)
// - Managing localization and query strings
// - Executing optional hooks for preprocessing data
// - Storing the loaded page data into Pinia store (`sectionsDataStore`)

// import {
//   defineNuxtRouteMiddleware,
//   getSectionProjectIdentity,   // Gets the current section project identity
//   parsePath,                   // Encodes a path string to be used safely in a URL
//   parseQS,                     // Constructs a query string for the request
//   sectionHeader,               // Prepares necessary headers for the request
//   useApiRequest,               // Custom API request utility
//   abstractPathLanguage,       // Extracts locale info from a given path
//   useNuxtApp,
//   useState,
//   importJs,
//   useCookie                    // Dynamic JS module importer
// } from "#imports";

import { useSectionsDataStore } from "../stores/sectionsDataStore"; // Pinia store for managing page data

export default defineNuxtRouteMiddleware(async (to, from) => {
  const app: any = useNuxtApp();
  const defaultLocale = useState('defaultLocale', () => app.$i18n.locale.value);

  const route = to;

  // Resolve the full path from route parameters
  const pathMatch = Array.isArray(route.params.pathMatch)
    ? route.params.pathMatch.join('/')
    : route.params.pathMatch || '';
  const pageName = pathMatch || '/';

  // Get locale if the path has a language prefix (e.g., /en/page)
  const abstractedDefaultLocale = abstractPathLanguage(pageName).matchedLocale;

  const store = useSectionsDataStore();

  // Server-side logic
  if (import.meta.server && !store.getPageData && !to.fullPath.endsWith('/health') && !to.fullPath.endsWith('/admin')) {
    let hooksJs;

    // Dynamically load global hooks (e.g., for custom section logic)
    try {
      hooksJs = importJs(`/js/global-hooks`);

      // If an init hook is defined, allow it to modify section params before request
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

    // Detect protocol and domain from headers
    const scheme = app.ssrContext.event.req.headers['x-forwarded-proto'] || 'http';
    const websiteDomain = app.ssrContext.event.req.headers.host;

    const token: any = useCookie("sections-auth-token").value;

    // Prepare API headers
    const config = {
      headers: sectionHeader(({ origin: `${scheme}://${websiteDomain}`, token })),
    };

    // Construct the endpoint URL to load section page data
    let URL = `${app.$sections.serverUrl}/project/${getSectionProjectIdentity()}/page/${parsePath(encodeURIComponent(pageName))}`;

    let payload: any = {};

    // Add detected language to the payload if available
    let language;
    try {
      language = abstractedDefaultLocale ? abstractedDefaultLocale : undefined;
    } catch {}

    // If query string support is enabled, prepare it for the request payload
    if (app.$sections.queryStringSupport === "enabled") {
      const query_string = parseQS(encodeURIComponent(pathMatch || '/'), Object.keys(route.query).length !== 0, route.query);
      payload = {
        query_string: {
          ...query_string,
          language
        }
      };
    }

    // Call page_pre_load hook if defined to alter or enhance the payload
    if (hooksJs && hooksJs['page_pre_load']) {
      const hookResult = hooksJs['page_pre_load'](payload);

      if (hookResult && typeof hookResult === 'object') {
        try {
          payload = JSON.parse(JSON.stringify(hookResult)); // Ensure payload is serializable
        } catch {}
      }
    }

    // Setup i18n localization
    const setupLocalization = async (lang: string) => {
      if (lang) {
        defaultLocale.value = lang;
      }
      let localization;
      if (abstractedDefaultLocale && app.$i18n.availableLocales.includes(abstractedDefaultLocale)) {
        localization = abstractedDefaultLocale;
      } else if (lang) {
        localization = lang;
      }
      if (localization) {
        app.$i18n.locale.value = localization;
        await app.$i18n.setLocale(localization);
      }
    };

    // Perform preflight check using OPTIONS method
    const optionsRes = await fetch(URL, { method: 'OPTIONS', ...config });
    if (optionsRes.status === 200) {
      try {
        // Load page data using POST with the constructed payload
        await useApiRequest({
          url: URL,
          method: 'POST',
          body: payload,
          ...config,
          onSuccess: async (res) => {
            // On success, set locale and store data
            if (res.data.metadata.project_metadata && res.data.metadata.project_metadata.defaultLang) {
              await setupLocalization(res.data.metadata.project_metadata.defaultLang)
            } else {
              await setupLocalization('')
            }
            store.setPageData({
              res
            })
          },
          onError: async (error) => {
            // On error, still try to set locale and store error
            if (error.response && error.response.data && error.response.data.options && error.response.data.options.project_metadata && error.response.data.options.project_metadata.defaultLang) {
              await setupLocalization(error.response.data.options.project_metadata.defaultLang)
            } else {
              await setupLocalization('')
            }
            store.setPageData({
              error
            })
          }
        });
      } catch {}
    }
  } else {
    // Client-side locale setup (based on abstracted or default locale)
    if (abstractedDefaultLocale && app.$i18n.availableLocales.includes(abstractedDefaultLocale)) {
      app.$i18n.locale.value = abstractedDefaultLocale;
      await app.$i18n.setLocale(abstractedDefaultLocale);
    } else {
      app.$i18n.locale.value = defaultLocale.value;
      await app.$i18n.setLocale(defaultLocale.value);
    }
  }
})
