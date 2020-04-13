import { route, CallbackContext, Router } from '../src/router'
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

describe('Router', () => {
  test('path match', async () => {
    expect.assertions(3)
    const callback = (ctx: CallbackContext) => ctx.pathname
    const routes = [route('/a', callback), route('/b', callback), route('/c', callback)]

    for await (const path of ['/a', '/b', '/c']) {
      const router = new Router(routes, () => ({ url: path }))
      const result = await router.resolve({})
      expect(result).toBe(path)
    }
  })

  test('not found', () => {
    const router = new Router([], () => ({ url: '' }))
    expect(router.resolve({})).rejects.toBeInstanceOf(NotFoundError)
  })

  test('custom next', async () => {
    const next = () => '/notfound'
    const router = new Router([], () => ({ url: '' }))
    expect(router.resolve({}, next)).resolves.toBe('/notfound')
  })

  test('custom next - reject', async () => {
    const next = () => Promise.reject('/notfound')
    const router = new Router([], () => ({ url: '' }))
    expect(router.resolve({}, next)).rejects.toBe('/notfound')
  })

  test('custom next - error', async () => {
    const next = () => thrown(new Error('404'))
    const router = new Router([], () => ({ url: '' }))
    expect(router.resolve({}, next)).rejects.toBeInstanceOf(Error)
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

    const router = new Router(routes, () => ({ url: '/1?k=v', method: 'GET' }))
    return router.resolve({ n: 1 })
  })

  test('option parser', async () => {
    const match = route<{ ctx: number }>('/', () => '/')
    const option = jest.fn(() => ({ url: '/' }))
    const router = new Router([match], option)

    await router.resolve({ ctx: 1 })
    expect(option).toBeCalledWith({ ctx: 1 })

    await router.resolve({ ctx: 2 })
    expect(option).toBeCalledWith({ ctx: 2 })
  })
})
