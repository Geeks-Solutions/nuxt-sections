import { describe, expect, it, vi } from 'vitest'
import { prepareApiRequest, runApiErrorHook } from '../../src/runtime/utils/request-hooks'

const request = () => ({
  app: {},
  method: 'POST',
  url: '/original',
  body: { nested: { value: 'original' } },
  options: { method: 'POST', headers: new Headers({ token: 'original' }), body: 'original body' },
})

describe('transactional request interception', () => {
  it.each(['throw', 'reject', 'malformed', 'getter'])(
    'falls back atomically after %s',
    async (failure) => {
      const original = request()
      const hook = vi.fn(async (_app, _method, _url, body, options) => {
        body.nested.value = 'changed'
        options.headers.set('token', 'changed')
        options.body = 'changed body'
        if (failure === 'throw') throw new Error('Hook failed')
        if (failure === 'reject') return Promise.reject(new Error('Hook rejected'))
        if (failure === 'malformed') return { url: '/partial', apiOff: 'invalid' }
        return {
          url: '/partial',
          get body() {
            throw new Error('Bad payload')
          },
        }
      })
      const result = await prepareApiRequest({ ...original, hook })
      expect(result).toEqual({ url: '/original', options: original.options, apiOff: false })
      expect(result.options).toBe(original.options)
      expect(original.options.headers.get('token')).toBe('original')
      expect(original.options.body).toBe('original body')
      expect(original.body.nested.value).toBe('original')
      expect(hook).toHaveBeenCalledTimes(1)
    }
  )

  it('applies a successful hook once without mutating the original', async () => {
    const original = request()
    const result = await prepareApiRequest({
      ...original,
      hook: (_app, _method, _url, _body, options) => {
        options.headers.set('token', 'updated')
        return { url: '/custom', body: 'custom body', apiOff: true }
      },
    })
    expect(result.url).toBe('/custom')
    expect(result.apiOff).toBe(true)
    expect(result.options.body).toBe('custom body')
    expect(result.options.headers.get('token')).toBe('updated')
    expect(original.options.headers.get('token')).toBe('original')
  })

  it('isolates FormData edits when interception fails', async () => {
    const original = request()
    const body = new FormData()
    body.append('file', 'original')
    const options = { ...original.options, body }
    const result = await prepareApiRequest({
      ...original,
      body,
      options,
      hook: (_app, _method, _url, stagedBody, stagedOptions) => {
        stagedBody.set('file', 'changed')
        stagedOptions.body.set('file', 'also changed')
        throw new Error('Failed')
      },
    })
    expect(result.options.body.get('file')).toBe('original')
    expect(body.get('file')).toBe('original')
  })

  it('keeps the original request when no hook is configured', async () => {
    const original = request()
    expect((await prepareApiRequest(original)).options).toBe(original.options)
  })

  it('preserves FormData aliasing for a successful interceptor', async () => {
    const original = request()
    const body = new FormData()
    body.set('file', 'original')
    const result = await prepareApiRequest({
      ...original,
      body,
      options: { ...original.options, body },
      hook: (_app, _method, _url, stagedBody, stagedOptions) => {
        expect(stagedBody).toBe(stagedOptions.body)
        stagedBody.set('file', 'updated')
        return {}
      },
    })
    expect(result.options.body.get('file')).toBe('updated')
    expect(body.get('file')).toBe('original')
  })
})

describe('request error hook policy', () => {
  it('rethrows the original error when no hook is configured', async () => {
    const error = new Error('Original')
    await expect(runApiErrorHook(undefined, [], error)).rejects.toBe(error)
  })

  it.each(['throw', 'reject'])('propagates a hook %s consistently', async (failure) => {
    const original = new Error('Original')
    const replacement = new Error('Replacement')
    const hook = vi.fn(() => {
      if (failure === 'throw') throw replacement
      return Promise.reject(replacement)
    })
    await expect(runApiErrorHook(hook, [original], original)).rejects.toBe(replacement)
    expect(hook).toHaveBeenCalledExactlyOnceWith(original)
  })

  it('returns an async hook recovery value', async () => {
    const recovery = { data: { cached: true }, status: 200 }
    await expect(runApiErrorHook(async () => recovery, [], new Error('Offline'))).resolves.toBe(
      recovery
    )
  })
})
