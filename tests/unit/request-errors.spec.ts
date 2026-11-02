import { afterEach, describe, expect, it, vi } from 'vitest'
import { useApiRequest } from '../../src/runtime/utils/helpers'
import { toApiError } from '../../src/runtime/utils/api-errors'

afterEach(() => vi.unstubAllGlobals())

const deferred = () => {
  let resolve!: () => void
  const promise = new Promise<void>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

describe('request error handling', () => {
  it('notifies once for network errors while rethrowing the original error', async () => {
    const error = new TypeError('Failed to fetch')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error))
    const onError = vi.fn()
    await expect(useApiRequest({ url: '/page', onError })).rejects.toBe(error)
    expect(onError).toHaveBeenCalledExactlyOnceWith(toApiError(error))
    expect(onError.mock.calls[0][0].response.status).toBe(0)
  })

  it('notifies once for HTTP failures with the original response shape', async () => {
    const data = { error: 'Not found' }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => data,
      })
    )
    const onError = vi.fn()
    await expect(useApiRequest({ url: '/page', onError })).rejects.toMatchObject({
      response: { status: 404, data },
    })
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0].response.data).toBe(data)
  })

  it('reports invalid success JSON without calling onSuccess', async () => {
    const error = new SyntaxError('Invalid JSON')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw error
        },
      })
    )
    const onSuccess = vi.fn()
    const onError = vi.fn()
    await expect(useApiRequest({ url: '/page', onSuccess, onError })).rejects.toBe(error)
    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledExactlyOnceWith(toApiError(error))
  })

  it('waits for async initialization before returning data', async () => {
    const gate = deferred()
    const entered = deferred()
    const store: any = {}
    const data = { page: 'home' }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => data })
    )
    let finished = false
    const request = useApiRequest({
      url: '/page',
      onSuccess: async (res) => {
        entered.resolve()
        await gate.promise
        store.page = res.data
      },
    }).then((res) => {
      finished = true
      return res
    })
    await entered.promise
    expect(finished).toBe(false)
    gate.resolve()
    await expect(request).resolves.toEqual({ data, status: 200 })
    expect(store.page).toBe(data)
  })

  it('waits for async error handling before rejecting', async () => {
    const gate = deferred()
    const entered = deferred()
    const error = new Error('Offline')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error))
    let finished = false
    const request = useApiRequest({
      url: '/page',
      onError: async () => {
        entered.resolve()
        await gate.promise
      },
    }).catch((caught) => {
      finished = true
      return caught
    })
    await entered.promise
    expect(finished).toBe(false)
    gate.resolve()
    expect(await request).toBe(error)
  })

  it('routes a rejected initialization callback to onError once', async () => {
    const error = new Error('Initialization failed')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })
    )
    const onSuccess = vi.fn().mockRejectedValue(error)
    const onError = vi.fn()
    await expect(useApiRequest({ url: '/page', onSuccess, onError })).rejects.toBe(error)
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledExactlyOnceWith(toApiError(error))
  })

  it('does not recurse when onError rejects', async () => {
    const error = new Error('Error handler failed')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline')))
    const onError = vi.fn().mockRejectedValue(error)
    await expect(useApiRequest({ url: '/page', onError })).rejects.toBe(error)
    expect(onError).toHaveBeenCalledTimes(1)
  })
})
