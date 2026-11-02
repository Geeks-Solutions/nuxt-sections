import { describe, expect, it } from 'vitest'
import { ESLint } from 'eslint'

const eslint = new ESLint()
const check = async (source: string, filePath = 'event-rule-fixture.vue') => {
  const [result] = await eslint.lintText(source, { filePath })
  expect(result.fatalErrorCount).toBe(0)
  return result.messages.filter((message) => message.ruleId === 'local-rules/no-multiline-v-on')
}

describe('multiline Vue event rule', () => {
  it('rejects multiple statements across lines', async () => {
    expect(
      await check('<template><button @click="one();\ntwo()">Run</button></template>')
    ).toHaveLength(1)
  })

  it('rejects a multiline comma expression', async () => {
    expect(
      await check('<template><button @click="one(),\ntwo()">Run</button></template>')
    ).toHaveLength(1)
  })

  it('allows a single multiline expression', async () => {
    expect(
      await check('<template><button @click="one(\nvalue\n)">Run</button></template>')
    ).toEqual([])
  })

  it('preserves the arrow-function exception', async () => {
    expect(
      await check('<template><button @click="() => {\none(); two()\n}">Run</button></template>')
    ).toEqual([])
  })

  it('handles non-Vue files without template services', async () => {
    expect(await check('export const answer = 42\n', 'event-rule-fixture.js')).toEqual([])
  })
})
