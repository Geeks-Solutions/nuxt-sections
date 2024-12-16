import { shallowMount } from '@vue/test-utils'
import SectionsMain from '../lib/src/components/Sections/index.vue'

jest.mock('@geeks.solutions/vue-components/components/AutoComplete.vue', () => ({
  name: 'AutoComplete',
  render: () => null
}));

describe('SectionsMain', () => {
  // test('calls initializeSections and computeLayoutData in fetch()', async () => {
  //   // Create a spy for both methods
  //   const initializeSectionsSpy = jest.spyOn(SectionsMain.methods, 'initializeSections')
  //   const computeLayoutDataSpy = jest.spyOn(SectionsMain.methods, 'computeLayoutData')
  //
  //   // Mount the component
  //   const wrapper = shallowMount(SectionsMain, {
  //     mocks: {
  //       // Mock any dependencies like $axios or $store if they are used in fetch
  //       $sections: {
  //         cname: true
  //       }
  //     }
  //   })
  //
  //   // Manually call the fetch method
  //   await wrapper.vm.fetch()
  //
  //   // Check if both methods were called
  //   expect(initializeSectionsSpy).toHaveBeenCalled()
  //   expect(computeLayoutDataSpy).toHaveBeenCalled()
  //
  //   // Optionally, check if initializeSections is called with the expected argument
  //   // Example: expect(initializeSectionsSpy).toHaveBeenCalledWith(expectedResponse)
  //
  //   // Clean up the spies
  //   initializeSectionsSpy.mockRestore()
  //   computeLayoutDataSpy.mockRestore()
  // })

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

})
