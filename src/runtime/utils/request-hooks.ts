/** Isolate mutable request data while retaining opaque fetch values such as AbortSignal. */
const cloneHookValue = (value: any, seen = new WeakMap<object, any>()): any => {
  if (!value || typeof value !== 'object') return value
  if (seen.has(value)) return seen.get(value)
  if (value instanceof Headers) {
    const copy = new Headers(value)
    seen.set(value, copy)
    return copy
  }
  if (value instanceof FormData) {
    const copy = new FormData()
    seen.set(value, copy)
    value.forEach((entry, key) => copy.append(key, entry))
    return copy
  }
  if (value instanceof URLSearchParams) return new URLSearchParams(value)
  if (value instanceof Date) return new Date(value)
  if (value instanceof ArrayBuffer) return value.slice(0)
  if (value instanceof DataView)
    return new DataView(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength))
  if (ArrayBuffer.isView(value)) return new (value.constructor as any)(value)
  if (
    Array.isArray(value) ||
    Object.getPrototypeOf(value) === Object.prototype ||
    Object.getPrototypeOf(value) === null
  ) {
    const copy: any = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value))
    seen.set(value, copy)
    Object.keys(value).forEach((key) => {
      Object.defineProperty(copy, key, {
        value: cloneHookValue(value[key], seen),
        writable: true,
        enumerable: true,
        configurable: true,
      })
    })
    return copy
  }
  return value
}

/** Apply interception atomically; a failed hook must leave the original request usable. */
export const prepareApiRequest = async ({
  hook,
  app,
  method,
  url,
  body,
  options,
}: {
  hook?: (...args: any[]) => any
  app: any
  method: string
  url: string
  body: any
  options: any
}) => {
  const original = { url, options, apiOff: false }
  if (typeof hook !== 'function') return original
  try {
    const copies = new WeakMap<object, any>()
    const stagedOptions = cloneHookValue(options, copies)
    const result = await hook(app, method, url, cloneHookValue(body, copies), stagedOptions)
    if (!result || typeof result !== 'object' || Array.isArray(result)) return original
    const { url: nextURL, body: nextBody, apiOff } = result
    if (nextURL != null && typeof nextURL !== 'string') return original
    if (apiOff !== undefined && typeof apiOff !== 'boolean') return original
    if (nextBody) stagedOptions.body = cloneHookValue(nextBody)
    return { url: nextURL || url, options: stagedOptions, apiOff: apiOff === true }
  } catch {
    // A failed interceptor must fall back to the unmodified native request.
    return original
  }
}

/** Both synchronous throws and rejected promises from a configured error hook propagate. */
export const runApiErrorHook = async (hook: any, args: any[], error: any) => {
  if (typeof hook === 'function') return await hook(...args)
  throw error
}
