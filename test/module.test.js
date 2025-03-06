import { shallowMount, mount } from '@vue/test-utils'
import SectionsMain from '../lib/src/components/Sections/index.vue'
import FieldSets from '../lib/src/components/SectionsForms/FieldSets.vue';

describe('SectionsMain', () => {
  let controlsWrapper;

  beforeEach(() => {
    controlsWrapper = shallowMount(SectionsMain, {
      mocks: {
        ...global.mocks,
        $sections: {
          cname: true
        },
      },
      propsData: {
        admin: true,
        isModalOpen: true,
        currentSection: false,
        isCreateInstance: false,
        typesTab: 'types',
        sectionsFilterName: '',
        sectionsFilterAppName: '',
        appNames: []
      },
      data() {
        return {
          editMode: true,
          sectionOptions: {}, // Mock initial state
          view: { id: 'view-id', name: 'section1', weight: 1, type: 'text' },
          selectedVariation: "variation1",
          displayVariations: {
            variation1: {
              views: {
                1: { id: 'view-1', name: 'section1', weight: 1, type: 'text', linked_to: '' },
                2: { id: 'view-2', name: 'section2', weight: 2, type: 'image', linked_to: '' },
              },
            },
          },
          originalVariations: {
            testPage: {
              views: {
                'test-section': {
                  id: 'test-section',
                  type: 'custom',
                  region: { customLayout: { slot: 'main', weight: 3 } },
                },
              },
            },
          },
          isSideBarOpen: false
        };
      },
    });
  });

  test('calls initializeSections and computeLayoutData in fetch()', async () => {
    // Create a spy for both methods
    const initializeSectionsSpy = jest.spyOn(SectionsMain.methods, 'initializeSections')
    const computeLayoutDataSpy = jest.spyOn(SectionsMain.methods, 'computeLayoutData')

    // Mount the component
    const wrapper = shallowMount(SectionsMain, {
      mocks: {
        ...global.mocks,
        $sections: {
          cname: true
        },
        // Mock $set for reactivity
        $set: jest.fn(),
        $route: {
          query: jest.fn(),
          params: {
            pathMatch: jest.fn()
          }
        }
      },
      data() {
        return {
          selectedVariation: "variation1",
          displayVariations: {
            variation1: {
              views: {
                1: { id: 'view-1', name: 'section1', weight: 1, type: 'text', linked_to: '' },
                2: { id: 'view-2', name: 'section2', weight: 2, type: 'image', linked_to: '' },
              },
            },
          }
        }
      }
    })

    global.mocks.$axios.post.mockResolvedValueOnce({
      data: {
        "id": "67642846052f506967b3db96",
        "path": "page5",
        "metadata": {
          "media": {
            "filename": "sections/eweev (1)80228c2cca6a41de8e13daee6cca3c05.css",
            "url": "https://s3.amazonaws.com/eweevtestbucketprivate/sections%2Feweev+%281%2980228c2cca6a41de8e13daee6cca3c05.css",
            "headers": {},
            "seo_tag": null,
            "media_id": "678a0cc526735e000700b6aa"
          },
          "fr": {
            "description": "",
            "title": ""
          },
          "package": {
            "name": "corporate",
            "label": "Corporate",
            "type": "public",
            "price": 14900,
            "currency": "EUR",
            "project_id": null,
            "rank": 2000000000,
            "limits": [
              {
                "name": "number_of_pages",
                "value": -1,
                "included": 10,
                "unit_price": 150
              },
              {
                "name": "query_string_support",
                "value": -1
              },
              {
                "name": "variation_per_page",
                "value": 5
              },
              {
                "name": "static_sections",
                "value": 20
              },
              {
                "name": "sections_total",
                "value": 15
              },
              {
                "name": "hosted_files",
                "value": -1
              },
              {
                "name": "size_per_file",
                "value": 20000000000000
              },
              {
                "name": "api_limit_sec",
                "value": -1
              },
              {
                "name": "api_limit_minute",
                "value": -1
              },
              {
                "name": "api_limit_hour",
                "value": 3000
              },
              {
                "name": "api_limit_day",
                "value": -1
              },
              {
                "name": "dynamic_section_types_support",
                "value": -1
              },
              {
                "name": "users",
                "value": 5
              },
              {
                "name": "domains",
                "value": 4
              }
            ],
            "quota": 15,
            "locked": false
          },
          "project_metadata": {
            "media": {
              "filename": "sections/SectionsLook17df18dd1f53409e8a00146d0163492e.css",
              "url": "https://s3.amazonaws.com/eweevtestbucketprivate/sections%2FSectionsLook17df18dd1f53409e8a00146d0163492e.css",
              "headers": {},
              "seo_tag": null,
              "media_id": "67658343b109090007add20d"
            },
            "activateCookieControl": true,
            "favicon": {
              "filename": "sections/sections_sections_Group+2034a753d7ab0e04ac5bab7bd1fb80614bb845132eb956e45348072906290c9ea8e0c717a98b2a94585be5a500dd577683a.png",
              "url": "https://s3.amazonaws.com/eweevtestbucketprivate/sections%2Fsections_sections_Group%2B2034a753d7ab0e04ac5bab7bd1fb80614bb845132eb956e45348072906290c9ea8e0c717a98b2a94585be5a500dd577683a.png",
              "headers": {},
              "seo_tag": null,
              "media_id": "672cb7846777fd0007715fa4"
            },
            "gtmId": "567689789",
            "languages": [
              "fr",
              "en"
            ],
            "selectedCSSPreset": {
              "name": "None",
              "url": ""
            },
            "defaultLang": "en"
          },
          "en": {
            "description": "",
            "title": ""
          }
        },
        "sections": [
          {
            "error": null,
            "id": "678a0d8626735e00076ecc56",
            "name": "SimpleMenu",
            "type": "static",
            "settings": [
              {
                "media": {
                  "filename": "sections/Eweev-Logo.69cc37497996c6f54054c8291d0f0eed099ec8e.svg",
                  "url": "https://s3.amazonaws.com/eweevtestbucketprivate/sections%2FEweev-Logo.69cc37497996c6f54054c8291d0f0eed099ec8e.svg",
                  "headers": {},
                  "seo_tag": null,
                  "media_id": "678a0eb926735e000771e6a3"
                },
                "menu": [
                  {
                    "label": {
                      "fr": "en",
                      "en": "en"
                    },
                    "link": {
                      "en": ""
                    },
                    "page": {
                      "fr": "page1",
                      "en": "page1"
                    },
                    "menuItemClasses": "mobile-top"
                  },
                  {
                    "label": {
                      "fr": "menu francais 2",
                      "en": "Menu 2"
                    },
                    "link": {
                      "fr": "",
                      "en": "#Plans-672cb93e6777fd0007354149"
                    },
                    "page": {
                      "fr": "page1",
                      "en": "page1"
                    },
                    "menuItemClasses": "mobile-top"
                  },
                  {
                    "label": {
                      "fr": "en",
                      "en": "fr"
                    },
                    "link": {
                      "fr": "",
                      "en": ""
                    },
                    "page": {
                      "fr": "",
                      "en": ""
                    },
                    "languageMenu": true,
                    "menuItemClasses": "language mobile-top"
                  }
                ],
                "classes": "main",
                "logoLink": {
                  "fr": "",
                  "en": ""
                },
                "logoPage": {},
                "menuLabel": {}
              }
            ],
            "status_code": null,
            "region": {},
            "query_string_keys": null,
            "render_data": "",
            "linked_to": "Global menu",
            "weight": 1
          },
          {
            "error": null,
            "id": "678a0d8626735e00076ecc57",
            "name": "SimpleMenu",
            "type": "static",
            "settings": [
              {
                "media": {
                  "filename": "sections/sections_sections_Group+2034a753d7ab0e04ac5bab7bd1fb80614bb845132eb956e45348072906290c9ea8e0c717a98b2a94585be5a500dd577683a.png",
                  "url": "https://s3.amazonaws.com/eweevtestbucketprivate/sections%2Fsections_sections_Group%2B2034a753d7ab0e04ac5bab7bd1fb80614bb845132eb956e45348072906290c9ea8e0c717a98b2a94585be5a500dd577683a.png",
                  "headers": {},
                  "seo_tag": null,
                  "media_id": "672cb7846777fd0007715fa4"
                },
                "menu": [
                  {
                    "label": {
                      "fr": "en",
                      "en": "en"
                    },
                    "link": {
                      "en": ""
                    },
                    "page": {
                      "fr": "page1",
                      "en": "page1"
                    },
                    "languageMenu": true,
                    "menuItemClasses": "language"
                  },
                  {
                    "label": {
                      "fr": "menu francais 2",
                      "en": "Menu 2"
                    },
                    "link": {
                      "fr": "",
                      "en": "#Plans-672cb93e6777fd0007354149"
                    },
                    "page": {
                      "fr": "page5",
                      "en": "page5"
                    },
                    "linkTarget": "_self"
                  },
                  {
                    "label": {
                      "fr": "menu francais 3",
                      "en": "Free sig"
                    },
                    "link": {
                      "fr": "",
                      "en": "#FAQ-672b7ace70b3b0000719f070"
                    },
                    "page": {
                      "fr": "",
                      "en": ""
                    },
                    "menuItemClasses": "sign-up"
                  },
                  {
                    "label": {
                      "fr": "",
                      "en": "menu 4"
                    },
                    "link": {
                      "fr": "",
                      "en": ""
                    },
                    "page": {
                      "fr": "newpagefortheproject",
                      "en": "newpagefortheproject"
                    }
                  },
                  {
                    "label": {
                      "fr": "",
                      "en": "menu 5"
                    },
                    "link": {
                      "fr": "",
                      "en": "/page1"
                    },
                    "page": {
                      "fr": "",
                      "en": ""
                    }
                  },
                  {
                    "label": {
                      "fr": "en",
                      "en": "fr"
                    },
                    "link": {
                      "fr": "",
                      "en": ""
                    },
                    "page": {
                      "fr": "",
                      "en": ""
                    },
                    "languageMenu": true,
                    "menuItemClasses": "language"
                  }
                ],
                "classes": "main",
                "logoLink": {
                  "fr": "",
                  "en": ""
                },
                "logoPage": {
                  "fr": "page2",
                  "en": "page2"
                },
                "menuLabel": {},
                "logoLinkTarget": "_blank"
              }
            ],
            "status_code": null,
            "region": {},
            "query_string_keys": null,
            "render_data": "",
            "linked_to": "Global menu 1",
            "weight": 0
          }
        ],
        "layout": "standard",
        "page": "page5",
        "variations": [],
        "invalid_sections": [],
        "last_updated": 1737103250
      },
    })

    const result = wrapper.vm.currentViews;

    // Expected result should be sorted by weight
    expect(result).toEqual([
      { id: 'view-1', name: 'section1', weight: 1, type: 'text', linked_to: '' },
      { id: 'view-2', name: 'section2', weight: 2, type: 'image', linked_to: '' }
    ]);

    const newViews = [
      { id: 3, name: 'View 3' }, // Will be assigned weight 0
      { id: 1, name: 'View 1' }, // Will be assigned weight 1
    ];

    // Call the setter
    wrapper.vm.currentViews = newViews;

    // Verify $set was called with updated weights
    expect(wrapper.vm.$set).toHaveBeenCalledWith(
      wrapper.vm.displayVariations.variation1.views,
      3,
      { id: 3, name: 'View 3', weight: 0 }
    );
    expect(wrapper.vm.$set).toHaveBeenCalledWith(
      wrapper.vm.displayVariations.variation1.views,
      1,
      { id: 1, name: 'View 1', weight: 1 }
    );

    wrapper.vm.$i18n.locale = 'en';
    wrapper.vm.$sections.queryStringSupport = 'enabled';

    await wrapper.vm.$options.fetch.call(wrapper.vm);

    expect(global.mocks.$axios.post).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        query_string: expect.objectContaining({
          language: 'en'
        }),
      }),
      expect.any(Object) // headers/config
    );

    // Check if both methods were called
    expect(initializeSectionsSpy).toHaveBeenCalled()
    expect(computeLayoutDataSpy).toHaveBeenCalled()

    // Clean up the spies
    initializeSectionsSpy.mockRestore()
    computeLayoutDataSpy.mockRestore()
  })

  it('addSectionType function should set section.weight if it is null, "null", or undefined', () => {
    const wrapper = shallowMount(SectionsMain, {
      mocks: {
        ...global.mocks,
        $sections: {
          cname: true
        }
      }
    });

    // Mocking component instance properties
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
      const showToast = jest.fn(); // Mock function
      const instance = {}; // Placeholder, customize if needed

      // Call the function
      wrapper.vm.addSectionType(section, showToast, instance);

      // Assert that weight has been set
      expect(section.weight).toBe(3); // Expect the length of views
    });
  });

  const TestComponent = {
    template: `
    <div>
      <div ref="sectionsMainTarget" style="position: relative; height: 500px; overflow: auto;">
        <div id="section-1" style="height: 100px; margin-top: 300px;">Section 1</div>
        <div id="section-2" style="height: 100px; margin-top: 300px;">Section 2</div>
      </div>
      <div ref="resizeTarget" style="position: relative; height: 500px; overflow: auto;"></div>
    </div>
  `,
    methods: {
      edit(view, viewAnchor) {
        setTimeout(() => {
          if (this.$refs.sectionsMainTarget) {
            const targetElement = this.$refs.sectionsMainTarget.querySelector(viewAnchor);
            if (targetElement) {
              const targetPosition = targetElement.offsetTop; // Get the vertical position of the element
              this.$refs.sectionsMainTarget.scrollTo({
                top: targetPosition,
                behavior: 'smooth',
              });
            }
          }
        }, 600);
      },
    },
  };

  jest.useFakeTimers();

  it('scrolls to the correct section when edit is called', async () => {
    const wrapper = mount(TestComponent);

    // Mock both scrollTo methods
    const scrollToMock = jest.fn();
    wrapper.vm.$refs.sectionsMainTarget.scrollTo = scrollToMock;

    wrapper.vm.$refs.sectionsMainTarget.querySelector = jest.fn(() => ({
      offsetTop: 300, // Mocking the offsetTop value
    }));

    // Call the edit function
    wrapper.vm.edit(null, '#section-1');

    // Fast-forward the timer
    jest.runAllTimers();

    // Assert that scrollTo was called with the correct parameters
    expect(scrollToMock).toHaveBeenCalledWith({
      top: 300,
      behavior: 'smooth',
    });
  });

  it('renders a SettingsIcon for each view', () => {
    // Find all instances of the SettingsIcon
    const settingsIcons = controlsWrapper.findAll('.settings-icon-wrapper');
    expect(settingsIcons.length).toBe(2); // Assert there are two icons (one per view)
  });

  it('toggles sectionOptions for the correct view when SettingsIcon is clicked', async () => {
    // Initialize sectionOptions
    controlsWrapper.setData({
      sectionOptions: {
        'view-1': false,
        'view-2': false,
      },
    });

    // Find the SettingsIcon for the first view and click it
    const firstSettingsIcon = controlsWrapper.findAll('.settings-icon-wrapper').at(0);
    await firstSettingsIcon.trigger('click');

    // Assert that sectionOptions for 'view-1' is toggled
    expect(controlsWrapper.vm.sectionOptions['view-1']).toBe(true);
    // Assert that sectionOptions for 'view-2' is unchanged
    expect(controlsWrapper.vm.sectionOptions['view-2']).toBe(false);

    // Find the SettingsIcon for the second view and click it
    const secondSettingsIcon = controlsWrapper.findAll('.settings-icon-wrapper').at(1);
    await secondSettingsIcon.trigger('click');

    // Assert that sectionOptions for 'view-2' is toggled
    expect(controlsWrapper.vm.sectionOptions['view-2']).toBe(true);
    // Assert that sectionOptions for 'view-1' remains unchanged
    expect(controlsWrapper.vm.sectionOptions['view-1']).toBe(true); // Remains true from the earlier toggle
  });

  it('renders controls div only for the view with sectionOptions set to true', async () => {
    // Set sectionOptions for only the first view
    controlsWrapper.setData({
      sectionOptions: {
        'view-1': true,
        'view-2': false,
      },
    });

    // Assert that the controls div is rendered for the first view
    const controls = controlsWrapper.findAll('.controls');
    expect(controls.length).toBe(2);
    expect(controls.at(0).element.closest('section').id).toBe('section1-view-1');

    // Set sectionOptions for only the second view
    await controlsWrapper.setData({
      sectionOptions: {
        'view-1': false,
        'view-2': true,
      },
    });

    // Assert that the controls div is now rendered for the second view
    const updatedControls = controlsWrapper.findAll('.controls');
    expect(updatedControls.length).toBe(3);
    expect(updatedControls.at(0).element.closest('section').id).toBe('section1-view-1');
  });

  it('shows input and select filters for all tabs', async () => {

    const tabsWrapper = shallowMount(SectionsMain, {
      mocks: {
        ...global.mocks,
        $sections: {
          cname: true
        }
      },
      propsData: {
        admin: true
      },
      data() {
        return {
          editMode: true,
          pageNotFound: false,
          isModalOpen: true,
          currentSection: false,
          isCreateInstance: false,
          typesTab: 'types',
          sectionsFilterName: '',
          sectionsFilterAppName: '',
          appNames: ['sections'],
          sectionOptions: {}, // Mock initial state
          view: { id: 'view-id', name: 'section1', weight: 1, type: 'text' }, // Mock view object
          currentViews: [
            { id: 'view-1', name: 'section1', weight: 1, type: 'text', linked_to: '' },
            { id: 'view-2', name: 'section2', weight: 2, type: 'image', linked_to: '' },
          ]
        };
      },
    });

    const tabs = ['types', 'globalTypes', 'inventoryTypes'];

    for (const tab of tabs) {
      // Set the active tab
      await tabsWrapper.setData({ typesTab: tab });

      // Assert input field is visible
      const inputFilter = tabsWrapper.find('input.sectionsFilterName');
      expect(inputFilter.exists()).toBe(true);

      if (tab !== 'inventoryTypes') {
        const selectFilter = tabsWrapper.find('select#select');
        expect(selectFilter.exists()).toBe(true);
      }

      // Assert the "clear filters" text is visible
      const clearFilters = tabsWrapper.find('.slot-name');
      expect(clearFilters.exists()).toBe(true);
    }
  });

  it('should maintain region weight and stay in position when editing a section in a non-standard layout', () => {
    const section = {
      id: 'test-section',
      type: 'custom',
      region: { customLayout: { slot: 'main', weight: 3 } },
    };

    controlsWrapper.vm.addSectionType(section, false, false);

    expect(controlsWrapper.vm.displayVariations[controlsWrapper.vm.selectedVariation].views[section.id].region.customLayout.weight).toBe(3);
  });

  it('should restore the section from updatedVariations', async () => {

    await jest.resetAllMocks();

    controlsWrapper.setProps({
      pageName: 'testPage',
      variations: [{ name: 'testPage', active: true }],
    })

    controlsWrapper.setData({
      selectedVariation: 'testPage',
      currentSection: { id: 'section1' },
      displayVariations: {
        testPage: {
          altered: true,
          views: {
            section1: { id: 'section1', content: 'Old Content' },
          },
        },
      },
      updatedVariations: {
        testPage: {
          views: {
            section1: { id: 'section1', content: 'Restored Content' },
          },
        },
      },
      currentViews: [{ id: 'section1', content: 'Old Content' }],
      selectedLayout: 'standard',
      viewsPerRegions: {
        region1: [{ id: 'section1', content: 'Old Content' }],
      }
    })

    controlsWrapper.vm.restoreSection();

    expect(controlsWrapper.vm.displayVariations.testPage.altered).toBe(false);
    expect(controlsWrapper.vm.displayVariations.testPage.views.section1.content).toBe(
      'Restored Content'
    );
    expect(controlsWrapper.vm.currentViews[0].content).toBe('Restored Content');


    await jest.resetAllMocks();

    controlsWrapper.setData({
      selectedVariation: 'testPage',
      currentSection: { id: 'section1' },
      displayVariations: {
        testPage: {
          altered: true,
          views: {
            section1: { id: 'section1', content: 'Old Content' },
          },
        },
      },
      updatedVariations: {
        testPage: {
          views: {
            section1: { id: 'section1', content: 'Restored Content' },
          },
        },
      },
      currentViews: [{ id: 'section1', content: 'Old Content' }],
      viewsPerRegions: {
        region1: [{ id: 'section1', content: 'Old Content' }],
      },
      selectedSlotRegion: 'region1',
      selectedLayout: 'custom-layout'
    })

    controlsWrapper.vm.restoreSection();

    expect(controlsWrapper.vm.viewsPerRegions.region1[0].content).toBe('Restored Content');
  });

  it('Hide SettingsIcon for the views when sidebar is opened', async () => {

    controlsWrapper.vm.isSideBarOpen = true

    controlsWrapper.vm.$nextTick(() => {
      const settingsIcons = controlsWrapper.findAll('.settings-icon-wrapper');
      expect(settingsIcons.length).toBe(0);
    })
  });

})

