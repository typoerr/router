import { execute, Callback } from '../src/callback-chain'

test('execute', async () => {
  expect.assertions(3)
  const callbacks: Callback<string, string>[] = [
    async (ctx, next) => {
      expect(typeof ctx).toBe('string')
      return 'a' + (await next(ctx))
    },
    async (ctx, next) => {
      expect(typeof ctx).toBe('string')
      return 'b' + (await next(ctx))
    },
  ]

  const result = await execute(callbacks, 'c', (s) => s + '!')
  expect(result).toBe('abc!')
})
