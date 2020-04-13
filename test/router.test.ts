import { route, CallbackContext, createRouter } from '../src/router'
import { NotFoundError } from '../src/not-found'

function thrown<T extends Error>(err: T) {
  throw err
}

describe('route', () => {
  test('route(path, callback)', () => {
    const match = route('/', (ctx) => ctx.pathname)
    const next = () => '/notfound'

    expect(match({ pathname: '/' }, next)).resolves.toBe('/')
    expect(match({ pathname: '/path' }, next)).resolves.toBe('/notfound')
  })

  test('route(method, path, callback)', () => {
    const match = route('GET', '/', (ctx) => ctx.pathname)
    const next = () => '/notfound'

    expect(match({ pathname: '/', method: 'GET' }, next)).resolves.toBe('/')
    expect(match({ pathname: '/', method: 'POST' }, next)).resolves.toBe('/notfound')
    expect(match({ pathname: '/path', method: 'GET' }, next)).resolves.toBe('/notfound')
  })
})

describe('createRouter', () => {
  test('path match', async () => {
    expect.assertions(3)
    const callback = (ctx: CallbackContext) => ctx.pathname
    const routes = [route('/a', callback), route('/b', callback), route('/c', callback)]

    for await (const path of ['/a', '/b', '/c']) {
      const url = () => path
      const router = createRouter(routes, { url })
      const result = await router({})
      expect(result).toBe(path)
    }
  })

  test('not found', () => {
    const router = createRouter([], { url: () => '' })
    expect(router({})).rejects.toBeInstanceOf(NotFoundError)
  })

  test('custom next', async () => {
    const next = () => '/notfound'
    const router = createRouter([], { url: () => '' })
    expect(router({}, next)).resolves.toBe('/notfound')
  })

  test('custom next - reject', async () => {
    const next = () => Promise.reject('/notfound')
    const router = createRouter([], { url: () => '' })
    expect(router({}, next)).rejects.toBe('/notfound')
  })

  test('custom next - error', async () => {
    const next = () => thrown(new Error('404'))
    const router = createRouter([], { url: () => '' })
    expect(router({}, next)).rejects.toBeInstanceOf(Error)
  })

  test('callback context', () => {
    expect.assertions(6)

    const routes = [
      route<{ n: number }, void>('/:id', (ctx) => {
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

    const router = createRouter(routes, { url: () => '/1?k=v', method: () => 'GET' })
    return router({ n: 1 })
  })
})