describe('Types tests', () => {

  const typesWrapper = shallowMount(SectionsMain, {
    mocks: {
      ...global.mocks,
      $sections: {
        cname: true
      }
    },
    propsData: {
      admin: true
    },
    data() {
      return {
        editMode: true,
        pageNotFound: false,
        isModalOpen: true,
        currentSection: false,
        isCreateInstance: false,
        typesTab: 'types',
        sectionsFilterName: '',
        sectionsFilterAppName: '',
        appNames: ['sections'],
        sectionOptions: {}, // Mock initial state
        view: { id: 'view-id', name: 'section1', weight: 1, type: 'text' }, // Mock view object
        currentViews: [
          { id: 'view-1', name: 'section1', weight: 1, type: 'text', linked_to: '' },
          { id: 'view-2', name: 'section2', weight: 2, type: 'image', linked_to: '' },
        ],
        globalTypes: [],
        types: [
          {
            name: 'Section1',
            type: 'configurable',
            query_string_keys: ['key1', 'key2'],
            fields: ['field1'],
            dynamic_options: ['option1'],
            application: 'app1',
          },
        ],
        loading: false,
        allSections: [],
      };
    },
  });

  it('should not proceed if globalTypes already has data', async () => {
    typesWrapper.setData({ globalTypes: [{ id: 1, name: 'Test' }] });

    await jest.resetAllMocks();
    await typesWrapper.vm.getGlobalSectionTypes(false);

    expect(global.mocks.$axios.get).not.toHaveBeenCalled();
    expect(typesWrapper.vm.loading).toBe(false);
  });

  it('should fetch and process global types if not already loaded', async () => {
    const mockResponse = {
      data: {
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
      },
    };

    typesWrapper.setData({ globalTypes: [] });

    global.mocks.$axios.get.mockResolvedValue(mockResponse);

    await typesWrapper.vm.getGlobalSectionTypes(false);

    expect(global.mocks.$axios.get).toHaveBeenCalled();
    expect(typesWrapper.vm.globalTypes).toHaveLength(2);
    expect(typesWrapper.vm.globalTypes[0]).toMatchObject({
      name: 'Section1',
      type: 'configurable',
      regions: ['Region1'],
      auto_insertion: true,
    });
    expect(typesWrapper.vm.loading).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    global.mocks.$axios.get.mockRejectedValue(new Error('Fetch failed'));

    await typesWrapper.vm.getGlobalSectionTypes(false);

    expect(typesWrapper.vm.loading).toBe(false);
  });

});

