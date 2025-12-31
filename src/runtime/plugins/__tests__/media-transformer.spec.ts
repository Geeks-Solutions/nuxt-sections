import { describe, it, expect, vi } from 'vitest'

// Mock #app
vi.mock('#app', () => ({
  defineNuxtPlugin: (plugin) => plugin,
}))

import mediaTransformerPlugin from '../media-transformer'

// Mock helpers
vi.mock('../../utils/helpers', () => ({
  importJs: vi.fn(),
}))

import { importJs } from '../../utils/helpers'

describe('media-transformer plugin', () => {
  it('provides mediaURLTransformer if hook exists', async () => {
    const mockTransformer = vi.fn()
    vi.mocked(importJs).mockReturnValue({
      media_transform: mockTransformer,
    })

    const nuxtApp = {
      vueApp: {
        provide: vi.fn(),
      },
    }

    await mediaTransformerPlugin(nuxtApp)

    expect(importJs).toHaveBeenCalledWith('/js/global-hooks')
    expect(nuxtApp.vueApp.provide).toHaveBeenCalledWith(
      Symbol.for('mediaURLTransformer'),
      mockTransformer
    )
  })

  it('does not provide anything if hook is missing', async () => {
    vi.mocked(importJs).mockReturnValue({})

    const nuxtApp = {
      vueApp: {
        provide: vi.fn(),
      },
    }

    await mediaTransformerPlugin(nuxtApp)

    expect(importJs).toHaveBeenCalledWith('/js/global-hooks')
    expect(nuxtApp.vueApp.provide).not.toHaveBeenCalled()
  })
})
