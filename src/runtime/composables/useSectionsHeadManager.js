import { computed, ref, useHead } from '#imports'
import {
  buildSectionsHeadConfig,
  buildSectionsLinksWithPreview,
  createHeadPreviewState,
  mergeHeadPreviewState,
} from '../utils/head-management.js'

const resolveHeadOwnership = (isHeadOwner) => {
  if (typeof isHeadOwner === 'boolean') {
    return isHeadOwner
  }

  if (isHeadOwner && typeof isHeadOwner === 'object' && 'value' in isHeadOwner) {
    return !!isHeadOwner.value
  }

  return !!isHeadOwner
}

const resolveFullURL = (nuxtApp, route) => {
  const fullPath = typeof route?.fullPath === 'string' ? route.fullPath : ''

  if (import.meta.server) {
    const headers = nuxtApp?.ssrContext?.event?.req?.headers || {}
    const protocol = headers['x-forwarded-proto'] || 'http'
    const host = headers.host || ''
    return `${protocol}://${host}${fullPath}`
  }

  return `${window.location.origin}${fullPath}`
}

export const useSectionsHeadManager = ({
  projectMetadata,
  pageMetadata,
  computedSEO,
  i18n,
  route,
  nuxtApp,
  isHeadOwner = true,
}) => {
  const headPreviewState = ref(createHeadPreviewState())

  const hasHeadOwnership = computed(() => resolveHeadOwnership(isHeadOwner))

  const setHeadPreview = (payload = {}) => {
    headPreviewState.value = mergeHeadPreviewState(headPreviewState.value, payload)
  }

  const resetHeadPreview = () => {
    headPreviewState.value = createHeadPreviewState()
  }

  const applyHead = (headInput = {}) => {
    useHead(headInput)
  }

  const buildLogoutLinks = ({
    includeProjectStylesheet = true,
    includePageStylesheet = true,
    includeFavicon = true,
  } = {}) =>
    buildSectionsLinksWithPreview({
      projectMetadata: projectMetadata.value,
      pageMetadata: pageMetadata.value,
      previewState: headPreviewState.value,
      includeProjectStylesheet,
      includePageStylesheet,
      includeFavicon,
    })

  useHead(() => {
    if (!hasHeadOwnership.value) {
      return {}
    }

    return buildSectionsHeadConfig({
      locale: i18n.locale.value,
      computedSEO: computedSEO.value,
      projectMetadata: projectMetadata.value,
      pageMetadata: pageMetadata.value,
      fullURL: resolveFullURL(nuxtApp, route),
      previewState: headPreviewState.value,
    })
  })

  return {
    applyHead,
    buildLogoutLinks,
    hasHeadOwnership,
    headPreviewState,
    resetHeadPreview,
    setHeadPreview,
  }
}
