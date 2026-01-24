import { describe, it, expect, vi, beforeEach } from 'vitest'
import mediaTransformerPlugin from '../media-transformer'

vi.mock('../../utils/helpers', () => ({
  importJs: vi.fn(),
}))

import { importJs } from '../../utils/helpers'

describe('media-transformer plugin', () => {
  let mockTransformer: any
  let mockNuxtApp: any

  beforeEach(() => {
    mockTransformer = vi.fn((url: string) => url)
    mockNuxtApp = {
      vueApp: {
        provide: vi.fn(),
      },
    }
  })

  it('provides mediaURLTransformer if hook exists', async () => {
    vi.mocked(importJs).mockReturnValue({
      media_transform: mockTransformer,
    })

    await mediaTransformerPlugin(mockNuxtApp)

    expect(importJs).toHaveBeenCalledWith('/js/global-hooks')
    expect(mockNuxtApp.vueApp.provide).toHaveBeenCalledWith(
      Symbol.for('mediaURLTransformer'),
      mockTransformer
    )
  })

  it('does not provide anything if hook is missing', async () => {
    vi.mocked(importJs).mockReturnValue({})

    await mediaTransformerPlugin(mockNuxtApp)

    expect(importJs).toHaveBeenCalledWith('/js/global-hooks')
    expect(mockNuxtApp.vueApp.provide).not.toHaveBeenCalled()
  })

  it('handles errors gracefully if importJs fails', async () => {
    vi.mocked(importJs).mockImplementation(() => {
      throw new Error('Failed to load hooks')
    })

    await expect(mediaTransformerPlugin(mockNuxtApp)).resolves.not.toThrow()
    expect(mockNuxtApp.vueApp.provide).not.toHaveBeenCalled()
  })

  it('provides the actual transformer function, not a wrapper', async () => {
    const customTransformer = (url: string) => url + '?transformed=true'
    vi.mocked(importJs).mockReturnValue({
      media_transform: customTransformer,
    })

    await mediaTransformerPlugin(mockNuxtApp)

    const calls = mockNuxtApp.vueApp.provide.mock.calls
    const transformerSymbol = calls[0][0]
    const transformerFunction = calls[0][1]

    expect(transformerFunction).toBe(customTransformer)
    expect(transformerFunction('test.jpg')).toBe('test.jpg?transformed=true')
  })
})
