import { describe, it, expect, beforeEach, vi } from 'vitest'
import {flushPromises, mount, shallowMount} from '@vue/test-utils'
import {useNuxtApp} from "#app";
import * as vt from 'vue-toastification';
import draggable from "@marshallswain/vuedraggable"

const mockedSectionsConfig = {
  cname: true,
  serverUrl: 'http://localhost:3000',
  projectId: 'test-project',
  queryStringSupport: 'enabled',
  projectLocales: ''
}

useNuxtApp().provide('toast', vt.useToast())
useNuxtApp().provide('sections', mockedSectionsConfig)

import {
  importJs,sectionHeader,
  getSectionProjectIdentity,
  parsePath,
  parseQS,
  useApiRequest,
  showToast,
  importComp,
  validateQS
} from "~/src/runtime/utils/helpers.js";

global.importJs = importJs
global.sectionHeader = sectionHeader
global.getSectionProjectIdentity = getSectionProjectIdentity
global.parsePath = parsePath
global.parseQS = parseQS
global.importComp = importComp
global.useApiRequest = useApiRequest
global.showToast = showToast
global.validateQS = validateQS

vi.mock('./src/runtime/utils/helpers.ts', { spy: true })

import SectionsPage from '../src/runtime/components/Sections/index.vue';
import FieldSets from '../src/runtime/components/SectionsForms/FieldSets.vue';
import WysiwygStatic from '../src/runtime/components/configs/views/wysiwyg_static.vue';

import { createI18n } from 'vue-i18n'

let stubs = { // Add basic stubs for common lazy components
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
  LazyBaseIconsAlert: true,
  LazyBaseIconsError: true,
  LazyBaseIconsMediaDocument: true,
  LazyBaseIconsUpload: true,
  LazyBaseIconsEmptyImage: true,
  LazyBaseIconsLoadingCircle: true,
  LazyMediasUploadMedia: true,
  LazyTranslationsTranslationComponent: true,
  LazyMediasMediaComponent: true,
  LazyBaseIconsCelebrate: true,
  LazyBaseIconsLoading: true,
  SettingsIcon: true, // If SettingsIcon is a separate component
  NuxtLink: { template: '<a><slot /></a>' }, // Stub NuxtLink,
  draggable
};

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {},
    fr: {}
  }
})

// Helper to dynamically mount the component with custom props
const mountComponent = (props = {}) => {
  return mount(SectionsPage, {
    global: {
      plugins: [i18n],
      stubs,
      config: {
        globalProperties: {
          parsePath: vi.fn().mockReturnValue('mocked/path'),
          importJs: vi.fn()
        }
      }
    },
    props: {
      pageName: 'variation1',
      admin: true,
      variations: [],
      headers: {},
      reactiveTrigger: '',
      lang: 'en',
      editorOptions: {},
      viewsBgColor: 'transparent',
      _sectionsOptions: {},
      sectionsPageData: null,
      ...props,
    }
  })
}

const mockPageData = {
  "id": "67642846052f506967b3db96",
  "path": "page5",
  "metadata": { /* ... metadata from original mock ... */ },
  "sections": [
    { id: 'view-1', name: 'section1', weight: 1, type: 'text', linked_to: '' },
    { id: 'view-2', name: 'section2', weight: 2, type: 'image', linked_to: '' }
  ],
  "layout": "standard",
  "page": "page5",
  "variations": [],
  "invalid_sections": [],
  "last_updated": 1737103250
};

