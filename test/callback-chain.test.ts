import test from 'ava'
import { execute, Callback } from '../src/callback-chain'

test('execute', async (t) => {
  t.plan(3)
  const callbacks: Callback<string, string>[] = [
    async (ctx, next) => {
      t.assert(typeof ctx === 'string')
      return 'a' + (await next(ctx))
    },
    async (ctx, next) => {
      t.assert(typeof ctx === 'string')
      return 'b' + (await next(ctx))
    },
  ]

  const result = await execute(callbacks, 'c', (s) => s + '!')
  t.is(result, 'abc!')
})
