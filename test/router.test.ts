import test from 'ava'
import sinon from 'sinon'
import { HandlerContext, route } from '../src/route'
import { Router } from '../src/router'
import { NotFoundError } from '../src/not-found'

function throws<T extends Error>(err: T) {
  throw err
}

test('path match', async (t) => {
  t.plan(3)
  const callback = (ctx: HandlerContext) => ctx.pathname
  const routes = [route('/a', callback), route('/b', callback), route('/c', callback)]

  for await (const path of ['/a', '/b', '/c']) {
    const router = new Router(routes, () => ({ url: path }))
    const result = await router.resolve({})
    t.is(result, path)
  }
})

test('not found', async (t) => {
  const router = new Router([], () => ({ url: '' }))
  const result = await t.throwsAsync(router.resolve({}))
  t.assert(result instanceof NotFoundError)
})

test('custom next', async (t) => {
  const next = () => '/notfound'
  const router = new Router([], () => ({ url: '' }))
  const result = await router.resolve({}, next)
  t.is(result, '/notfound')
})

test('custom next - reject', async (t) => {
  const next = () => Promise.reject('/notfound')
  const router = new Router([], () => ({ url: '' }))
  return router
    .resolve({}, next)
    .then(() => t.fail())
    .catch((err) => t.is(err, '/notfound'))
})

test('custom next - error', async (t) => {
  const next = () => throws(new Error('404'))
  const router = new Router([], () => ({ url: '' }))
  const err = await t.throwsAsync(router.resolve({}, next))
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

  const router = new Router(routes, () => ({ url: '/1?k=v', method: 'GET' }))
  return router.resolve({ n: 1 })
})

test('option parser', async (t) => {
  const match = route<{ ctx: number }>('/', () => '/')
  const option = sinon.fake(() => ({ url: '/' }))
  const router = new Router([match], option)

  await router.resolve({ ctx: 1 })

  await router.resolve({ ctx: 2 })
  t.assert(option.calledWith({ ctx: 2 }))
})