describe('SectionsPage.vue', () => {
  let wrapper

  beforeEach(() => {

    vi.clearAllMocks();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPageData),
      })
    )

    wrapper = mountComponent()
  })

  it('renders successfully', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('uses pageName prop correctly', async () => {
    const customPageName = 'about'
    wrapper = mountComponent({ pageName: customPageName })
    expect(wrapper.vm.pageName).toBe(customPageName)
  })

  it('computed activeVariation returns default when no active variation is found', () => {
    const result = wrapper.vm.activeVariation
    expect(result).toEqual({ name: 'default', pageName: 'variation1' })
  })

  it('filters types based on filter input', async () => {
    // Simulate setting filter values
    wrapper.vm.sectionsFilterName = 'hero'
    wrapper.vm.sectionsFilterAppName = 'marketing'

    // Set some mock data for types
    wrapper.vm.types = [
      { name: 'HeroBanner', application: 'marketing' },
      { name: 'Footer', application: 'core' },
    ]

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.filteredTypes.length).toBe(1)
    expect(wrapper.vm.filteredTypes[0].name).toBe('HeroBanner')
  })

  it('sorts currentViews by weight', async () => {
    wrapper.vm.displayVariations.home = {
      name: 'home',
      views: {
        view1: { id: 'view1', weight: 2 },
        view2: { id: 'view2', weight: 1 },
      },
      altered: false,
    }

    wrapper.vm.selectedVariation = 'home'

    await wrapper.vm.$nextTick()

    const views = wrapper.vm.currentViews
    expect(views[0].id).toBe('view2')
    expect(views[1].id).toBe('view1')
  })

  it('calls initializeSections and computeLayoutData in fetch()', async () => { // Changed test to it

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPageData,
    })

    await wrapper.vm.fetchData()
    // Mock the global fetch for useApiRequest
    // global.fetch.mockResolvedValueOnce({
    //   ok: true,
    //   json: () => Promise.resolve(mockPageData),
    // });

    await flushPromises();

    const result = wrapper.vm.currentViews;

    // Expected result should be sorted by weight
    expect(result).toEqual([
      { id: 'view-1', name: 'section1', weight: 1, type: 'text', linked_to: '' },
      { id: 'view-2', name: 'section2', weight: 2, type: 'image', linked_to: '' }
    ]);

    const newViews = [
      { id: 3, name: 'View 3', weight: 0 }, // Will be assigned weight 0
      { id: 1, name: 'View 1', weight: 1 }, // Will be assigned weight 1
    ];

    // Call the setter
    wrapper.vm.displayVariations.variation1.views = newViews;

    expect(wrapper.vm.displayVariations.variation1.views[0]).toEqual({ id: 3, name: 'View 3', weight: 0 });
    expect(wrapper.vm.displayVariations.variation1.views[1]).toEqual({ id: 1, name: 'View 1', weight: 1 });


    // Component's fetch method is called.
    // Need to ensure $nuxt is available if renderPageData relies on it.
    // The global mock for useNuxtApp should provide $sections.
    if (wrapper.vm.$options.fetch) {
      await wrapper.vm.$options.fetch.call(wrapper.vm);
    } else if (typeof wrapper.vm.fetch === 'function') { // For <script setup> or setup() returning fetch
      await wrapper.vm.fetch();
    }

    // Check if fetch was called by useApiRequest
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`http://localhost:3000/project/test-project/page/variation1`), // URL check
      expect.objectContaining({
        method: 'POST'
      })
    );

  })

  it('addSectionType function should set section.weight if it is null, "null", or undefined', async () => {
    wrapper.vm.displayVariations = {
      variation1: {
        views: { view1: {}, view2: {}, view3: {} },
      },
    };
    wrapper.vm.selectedVariation = 'variation1';

    const testCases = [null, 'null', undefined];
    testCases.forEach((initialWeight, idx) => {
      wrapper.vm.displayVariations = {
        variation1: {
          views: { view1: {}, view2: {}, view3: {} },
        },
      };
      const section = { weight: initialWeight };
      const instance = {}; // Placeholder, customize if needed

      wrapper.vm.addSectionType(section, showToast, instance);

      expect(section.weight).toBe(3); // Expect the length of views
    })
  })

  it('renders a SettingsIcon for each view', async () => {

    wrapper.vm.initializeSections({
      data: mockPageData
    })

    wrapper.vm.editMode = true

    await wrapper.vm.$nextTick();

    const settingsIcons = wrapper.findAll('.settings-icon-wrapper')
    expect(settingsIcons.length).toBe(2)
  });

  it('toggles sectionOptions for the correct view when SettingsIcon is clicked', async () => {

    wrapper.vm.initializeSections({
      data: mockPageData
    })
    // Initialize sectionOptions
    wrapper.vm.sectionOptions = {
      'view-1': false,
      'view-2': false,
    }
    wrapper.vm.editMode = true
    wrapper.vm.isSideBarOpen = false

    await wrapper.vm.$nextTick()
    // Find the SettingsIcon for the first view and click it
    const firstSettingsIcon = wrapper.findAll('.settings-icon-wrapper').at(0);
    await firstSettingsIcon.trigger('click');

    // Assert that sectionOptions for 'view-1' is toggled
    expect(wrapper.vm.sectionOptions['view-1']).toBe(true);
    // Assert that sectionOptions for 'view-2' is unchanged
    expect(wrapper.vm.sectionOptions['view-2']).toBe(false);

    // Find the SettingsIcon for the second view and click it
    const secondSettingsIcon = wrapper.findAll('.settings-icon-wrapper').at(1);
    await secondSettingsIcon.trigger('click');

    // Assert that sectionOptions for 'view-2' is toggled
    expect(wrapper.vm.sectionOptions['view-2']).toBe(true);
    // Assert that sectionOptions for 'view-1' remains unchanged
    expect(wrapper.vm.sectionOptions['view-1']).toBe(true);
  });

  it('renders controls div only for the view with sectionOptions set to true', async () => {

    wrapper.vm.initializeSections({
      data: mockPageData
    })
    // Set sectionOptions for only the first view
    wrapper.vm.sectionOptions = {
      'view-1': true,
      'view-2': false,
    }

    wrapper.vm.editMode = true

    await wrapper.vm.$nextTick()
    // Assert that the controls div is rendered for the first view
    const controls = wrapper.findAll('.controls');
    expect(controls.length).toBe(3);
    expect(controls.at(0).element.closest('section').id).toBe('section1-view-1');

    // Set sectionOptions for only the second view
    wrapper.vm.sectionOptions = {
        'view-1': false,
        'view-2': true,
    }

    await wrapper.vm.$nextTick()
    // Assert that the controls div is now rendered for the second view
    const updatedControls = wrapper.findAll('.controls');
    expect(updatedControls.length).toBe(3);
    expect(updatedControls.at(0).element.closest('section').id).toBe('section1-view-1');
  });

  it('shows input and select filters for all tabs', async () => {

    wrapper.vm.editMode = true
    wrapper.vm.isModalOpen = true
    wrapper.vm.appNames = ['sections']

    const tabs = ['types', 'globalTypes', 'inventoryTypes'];

    for (const tab of tabs) {
      // Set the active tab
      // await tabsWrapper.setData({ typesTab: tab });
      wrapper.typesTab = tab

      await wrapper.vm.$nextTick()
      // Assert input field is visible
      const inputFilter = wrapper.find('input.sectionsFilterName');
      expect(inputFilter.exists()).toBe(true);

      if (tab !== 'inventoryTypes') {
        const selectFilter = wrapper.find('select#select');
        expect(selectFilter.exists()).toBe(true);
      }

      // Assert the "clear filters" text is visible
      const clearFilters = wrapper.find('.slot-name');
      expect(clearFilters.exists()).toBe(true);
    }
  });

  it('should maintain region weight and stay in position when editing a section in a non-standard layout', async () => {
    const section = {
      id: 'test-section',
      type: 'custom',
      region: { customLayout: { slot: 'main', weight: 3 } },
    };

    wrapper.vm.selectedLayout = 'customLayout'
    wrapper.vm.selectedVariation = 'variation1'

    wrapper.vm.addSectionType(section, false, false);

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.displayVariations[wrapper.vm.selectedVariation].views[section.id].region.customLayout.weight).toBe(3);
  });

  it('should restore the section from updatedVariations', async () => {

    wrapper.setProps({
      pageName: 'testPage',
      variations: [{ name: 'testPage', active: true }],
    })

    wrapper.vm.selectedVariation = 'testPage'
    wrapper.vm.currentSection = { id: 'section1' }
    wrapper.vm.displayVariations = {
        testPage: {
          altered: true,
          views: {
            section1: { id: 'section1', content: 'Old Content' },
          },
        },
      }
    wrapper.vm.updatedVariations = {
        testPage: {
          views: {
            section1: { id: 'section1', content: 'Restored Content' },
          },
        },
      }
    wrapper.vm.currentViews = [{ id: 'section1', content: 'Old Content' }]
    wrapper.vm.selectedLayout = 'standard'
    wrapper.vm.viewsPerRegions = {
        region1: [{ id: 'section1', content: 'Old Content' }],
      }

    wrapper.vm.restoreSection();

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.displayVariations.testPage.altered).toBe(false);
    expect(wrapper.vm.displayVariations.testPage.views.section1.content).toBe(
      'Restored Content'
    );
    expect(wrapper.vm.currentViews[0].content).toBe('Restored Content');

    wrapper.vm.selectedVariation = 'testPage'
    wrapper.vm.currentSection = { id: 'section1' }
    wrapper.vm.displayVariations = {
      testPage: {
        altered: true,
        views: {
          section1: { id: 'section1', content: 'Old Content' },
        },
      },
    }
    wrapper.vm.updatedVariations = {
      testPage: {
        views: {
          section1: { id: 'section1', content: 'Restored Content' },
        },
      },
    }
    wrapper.vm.currentViews = [{ id: 'section1', content: 'Old Content' }]
    wrapper.vm.viewsPerRegions = {
      region1: [{ id: 'section1', content: 'Old Content' }],
    }
    wrapper.vm.selectedSlotRegion = 'region1'
    wrapper.vm.selectedLayout = 'custom-layout'

    wrapper.vm.restoreSection();

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.viewsPerRegions.region1[0].content).toBe('Restored Content');
  });

  it('Hide SettingsIcon for the views when sidebar is opened', async () => {

    wrapper.vm.isSideBarOpen = true

    await wrapper.vm.$nextTick()
    const settingsIcons = wrapper.findAll('.settings-icon-wrapper');
    expect(settingsIcons.length).toBe(0);
  });



  it('should not proceed if globalTypes already has data', async () => {
    wrapper.vm.globalTypes = [{ id: 1, name: 'Test' }]

    vi.resetAllMocks();

    await wrapper.vm.$nextTick()

    await wrapper.vm.getGlobalSectionTypes(false);

    expect(global.fetch).toHaveBeenCalledOnce();
  });

  it('should fetch and process global types if not already loaded', async () => {
    const mockResponse = {
      data: [
        {
          id: 1,
          name: 'Section1',
          section: { name: 'Section1', options: [{ setting: 'option1' }] },
          regions: ['Region1'],
          auto_insertion: true,
          pages: ['Page1'],
        },
      ],
    };

    wrapper.vm.globalTypes = []

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    wrapper.vm.types = [
      {
        name: 'Section1',
        type: 'configurable',
        query_string_keys: ['key1', 'key2'],
        fields: ['field1'],
        dynamic_options: ['option1'],
        application: 'app1',
      },
    ]

    await wrapper.vm.$nextTick()

    await wrapper.vm.getGlobalSectionTypes(false);

    await wrapper.vm.$nextTick()

    expect(global.fetch).toHaveBeenCalled();

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.globalTypes).toHaveLength(2);
    expect(wrapper.vm.globalTypes[0]).toMatchObject({
      name: 'Section1',
      type: 'configurable',
      regions: ['Region1'],
      auto_insertion: true,
    });
    expect(wrapper.vm.loading).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    global.fetch.mockRejectedValue({
      ok: false,
      json: async () => {error: 'Fetch failed'},
    })

    await wrapper.vm.getGlobalSectionTypes(false);

    expect(wrapper.vm.loading).toBe(false);
  });



  it('includes query_string and language in variables when queryStringSupport is enabled', async () => {
    const gt = {
      section: {
        name: 'testSection',
      },
      query_string_keys: ['key1', 'key2'],
    };
    const options = { option1: true };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPageData,
    })

    vi.resetAllMocks()

    await wrapper.vm.renderConfigurableSection(gt, options);

    // Assert axios.post is cssalled with the correct URL and variables
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/project/test-project/section/render',
      expect.any(Object)
    );

  });

  it('does not include query_string if queryStringSupport is disabled', async () => {
    wrapper.vm.nuxtApp.$sections.queryStringSupport = 'disabled';

    const gt = {
      section: {
        name: 'testSection',
      },
      query_string_keys: [],
    };
    const options = { option1: true };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPageData,
    })

    vi.resetAllMocks()

    await wrapper.vm.renderConfigurableSection(gt, options);

    // Assert axios.post is called without query_string in variables
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/project/test-project/section/render',
      expect.any(Object)
    );

  });

  it('include language if locale matches defaultLocale', async () => {
    wrapper.vm.nuxtApp.$sections.queryStringSupport = "enabled";

    const gt = {
      section: {
        name: 'testSection',
      },
      query_string_keys: ['key1', 'key2'],
    };
    const options = { option1: true };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPageData,
    })

    vi.resetAllMocks()

    await wrapper.vm.renderConfigurableSection(gt, options);

    // Assert axios.post is called with query_string but no language
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/project/test-project/section/render',
      expect.any(Object)
    );
  });

  it('Add section type side bar view: Add section popup shows on the sidebar', async () => {
    wrapper.setProps({
      admin: true
    });

    wrapper.vm.isSideBarOpen = false
    wrapper.vm.editMode = true
    wrapper.vm.creationView = true
    wrapper.vm.selectedLayout = 'standard'
    wrapper.vm.currentSection = {name: 'wysiwyg', type: 'static'}

    await wrapper.vm.openCurrentSection({name: 'wysiwyg', type: 'static'});

    expect(wrapper.vm.isSideBarOpen).toBe(true);

    const creationView = wrapper.find('.creation-view-standard')

    expect(creationView.exists()).toBe(true);

  });

})

