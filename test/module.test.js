import { shallowMount } from '@vue/test-utils'
import SectionsMain from '../lib/src/components/Sections/index.vue'

jest.mock('@geeks.solutions/vue-components/components/AutoComplete.vue', () => ({
  name: 'AutoComplete',
  render: () => null
}));

describe('SectionsMain', () => {
  test('calls initializeSections and computeLayoutData in fetch()', async () => {
    // Create a spy for both methods
    const initializeSectionsSpy = jest.spyOn(SectionsMain.methods, 'initializeSections')
    const computeLayoutDataSpy = jest.spyOn(SectionsMain.methods, 'computeLayoutData')

    // Mount the component
    const wrapper = shallowMount(SectionsMain, {
      mocks: {
        // Mock any dependencies like $axios or $store if they are used in fetch
        $sections: {
          cname: true
        }
      }
    })

    // Manually call the fetch method
    await wrapper.vm.fetch()

    // Check if both methods were called
    expect(initializeSectionsSpy).toHaveBeenCalled()
    expect(computeLayoutDataSpy).toHaveBeenCalled()

    // Optionally, check if initializeSections is called with the expected argument
    // Example: expect(initializeSectionsSpy).toHaveBeenCalledWith(expectedResponse)

    // Clean up the spies
    initializeSectionsSpy.mockRestore()
    computeLayoutDataSpy.mockRestore()
  })
})
