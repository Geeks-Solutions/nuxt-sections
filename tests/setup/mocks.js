function importJs(path) {
  const jsHooks = {
    '/sections/js/global-hooks.js': {
      available_locales: () => ['en', 'de', 'fr', 'es'],
      init_params: vi.fn((sections, params) => ({
        ...sections,
        modified: true
      })),
      page_pre_load: vi.fn((payload) => ({
        ...payload,
        preloaded: true
      }))
    }
  }

  try {
    return jsHooks[`/sections${path}.js`] || ''
  } catch (e) {
    return ''
  }
}

function abstractPathLanguage(finalPath) {
  let availableLocales
  let matchedLocale

  try {
    const hooksJavascript = globalThis.importJs('/js/global-hooks')
    if (hooksJavascript && hooksJavascript['available_locales']) {
      availableLocales = hooksJavascript['available_locales']()
    }
  } catch {
    availableLocales = []
  }

  if (availableLocales.length > 0) {
    matchedLocale = availableLocales.find((locale) =>
      decodeURIComponent(finalPath) === `${locale}` || decodeURIComponent(finalPath).startsWith(`${locale}/`)
    )

    if (matchedLocale) {
      finalPath = encodeURIComponent(decodeURIComponent(finalPath).slice(matchedLocale.length))

      if (decodeURIComponent(finalPath).startsWith('/')) {
        finalPath = encodeURIComponent(decodeURIComponent(finalPath).slice(1))
      }

      if (!finalPath) {
        finalPath = encodeURIComponent('/')
      }
    }
  }

  return {
    path: finalPath,
    matchedLocale
  }
}

function parsePath(path) {
  let finalPath = path
  const decodedPath = decodeURIComponent(path)

  if (decodedPath.includes('=')) {
    const parsed0 = decodedPath.substring(0, decodedPath.indexOf('='))
    const parsed1 = parsed0.substring(0, parsed0.lastIndexOf('/'))
    finalPath = parsed1 ? encodeURIComponent(parsed1) : encodeURIComponent('/')
  }

  finalPath = globalThis.abstractPathLanguage(finalPath).path

  return finalPath
}

function getSectionProjectIdentity() {
  return 'test-project-id'
}

// Register globally
globalThis.importJs = importJs
globalThis.abstractPathLanguage = abstractPathLanguage
globalThis.parsePath = parsePath
globalThis.getSectionProjectIdentity = getSectionProjectIdentity