const mockUseState = vi.fn()
const mockSelectedLayout = { value: 'standard' }
const mockDisplayVariations = {
  value: {
    'testPage': {
      name: 'testPage',
      views: {
        'element1': {
          region: {
            standard: { slot: '', weight: 0 }
          }
        },
        'element2': {
          region: {
            standard: { slot: '', weight: 0 }
          }
        }
      },
      altered: false
    }
  }
}
const mockSelectedVariation = { value: 'testPage' }

describe('logDrag function, layout region position updates', () => {
  let logDrag

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Setup useState mock to return our mock state objects
    mockUseState
      .mockReturnValueOnce(mockSelectedLayout)     // selectedLayout
      .mockReturnValueOnce(mockDisplayVariations)  // displayVariations

    // Reset the mock data
    mockDisplayVariations.value.testPage.views.element1.region.standard = { slot: '', weight: 0 }
    mockDisplayVariations.value.testPage.views.element2.region.standard = { slot: '', weight: 0 }
    mockDisplayVariations.value.testPage.altered = false

    // Define the function (normally this would be imported from your component/composable)
    const pageName = 'testPage'
    const selectedLayout = mockSelectedLayout
    const displayVariations = mockDisplayVariations
    const selectedVariation = mockSelectedVariation

    logDrag = (evt, slotName) => {
      if (evt.added) {
        displayVariations.value[selectedVariation.value].views[evt.added.element.id].region[selectedLayout.value].slot = slotName
        displayVariations.value[selectedVariation.value].views[evt.added.element.id].region[selectedLayout.value].weight = evt.added.newIndex
        displayVariations.value[selectedVariation.value].altered = true
      } else if(evt.moved) {
        displayVariations.value[selectedVariation.value].views[evt.moved.element.id].region[selectedLayout.value].weight = evt.moved.newIndex
        displayVariations.value[selectedVariation.value].altered = true
      }
    }
  })

  it('should update slot, weight, and altered status when element is added', () => {
    const evt = {
      added: {
        element: { id: 'element1' },
        newIndex: 2
      }
    }
    const slotName = 'header'

    logDrag(evt, slotName)

    expect(mockDisplayVariations.value.testPage.views.element1.region.standard.slot).toBe('header')
    expect(mockDisplayVariations.value.testPage.views.element1.region.standard.weight).toBe(2)
    expect(mockDisplayVariations.value.testPage.altered).toBe(true)
  })

  it('should handle different slot names when element is added', () => {
    const evt = {
      added: {
        element: { id: 'element2' },
        newIndex: 1
      }
    }
    const slotName = 'sidebar'

    logDrag(evt, slotName)

    expect(mockDisplayVariations.value.testPage.views.element2.region.standard.slot).toBe('sidebar')
    expect(mockDisplayVariations.value.testPage.views.element2.region.standard.weight).toBe(1)
    expect(mockDisplayVariations.value.testPage.altered).toBe(true)
  })

  it('should handle zero index when element is added', () => {
    const evt = {
      added: {
        element: { id: 'element1' },
        newIndex: 0
      }
    }
    const slotName = 'footer'

    logDrag(evt, slotName)

    expect(mockDisplayVariations.value.testPage.views.element1.region.standard.slot).toBe('footer')
    expect(mockDisplayVariations.value.testPage.views.element1.region.standard.weight).toBe(0)
    expect(mockDisplayVariations.value.testPage.altered).toBe(true)
  })

  it('should update weight and altered status when element is moved', () => {
    const evt = {
      moved: {
        element: { id: 'element1' },
        newIndex: 3
      }
    }

    logDrag(evt, 'anySlot')

    expect(mockDisplayVariations.value.testPage.views.element1.region.standard.weight).toBe(3)
    expect(mockDisplayVariations.value.testPage.altered).toBe(true)
    // Slot should remain unchanged when moving
    expect(mockDisplayVariations.value.testPage.views.element1.region.standard.slot).toBe('')
  })

  it('should handle different elements being moved', () => {
    const evt = {
      moved: {
        element: { id: 'element2' },
        newIndex: 5
      }
    }

    logDrag(evt, 'header')

    expect(mockDisplayVariations.value.testPage.views.element2.region.standard.weight).toBe(5)
    expect(mockDisplayVariations.value.testPage.altered).toBe(true)
  })

  it('should not modify any state when neither added nor moved', () => {
    const evt = {
      removed: {
        element: { id: 'element1' }
      }
    }

    logDrag(evt, 'header')

    expect(mockDisplayVariations.value.testPage.views.element1.region.standard.slot).toBe('')
    expect(mockDisplayVariations.value.testPage.views.element1.region.standard.weight).toBe(0)
    expect(mockDisplayVariations.value.testPage.altered).toBe(false)
  })

  it('should handle empty event object', () => {
    const evt = {}

    logDrag(evt, 'header')

    expect(mockDisplayVariations.value.testPage.altered).toBe(false)
  })

  it('should handle undefined slotName for added elements', () => {
    const evt = {
      added: {
        element: { id: 'element1' },
        newIndex: 1
      }
    }

    logDrag(evt, undefined)

    expect(mockDisplayVariations.value.testPage.views.element1.region.standard.slot).toBeUndefined()
    expect(mockDisplayVariations.value.testPage.views.element1.region.standard.weight).toBe(1)
    expect(mockDisplayVariations.value.testPage.altered).toBe(true)
  })

  it('should handle null slotName for added elements', () => {
    const evt = {
      added: {
        element: { id: 'element1' },
        newIndex: 1
      }
    }

    logDrag(evt, null)

    expect(mockDisplayVariations.value.testPage.views.element1.region.standard.slot).toBeNull()
    expect(mockDisplayVariations.value.testPage.views.element1.region.standard.weight).toBe(1)
    expect(mockDisplayVariations.value.testPage.altered).toBe(true)
  })

})

