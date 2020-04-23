import test from 'ava'
import { route, HandlerContext } from '@/route'
import { compose } from '@/callback-chain'

test('route(path, handler)', async (t) => {
  const match = route('/', (ctx) => ctx.pathname)
  const next = () => '/notfound'

  t.is(await match({ pathname: '/' }, next), '/')
  t.is(await match({ pathname: '/path' }, next), '/notfound')
})

test('route(method, path, handler)', async (t) => {
  const match = route('GET', '/', (ctx) => ctx.pathname)
  const next = () => '/notfound'

  t.is(await match({ pathname: '/', method: 'GET' }, next), '/')
  t.is(await match({ pathname: '/', method: 'POST' }, next), '/notfound')
  t.is(await match({ pathname: '/path', method: 'GET' }, next), '/notfound')
})

test('route level middleware', async (t) => {
  t.plan(1)
  type Context = HandlerContext<{ message: string }>

  const handler = compose<Context>([
    (ctx, next) => next({ ...ctx, message: ctx.message + '!' }),
    (ctx) => t.assert(ctx.message === 'hello!'),
  ])

  const next = () => '/notfound'
  const match = route('/', handler)
  return match({ pathname: '/', message: 'hello' }, next)
})
