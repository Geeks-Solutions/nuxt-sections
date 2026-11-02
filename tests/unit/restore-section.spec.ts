import { describe, expect, it } from 'vitest'
import { restoreSectionView } from '../../src/runtime/utils/restore-section'

describe('section restoration', () => {
  const setup = () => {
    const saved = { id: 'a', weight: 1, region: { layout: { slot: 'main', weight: 1 } } }
    const other = { id: 'b', weight: 2, region: { layout: { slot: 'main', weight: 2 } } }
    const changed = { ...saved, weight: 9 }
    return {
      views: { a: changed, b: other },
      savedViews: { a: saved, b: other },
      id: 'a',
      regions: { main: [changed, other] } as Record<string, any[]>,
      layout: 'layout',
      fallbackSlot: 'main',
    }
  }

  it('restores the saved view without changing neighboring views', () => {
    const state = setup()
    expect(restoreSectionView(state)).toBe(true)
    expect(state.views.a).toBe(state.savedViews.a)
    expect(state.regions.main).toEqual([state.savedViews.a, state.views.b])
    expect(state.views.b).toBe(state.savedViews.b)
  })

  it.each(['missing region', 'missing view'])(
    'rebuilds a %s from authoritative views',
    (scenario) => {
      const state = setup()
      if (scenario === 'missing region') state.regions = {}
      else state.regions.main = [state.views.b]
      restoreSectionView(state)
      expect(state.regions.main).toEqual([state.savedViews.a, state.views.b])
      expect(Object.hasOwn(state.regions.main, '-1')).toBe(false)
    }
  )

  it('does not alter views when the saved section is missing', () => {
    const state = setup()
    const before = state.views.a
    state.savedViews = {} as typeof state.savedViews
    expect(restoreSectionView(state)).toBe(false)
    expect(state.views.a).toBe(before)
  })

  it('removes a stale region entry when a restored section belongs elsewhere', () => {
    const state = setup()
    state.savedViews.a.region.layout.slot = 'header'
    restoreSectionView(state)
    expect(state.regions.main).toEqual([state.views.b])
    expect(state.regions.header).toEqual([state.savedViews.a])
  })
})