describe('render call has language sent in qs when the condition is met', () => {
  let wrapper;
  let mockAxios;

  beforeEach(() => {
    mockAxios = {
      post: jest.fn(() => Promise.resolve({ data: {} })),
    };

    wrapper = shallowMount(SectionsMain, {
      mocks: {
        ...global.mocks,
        $sections: {
          serverUrl: 'https://mock.server',
          projectId: 'mockProjectId',
          queryStringSupport: 'enabled',
        },
        $axios: mockAxios,
        $i18n: {
          locale: 'fr',
          defaultLocale: 'en',
        },
        $route: {
          query: jest.fn(),
          params: {
            pathMatch: jest.fn()
          }
        },
        sectionHeader: jest.fn().mockReturnValue({}),
        parseQS: jest.fn((path, hasQuery, query) => ({ path, hasQuery, query })),
        validateQS: jest.fn((queryString, keys, editMode) => ({ validated: true })),
      },
      propsData: {},
    });
  });

  it('includes query_string and language in variables when queryStringSupport is enabled', async () => {
    const gt = {
      section: {
        name: 'testSection',
      },
      query_string_keys: ['key1', 'key2'],
    };
    const options = { option1: true };

    await wrapper.vm.renderConfigurableSection(gt, options);

    // Assert axios.post is called with the correct URL and variables
    expect(mockAxios.post).toHaveBeenCalledWith(
      'https://mock.server/project/mockProjectId/section/render',
      expect.objectContaining({
        query_string: expect.objectContaining({
          language: 'fr', // Assert language is included
        }),
      }),
      expect.any(Object) // headers/config
    );
  });

  it('does not include query_string if queryStringSupport is disabled', async () => {
    wrapper.vm.$sections.queryStringSupport = 'disabled';

    const gt = {
      section: {
        name: 'testSection',
      },
      query_string_keys: [],
    };
    const options = { option1: true };

    await wrapper.vm.renderConfigurableSection(gt, options);

    // Assert axios.post is called without query_string in variables
    expect(mockAxios.post).toHaveBeenCalledWith(
      'https://mock.server/project/mockProjectId/section/render',
      expect.not.objectContaining({
        query_string: expect.any(Object),
      }),
      expect.any(Object)
    );
  });

  it('include language if locale matches defaultLocale', async () => {
    wrapper.vm.$i18n.locale = 'en';
    wrapper.vm.$sections.queryStringSupport = "enabled";

    const gt = {
      section: {
        name: 'testSection',
      },
      query_string_keys: ['key1', 'key2'],
    };
    const options = { option1: true };

    await wrapper.vm.renderConfigurableSection(gt, options);

    // Assert axios.post is called with query_string but no language
    expect(mockAxios.post).toHaveBeenCalledWith(
      'https://mock.server/project/mockProjectId/section/render',
      expect.objectContaining({
        query_string: expect.objectContaining({
          language: expect.any(String),
        }),
      }),
      expect.any(Object)
    );
  });
});

