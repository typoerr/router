import test from 'ava'
import { route, HandlerContext, RouteHandler } from '@/route'
import { compose } from '@/compose'

function throws<T extends Error>(err: T) {
  throw err
}

test('route(path, handler)', async (t) => {
  const match = route('/', (ctx) => ctx.pathname)
  const next = () => '/notfound'

  t.is(await match({ pathname: '/' }, next), '/')
  t.is(await match({ pathname: '/path' }, next), '/notfound')
})

test('route(path, ...handler)', async (t) => {
  t.plan(1)
  type Context = { message: string }
  const h1: RouteHandler<Context> = (ctx, next) => next({ ...ctx, message: ctx.message + '!' })
  const h2: RouteHandler<Context> = (ctx) => t.assert(ctx.message === 'hello!')

  const next = () => '/notfound'
  const match = route('/', h1, h2)
  return match({ pathname: '/', message: 'hello' }, next)
})

test('route(method, path, handler)', async (t) => {
  const match = route('GET', '/', (ctx) => ctx.pathname)
  const next = () => '/notfound'

  t.is(await match({ pathname: '/', method: 'GET' }, next), '/')
  t.is(await match({ pathname: '/', method: 'POST' }, next), '/notfound')
  t.is(await match({ pathname: '/path', method: 'GET' }, next), '/notfound')
})

test('route(method, path, ...handler)', async (t) => {
  t.plan(1)
  type Context = { message: string }
  const h1: RouteHandler<Context> = (ctx, next) => next({ ...ctx, message: ctx.message + '!' })
  const h2: RouteHandler<Context> = (ctx) => t.assert(ctx.message === 'hello!')
  const next = () => '/notfound'
  const match = route<Context>('GET', '/', h1, h2)

  return match({ pathname: '/', method: 'GET', message: 'hello' }, next)
})

test('path match', async (t) => {
  t.plan(3)
  const callback = (ctx: HandlerContext) => ctx.pathname
  const routes = [route('/a', callback), route('/b', callback), route('/c', callback)]
  const router = compose(routes)
  const next = () => Promise.resolve('/notfound')

  for await (const path of ['/a', '/b', '/c']) {
    const result = await router({ pathname: path }, next)
    t.is(result, path)
  }
})

test('not found rejection', async (t) => {
  const router = compose([])
  const next = () => Promise.reject('/notfound')

  return router({ pathname: '/' }, next)
    .then(() => t.fail())
    .catch((err) => t.is(err, '/notfound'))
})

test('custom next - error', async (t) => {
  const router = compose([])
  const next = () => throws(new Error('404'))
  const err = await t.throwsAsync(router({}, next))
  t.is(err.message, '404')
})

test('callback context', (t) => {
  t.plan(6)

  const routes = [
    route<{ n: number }, void>('/:id', (ctx) => {
      // context
      t.is(ctx.n, 1)
      // match context
      t.is(ctx.params.id, '1')
      t.deepEqual(ctx.query, { k: 'v' })
      // lookup hint
      t.is(ctx.pathname, '/1')
      t.is(ctx.method, 'GET')
      t.is(ctx.search, '?k=v')
    }),
  ]

  const router = compose(routes)
  const next = () => t.fail()
  return router({ n: 1, pathname: '/1', search: '?k=v', method: 'GET' }, next)
})