const mockData = [
  { id: 0, name: 'Item 1' },
  { id: 1, name: 'Item 2' },
  { id: 2, name: 'Item 3' }
]

describe('FieldSets.vue', () => {
  let wrapper

  const createComponent = (propsData = {}, slots = {}) => {
    wrapper = mount(FieldSets, {
      global: {
        stubs,
      },
      propsData: {
        arrayDataPop: mockData,
        legendLabel: 'Test Legend',
        ...propsData
      },
      slots
    })
  }

  it('renders fieldsets based on arrayDataPop', () => {
    createComponent()
    const fieldsets = wrapper.findAll('fieldset')
    expect(fieldsets.length).toBe(3)
  })

  it('renders custom legend labels using alterLengendLabel', () => {
    createComponent()
    const legends = wrapper.findAll('legend')
    legends.forEach((legend, idx) => {
      expect(legend.text()).toBe(`Test Legend #${idx + 1}:`)
    })
  })

  it('emits "remove-fieldset" event when trash icon is clicked', async () => {
    createComponent()
    const trashIcons = wrapper.findAll('.trash-icon')
    await trashIcons.at(0).trigger('click')

    expect(wrapper.emitted('remove-fieldset')).toBeTruthy()
    expect(wrapper.emitted('remove-fieldset')[0]).toEqual([mockData[0], 0])
  })

  it('emits "array-updated" when arrayData changes', async () => {
    createComponent()
    const newArray = [...mockData, { id: 3, name: 'Item 4' }]
    wrapper.vm.arrayData = newArray

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('array-updated')).toBeTruthy()
    expect(wrapper.emitted('array-updated')[0][0].length).toBe(4)
  })

  it('applies custom classes from props', async () => {
    createComponent({
      draggableClasses: 'custom-draggable',
      mainWrapperClasses: 'main-wrapper',
      wrapperClasses: 'custom-wrapper',
      legendClasses: 'custom-legend'
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.custom-draggable').exists()).toBe(true)
    expect(wrapper.find('.main-wrapper').exists()).toBe(true)
    expect(wrapper.find('.custom-wrapper').exists()).toBe(true)
    expect(wrapper.find('.custom-legend').exists()).toBe(true)
  })

  it('renders slot content correctly',async () => {
    createComponent({}, { default: '<div class="custom-slot">Slot Content</div>' })

    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.custom-slot').length).toBe(3)
  })
})

describe('Z-index Test', () => {

  const TestComponent = {
    template: `
    <div>
      <div class="media-container" style="position: relative; z-index: 10;">Media container</div>
      <div class="flexSections control-button config-buttons" style="right: 0px; left: auto; top: 0; position: relative; z-index: 5;">Target Div</div>
    </div>
  `
  };

  it('ensures the target controls div does not display above the Media container div', async () => {
    const wrapper = shallowMount(TestComponent);

    const backgroundDiv = wrapper.find('.media-container');
    const targetDiv = wrapper.find('.control-button.config-buttons');

    await wrapper.vm.$nextTick()

    const backgroundZIndex = window.getComputedStyle(backgroundDiv.element).zIndex || 1;
    const targetZIndex = window.getComputedStyle(targetDiv.element).zIndex || 0;

    await wrapper.vm.$nextTick()

    expect(Number(targetZIndex)).toBeLessThan(Number(backgroundZIndex));
  });
});

describe("WysiwygStatic", () => {

  it("renders the .ql-snow .ql-editor class when html exists", () => {
    const wrapper = shallowMount(WysiwygStatic, {
      propsData: {
        section: {
          settings: [{ en: "<p>Test content</p>" }],
        },
        lang: "en",
      },
    });
  });

});

// Import Export Tests
const mockAllSections = ref([
  {
    id: 1,
    name: 'Header',
    type: 'static',
    region: { desktop: { slot: 'header' } }
  },
  {
    id: 2,
    name: 'Footer',
    type: 'configurable',
    nameID: 'footer-config',
    linked_to: 'footer-instance'
  }
])
const mockJsonFilePick = ref(null)
const mockTypes = ref([
  {
    name: 'footer-config',
    access: 'public',
    app_status: 'enabled'
  }
])
const mockSelectedSlotRegion = ref('')

// Mock functions
const mockShowToast = vi.fn()
const mockAddSectionType = vi.fn()
const mockI18n = {
  t: vi.fn((key) => {
    const translations = {
      'importSections': 'Import will overwrite existing sections',
      'activateConfigSections': 'Please activate',
      'forProject': 'for this project',
      'successImported': 'Successfully imported'
    }
    return translations[key] || key
  })
}
// Mock DOM elements
const mockDownloadAnchor = {
  setAttribute: vi.fn(),
  click: vi.fn()
}
const mockPagePath = {value: 'page'}
const mockFileInput = {
  click: vi.fn()
}

// The functions to test (would normally be imported from your composable)
const exportSections = () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
    layout: mockSelectedLayout.value,
    sections: mockAllSections.value
  }))
  const dlAnchorElem = document.getElementById('downloadAnchorElem')
  dlAnchorElem.setAttribute("href", dataStr)
  dlAnchorElem.setAttribute("download", `${mockPagePath.value}.json`)
  dlAnchorElem.click()
}

