import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useNuxtApp } from '#app'
import MediaComponent from '../../src/runtime/components/Medias/MediaComponent.vue'
import Editor from '../../src/runtime/components/Editor/wysiwyg.vue'

const { hooks } = vi.hoisted(() => ({ hooks: {} as Record<string, any> }))
vi.mock('~/src/runtime/utils/helpers.js', async (importOriginal) => ({
  ...(await importOriginal<Record<string, any>>()),
  importJs: vi.fn(() => hooks),
}))

const wrappers: any[] = []
beforeEach(() => {
  Object.keys(hooks).forEach((key) => Reflect.deleteProperty(hooks, key))
  Object.assign(useNuxtApp().$sections as Record<string, any>, {
    projectId: 'hook-project',
    serverUrl: 'https://cms.example',
  })
})
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()))

const mount = async (component: any): Promise<any> => {
  const wrapper = await mountSuspended(component, {
    props: component === Editor ? { html: '' } : {},
    global: { stubs: { gMedia: true, gWysiwyg: true } },
  })
  wrappers.push(wrapper)
  return wrapper
}

describe('optional media hooks', () => {
  it('evaluates modal URLs once and passes the project ID value', async () => {
    hooks.medias_api_url = vi.fn(() => ({ mediasUri: 'https://custom.example/media' }))
    const wrapper = await mount(MediaComponent)
    expect(hooks.medias_api_url).toHaveBeenCalledTimes(1)
    expect(hooks.medias_api_url.mock.calls[0][1]).toBe('hook-project')
    expect(wrapper.vm.$.setupState.mediasUri).toBe('https://custom.example/media')
  })

  it('keeps the default modal URLs when the hook throws', async () => {
    hooks.medias_api_url = vi.fn(() => {
      throw new Error('URL hook failed')
    })
    const wrapper = await mount(MediaComponent)
    expect(wrapper.vm.$.setupState.mediasUri).toBe(
      'https://cms.example/project/hook-project/medias'
    )
    expect(hooks.medias_api_url).toHaveBeenCalledTimes(1)
  })

  it('evaluates each editor URL resolution once with the string-URL flag', async () => {
    const wrapper = await mount(Editor)
    hooks.medias_api_url = vi.fn(() => 'https://custom.example')
    expect(wrapper.vm.$.setupState.alterMediasServerUrl()).toBe('https://custom.example')
    expect(hooks.medias_api_url).toHaveBeenCalledTimes(1)
    expect(hooks.medias_api_url.mock.calls[0].slice(1)).toEqual(['hook-project', true])
  })

  it('keeps the configured editor server when its URL hook throws', async () => {
    const wrapper = await mount(Editor)
    hooks.medias_api_url = vi.fn(() => {
      throw new Error('URL hook failed')
    })
    expect(wrapper.vm.$.setupState.alterMediasServerUrl()).toBe('https://cms.example')
    expect(hooks.medias_api_url).toHaveBeenCalledTimes(1)
  })

  it.each([Editor, MediaComponent])(
    'preserves default handling when media hooks fail',
    async (component) => {
      const wrapper = await mount(component)
      const state = wrapper.vm.$.setupState
      hooks.medias_api_error_received = () => {
        throw new Error('Error hook failed')
      }
      hooks.medias_api_response_received = async () => {
        throw new Error('Response hook failed')
      }
      hooks.medias_api_request_received = async () => {
        throw new Error('Request hook failed')
      }
      expect(state.alterErrorReceived(new Error('Original error'))).toBeUndefined()
      await expect(state.mediaResponseReceived('GET', '/media', {}, {})).resolves.toBeUndefined()
      await expect(state.mediaRequestReceived('POST', '/media', {})).resolves.toBeUndefined()
    }
  )
})
