import { describe, expect, it } from 'vitest'
import { componentName } from '../../src/runtime/utils/component-name'

describe('component filename extraction', () => {
  it.each([
    '/sections/layouts/standard.vue',
    '/nested/a.b.vue',
    '/nested/é.vue',
    'plain.vue',
    '/a/.vue',
    '/.vue',
    '/a.vue.js',
    '',
    '/a.vue\n',
    '/a.vue\r\n',
    '/a\nb.vue',
    '/a/b/.vue',
    '//.vue',
    '/a.vue\u2028',
  ])('preserves legacy extraction for %j', (filename) => {
    // eslint-disable-next-line regexp/no-super-linear-backtracking -- Small fixed regression inputs compare against the legacy implementation.
    const expected = filename.replace(/^.*\/(.+)\.vue$/, '$1')
    expect(componentName(filename)).toBe(expected)
  })

  it('handles long unmatched paths without backtracking', () => {
    const filename = '/'.repeat(100000) + 'missing-extension'
    expect(componentName(filename)).toBe(filename)
  })
})
