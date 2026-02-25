import { config } from '@vue/test-utils'
import { vi } from 'vitest'

config.global.provide = {
  ...(config.global.provide || {}),
  loadScript: vi.fn(),
}

config.global.stubs = {
  ...(config.global.stubs || {}),
  LazyEditorWysiwyg: true,
  SectionItem: true,
}

const warningFilters = [
  'No match found for location',
  'Component not found at:',
  'Invalid prop: type check failed for prop "componentItem"',
  'injection "loadScript" not found',
  '[intlify] Not found',
  'quill Overwriting',
  'quill:toolbar ignoring',
  'quill',
]

const originalWarn = console.warn
console.warn = (...args) => {
  const message = String(args[0] ?? '')
  if (warningFilters.some((pattern) => message.includes(pattern))) {
    return
  }
  originalWarn(...args)
}

const originalLog = console.log
console.log = (...args) => {
  const message = String(args[0] ?? '')
  if (warningFilters.some((pattern) => message.includes(pattern))) {
    return
  }
  originalLog(...args)
}

const originalError = console.error
console.error = (...args) => {
  const message = String(args[0] ?? '')
  if (warningFilters.some((pattern) => message.includes(pattern))) {
    return
  }
  originalError(...args)
}
