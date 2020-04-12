import { compose } from '../src/callback-chain'

test('compose', async () => {
  expect.assertions(3)

  const middleware = compose<string, string>([
    async (ctx, next) => {
      expect(typeof ctx).toBe('string')
      return 'a' + (await next(ctx))
    },
    async (ctx, next) => {
      expect(typeof ctx).toBe('string')
      return 'b' + (await next(ctx))
    },
  ])
  const result = await middleware('c', async (s) => s + '!')
  expect(result).toBe('abc!')
})
