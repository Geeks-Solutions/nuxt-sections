import { describe, expect, it, vi } from 'vitest'
import { createHead, renderDOMHead } from 'unhead/client'
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
    expect(links[0].key).toBe('sections-project-css')
    expect(links[1].key).toBe('sections-page-css-with-project')
    expect(links[0].tagPriority).toBe(59)
    expect(links[1].tagPriority).toBe(60)
    expect(links[2].key).toBe('sections-favicon')
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

  it('can disable managed css/favicon links while keeping custom links', () => {
    const head: any = buildSectionsHeadConfig({
      locale: 'en',
      computedSEO: {},
      projectMetadata: {
        selectedCSSPreset: {
          name: 'Preset',
          url: 'https://cdn.example.com/project.css',
        },
        favicon: {
          url: 'https://cdn.example.com/favicon.png',
        },
      },
      pageMetadata: {
        media: {
          url: 'https://cdn.example.com/page.css',
        },
      },
      fullURL: 'https://example.com/no-managed-css',
      previewState: {
        head: {
          link: [{ rel: 'preconnect', href: 'https://cdn.example.com' }],
        },
      },
      includeProjectStylesheet: false,
      includePageStylesheet: false,
      includeFavicon: false,
    })

    expect(head.link).toEqual([{ rel: 'preconnect', href: 'https://cdn.example.com' }])
  })

  it('deduplicates page css when a hook injects the same stylesheet', () => {
    const links = buildSectionsLinks(
      {
        selectedCSSPreset: {
          name: 'Preset',
          url: 'https://cdn.example.com/project.css',
        },
      },
      {
        media: {
          url: 'https://cdn.example.com/page.css',
        },
      },
      [
        {
          rel: 'stylesheet',
          href: 'https://cdn.example.com/page.css',
        },
        {
          id: 'page-selected-css',
          rel: 'stylesheet',
          href: 'https://cdn.example.com/page.css',
        },
      ]
    )

    const pageStylesheets = links.filter(
      (link) => link.rel === 'stylesheet' && link.href === 'https://cdn.example.com/page.css'
    )

    expect(pageStylesheets).toHaveLength(1)
    expect(pageStylesheets[0].id).toBe('page-selected-css')
    expect(pageStylesheets[0].key).toBe('sections-page-css-with-project')
  })

  it('keeps a single page css link when page and project css are added together', async () => {
    const doc = document.implementation.createHTMLDocument('head-add-both-test')
    const head = createHead({ document: doc })

    const headEntry = head.push({
      link: buildSectionsLinks(
        {
          selectedCSSPreset: {
            name: 'Preset',
            url: 'data:text/css,body%7Bcolor%3A%23000%7D',
          },
        },
        {
          media: {
            url: 'data:text/css,body%7Bfont-size%3A14px%7D',
          },
        },
        [
          {
            rel: 'stylesheet',
            href: 'data:text/css,body%7Bfont-size%3A14px%7D',
          },
        ]
      ),
    })

    await renderDOMHead(head)

    const stylesheets = Array.from(doc.head.querySelectorAll('link[rel="stylesheet"]'))
    const orderedStylesheetIds = stylesheets
      .filter((link) => link.id === 'project-css-stylesheet' || link.id === 'page-selected-css')
      .map((link) => link.id)
    const pageStylesheets = stylesheets.filter((link) => link.id === 'page-selected-css')

    expect(orderedStylesheetIds).toEqual(['project-css-stylesheet', 'page-selected-css'])
    expect(pageStylesheets).toHaveLength(1)

    headEntry.dispose()
  })

  it('keeps project css before page css across preview to save transitions', async () => {
    const doc = document.implementation.createHTMLDocument('head-ordering-test')
    const head = createHead({ document: doc })

    const headEntry = head.push({
      link: buildSectionsLinks(
        {},
        {
          media: {
            url: 'data:text/css,body%7Bbackground%3A%23fff%7D',
          },
        }
      ),
    })

    await renderDOMHead(head)

    headEntry.patch({
      link: buildSectionsLinks(
        {
          selectedCSSPreset: {
            name: 'Preset',
            url: 'data:text/css,body%7Bcolor%3A%23000%7D',
          },
        },
        {
          media: {
            url: 'data:text/css,body%7Bfont-size%3A14px%7D',
          },
        }
      ),
    })

    await renderDOMHead(head)

    headEntry.patch({
      link: buildSectionsLinks(
        {
          selectedCSSPreset: {
            name: 'Preset',
            url: 'data:text/css,body%7Bcolor%3A%23111%7D',
          },
          favicon: {
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgP8qYqQAAAAASUVORK5CYII=',
          },
        },
        {
          media: {
            url: 'data:text/css,body%7Bfont-size%3A15px%7D',
          },
        }
      ),
    })

    await renderDOMHead(head)

    const stylesheets = Array.from(doc.head.querySelectorAll('link[rel="stylesheet"]'))
    const orderedStylesheetIds = stylesheets
      .filter((link) => link.id === 'project-css-stylesheet' || link.id === 'page-selected-css')
      .map((link) => link.id)

    expect(orderedStylesheetIds).toEqual(['project-css-stylesheet', 'page-selected-css'])

    const projectStylesheets = stylesheets.filter((link) => link.id === 'project-css-stylesheet')
    const pageStylesheets = stylesheets.filter((link) => link.id === 'page-selected-css')

    expect(projectStylesheets).toHaveLength(1)
    expect(projectStylesheets[0].getAttribute('href')).toBe(
      'data:text/css,body%7Bcolor%3A%23111%7D'
    )

    expect(pageStylesheets).toHaveLength(1)
    expect(pageStylesheets[0].getAttribute('href')).toBe('data:text/css,body%7Bfont-size%3A15px%7D')

    headEntry.patch({
      link: buildSectionsLinks(
        {
          selectedCSSPreset: {
            name: 'Preset',
            url: 'data:text/css,body%7Bcolor%3A%23111%7D',
          },
          favicon: {
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8zw8AAoMBgR3fMckAAAAASUVORK5CYII=',
          },
        },
        {
          media: {
            url: 'data:text/css,body%7Bfont-size%3A15px%7D',
          },
        }
      ),
    })

    await renderDOMHead(head)

    const favicons = Array.from(doc.head.querySelectorAll('link[rel="icon"]'))

    expect(favicons).toHaveLength(1)
    expect(favicons[0].getAttribute('href')).toBe(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8zw8AAoMBgR3fMckAAAAASUVORK5CYII='
    )

    headEntry.dispose()
  })

  it('keeps project css before page css when preview metadata adds project css', async () => {
    const doc = document.implementation.createHTMLDocument('head-preview-metadata-ordering-test')
    const head = createHead({ document: doc })

    let previewState = createHeadPreviewState()

    const headEntry = head.push(
      buildSectionsHeadConfig({
        locale: 'en',
        computedSEO: {},
        projectMetadata: {},
        pageMetadata: {
          media: {
            url: 'data:text/css,body%7Bfont-size%3A14px%7D',
          },
        },
        fullURL: 'https://example.com/preview-ordering',
        previewState,
      })
    )

    await renderDOMHead(head)

    previewState = mergeHeadPreviewState(previewState, {
      projectMetadata: {
        selectedCSSPreset: {
          name: 'Preset',
          url: 'data:text/css,body%7Bcolor%3A%23000%7D',
        },
      },
    })

    headEntry.patch(
      buildSectionsHeadConfig({
        locale: 'en',
        computedSEO: {},
        projectMetadata: {},
        pageMetadata: {
          media: {
            url: 'data:text/css,body%7Bfont-size%3A14px%7D',
          },
        },
        fullURL: 'https://example.com/preview-ordering',
        previewState,
      })
    )

    await renderDOMHead(head)

    const stylesheets = Array.from(doc.head.querySelectorAll('link[rel="stylesheet"]'))
    const orderedStylesheetIds = stylesheets
      .filter((link) => link.id === 'project-css-stylesheet' || link.id === 'page-selected-css')
      .map((link) => link.id)

    expect(orderedStylesheetIds).toEqual(['project-css-stylesheet', 'page-selected-css'])

    const projectStylesheets = stylesheets.filter((link) => link.id === 'project-css-stylesheet')
    const pageStylesheets = stylesheets.filter((link) => link.id === 'page-selected-css')

    expect(projectStylesheets).toHaveLength(1)
    expect(pageStylesheets).toHaveLength(1)

    headEntry.dispose()
  })

  it('avoids duplicate page css when parent and admin entries are both mounted', async () => {
    const doc = document.implementation.createHTMLDocument('head-parent-admin-test')
    const head = createHead({ document: doc })

    const parentEntry = head.push(
      buildSectionsHeadConfig({
        locale: 'en',
        computedSEO: {},
        projectMetadata: {},
        pageMetadata: {
          media: {
            url: 'data:text/css,body%7Bfont-size%3A14px%7D',
          },
        },
        fullURL: 'https://example.com/parent-entry',
        includeProjectStylesheet: false,
        includePageStylesheet: false,
        includeFavicon: false,
      })
    )

    const adminEntry = head.push(
      buildSectionsHeadConfig({
        locale: 'en',
        computedSEO: {},
        projectMetadata: {},
        pageMetadata: {
          media: {
            url: 'data:text/css,body%7Bfont-size%3A14px%7D',
          },
        },
        fullURL: 'https://example.com/admin-entry',
      })
    )

    await renderDOMHead(head)

    adminEntry.patch(
      buildSectionsHeadConfig({
        locale: 'en',
        computedSEO: {},
        projectMetadata: {
          selectedCSSPreset: {
            name: 'Preset',
            url: 'data:text/css,body%7Bcolor%3A%23000%7D',
          },
        },
        pageMetadata: {
          media: {
            url: 'data:text/css,body%7Bfont-size%3A14px%7D',
          },
        },
        fullURL: 'https://example.com/admin-entry',
      })
    )

    await renderDOMHead(head)

    const stylesheets = Array.from(doc.head.querySelectorAll('link[rel="stylesheet"]'))
    const orderedStylesheetIds = stylesheets
      .filter((link) => link.id === 'project-css-stylesheet' || link.id === 'page-selected-css')
      .map((link) => link.id)
    const pageStylesheets = stylesheets.filter((link) => link.id === 'page-selected-css')

    expect(orderedStylesheetIds).toEqual(['project-css-stylesheet', 'page-selected-css'])
    expect(pageStylesheets).toHaveLength(1)

    parentEntry.dispose()
    adminEntry.dispose()
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
    expect(pageStylesheets[0].key).toBe('sections-page-css')
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
