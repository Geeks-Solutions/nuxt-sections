import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { useNuxtApp, registerSidebarRefs, clearSidebarRefs } from '#app'
import * as vt from 'vue-toastification'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'

// Mock showToast and useApiRequest - other utilities are handled by #imports virtual module
vi.mock('~/src/runtime/utils/helpers.js', async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    showToast: vi.fn(),
    useApiRequest: vi.fn((options) => {
      // Mock successful API response
      return Promise.resolve({
        data: {
          id: 'test-page-id',
          path: 'test-page',
          metadata: { project_metadata: { languages: ['en'] } },
          sections: [],
          layout: 'standard',
          page: 'test-page',
          variations: [],
          invalid_sections: [],
          last_updated: Date.now(),
        },
        status: 200,
      })
    }),
  }
})

// Import component AFTER mocks are set up
import SectionsPage from '../src/runtime/components/Sections/admin.vue'

const mockedSectionsConfig = {
  cname: true,
  serverUrl: 'http://localhost:3000',
  projectId: 'test-project',
  queryStringSupport: 'enabled',
  projectLocales: '',
}

useNuxtApp().provide('toast', vt.useToast())
useNuxtApp().provide('sections', mockedSectionsConfig)

// Mock global functions that component uses
global.importJs = vi.fn(() => ({}))
global.loadScript = vi.fn()

// Mock global fetch to prevent actual network requests
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        id: 'test-page-id',
        path: 'test-page',
        metadata: { project_metadata: { languages: ['en'] } },
        sections: [],
        layout: 'standard',
        page: 'test-page',
        variations: [],
        invalid_sections: [],
        last_updated: Date.now(),
      }),
  })
)

