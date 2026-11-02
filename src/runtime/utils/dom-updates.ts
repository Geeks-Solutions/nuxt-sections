import { nextTick } from 'vue'

/** Observe errors where deferred DOM work actually runs, and cancel it on disposal. */
export const createDomScheduler = (onError: (error: unknown) => void) => {
  let disposed = false
  const timers = new Set<ReturnType<typeof setTimeout>>()
  const run = (callback: () => void) => {
    if (disposed) return
    try {
      callback()
    } catch (error) {
      onError(error)
    }
  }

  return {
    nextTick: (callback: () => void) => nextTick(() => run(callback)),
    delay: (callback: () => void, milliseconds: number) => {
      if (disposed) return
      const timer = setTimeout(() => {
        timers.delete(timer)
        run(callback)
      }, milliseconds)
      timers.add(timer)
    },
    dispose: () => {
      disposed = true
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    },
  }
}