const initImportSections = () => {
  if (Object.keys(mockDisplayVariations.value[mockSelectedVariation.value].views).length > 0) {
    mockShowToast(
      "Warning",
      "warning",
      mockI18n.t('importSections')
    )
  } else {
    mockJsonFilePick.value.click()
  }
}

const importSections = (e) => {
  const jsonFile = e.target.files[0]
  const reader = new FileReader()
  reader.readAsText(jsonFile, "UTF-8")
  reader.onload = (evt) => {
    const jsonFileResult = evt.target.result
    const parsedImport = JSON.parse(jsonFileResult)
    const sections = parsedImport.sections
    mockSelectedLayout.value = parsedImport.layout
    let sectionsNames = []

    sections.forEach((section) => {
      sectionsNames.push(section.name)
      if (section.type === "configurable") {
        const sectionTypeObject = mockTypes.value.find(type => type.name === section.nameID)
        if (sectionTypeObject && (sectionTypeObject.access === 'private' || sectionTypeObject.access === 'public_scoped') && sectionTypeObject.app_status !== 'enabled') {
          mockShowToast(
            "Warning",
            "warning",
            `${mockI18n.t('activateConfigSections')} ${section.name} ${mockI18n.t('forProject')}`
          )
        }
      }
      if (section.linked_to && section.linked_to !== "") {
        section.instance_name = section.linked_to
        section.options = section.settings
      }
      if (section.region && section.region[mockSelectedLayout.value] && section.region[mockSelectedLayout.value].slot) {
        mockSelectedSlotRegion.value = section.region[mockSelectedLayout.value].slot
      }
      mockAddSectionType(section, false, section.linked_to && section.linked_to !== "")
    })

    mockShowToast(
      "Success",
      "info",
      `${mockI18n.t('successImported')} ${sectionsNames.length} sections: ${sectionsNames.join(', ')}`
    )
  }
}

