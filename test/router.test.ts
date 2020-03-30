import { route, use, resolve, HandlerContext, Middleware } from '../src/router'
import regexparam from 'regexparam'
import { NotFoundError } from '../src/not-found'

test('route(mehtod, path, handler)', () => {
  const handler = jest.fn()
  expect(route('GET', '/path', handler)).toStrictEqual({
    path: regexparam('/path'),
    method: 'GET',
    handler,
  })
})

test('route(path, handler)', () => {
  const handler = jest.fn()
  expect(route('/path', handler)).toStrictEqual({
    path: regexparam('/path'),
    method: undefined,
    handler,
  })
})

test('use', () => {
  expect(use('/path', [])).toStrictEqual({
    path: regexparam('/path'),
    method: '*',
    use: [],
  })
})

describe('resolve', () => {
  test('match route (path)', async () => {
    const a = () => 'a'
    const b = () => 'b'
    const routes = [route('/a', a), route('/b', b)]
    expect(await resolve(routes, { pathname: '/a' })).toBe('a')
    expect(await resolve(routes, { pathname: '/b' })).toBe('b')
  })

  test('match route (path + method)', async () => {
    const a = () => 'a'
    const b = () => 'b'
    const routes = [route('GET', '/a', a), route('GET', '/b', b)]
    expect(await resolve(routes, { pathname: '/a', method: 'GET' })).toBe('a')
    expect(await resolve(routes, { pathname: '/b', method: 'GET' })).toBe('b')
  })

  test('route not found', async () => {
    const handler = () => 'a'
    const routes = [route('GET', '/a', handler)]
    const promise = resolve(routes, { pathname: '/b', method: 'GET' })
    expect(promise).rejects.toThrowError(new NotFoundError('/b', 'GET'))
  })

  test('handler context', async () => {
    expect.assertions(6)
    type Ctx = { ctx: string }

    const handler = (ctx: HandlerContext<Ctx>) => {
      // context
      expect(ctx.ctx).toBe('a')
      // match context
      expect(ctx.params.id).toBe('1')
      expect(ctx.query).toStrictEqual({ k: 'v' })
      // lookup hint
      expect(ctx.pathname).toBe('/1')
      expect(ctx.search).toBe('k=v')
      expect(ctx.method).toBe('GET')
    }

    const routes = [route('GET', '/:id', handler)]
    return resolve(routes, { ctx: 'a', pathname: '/1', method: 'GET', search: 'k=v' })
  })
})

describe('middleware', () => {
  test('context replacement', () => {
    expect.assertions(1)
    type Ctx = { ctx: string }

    const handler = (ctx: HandlerContext<Ctx>) => {
      expect(ctx.ctx).toBe('b')
    }
    const middleware: Middleware<Ctx, void> = async (ctx, next) => {
      return next({ ...ctx, ctx: 'b' })
    }
    const routes = [use('/*', [middleware]), route('/a', handler)]
    return resolve(routes, { pathname: '/a', ctx: 'a' })
  })

  it('should not call middlewares under a matched HandlerRoute', async () => {
    const m1: Middleware<{}, void> = jest.fn(async (ctx, next) => next(ctx))
    const m2: Middleware<{}, void> = jest.fn(async (ctx, next) => next(ctx))
    const routes = [use('/*', [m1]), route('/', jest.fn()), use('/*', [m2])]
    await resolve(routes, { pathname: '/' })
    expect(m1).toBeCalledTimes(1)
    expect(m2).toBeCalledTimes(0)
  })
})
