import test from 'ava'
import { compose, Callback } from '@/callback-chain'

test('compose', async (t) => {
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

  const result = await compose(callbacks)('c', (s) => s + '!')
  t.is(result, 'abc!')
})