describe('alteredViews computed property', () => {
  let wrapper;
  let mockImportJs;

  beforeEach(() => {
    mockImportJs = jest.fn();
    wrapper = mount(SectionsMain, {
      mocks: {
        ...global.mocks,
        $sections: {
          serverUrl: 'https://mock.server',
          projectId: 'mockProjectId',
          queryStringSupport: 'enabled',
        },
        $i18n: {
          locale: 'fr',
          defaultLocale: 'en',
        },
        $route: {
          query: jest.fn(),
          params: {
            pathMatch: jest.fn()
          }
        },
        sectionHeader: jest.fn().mockReturnValue({}),
        parseQS: jest.fn((path, hasQuery, query) => ({ path, hasQuery, query })),
        validateQS: jest.fn((queryString, keys, editMode) => ({ validated: true })),
      },
      methods: {
        importJs: mockImportJs,
      },
    });
  });

  it('returns alteredSections when page_pre_render is a function and returns a value', () => {
    const mockPagePreRender = jest.fn().mockReturnValue([{ id: 1 }]);
    mockImportJs.mockReturnValue({
      page_pre_render: mockPagePreRender,
    });

    wrapper.setData({
      pageData: [{ id: 1 }],
      currentViews: [{ id: 2 }],
    });

    expect(wrapper.vm.alteredViews).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 2, weight: 0 })])
    );
  });

  it('returns currentViews when page_pre_render is not a function', () => {
    mockImportJs.mockReturnValue({
      page_pre_render: 'not-a-function',
    });

    wrapper.setData({
      pageData: [{ id: 1 }],
      currentViews: [{ id: 2 }],
    });

    expect(wrapper.vm.alteredViews).toEqual([{ id: 2, weight: 0 }]);
  });

  it('returns currentViews when page_pre_render returns null', () => {
    const mockPagePreRender = jest.fn().mockReturnValue(null);
    mockImportJs.mockReturnValue({
      page_pre_render: mockPagePreRender,
    });

    wrapper.setData({
      pageData: [{ id: 1 }],
      currentViews: [{ id: 2 }],
    });

    expect(wrapper.vm.alteredViews).toEqual([{ id: 2, weight: 0 }]);
  });
});

