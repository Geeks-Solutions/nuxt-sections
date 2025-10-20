import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MainBuilder from '../MainBuilder.vue'

describe('Layout MainBuilder Component', () => {
  let wrapper
  let mockGetComponent
  let mockEditable

  beforeEach(() => {
    mockGetComponent = vi.fn()
    mockEditable = vi.fn()

    wrapper = mount(MainBuilder, {
      props: {
        pageData: {
          sections: []
        },
        getComponent: mockGetComponent,
        editable: mockEditable,
        admin: true,
        editMode: true
      },
      global: {
        stubs: {
          LayoutElementsLayoutHandle: true,
          LayoutElementsLayoutLine: true,
          LayoutElementsLayoutSelectionModal: true
        }
      }
    })
  })

  describe('buildLayoutTree', () => {
    it('should build a flat layout tree with no nesting', () => {
      const sections = [
        { id: '1', region: { path: '0/0' }, weight: 0, type: 'section' },
        { id: '2', region: { path: '0/1' }, weight: 1, type: 'section' }
      ]

      wrapper.vm.sections = sections
      const layouts = wrapper.vm.computedLayouts

      expect(layouts).toHaveLength(1) // Number of lines
      expect(layouts[0].items).toHaveLength(2) // Number of columns
      expect(layouts[0].items[0].path).toBe('0/0')
      expect(layouts[0].items[1].path).toBe('0/1')
    })

    it('should build a nested layout tree with 4-segment paths', () => {
      const sections = [
        { id: '1', region: { path: '0/0' }, weight: 0, type: 'section' },
        { id: '2', region: { path: '0/0/0/0' }, weight: 1, type: 'section' },
        { id: '3', region: { path: '0/0/1/0' }, weight: 2, type: 'section' }
      ]

      wrapper.vm.sections = sections
      const layouts = wrapper.vm.computedLayouts

      expect(layouts).toHaveLength(1) // Number of direct lines
      expect(layouts[0].items).toHaveLength(1) // Number of columns

      // First item is the direct section
      expect(layouts[0].items[0].path).toBe('0/0')

      // Next two items are nested lines
      const nestedLines = layouts[0].items[0].items.filter(item => item.itemType === 'line')
      expect(nestedLines).toHaveLength(2) // Number of nested lines
      expect(nestedLines[0].path).toBe('0/0/0')
      expect(nestedLines[1].path).toBe('0/0/1')
    })

    it('should handle multiple root lines', () => {
      const sections = [
        { id: '1', region: { path: '0/0' }, weight: 0, type: 'section' },
        { id: '2', region: { path: '0/1' }, weight: 1, type: 'section' },
        { id: '3', region: { path: '1/0' }, weight: 2, type: 'section' }
      ]

      wrapper.vm.sections = sections
      const layouts = wrapper.vm.computedLayouts

      expect(layouts).toHaveLength(2) // Number of direct lines
      expect(layouts[0].path).toBe('0')
      expect(layouts[1].path).toBe('1')
      expect(layouts[0].items).toHaveLength(2) // Number of columns for line 0
      expect(layouts[1].items).toHaveLength(1) // Number of columns for line 1
    })

    it('should handle deeply nested structures', () => {
      const sections = [
        { id: '1', region: { path: '0/0' }, weight: 0, type: 'section' },
        { id: '2', region: { path: '0/0/0/0' }, weight: 1, type: 'section' },
        { id: '3', region: { path: '0/0/0/0/0/0' }, weight: 2, type: 'section' }
      ]

      wrapper.vm.sections = sections
      const layouts = wrapper.vm.computedLayouts

      expect(layouts).toHaveLength(1) // Number of lines
      expect(layouts[0].items[0].path).toBe('0/0')

      // Check nested structure
      const firstNested = layouts[0].items[0].items.find(item => item.itemType === 'line')
      expect(firstNested).toBeDefined()
      expect(firstNested.path).toBe('0/0/0')
    })

    it('should handle empty sections array', () => {
      wrapper.vm.sections = []
      const layouts = wrapper.vm.computedLayouts

      expect(layouts).toHaveLength(0)
    })
  })

  describe('recalculateWeights', () => {
    it('should recalculate weights in correct order for simple paths', () => {
      wrapper.vm.sections = [
        { id: '1', region: { path: '1/0' }, weight: 5, type: 'section' },
        { id: '2', region: { path: '0/0' }, weight: 3, type: 'section' },
        { id: '3', region: { path: '0/1' }, weight: 1, type: 'section' }
      ]

      wrapper.vm.recalculateWeights()

      expect(wrapper.vm.sections[0].weight).toBe(0) // 0/0
      expect(wrapper.vm.sections[0].id).toBe('2')
      expect(wrapper.vm.sections[1].weight).toBe(1) // 0/1
      expect(wrapper.vm.sections[1].id).toBe('3')
      expect(wrapper.vm.sections[2].weight).toBe(2) // 1/0
      expect(wrapper.vm.sections[2].id).toBe('1')
    })

    it('should recalculate weights for nested paths', () => {
      wrapper.vm.sections = [
        { id: '1', region: { path: '0/0/1/0' }, weight: 10, type: 'section' },
        { id: '2', region: { path: '0/0' }, weight: 5, type: 'section' },
        { id: '3', region: { path: '0/0/0/0' }, weight: 7, type: 'section' }
      ]

      wrapper.vm.recalculateWeights()

      expect(wrapper.vm.sections[0].id).toBe('2') // 0/0
      expect(wrapper.vm.sections[0].weight).toBe(0)
      expect(wrapper.vm.sections[1].id).toBe('3') // 0/0/0/0
      expect(wrapper.vm.sections[1].weight).toBe(1)
      expect(wrapper.vm.sections[2].id).toBe('1') // 0/0/1/0
      expect(wrapper.vm.sections[2].weight).toBe(2)
    })

    it('should handle mixed path lengths', () => {
      wrapper.vm.sections = [
        { id: '1', region: { path: '0/0/0/0/0/0' }, weight: 10, type: 'section' },
        { id: '2', region: { path: '0/0' }, weight: 5, type: 'section' },
        { id: '3', region: { path: '0/0/0/0' }, weight: 7, type: 'section' }
      ]

      wrapper.vm.recalculateWeights()

      expect(wrapper.vm.sections[0].id).toBe('2')
      expect(wrapper.vm.sections[1].id).toBe('3')
      expect(wrapper.vm.sections[2].id).toBe('1')
      expect(wrapper.vm.sections.every((s, i) => s.weight === i)).toBe(true)
    })
  })

  describe('handleLayoutSelect', () => {
    beforeEach(() => {
      wrapper.vm.layoutSelectionModal = {
        handleCloseModal: vi.fn()
      }
    })

    it('should add a new line with correct regions at the end', () => {
      wrapper.vm.sections = [
        { id: '1', region: { path: '0/0' }, weight: 0, type: 'section' }
      ]
      wrapper.vm.modalContext = { path: '0/0', type: null, insertAfter: true }

      wrapper.vm.handleLayoutSelect(2)

      const newSections = wrapper.vm.sections.filter(s => s.region.path.startsWith('1/'))
      expect(newSections).toHaveLength(2)
      expect(newSections[0].region.path).toBe('1/0')
      expect(newSections[1].region.path).toBe('1/1')
      expect(newSections.every(s => s._isPlaceholder)).toBe(true)
    })

    it('should insert a line after first-region of a line', () => {
      wrapper.vm.sections = [
        { id: '1', region: { path: '0/0' }, weight: 0, type: 'section' },
        { id: '2', region: { path: '1/0' }, weight: 1, type: 'section' }
      ]
      wrapper.vm.modalContext = { path: '0/0', type: 'first-region', insertAfter: true }

      wrapper.vm.handleLayoutSelect(3) // 3 is the region/column count

      // Inserted Line 1 should now exist
      const line1Sections = wrapper.vm.sections.filter(s => s.region.path.startsWith('1/'))
      expect(line1Sections).toHaveLength(3) // Number of columns/regions for the inserted line

      // Original line 1 should be shifted to line 2
      const line2Sections = wrapper.vm.sections.filter(s => s.region.path.startsWith('2/'))
      expect(line2Sections).toHaveLength(1)
      expect(line2Sections[0].id).toBe('2')
      expect(line2Sections[0].region.path).toBe('2/0')
    })

    it('should convert section to nested lines when adding under a section', () => {
      wrapper.vm.sections = [
        { id: '1', region: { path: '0/0' }, weight: 0, type: 'section' },
        { id: '2', region: { path: '0/0' }, weight: 1, type: 'section' }
      ]
      wrapper.vm.modalContext = { path: '0/0', type: 'section', sectionWeight: 0, insertAfter: true }

      wrapper.vm.handleLayoutSelect(2)

      // First section should be converted to 0/0/0/0
      const firstSection = wrapper.vm.sections.find(s => s.id === '1')
      expect(firstSection.region.path).toBe('0/0/0/0')

      // New line should be added at 0/0/1/x with 2 regions/columns
      const newLine = wrapper.vm.sections.filter(s => s.region.path.startsWith('0/0/1/'))
      expect(newLine).toHaveLength(2)
      expect(newLine[0].region.path).toBe('0/0/1/0')
      expect(newLine[1].region.path).toBe('0/0/1/1')

      // Second section should be converted to 0/0/2/0
      const secondSection = wrapper.vm.sections.find(s => s.id === '2')
      expect(secondSection.region.path).toBe('0/0/2/0')
    })

    it('should insert nested line between two sections', () => {
      wrapper.vm.sections = [
        { id: '1', region: { path: '1/1' }, weight: 0, type: 'section' },
        { id: '2', region: { path: '1/1' }, weight: 1, type: 'section' }
      ]
      wrapper.vm.modalContext = { path: '1/1', type: 'section', sectionWeight: 0, insertAfter: true }

      wrapper.vm.handleLayoutSelect(2)

      // First section: 1/1/0/0
      const firstSection = wrapper.vm.sections.find(s => s.id === '1')
      expect(firstSection.region.path).toBe('1/1/0/0')

      // New line: 1/1/1/x
      const newLine = wrapper.vm.sections.filter(s => s.region.path.startsWith('1/1/1/') && s._isPlaceholder)
      expect(newLine).toHaveLength(2)

      // Second section: 1/1/2/0
      const secondSection = wrapper.vm.sections.find(s => s.id === '2')
      expect(secondSection.region.path).toBe('1/1/2/0')
    })

    it('should handle adding nested line with existing nested sections', () => {
      wrapper.vm.sections = [
        { id: '1', region: { path: '1/1' }, weight: 0, type: 'section' },
        { id: '2', region: { path: '1/1/1/0' }, weight: 1, type: 'section' },
        { id: '3', region: { path: '1/1' }, weight: 2, type: 'section' }
      ]
      wrapper.vm.modalContext = { path: '1/1', type: 'section', sectionWeight: 0, insertAfter: true }

      wrapper.vm.handleLayoutSelect(5)

      // First section: 1/1/0/0
      expect(wrapper.vm.sections.find(s => s.id === '1').region.path).toBe('1/1/0/0')

      // New line should be inserted at position 1: 1/1/1/x and should have 5 columns/regions
      const newLine = wrapper.vm.sections.filter(s => s.region.path.startsWith('1/1/1/') && s._isPlaceholder)
      expect(newLine).toHaveLength(5)

      // Existing nested section should be shifted: 1/1/2/0
      expect(wrapper.vm.sections.find(s => s.id === '2').region.path).toBe('1/1/2/0')

      // Last section: 1/1/3/0
      expect(wrapper.vm.sections.find(s => s.id === '3').region.path).toBe('1/1/3/0')
    })

    it('should handle adding nested line in deeply nested structure', () => {
      wrapper.vm.sections = [
        { id: '1', region: { path: '0/0/0/0' }, weight: 0, type: 'section' },
        { id: '2', region: { path: '0/0/0/0' }, weight: 1, type: 'section' }
      ]
      wrapper.vm.modalContext = { path: '0/0/0/0', type: 'section', sectionWeight: 0, insertAfter: true }

      wrapper.vm.handleLayoutSelect(3)

      // First section: 0/0/0/0/0/0
      expect(wrapper.vm.sections.find(s => s.id === '1').region.path).toBe('0/0/0/0/0/0')

      // New line: 0/0/0/0/1/x (3 regions)
      const newLine = wrapper.vm.sections.filter(s => s.region.path.startsWith('0/0/0/0/1/'))
      expect(newLine).toHaveLength(3)

      // Second section originally becomes at line 2 : 0/0/0/0/2/0
      expect(wrapper.vm.sections.find(s => s.id === '2').region.path).toBe('0/0/0/0/2/0')
    })
  })

  describe('handleContentSelect', () => {
    beforeEach(() => {
      wrapper.vm.modalContext = { path: '0/0', type: null, insertAfter: true }
    })

    it('should add content to existing region and remove placeholder', () => {
      wrapper.vm.sections = [
        { id: '1', region: { path: '0/0' }, weight: 0, type: 'placeholder', _isPlaceholder: true }
      ]

      const sectionData = { type: 'static', title: 'Test Section' }
      wrapper.vm.handleContentSelect(sectionData)

      const sections = wrapper.vm.sections
      expect(sections).toHaveLength(1)
      expect(sections[0]._isPlaceholder).toBeUndefined()
      expect(sections[0].type).toBe('static')
      expect(sections[0].title).toBe('Test Section')
      expect(sections[0].region.path).toBe('0/0')
    })

    it('should add content after existing section in same region', () => {
      wrapper.vm.sections = [
        { id: '1', region: { path: '0/0' }, weight: 0, type: 'static' }
      ]

      const sectionData = { type: 'static', title: 'Second Section' }
      wrapper.vm.modalContext = { path: '0/0', type: 'section', sectionWeight: 0, insertAfter: true }

      wrapper.vm.handleContentSelect(sectionData)

      const sections = wrapper.vm.sections.filter(s => s.region.path === '0/0')
      console.log('sections', sections)
      expect(sections).toHaveLength(2)
      expect(sections[1].type).toBe('static')
      expect(sections[1].title).toBe('Second Section')
      expect(sections[1].weight).toBeGreaterThan(sections[0].weight)
    })

    it('should add content in new line after first-region', () => {
      wrapper.vm.sections = [
        { id: '1', region: { path: '0/0' }, weight: 0, type: 'section' },
        { id: '2', region: { path: '1/0' }, weight: 1, type: 'section' }
      ]
      wrapper.vm.modalContext = { path: '0/0', type: 'first-region', insertAfter: true }

      const sectionData = { type: 'hero', title: 'New Section' }
      wrapper.vm.handleContentSelect(sectionData)

      // Original line 1 should be shifted to line 2
      expect(wrapper.vm.sections.find(s => s.id === '2').region.path).toBe('2/0')

      // New content should be in line 1
      const newSection = wrapper.vm.sections.find(s => s.type === 'hero')
      expect(newSection.region.path).toBe('1/0')
    })

    it('should handle sectionWeight to insert after specific section', () => {
      wrapper.vm.sections = [
        { id: '1', region: { path: '0/0' }, weight: 0, type: 'hero' },
        { id: '2', region: { path: '0/0' }, weight: 1, type: 'content' }
      ]
      wrapper.vm.modalContext = { path: '0/0', type: null, sectionWeight: 0, insertAfter: true }

      const sectionData = { type: 'footer', title: 'Footer' }
      wrapper.vm.handleContentSelect(sectionData)

      const sections = wrapper.vm.sections.filter(s => s.region.path === '0/0')
      expect(sections).toHaveLength(3)

      // New section should be inserted after the first section (weight 0)
      expect(sections[1].type).toBe('footer')
      expect(sections[2].type).toBe('content')
    })

    it('should maintain correct weights after content insertion', () => {
      wrapper.vm.sections = [
        { id: '1', region: { path: '0/0' }, weight: 5, type: 'hero' },
        { id: '2', region: { path: '0/1' }, weight: 10, type: 'content' }
      ]

      const sectionData = { type: 'footer', title: 'Footer' }
      wrapper.vm.handleContentSelect(sectionData)

      // All sections should have sequential weights
      expect(wrapper.vm.sections[0].weight).toBe(0)
      expect(wrapper.vm.sections[1].weight).toBe(1)
      expect(wrapper.vm.sections[2].weight).toBe(2)
    })

    it('should handle nested region paths', () => {
      wrapper.vm.sections = [
        { id: '1', region: { path: '0/0/0/0' }, weight: 0, type: 'placeholder', _isPlaceholder: true }
      ]
      wrapper.vm.modalContext = { path: '0/0/0/0', type: null, insertAfter: true }

      const sectionData = { type: 'hero', title: 'Nested Section' }
      wrapper.vm.handleContentSelect(sectionData)

      const newSection = wrapper.vm.sections.find(s => s.type === 'hero')
      expect(newSection.region.path).toBe('0/0/0/0')
      expect(newSection._isPlaceholder).toBeUndefined()
    })

    it('should remove only placeholder in target region', () => {
      wrapper.vm.sections = [
        { id: '1', region: { path: '0/0' }, weight: 0, type: 'placeholder', _isPlaceholder: true },
        { id: '2', region: { path: '0/1' }, weight: 1, type: 'placeholder', _isPlaceholder: true }
      ]
      wrapper.vm.modalContext = { path: '0/0', type: null, insertAfter: true }

      const sectionData = { type: 'hero', title: 'Test' }
      wrapper.vm.handleContentSelect(sectionData)

      // Placeholder in 0/1 should remain
      const placeholder = wrapper.vm.sections.find(s => s.region.path === '0/1' && s._isPlaceholder)
      expect(placeholder).toBeDefined()

      // Placeholder in 0/0 should be removed
      const removedPlaceholder = wrapper.vm.sections.find(s => s.region.path === '0/0' && s._isPlaceholder)
      expect(removedPlaceholder).toBeUndefined()
    })
  })

  describe('handleDragLine', () => {

  })

  describe('handleDragRegion', () => {
    // allow ordering regions within the same line only for now and have the region path and section weights updated correctly
  })

  describe('handleDragSection', () => {
    // create a placeholder when moving a section from a region in case the region doesn't have sections left inside it (this is to prevent the region from being removed)
    // update the section region path and weight to the new one where it got dropped
  })

})
