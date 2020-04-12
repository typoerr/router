import { router, route, Route } from '../src/router'
import { NotFoundError } from '../src/not-found'

test('route(path, callback)', async () => {
  const routes = [
    route('/', async (ctx) => ctx.pathname), //
    route('/path', async (ctx) => ctx.pathname),
  ]
  const next = async () => '/notfound'

  // match
  expect(router(routes, { url: '/' }, next)).resolves.toBe('/')
  expect(router(routes, { url: '/path' }, next)).resolves.toBe('/path')
  // unmatch
  expect(router(routes, { url: '/notfound' }, next)).resolves.toBe('/notfound')
  expect(router(routes, { url: '/notfound' })).rejects.toBeInstanceOf(NotFoundError)
})

test('route(method, path, callback)', async () => {
  const routes = [
    route('GET', '/', async (ctx) => ctx.pathname), //
    route('GET', '/path', async (ctx) => ctx.pathname),
  ]
  const next = async () => '/notfound'

  // match
  expect(router(routes, { url: '/', method: 'GET' }, next)).resolves.toBe('/')
  expect(router(routes, { url: '/path', method: 'GET' }, next)).resolves.toBe('/path')
  // unmatch
  expect(router(routes, { url: '/', method: 'POST' }, next)).resolves.toBe('/notfound')
  expect(router(routes, { url: '/path', method: 'POST' })).rejects.toBeInstanceOf(NotFoundError)
})

test('context', async () => {
  expect.assertions(6)

  const routes = [
    route<{ n: number }, void>('/:id', async (ctx) => {
      // context
      expect(ctx.n).toBe(1)
      // match context
      expect(ctx.params.id).toBe('1')
      expect(ctx.query).toStrictEqual({ k: 'v' })
      // lookup hint
      expect(ctx.pathname).toBe('/1')
      expect(ctx.method).toBe('GET')
      expect(ctx.search).toBe('?k=v')
    }),
  ]
  return router(routes, { url: '/1?k=v', method: 'GET', n: 1 })
})

test('next', async () => {
  const callback = route('/', (ctx, next) => next(ctx))
  const next = async () => 'next'
  expect(router([callback], { url: '/' }, next)).resolves.toBe('next')
})

test('throw error', () => {
  function thrown(error: Error): never {
    throw error
  }
  const routes: Route[] = [
    route('/reject', () => Promise.reject('reject!')),
    route('/error', () => thrown(new Error('error!'))),
    route('/', () => '/'),
  ]

  expect(router(routes, { url: '/reject' })).rejects.toBe('reject!')
  expect(router(routes, { url: '/error' })).rejects.toBeInstanceOf(Error)
})