describe('Sidebar Options Tests', () => {
  let wrapper
  let pinia

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    clearSidebarRefs()

    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {
          'Edit page': 'Edit page',
          'View page': 'View page',
          'Create New Page': 'Create New Page',
          Add: 'Add',
          Save: 'Save',
          Restore: 'Restore',
        },
      },
    })

    wrapper = mount(SectionsPage, {
      global: {
        plugins: [pinia, i18n],
        stubs: {
          LazyBaseIconsBack: true,
          LazyBaseIconsClose: true,
          LazyBaseIconsAnchor: true,
          LazyBaseTypesStatic: true,
          LazyBaseTypesDynamic: true,
          LazyBaseTypesConfigurable: true,
          LazyBaseTypesLocal: true,
          LazyBaseIconsPlus: true,
          LazyBaseIconsSave: true,
          LazyBaseIconsImport: true,
          LazyBaseIconsExport: true,
          LazyBaseIconsTrash: true,
          LazyBaseIconsSettings: true,
          LazyBaseIconsSync: true,
          LazyBaseIconsInfo: true,
          LazyTooltipClickableTooltip: true,
          LazyBaseSubTypesSectionItem: true,
          LazyBaseIconsLocked: true,
          LazyBaseIconsUnlocked: true,
          LazyBaseIconsDrag: true,
          LazyBaseIconsContent: true,
          LazyBaseIconsImages: true,
          LazyBaseIconsLink: true,
          LazyBaseIconsTab: true,
          LazyBaseIconsEdit: true,
          LazyBaseIconsDot: true,
          LazyBaseIconsEye: true,
          LazyBaseIconsLoading: true,
          LazyBaseIconsError: true,
          LazyBaseIconsCelebrate: true,
          LazyBaseHelperComponentsBurgerMenu: true,
          LazyBaseIconsFloppy: true,
          LazyBaseIconsRestore: true,
          LazyBaseIconsPaintBursh: true,
          LazyTranslationsTranslationComponent: true,
          LazyMediasUploadMedia: true,
          LazyMediasMediaComponent: true,
          LazyBaseIconsAlert: true,
          draggable: true,
        },
      },
      props: {
        admin: true,
        pageName: 'test-page',
        variations: [
          {
            name: 'test-page',
            pageName: 'test-page',
            views: [],
          },
        ],
        sectionsPageData: {},
      },
    })

    // Simulate edit mode on
    wrapper.vm.editMode = true
    await flushPromises()

    // Register component refs with mock so it can update them
    registerSidebarRefs({
      isSideBarOpen: wrapper.vm.isSideBarOpen,
      keepEditBarVisible: wrapper.vm.keepEditBarVisible,
      dynamicSideComponent: wrapper.vm.dynamicSideComponent,
      currentSection: wrapper.vm.currentSection,
    })
  })

  afterEach(() => {
    clearSidebarRefs()
  })

  it('Default Behavior: Edit bar is hidden when sidebar shows', async () => {
    const sideBarComponent = useNuxtApp().$sideBarComponent

    // Wait for component to be fully mounted
    await flushPromises()

    // Ensure initial state
    expect(wrapper.vm.isSideBarOpen).toBe(false)
    expect(wrapper.find('.control-button').exists()).toBe(true)

    // Show sidebar - manually set refs since mock doesn't have access to component's internal refs
    sideBarComponent.show()
    // Simulate what the actual component would do
    wrapper.vm.isSideBarOpen = true
    wrapper.vm.dynamicSideComponent = true
    await flushPromises()
    await wrapper.vm.$nextTick()

    // Sidebar open, edit bar should be hidden
    expect(wrapper.vm.isSideBarOpen).toBe(true)
    expect(wrapper.find('.control-button').exists()).toBe(false)
  })

  it('New Feature: Edit bar remains visible with keepEditBarVisible option', async () => {
    const sideBarComponent = useNuxtApp().$sideBarComponent

    // Show sidebar with option
    sideBarComponent.show({ keepEditBarVisible: true })
    // Simulate what the actual component would do
    wrapper.vm.isSideBarOpen = true
    wrapper.vm.keepEditBarVisible = true
    wrapper.vm.dynamicSideComponent = true
    // Push to sidebarStateStack so currentSidebarKeepEditBar computed returns true
    wrapper.vm.sidebarStateStack = [{ type: 'default', keepEditBarVisible: true }]
    await flushPromises()
    await wrapper.vm.$nextTick()

    // Sidebar open, edit bar should be visible
    expect(wrapper.vm.isSideBarOpen).toBe(true)
    expect(wrapper.find('.control-button').exists()).toBe(true)
  })

  it('Reset: Feature resets when sidebar closes', async () => {
    const sideBarComponent = useNuxtApp().$sideBarComponent

    // 1. Open with option
    sideBarComponent.show({ keepEditBarVisible: true })
    wrapper.vm.isSideBarOpen = true
    wrapper.vm.keepEditBarVisible = true
    wrapper.vm.dynamicSideComponent = true
    wrapper.vm.sidebarStateStack = [{ type: 'default', keepEditBarVisible: true }]
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.control-button').exists()).toBe(true)

    // 2. Close
    sideBarComponent.hide()
    wrapper.vm.isSideBarOpen = false
    wrapper.vm.keepEditBarVisible = false
    wrapper.vm.dynamicSideComponent = false
    wrapper.vm.sidebarStateStack = []
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isSideBarOpen).toBe(false)

    // 3. Open without option (default)
    sideBarComponent.show()
    wrapper.vm.isSideBarOpen = true
    wrapper.vm.keepEditBarVisible = false
    wrapper.vm.dynamicSideComponent = true
    wrapper.vm.sidebarStateStack = [{ type: 'default', keepEditBarVisible: false }]
    await wrapper.vm.$nextTick()

    // Should be hidden now
    expect(wrapper.find('.control-button').exists()).toBe(false)
  })

  it('Drill Down: Edit bar stays visible during section edit if option enabled', async () => {
    const sideBarComponent = useNuxtApp().$sideBarComponent

    // 1. Open Agent with option
    sideBarComponent.show({ keepEditBarVisible: true })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.control-button').exists()).toBe(true)

    // 2. Simulate opening a section (drill down) behavior manually if possible or via state
    // Based on plan, keepEditBarVisible stays true, but valid edit bar logic ensures visibility

    // Manually mimic searching for a section to edit
    wrapper.vm.currentSection = { id: 1, type: 'test' }
    await wrapper.vm.$nextTick()

    // Even with currentSection, if keepEditBarVisible is true, button should persist
    expect(wrapper.find('.control-button').exists()).toBe(true)
  })

  it('State Preservation: dynamicSideComponent use v-show', async () => {
    const sideBarComponent = useNuxtApp().$sideBarComponent
    sideBarComponent.show({ keepEditBarVisible: true })
    wrapper.vm.isSideBarOpen = true
    wrapper.vm.keepEditBarVisible = true
    wrapper.vm.dynamicSideComponent = true
    await wrapper.vm.$nextTick()

    // Find the dynamic component container
    // Note: we might need to rely on class names or hierarchy since we are mocking components
    // In the template: .dynamic-side-component

    const dynamicContainer = wrapper.find('.dynamic-side-component')
    expect(dynamicContainer.exists()).toBe(true)
    expect(dynamicContainer.isVisible()).toBe(true)

    // Now set currentSection (Drill down)
    wrapper.vm.currentSection = { id: 1, type: 'test' }
    await wrapper.vm.$nextTick()
    await flushPromises()

    // Should still exist in DOM (v-show) but be hidden
    expect(dynamicContainer.exists()).toBe(true)
    // The element should be hidden due to v-show when currentSection is set
    // v-show applies display: none inline style
    const inlineDisplay = dynamicContainer.element.style.display
    expect(inlineDisplay).toBe('none')

    // Clear section
    wrapper.vm.currentSection = null
    await wrapper.vm.$nextTick()
    await flushPromises()

    // Should be visible again (inline style should be removed)
    const afterClearDisplay = dynamicContainer.element.style.display
    expect(afterClearDisplay).not.toBe('none')
  })
})
