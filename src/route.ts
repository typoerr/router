import regexparam from 'regexparam'
import { Assign, PartialMap } from './utils'
import * as parser from './parser'
import { Next, compose } from './compose'

export interface MatchContext {
  params: PartialMap<string>
  query: PartialMap<string>
}

export interface LookUpHint {
  pathname: string
  search?: string | null
  method?: string
}

export type ResolveContext<T extends object = {}> = Assign<T, LookUpHint>

export type HandlerContext<T extends object = {}> = Assign<ResolveContext<T>, MatchContext>

export interface RouteHandler<T extends object = {}, U = any> {
  (context: HandlerContext<T>, next: Next<HandlerContext<T>, U>): Promise<U> | U
}

export interface Route<T extends object = {}, U = any> {
  (context: ResolveContext<T>, next: Next<ResolveContext<T>, U>): Promise<U>
}

type METHOD = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE'

export function route<T extends object, U = any>(method: METHOD, path: string, ...handler: RouteHandler<T, U>[]): Route<T, U>
export function route<T extends object, U = any>(path: string, ...handler: RouteHandler<T, U>[]): Route<T, U>
export function route<T extends object, U = any>(a: any, b: any, ...c: any): Route<T, U> {
  const [method, path, handlers] = typeof b === 'string' ? [a, b, c] : [undefined, a, [b, ...c]]
  const handler = handlers.length > 1 ? compose(handlers) : handlers[0]
  const hint = regexparam(path)

  return function resolve(ctx: ResolveContext<T>, next: Next<ResolveContext<T>, U>) {
    if (hint.pattern.test(ctx.pathname)) {
      if (method === undefined || method.toLowerCase() === ctx.method?.toLowerCase()) {
        const params = parser.params(ctx.pathname, hint)
        const query = parser.query(ctx.search || undefined)
        return Promise.resolve(handler({ ...ctx, params, query }, next as any))
      }
    }
    return Promise.resolve(next(ctx))
  }
}