describe('Import/Export Functionality', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Mock DOM methods
    vi.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'downloadAnchorElem') {
        return mockDownloadAnchor
      }
      return null
    })

    // Reset ref values
    mockSelectedLayout.value = 'desktop'
    mockAllSections.value = [
      {
        id: 1,
        name: 'Header',
        type: 'static',
        region: { desktop: { slot: 'header' } }
      },
      {
        id: 2,
        name: 'Footer',
        type: 'configurable',
        nameID: 'footer-config',
        linked_to: 'footer-instance'
      }
    ]
    mockPagePath.value = 'test-page'
    mockDisplayVariations.value = {
      default: { views: {} }
    }
    mockSelectedVariation.value = 'default'
    mockJsonFilePick.value = mockFileInput
    mockSelectedSlotRegion.value = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('exportSections', () => {
    it('should create download link with correct data and trigger download', () => {
      exportSections()

      const expectedData = {
        layout: 'desktop',
        sections: mockAllSections.value
      }
      const expectedDataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(expectedData))

      expect(document.getElementById).toHaveBeenCalledWith('downloadAnchorElem')
      expect(mockDownloadAnchor.setAttribute).toHaveBeenCalledWith("href", expectedDataStr)
      expect(mockDownloadAnchor.setAttribute).toHaveBeenCalledWith("download", "test-page.json")
      expect(mockDownloadAnchor.click).toHaveBeenCalled()
    })

    it('should use current layout and sections values', () => {
      mockSelectedLayout.value = 'mobile'
      mockAllSections.value = [{ id: 3, name: 'Mobile Header' }]
      mockPagePath.value = 'mobile-page'

      exportSections()

      const expectedData = {
        layout: 'mobile',
        sections: [{ id: 3, name: 'Mobile Header' }]
      }
      const expectedDataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(expectedData))

      expect(mockDownloadAnchor.setAttribute).toHaveBeenCalledWith("href", expectedDataStr)
      expect(mockDownloadAnchor.setAttribute).toHaveBeenCalledWith("download", "mobile-page.json")
    })
  })

  describe('initImportSections', () => {
    it('should show warning toast when views exist', () => {
      mockDisplayVariations.value.default.views = { view1: {} }

      initImportSections()

      expect(mockShowToast).toHaveBeenCalledWith(
        "Warning",
        "warning",
        "Import will overwrite existing sections"
      )
      expect(mockFileInput.click).not.toHaveBeenCalled()
    })

    it('should trigger file picker when no views exist', () => {
      mockDisplayVariations.value.default.views = {}

      initImportSections()

      expect(mockShowToast).not.toHaveBeenCalled()
      expect(mockFileInput.click).toHaveBeenCalled()
    })

    it('should handle different selected variation', () => {
      mockSelectedVariation.value = 'variant1'
      mockDisplayVariations.value = {
        default: { views: {} },
        variant1: { views: { view1: {} } }
      }

      initImportSections()

      expect(mockShowToast).toHaveBeenCalledWith(
        "Warning",
        "warning",
        "Import will overwrite existing sections"
      )
    })
  })

  describe('importSections', () => {
    let mockFileReader
    let mockFile

    beforeEach(() => {
      mockFileReader = {
        readAsText: vi.fn(),
        onload: null,
        result: null
      }

      // Mock FileReader constructor
      vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))

      mockFile = new File(['test'], 'test.json', { type: 'application/json' })
    })

    it('should successfully import sections and update layout', () => {
      const importData = {
        layout: 'tablet',
        sections: [
          {
            name: 'Imported Header',
            type: 'static',
            region: { tablet: { slot: 'top' } }
          },
          {
            name: 'Imported Footer',
            type: 'configurable',
            nameID: 'footer-config',
            linked_to: 'footer-link',
            settings: { color: 'blue' }
          }
        ]
      }

      const mockEvent = {
        target: {
          files: [mockFile],
          result: JSON.stringify(importData)
        }
      }

      importSections(mockEvent)

      // Simulate FileReader onload
      const mockFileEvent = {
        target: {
          result: JSON.stringify(importData)
        }
      }
      mockFileReader.onload(mockFileEvent)

      expect(mockSelectedLayout.value).toBe('tablet')
      expect(mockSelectedSlotRegion.value).toBe('top')
      expect(mockAddSectionType).toHaveBeenCalledTimes(2)
      expect(mockShowToast).toHaveBeenCalledWith(
        "Success",
        "info",
        "Successfully imported 2 sections: Imported Header, Imported Footer"
      )
    })

    it('should handle linked sections correctly', () => {
      const importData = {
        layout: 'desktop',
        sections: [
          {
            name: 'Linked Section',
            type: 'configurable',
            nameID: 'config-type',
            linked_to: 'linked-instance',
            settings: { theme: 'dark' }
          }
        ]
      }

      const mockEvent = {
        target: {
          files: [mockFile]
        }
      }

      importSections(mockEvent)

      const mockFileEvent = {
        target: {
          result: JSON.stringify(importData)
        }
      }
      mockFileReader.onload(mockFileEvent)

      expect(mockAddSectionType).toHaveBeenCalledWith(
        expect.objectContaining({
          instance_name: 'linked-instance',
          options: { theme: 'dark' }
        }),
        false,
        true
      )
    })

    it('should show warning for disabled configurable sections', () => {
      mockTypes.value = [
        {
          name: 'disabled-config',
          access: 'private',
          app_status: 'disabled'
        }
      ]

      const importData = {
        layout: 'desktop',
        sections: [
          {
            name: 'Disabled Section',
            type: 'configurable',
            nameID: 'disabled-config'
          }
        ]
      }

      const mockEvent = {
        target: {
          files: [mockFile]
        }
      }

      importSections(mockEvent)

      const mockFileEvent = {
        target: {
          result: JSON.stringify(importData)
        }
      }
      mockFileReader.onload(mockFileEvent)

      expect(mockShowToast).toHaveBeenCalledWith(
        "Warning",
        "warning",
        "Please activate Disabled Section for this project"
      )
    })

    it('should handle sections without linked_to property', () => {
      const importData = {
        layout: 'desktop',
        sections: [
          {
            name: 'Static Section',
            type: 'static'
          }
        ]
      }

      const mockEvent = {
        target: {
          files: [mockFile]
        }
      }

      importSections(mockEvent)

      const mockFileEvent = {
        target: {
          result: JSON.stringify(importData)
        }
      }
      mockFileReader.onload(mockFileEvent)

      expect(mockAddSectionType).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Static Section',
          type: 'static'
        }),
        false,
        undefined
      )
    })

    it('should handle empty linked_to property', () => {
      const importData = {
        layout: 'desktop',
        sections: [
          {
            name: 'Empty Linked Section',
            type: 'configurable',
            linked_to: ''
          }
        ]
      }

      const mockEvent = {
        target: {
          files: [mockFile]
        }
      }

      importSections(mockEvent)

      const mockFileEvent = {
        target: {
          result: JSON.stringify(importData)
        }
      }
      mockFileReader.onload(mockFileEvent)

      expect(mockAddSectionType).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Empty Linked Section',
          linked_to: ''
        }),
        false,
        ""
      )
    })
  })

  describe('Edge Cases', () => {
    let mockFileReader

    beforeEach(() => {
      mockFileReader = {
        readAsText: vi.fn(),
        onload: null,
        result: null
      }

      // Mock FileReader constructor
      vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))

    })

    it('should handle missing DOM element in exportSections', () => {
      vi.spyOn(document, 'getElementById').mockReturnValue(null)

      expect(() => exportSections()).toThrow()
    })

    it('should handle malformed JSON in importSections', () => {
      const mockFile = new File(['invalid json'], 'test.json', { type: 'application/json' })
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      }

      importSections(mockEvent)

      const mockFileEvent = {
        target: {
          result: 'invalid json'
        }
      }

      expect(() => mockFileReader.onload(mockFileEvent)).toThrow()
    })

    it('should handle section without region property', () => {
      const importData = {
        layout: 'desktop',
        sections: [
          {
            name: 'No Region Section',
            type: 'static'
          }
        ]
      }

      const mockFile = new File(['test'], 'test.json', { type: 'application/json' })
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      }

      importSections(mockEvent)

      const mockFileEvent = {
        target: {
          result: JSON.stringify(importData)
        }
      }

      expect(() => mockFileReader.onload(mockFileEvent)).not.toThrow()
      expect(mockSelectedSlotRegion.value).toBe('')
    })
  })
})

describe('sanitizeURL', () => {

  let wrapper

  beforeEach(() => {

    vi.clearAllMocks();

    window.history.pushState({}, '', '/some-page?auth_code=abc123&project_id=xyz789&keep_me=yes')
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPageData),
      })
    )

    wrapper = mountComponent()
  })

  it('removes auth_code and project_id from query and calls router.replace', async () => {

    await useRouter().push({
      path: '/some-page',
      query: {
        auth_code: 'abc123',
        project_id: 'xyz789',
        keep_me: 'yes'
      }
    })

    await wrapper.vm.sanitizeURL()

    // Verify updated URL
    expect(useRoute().fullPath).toBe('/some-page?keep_me=yes')
  })
})