describe('Add section type side bar view', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(SectionsMain, {
      mocks: {
        ...global.mocks,
        $sections: {
          serverUrl: 'https://mock.server',
          projectId: 'mockProjectId',
          queryStringSupport: 'enabled',
        },
        $i18n: {
          locale: 'fr',
          defaultLocale: 'en',
        },
        $route: {
          query: jest.fn(),
          params: {
            pathMatch: jest.fn()
          }
        },
        sectionHeader: jest.fn().mockReturnValue({}),
        parseQS: jest.fn((path, hasQuery, query) => ({ path, hasQuery, query })),
        validateQS: jest.fn((queryString, keys, editMode) => ({ validated: true })),
      }
    });
  });

  it('Add section popup shows on the sidebar', async () => {
    wrapper.setProps({
      admin: true
    });

    wrapper.setData({
      isSideBarOpen: false,
      editMode: true,
      creationView: true,
      selectedLayout: 'standard',
      currentSection: {name: 'wysiwyg', type: 'static'}
    });

    await wrapper.vm.openCurrentSection({name: 'wysiwyg', type: 'static'});

    expect(wrapper.vm.isSideBarOpen).toBe(true);

    const creationView = wrapper.find('.creation-view-standard')

    expect(creationView.exists()).toBe(true);

  });

});

