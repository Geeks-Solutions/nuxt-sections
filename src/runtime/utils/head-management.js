const HEAD_ARRAY_KEYS = ['meta', 'link', 'style', 'script', 'noscript']
const HEAD_OBJECT_KEYS = ['htmlAttrs', 'bodyAttrs']
const ROOT_HEAD_KEYS = ['title', 'titleTemplate', 'base', ...HEAD_ARRAY_KEYS, ...HEAD_OBJECT_KEYS]

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== ''

const mergeObject = (baseValue, updateValue) => ({
  ...(isObject(baseValue) ? baseValue : {}),
  ...(isObject(updateValue) ? updateValue : {}),
})

const mergeMetadata = (baseValue = {}, updateValue = {}) => {
  const mergedValue = { ...(isObject(baseValue) ? baseValue : {}) }

  if (!isObject(updateValue)) {
    return mergedValue
  }

  for (const key of Object.keys(updateValue)) {
    const currentValue = mergedValue[key]
    const nextValue = updateValue[key]

    if (isObject(currentValue) && isObject(nextValue)) {
      mergedValue[key] = {
        ...currentValue,
        ...nextValue,
      }
    } else {
      mergedValue[key] = nextValue
    }
  }

  return mergedValue
}

export const createHeadPreviewState = () => ({
  projectMetadata: {},
  pageMetadata: {},
  computedSEO: {},
  head: {},
})

export const sanitizeHeadLinks = (links = []) => {
  if (!Array.isArray(links)) {
    return []
  }

  return links.filter((link) => isObject(link) && isNonEmptyString(link.href))
}

export const getProjectCSSHref = (projectMetadata = {}) => {
  const selectedCSSPreset = projectMetadata?.selectedCSSPreset

  if (
    selectedCSSPreset &&
    selectedCSSPreset.name &&
    selectedCSSPreset.name !== 'Other' &&
    selectedCSSPreset.name !== 'None' &&
    isNonEmptyString(selectedCSSPreset.url)
  ) {
    return selectedCSSPreset.url
  }

  if (
    selectedCSSPreset &&
    selectedCSSPreset.name &&
    selectedCSSPreset.name !== 'None' &&
    projectMetadata?.media &&
    isNonEmptyString(projectMetadata.media.url)
  ) {
    return projectMetadata.media.url
  }

  return ''
}

export const buildProjectStylesheetLink = (projectMetadata = {}) => {
  const href = getProjectCSSHref(projectMetadata)
  if (!href) {
    return null
  }

  return {
    id: 'project-css-stylesheet',
    rel: 'stylesheet',
    href,
  }
}

export const buildPageStylesheetLink = (pageMetadata = {}) => {
  const href = pageMetadata?.media?.url
  if (!isNonEmptyString(href)) {
    return null
  }

  return {
    id: 'page-selected-css',
    rel: 'stylesheet',
    href,
  }
}

export const buildFaviconLink = (projectMetadata = {}) => {
  const href = projectMetadata?.favicon?.url
  if (!isNonEmptyString(href)) {
    return null
  }

  return {
    rel: 'icon',
    type: 'image/png',
    href,
  }
}

export const buildSectionsLinks = (projectMetadata = {}, pageMetadata = {}, customLinks = []) => {
  const links = []

  const projectStylesheet = buildProjectStylesheetLink(projectMetadata)
  if (projectStylesheet) {
    links.push(projectStylesheet)
  }

  const pageStylesheet = buildPageStylesheetLink(pageMetadata)
  if (pageStylesheet) {
    links.push(pageStylesheet)
  }

  const favicon = buildFaviconLink(projectMetadata)
  if (favicon) {
    links.push(favicon)
  }

  if (Array.isArray(customLinks)) {
    links.push(...customLinks)
  }

  return sanitizeHeadLinks(links)
}

export const buildSectionsMetaTags = (computedSEO = {}, fullURL = '') => {
  const title = computedSEO?.title || ''
  const description = computedSEO?.description || ''

  let imageContent = ''
  if (computedSEO?.image) {
    imageContent = computedSEO.image.url ? computedSEO.image.url : computedSEO.image
  }

  const meta = [
    description
      ? {
          hid: 'description',
          name: 'description',
          content: description,
        }
      : null,
    { hid: 'og:title', property: 'og:title', content: title },
    description
      ? {
          hid: 'og:description',
          property: 'og:description',
          content: description,
        }
      : null,
    imageContent
      ? {
          hid: 'og:image',
          property: 'og:image',
          content: imageContent,
        }
      : null,
    { hid: 'og:url', property: 'og:url', content: fullURL },
  ]

  return meta.filter(Boolean)
}

const mergeHeadPatch = (baseHeadPatch = {}, updateHeadPatch = {}) => {
  const mergedHeadPatch = { ...(isObject(baseHeadPatch) ? baseHeadPatch : {}) }

  if (!isObject(updateHeadPatch)) {
    return mergedHeadPatch
  }

  for (const key of Object.keys(updateHeadPatch)) {
    const value = updateHeadPatch[key]
    if (value === undefined || value === null) {
      continue
    }

    if (HEAD_ARRAY_KEYS.includes(key)) {
      const valuesArray = Array.isArray(value) ? value : [value]
      mergedHeadPatch[key] =
        key === 'link' ? sanitizeHeadLinks(valuesArray) : valuesArray.filter(Boolean)
      continue
    }

    if (HEAD_OBJECT_KEYS.includes(key)) {
      mergedHeadPatch[key] = mergeObject(mergedHeadPatch[key], value)
      continue
    }

    mergedHeadPatch[key] = value
  }

  return mergedHeadPatch
}

