import * as chain from '../src/callback-chain'

test('chain.call', async () => {
  const a: chain.Callback<string, string> = async (ctx, next) => {
    return 'a' + (await next(ctx))
  }
  const b: chain.Callback<string, string> = async (ctx, next) => {
    return 'b' + (await next(ctx))
  }
  const result = await chain.call([a, b], 'c', async (str) => str + '!')
  expect(result).toBe('abc!')
})