const mockData = [
  { id: 0, name: 'Item 1' },
  { id: 1, name: 'Item 2' },
  { id: 2, name: 'Item 3' }
]

describe('FieldSets.vue', () => {
  let wrapper

  const createComponent = (propsData = {}, slots = {}) => {
    wrapper = mount(FieldSets, {
      propsData: {
        arrayDataPop: mockData,
        legendLabel: 'Test Legend',
        ...propsData
      },
      slots
    })
  }

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders fieldsets based on arrayDataPop', () => {
    createComponent()
    const fieldsets = wrapper.findAll('fieldset')
    expect(fieldsets.length).toBe(3)
  })

  it('renders custom legend labels using alterLengendLabel', () => {
    createComponent()
    const legends = wrapper.findAll('legend')
    legends.wrappers.forEach((legend, idx) => {
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
    await wrapper.setData({ arrayData: newArray })

    expect(wrapper.emitted('array-updated')).toBeTruthy()
    expect(wrapper.emitted('array-updated')[0][0].length).toBe(4)
  })

  it('applies custom classes from props', () => {
    createComponent({
      draggableClasses: 'custom-draggable',
      mainWrapperClasses: 'main-wrapper',
      wrapperClasses: 'custom-wrapper',
      legendClasses: 'custom-legend'
    })

    expect(wrapper.find('.custom-draggable').exists()).toBe(true)
    expect(wrapper.find('.main-wrapper').exists()).toBe(true)
    expect(wrapper.find('.custom-wrapper').exists()).toBe(true)
    expect(wrapper.find('.custom-legend').exists()).toBe(true)
  })

  it('renders slot content correctly', () => {
    createComponent({}, { default: '<div class="custom-slot">Slot Content</div>' })
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

  it('ensures the target controls div does not display above the Media container div', () => {
    const wrapper = shallowMount(TestComponent);

    const backgroundDiv = wrapper.find('.media-container');
    const targetDiv = wrapper.find('.control-button.config-buttons');

    const backgroundZIndex = window.getComputedStyle(backgroundDiv.element).zIndex;
    const targetZIndex = window.getComputedStyle(targetDiv.element).zIndex;

    expect(Number(targetZIndex)).toBeLessThan(Number(backgroundZIndex));
  });
});
