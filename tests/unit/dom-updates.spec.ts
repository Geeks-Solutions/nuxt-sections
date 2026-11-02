import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDomScheduler } from '../../src/runtime/utils/dom-updates'

afterEach(() => vi.useRealTimers())

describe('deferred DOM updates', () => {
  it('performs normal DOM updates after rendering', async () => {
    const onError = vi.fn()
    const scheduler = createDomScheduler(onError)
    const element = document.createElement('div')
    await scheduler.nextTick(() => element.style.setProperty('--section-height', '120px'))
    expect(element.style.getPropertyValue('--section-height')).toBe('120px')
    expect(onError).not.toHaveBeenCalled()
    scheduler.dispose()
  })

  it('runs DOM work after rendering and reports callback failures', async () => {
    const onError = vi.fn()
    const scheduler = createDomScheduler(onError)
    const error = new Error('Missing DOM target')
    const callback = vi.fn(() => {
      throw error
    })
    const update = scheduler.nextTick(callback)
    expect(callback).not.toHaveBeenCalled()
    await expect(update).resolves.toBeUndefined()
    expect(onError).toHaveBeenCalledExactlyOnceWith(error)
  })

  it('reports timer failures at the timer boundary', () => {
    vi.useFakeTimers()
    const onError = vi.fn()
    const scheduler = createDomScheduler(onError)
    const error = new Error('Detached target')
    scheduler.delay(() => {
      throw error
    }, 600)
    vi.advanceTimersByTime(600)
    expect(onError).toHaveBeenCalledExactlyOnceWith(error)
  })

  it('cancels pending ticks and timers on disposal', async () => {
    vi.useFakeTimers()
    const onError = vi.fn()
    const scheduler = createDomScheduler(onError)
    const callback = vi.fn()
    const update = scheduler.nextTick(callback)
    scheduler.delay(callback, 600)
    scheduler.dispose()
    scheduler.delay(callback, 600)
    await update
    vi.runAllTimers()
    expect(callback).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })
})
