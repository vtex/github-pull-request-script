import { run, hasBranch } from './index'

test('lets see', async () => {
  const tasks = [
    () => Promise.resolve(10),
    () => Promise.resolve({ bar: '123' }),
    () => Promise.resolve(undefined),
    () => Promise.resolve('abc'),
  ]

  const result = await run(tasks)

  console.log(result)
})

test('returns true for existing branch', () => {
  expect(hasBranch('master')).toBe(true)
})

test('returns false for non existent branch', () => {
  expect(hasBranch('master-non-existent')).toBe(false)
})
