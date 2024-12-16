import { shallowMount, mount } from '@vue/test-utils'
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

})
