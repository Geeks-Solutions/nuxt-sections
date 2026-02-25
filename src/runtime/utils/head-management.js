const HEAD_ARRAY_KEYS = ['meta', 'link', 'style', 'script', 'noscript']
const HEAD_OBJECT_KEYS = ['htmlAttrs', 'bodyAttrs']
const ROOT_HEAD_KEYS = ['title', 'titleTemplate', 'base', ...HEAD_ARRAY_KEYS, ...HEAD_OBJECT_KEYS]
const PROJECT_CSS_PRIORITY = 59
const PAGE_CSS_PRIORITY = 60
const MANAGED_LINK_SLOT_BY_KEY = {
  'sections-project-css': 'project-css',
  'sections-page-css': 'page-css',
  'sections-page-css-with-project': 'page-css',
  'sections-favicon': 'favicon',
}
const MANAGED_LINK_SLOT_BY_ID = {
  'project-css-stylesheet': 'project-css',
  'page-selected-css': 'page-css',
}

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== ''

const mergeObject = (baseValue, updateValue) => ({
  ...(isObject(baseValue) ? baseValue : {}),
  ...(isObject(updateValue) ? updateValue : {}),
})

const getManagedLinkSlot = (link = {}) => {
  if (!isObject(link)) {
    return ''
  }

  if (link.key && MANAGED_LINK_SLOT_BY_KEY[link.key]) {
    return MANAGED_LINK_SLOT_BY_KEY[link.key]
  }

  if (link.id && MANAGED_LINK_SLOT_BY_ID[link.id]) {
    return MANAGED_LINK_SLOT_BY_ID[link.id]
  }

  return ''
}

const getLinkSignature = (link = {}) =>
  [
    link.rel || '',
    link.href || '',
    link.media || '',
    link.type || '',
    link.as || '',
    link.crossorigin || '',
  ].join('|')

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

  const sanitizedLinks = []
  const seenManagedSlots = new Set()
  const seenManagedSignatures = new Set()
  const seenGenericSignatures = new Set()

  for (const link of links) {
    if (!isObject(link) || !isNonEmptyString(link.href)) {
      continue
    }

    const managedSlot = getManagedLinkSlot(link)
    const signature = getLinkSignature(link)

    if (managedSlot) {
      if (seenManagedSlots.has(managedSlot)) {
        continue
      }

      seenManagedSlots.add(managedSlot)
      seenManagedSignatures.add(signature)
      sanitizedLinks.push(link)
      continue
    }

    if (seenManagedSignatures.has(signature) || seenGenericSignatures.has(signature)) {
      continue
    }

    seenGenericSignatures.add(signature)
    sanitizedLinks.push(link)
  }

  return sanitizedLinks
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
    key: 'sections-project-css',
    id: 'project-css-stylesheet',
    rel: 'stylesheet',
    tagPriority: PROJECT_CSS_PRIORITY,
    tagDuplicateStrategy: 'replace',
    href,
  }
}

const getPageStylesheetKey = (projectMetadata = {}) =>
  getProjectCSSHref(projectMetadata) ? 'sections-page-css-with-project' : 'sections-page-css'

export const buildPageStylesheetLink = (pageMetadata = {}, projectMetadata = {}) => {
  const href = pageMetadata?.media?.url
  if (!isNonEmptyString(href)) {
    return null
  }

  return {
    key: getPageStylesheetKey(projectMetadata),
    id: 'page-selected-css',
    rel: 'stylesheet',
    tagPriority: PAGE_CSS_PRIORITY,
    tagDuplicateStrategy: 'replace',
    href,
  }
}

export const buildFaviconLink = (projectMetadata = {}) => {
  const href = projectMetadata?.favicon?.url
  if (!isNonEmptyString(href)) {
    return null
  }

  return {
    key: 'sections-favicon',
    rel: 'icon',
    type: 'image/png',
    tagDuplicateStrategy: 'replace',
    href,
  }
}

export const buildSectionsLinks = (
  projectMetadata = {},
  pageMetadata = {},
  customLinks = [],
  options = {}
) => {
  const includeProjectStylesheet = options.includeProjectStylesheet !== false
  const includePageStylesheet = options.includePageStylesheet !== false
  const includeFavicon = options.includeFavicon !== false

  const links = []

  if (includeProjectStylesheet) {
    const projectStylesheet = buildProjectStylesheetLink(projectMetadata)
    if (projectStylesheet) {
      links.push(projectStylesheet)
    }
  }

  if (includePageStylesheet) {
    const pageStylesheet = buildPageStylesheetLink(pageMetadata, projectMetadata)
    if (pageStylesheet) {
      links.push(pageStylesheet)
    }
  }

  if (includeFavicon) {
    const favicon = buildFaviconLink(projectMetadata)
    if (favicon) {
      links.push(favicon)
    }
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
  includeProjectStylesheet = true,
  includePageStylesheet = true,
  includeFavicon = true,
} = {}) => {
  const effectiveMetadata = buildEffectiveMetadata(projectMetadata, pageMetadata, {}, previewState)
  const previewLinks = Array.isArray(effectiveMetadata.head?.link)
    ? effectiveMetadata.head.link
    : []

  return buildSectionsLinks(
    effectiveMetadata.projectMetadata,
    effectiveMetadata.pageMetadata,
    previewLinks,
    {
      includeProjectStylesheet,
      includePageStylesheet,
      includeFavicon,
    }
  )
}

export const buildSectionsHeadConfig = ({
  locale = 'en',
  computedSEO = {},
  projectMetadata = {},
  pageMetadata = {},
  fullURL = '',
  previewState = {},
  includeProjectStylesheet = true,
  includePageStylesheet = true,
  includeFavicon = true,
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
      Array.isArray(effectiveMetadata.head?.link) ? effectiveMetadata.head.link : [],
      {
        includeProjectStylesheet,
        includePageStylesheet,
        includeFavicon,
      }
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
