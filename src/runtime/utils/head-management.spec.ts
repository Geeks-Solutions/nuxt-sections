import { describe, expect, it, vi } from 'vitest'
import {
  buildSectionsHeadConfig,
  buildSectionsLinks,
  buildSectionsLinksWithPreview,
  createHeadPreviewState,
  mergeHeadPreviewState,
  runHookWithHeadPreview,
} from './head-management.js'

describe('head-management', () => {
  it('keeps project stylesheet before page stylesheet', () => {
    const links = buildSectionsLinks(
      {
        selectedCSSPreset: {
          name: 'Preset',
          url: 'https://cdn.example.com/project.css',
        },
        media: {
          url: 'https://cdn.example.com/project-fallback.css',
        },
        favicon: {
          url: 'https://cdn.example.com/favicon.png',
        },
      },
      {
        media: {
          url: 'https://cdn.example.com/page.css',
        },
      }
    )

    expect(links.map((link) => link.href)).toEqual([
      'https://cdn.example.com/project.css',
      'https://cdn.example.com/page.css',
      'https://cdn.example.com/favicon.png',
    ])
    expect(links[0].id).toBe('project-css-stylesheet')
    expect(links[1].id).toBe('page-selected-css')
  })

  it('falls back to project media when selected preset is Other', () => {
    const links = buildSectionsLinks(
      {
        selectedCSSPreset: {
          name: 'Other',
          url: 'https://cdn.example.com/preset.css',
        },
        media: {
          url: 'https://cdn.example.com/project-fallback.css',
        },
      },
      {
        media: {
          url: 'https://cdn.example.com/page.css',
        },
      }
    )

    expect(links.map((link) => link.href)).toEqual([
      'https://cdn.example.com/project-fallback.css',
      'https://cdn.example.com/page.css',
    ])
  })

  it('filters invalid links to avoid empty tags in DOM', () => {
    const links = buildSectionsLinks(
      {
        selectedCSSPreset: {
          name: 'Preset',
          url: '',
        },
        media: {
          url: '',
        },
        favicon: {
          url: '   ',
        },
      },
      {
        media: {
          url: '',
        },
      },
      [{ rel: 'stylesheet' }, { rel: 'preconnect', href: '' }]
    )

    expect(links).toEqual([])
  })

  it('supports preview metadata and head patch for all supported head fields', () => {
    const previewState = mergeHeadPreviewState(createHeadPreviewState(), {
      projectMetadata: {
        selectedCSSPreset: {
          name: 'PreviewPreset',
          url: 'https://cdn.example.com/preview-project.css',
        },
      },
      pageMetadata: {
        media: {
          url: 'https://cdn.example.com/preview-page.css',
        },
      },
      computedSEO: {
        title: 'Preview Title',
        description: 'Preview Description',
      },
      head: {
        titleTemplate: '%s | Preview',
        htmlAttrs: {
          dir: 'rtl',
        },
        bodyAttrs: {
          class: 'preview-body',
        },
        style: [{ children: 'body{color:red}' }],
        script: [{ src: 'https://cdn.example.com/app.js' }],
        noscript: [{ children: 'Enable Javascript' }],
        meta: [{ name: 'x-preview', content: 'enabled' }],
        link: [{ rel: 'preconnect', href: 'https://cdn.example.com' }],
      },
    })

    const head: any = buildSectionsHeadConfig({
      locale: 'fr',
      computedSEO: {
        title: 'Base Title',
        description: '',
      },
      projectMetadata: {
        selectedCSSPreset: {
          name: 'Preset',
          url: 'https://cdn.example.com/base-project.css',
        },
      },
      pageMetadata: {
        media: {
          url: 'https://cdn.example.com/base-page.css',
        },
      },
      fullURL: 'https://example.com/test',
      previewState,
    })

    expect(head.title).toBe('Preview Title')
    expect(head.titleTemplate).toBe('%s | Preview')
    expect(head.htmlAttrs).toEqual({ lang: 'fr', dir: 'rtl' })
    expect(head.bodyAttrs).toEqual({ class: 'preview-body' })

    expect(head.link.map((link: any) => link.href)).toEqual([
      'https://cdn.example.com/preview-project.css',
      'https://cdn.example.com/preview-page.css',
      'https://cdn.example.com',
    ])

    expect(head.meta).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'og:title', content: 'Preview Title' }),
        expect.objectContaining({ property: 'og:description', content: 'Preview Description' }),
        expect.objectContaining({ name: 'x-preview', content: 'enabled' }),
      ])
    )
    expect(head.style).toEqual([{ children: 'body{color:red}' }])
    expect(head.script).toEqual([{ src: 'https://cdn.example.com/app.js' }])
    expect(head.noscript).toEqual([{ children: 'Enable Javascript' }])
  })

  it('builds logout links using preview-aware state', () => {
    const links = buildSectionsLinksWithPreview({
      projectMetadata: {
        selectedCSSPreset: {
          name: 'Preset',
          url: 'https://cdn.example.com/project.css',
        },
      },
      pageMetadata: {
        media: {
          url: 'https://cdn.example.com/page.css',
        },
      },
      previewState: {
        head: {
          link: [{ rel: 'preload', href: 'https://cdn.example.com/font.woff2' }],
        },
      },
    })

    expect(links.map((link) => link.href)).toEqual([
      'https://cdn.example.com/project.css',
      'https://cdn.example.com/page.css',
      'https://cdn.example.com/font.woff2',
    ])
  })

  it('replaces project css when updated multiple times', () => {
    let previewState = createHeadPreviewState()

    previewState = mergeHeadPreviewState(previewState, {
      projectMetadata: {
        selectedCSSPreset: {
          name: 'Preset',
          url: 'https://cdn.example.com/project-v1.css',
        },
      },
    })

    previewState = mergeHeadPreviewState(previewState, {
      projectMetadata: {
        selectedCSSPreset: {
          name: 'Preset',
          url: 'https://cdn.example.com/project-v2.css',
        },
      },
    })

    const head: any = buildSectionsHeadConfig({
      locale: 'en',
      computedSEO: {},
      projectMetadata: {
        selectedCSSPreset: {
          name: 'Preset',
          url: 'https://cdn.example.com/project-base.css',
        },
      },
      pageMetadata: {},
      fullURL: 'https://example.com',
      previewState,
    })

    const projectStylesheets = head.link.filter((link: any) => link.id === 'project-css-stylesheet')

    expect(projectStylesheets).toHaveLength(1)
    expect(projectStylesheets[0].href).toBe('https://cdn.example.com/project-v2.css')
  })

  it('replaces page css when updated multiple times', () => {
    let previewState = createHeadPreviewState()

    previewState = mergeHeadPreviewState(previewState, {
      pageMetadata: {
        media: {
          url: 'https://cdn.example.com/page-v1.css',
        },
      },
    })

    previewState = mergeHeadPreviewState(previewState, {
      pageMetadata: {
        media: {
          url: 'https://cdn.example.com/page-v2.css',
        },
      },
    })

    const head: any = buildSectionsHeadConfig({
      locale: 'en',
      computedSEO: {},
      projectMetadata: {},
      pageMetadata: {
        media: {
          url: 'https://cdn.example.com/page-base.css',
        },
      },
      fullURL: 'https://example.com',
      previewState,
    })

    const pageStylesheets = head.link.filter((link: any) => link.id === 'page-selected-css')

    expect(pageStylesheets).toHaveLength(1)
    expect(pageStylesheets[0].href).toBe('https://cdn.example.com/page-v2.css')
  })

  it('passes setHeadPreview only when hook arity expects it', () => {
    const setHeadPreview = vi.fn()
    const legacyHook = vi.fn((a: string, b: string) => `${a}-${b}`)
    const hookDeclaringPreviewArg = vi.fn((a: string, b: string, preview: unknown) => preview)

    runHookWithHeadPreview(legacyHook, ['a', 'b'], setHeadPreview)
    expect(legacyHook).toHaveBeenCalledWith('a', 'b')

    const returnedPreview = runHookWithHeadPreview(
      hookDeclaringPreviewArg,
      ['a', 'b'],
      setHeadPreview
    )

    expect(hookDeclaringPreviewArg).toHaveBeenCalledWith('a', 'b', setHeadPreview)
    expect(returnedPreview).toBe(setHeadPreview)
  })
})
