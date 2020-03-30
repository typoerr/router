import regexparam from 'regexparam'
import { Assign, PartialMap } from './utils'
import * as chain from './callback-chain'
import * as parser from './parser'
import { NotFoundError } from './not-found'

export interface MatchContext {
  params: PartialMap<string>
  query: PartialMap<string>
}

export interface LookUpHint {
  pathname: string
  search?: string
  method?: string
}

export type HandlerContext<T extends object> = Assign<Assign<T, LookUpHint>, MatchContext>

export interface RouteHandler<T extends object, U> {
  (ctx: HandlerContext<T>): U
}

export interface MiddlewareRoute<T extends object, U> {
  path: parser.MatchHint
  method: '*'
  use: Middleware<T, U>[]
}

export interface HandlerRoute<T extends object, U> {
  path: parser.MatchHint
  method?: string
  handler: RouteHandler<T, U>
}

export type Route<T extends object, U> = MiddlewareRoute<T, U> | HandlerRoute<T, U>

export type ResolveContext<T extends object> = Assign<T, LookUpHint>

export interface Next<T extends object, U> extends chain.Next<ResolveContext<T>, U> {}

export interface Middleware<T extends object, U> extends chain.Callback<ResolveContext<T>, U> {}

/**
 * Resolve routes
 */
export function resolve<T extends object, U>(routes: Route<T, U>[], ctx: ResolveContext<T>) {
  const mws: Middleware<T, U>[] = []
  const final = () => Promise.reject(new NotFoundError(ctx.pathname, ctx.method))

  // Find matched middleware and handler
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i]
    // Test method matching
    if (
      route.method === '*' ||
      (route.method || '').toLowerCase() === (ctx.method || '').toLowerCase()
    ) {
      // Test path matching
      if (route.path.pattern.test(ctx.pathname)) {
        if ('use' in route) {
          // middleware-route
          /* eslint-disable-next-line prefer-spread */
          mws.push.apply(mws, route.use)
        } else {
          // handler-route
          const next = (c: ResolveContext<T>) => {
            const params = parser.params(ctx.pathname, route.path)
            const query = parser.query(ctx.search)
            return Promise.resolve(route.handler({ ...c, params, query }))
          }
          mws.push(next)
          // Break loop when router handler exists
          break
        }
      }
    }
  }
  return new Promise<U>((resolve) => resolve(chain.call(mws, ctx, final)))
}

/**
 * Create a HandlerRoute
 *
 * route('MEHTOD', '/path', handler): HandlerRoute
 * route('/path', handler): HandlerRoute
 */
export function route<T extends object, U>(
  method: string,
  path: string,
  handler: RouteHandler<T, U>,
): HandlerRoute<T, U>
export function route<T extends object, U>(
  path: string,
  handler: RouteHandler<T, U>,
): HandlerRoute<T, U>
export function route<T extends object, U>(a: any, b: any, c?: any): HandlerRoute<T, U> {
  const [method, path, handler] = c ? [a, b, c] : [c, a, b]
  return { path: regexparam(path), method, handler }
}

/**
 *
 * Create a MiddlewareRoute
 */
export function use<T extends object, U>(
  path: string,
  middlewares: Middleware<T, U>[],
): MiddlewareRoute<T, U> {
  return { path: regexparam(path), method: '*', use: middlewares }
}
