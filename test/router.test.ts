import { router, route } from '../src/router'
import { NotFoundError } from '../src/not-found'

test('route(path, callback)', async () => {
  const routes = [
    route('/', async (ctx) => ctx.pathname), //
    route('/path', async (ctx) => ctx.pathname),
  ]
  const resolve = router(routes)
  const next = async () => '/notfound'

  // match
  expect(resolve({ url: '/' }, next)).resolves.toBe('/')
  expect(resolve({ url: '/path' }, next)).resolves.toBe('/path')
  // unmatch
  expect(resolve({ url: '/notfound' }, next)).resolves.toBe('/notfound')
  expect(resolve({ url: '/notfound' })).rejects.toBeInstanceOf(NotFoundError)
})

test('route(method, path, callback)', async () => {
  const routes = [
    route('GET', '/', async (ctx) => ctx.pathname), //
    route('GET', '/path', async (ctx) => ctx.pathname),
  ]
  const resolve = router(routes)
  const next = async () => '/notfound'

  // match
  expect(resolve({ url: '/', method: 'GET' }, next)).resolves.toBe('/')
  expect(resolve({ url: '/path', method: 'GET' }, next)).resolves.toBe('/path')
  // unmatch
  expect(resolve({ url: '/', method: 'POST' }, next)).resolves.toBe('/notfound')
  expect(resolve({ url: '/path', method: 'POST' })).rejects.toBeInstanceOf(NotFoundError)
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
  const resolve = router(routes)
  return resolve({ url: '/1?k=v', method: 'GET', n: 1 })
})

test('next', async () => {
  const callback = route('/', (ctx, next) => next(ctx))
  const next = async () => 'next'
  const resolve = router([callback])
  expect(resolve({ url: '/' }, next)).resolves.toBe('next')
})