const normalizeHeadPreviewPayload = (payload = {}) => {
  if (!isObject(payload)) {
    return createHeadPreviewState()
  }

  const metadataPatch = isObject(payload.metadata) ? payload.metadata : {}
  const projectPatch = isObject(payload.projectMetadata)
    ? payload.projectMetadata
    : isObject(payload.project)
      ? payload.project
      : {}
  const pagePatch = isObject(payload.pageMetadata)
    ? payload.pageMetadata
    : isObject(payload.page)
      ? payload.page
      : {}
  const seoPatch = isObject(payload.computedSEO)
    ? payload.computedSEO
    : isObject(payload.seo)
      ? payload.seo
      : {}

  let headPatch = {}
  if (isObject(payload.head)) {
    headPatch = payload.head
  } else if (isObject(payload.headConfig)) {
    headPatch = payload.headConfig
  } else {
    const rootHeadPatch = {}
    ROOT_HEAD_KEYS.forEach((key) => {
      if (payload[key] !== undefined && payload[key] !== null) {
        rootHeadPatch[key] = payload[key]
      }
    })
    headPatch = rootHeadPatch
  }

  return {
    projectMetadata: {
      ...metadataPatch,
      ...projectPatch,
    },
    pageMetadata: pagePatch,
    computedSEO: seoPatch,
    head: headPatch,
  }
}

export const mergeHeadPreviewState = (currentState = {}, payload = {}) => {
  const state = isObject(currentState) ? currentState : createHeadPreviewState()
  const update = normalizeHeadPreviewPayload(payload)

  return {
    projectMetadata: mergeMetadata(state.projectMetadata, update.projectMetadata),
    pageMetadata: mergeMetadata(state.pageMetadata, update.pageMetadata),
    computedSEO: mergeMetadata(state.computedSEO, update.computedSEO),
    head: mergeHeadPatch(state.head, update.head),
  }
}

export const mergeHeadConfig = (baseHead = {}, extraHead = {}) => {
  const mergedHead = { ...(isObject(baseHead) ? baseHead : {}) }

  if (!isObject(extraHead)) {
    return mergedHead
  }

  for (const key of Object.keys(extraHead)) {
    const value = extraHead[key]
    if (value === undefined || value === null) {
      continue
    }

    if (HEAD_ARRAY_KEYS.includes(key)) {
      const baseValue = Array.isArray(mergedHead[key]) ? mergedHead[key] : []
      const valueArray = Array.isArray(value) ? value : [value]
      const mergedArray = [...baseValue, ...valueArray].filter(Boolean)
      mergedHead[key] = key === 'link' ? sanitizeHeadLinks(mergedArray) : mergedArray
      continue
    }

    if (HEAD_OBJECT_KEYS.includes(key)) {
      mergedHead[key] = mergeObject(mergedHead[key], value)
      continue
    }

    mergedHead[key] = value
  }

  return mergedHead
}

const buildEffectiveMetadata = (
  projectMetadata = {},
  pageMetadata = {},
  computedSEO = {},
  previewState = {}
) => {
  const normalizedPreview = mergeHeadPreviewState(createHeadPreviewState(), previewState)

  return {
    projectMetadata: mergeMetadata(projectMetadata, normalizedPreview.projectMetadata),
    pageMetadata: mergeMetadata(pageMetadata, normalizedPreview.pageMetadata),
    computedSEO: mergeMetadata(computedSEO, normalizedPreview.computedSEO),
    head: normalizedPreview.head,
  }
}

export const buildSectionsLinksWithPreview = ({
  projectMetadata = {},
  pageMetadata = {},
  previewState = {},
} = {}) => {
  const effectiveMetadata = buildEffectiveMetadata(projectMetadata, pageMetadata, {}, previewState)
  const previewLinks = Array.isArray(effectiveMetadata.head?.link)
    ? effectiveMetadata.head.link
    : []

  return buildSectionsLinks(
    effectiveMetadata.projectMetadata,
    effectiveMetadata.pageMetadata,
    previewLinks
  )
}

export const buildSectionsHeadConfig = ({
  locale = 'en',
  computedSEO = {},
  projectMetadata = {},
  pageMetadata = {},
  fullURL = '',
  previewState = {},
} = {}) => {
  const effectiveMetadata = buildEffectiveMetadata(
    projectMetadata,
    pageMetadata,
    computedSEO,
    previewState
  )

  const baseHead = {
    htmlAttrs: {
      lang: locale,
    },
    title: effectiveMetadata.computedSEO.title || '',
    meta: buildSectionsMetaTags(effectiveMetadata.computedSEO, fullURL),
    link: buildSectionsLinks(
      effectiveMetadata.projectMetadata,
      effectiveMetadata.pageMetadata,
      Array.isArray(effectiveMetadata.head?.link) ? effectiveMetadata.head.link : []
    ),
  }

  const extraHead = { ...(effectiveMetadata.head || {}) }
  delete extraHead.link

  return mergeHeadConfig(baseHead, extraHead)
}

export const runHookWithHeadPreview = (hook, args = [], setHeadPreview = () => {}) => {
  if (typeof hook !== 'function') {
    return undefined
  }

  if (hook.length > args.length) {
    return hook(...args, setHeadPreview)
  }

  return hook(...args)
}
