import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'
import Configurable from '../../src/runtime/components/base/types/Configurable.vue'

const { hooks, components } = vi.hoisted(() => ({
  hooks: {} as Record<string, any>,
  components: {} as Record<string, any>,
}))
vi.mock('~/src/runtime/utils/helpers.js', async (importOriginal) => ({
  ...(await importOriginal<Record<string, any>>()),
  importJs: () => hooks,
  importComp: (path: string) => ({ component: components[path] || null }),
}))

const wrappers: any[] = []
beforeEach(() => {
  Object.keys(hooks).forEach((key) => Reflect.deleteProperty(hooks, key))
  Object.keys(components).forEach((key) => Reflect.deleteProperty(components, key))
})
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()))
const mount = async (props: Record<string, any> = {}): Promise<any> => {
  const wrapper = await mountSuspended(Configurable, {
    props,
    global: { stubs: { MediaComponent: true } },
  })
  wrappers.push(wrapper)
  return wrapper
}

describe('configurable form state', () => {
  it('keeps custom-form visibility sticky across component changes', async () => {
    const form = defineComponent({ template: '<div>Custom form</div>' })
    const wrapper = await mount({ props: { name: 'missing', fields: [] } })
    expect(wrapper.vm.showCustomFormTab).toBe(false)
    components['/forms/available'] = form
    await wrapper.setProps({ props: { name: 'available', fields: [] } })
    expect(wrapper.vm.getComponentForm).toBe(form)
    expect(wrapper.vm.showCustomFormTab).toBe(true)
    await wrapper.setProps({ props: { name: 'missing-again', fields: [] } })
    expect(wrapper.vm.getComponentForm).toBe('')
    expect(wrapper.vm.showCustomFormTab).toBe(true)
  })

  it('recognizes an initially available custom form', async () => {
    components['/forms/available'] = defineComponent({ template: '<div />' })
    const wrapper = await mount({ props: { name: 'available', fields: [] } })
    expect(wrapper.vm.showCustomFormTab).toBe(true)
  })

  it('handles a field named hasOwnProperty and ignores unknown hook fields', async () => {
    hooks.configurable_pre_render = () => [{ hasOwnProperty: 'updated', unexpected: 'ignored' }]
    const wrapper = await mount({
      props: {
        name: 'missing',
        fields: [{ key: 'hasOwnProperty', name: 'property', type: 'integer' }],
      },
      savedView: { fields: true, render_data: [{ settings: { hasOwnProperty: 'original' } }] },
    })
    // Vue instruments proxy.hasOwnProperty; inspect the stored field rather than that accessor.
    expect(Object.getOwnPropertyDescriptor(wrapper.vm.optionsData, 'hasOwnProperty')?.value).toBe(
      'updated'
    )
    expect(Object.hasOwn(wrapper.vm.optionsData, 'unexpected')).toBe(false)
  })
})
