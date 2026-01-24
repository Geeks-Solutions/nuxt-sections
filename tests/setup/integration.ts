import { beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.clearAllMocks()
})

global.window = global.window || {}
global.process = global.process || { env: { NODE_ENV: 'test' } }
global.process.client = true
