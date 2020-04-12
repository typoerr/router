import regexparam from 'regexparam'
import { Assign, PartialMap } from './utils'
import * as parser from './parser'
import { execute } from './callback-chain'
import { NotFoundError } from './not-found'

export interface MatchHint extends parser.MatchHint {}

export interface MatchContext {
  params: PartialMap<string>
  query: PartialMap<string>
}

export interface LookUpHint {
  pathname: string
  search?: string
  method?: string
}

export type ResolveContext<T extends object = {}> = Assign<T, LookUpHint>

export type CallbackContext<T extends object = {}> = Assign<Assign<T, LookUpHint>, MatchContext>

export interface Next<T extends object = {}, U = any> {
  (context: ResolveContext<T>): Promise<U> | U
}

export interface Callback<T extends object = {}, U = any> {
  (context: CallbackContext<T>, next: Next<T, U>): Promise<U> | U
}

export interface Route<T extends object = {}, U = any> {
  (context: ResolveContext<T>, next: Next<T, U>): Promise<U> | U
}

export function route<T extends object, U = any>(method: string, path: string, callback: Callback<T, U>): Route<T, U>
export function route<T extends object, U = any>(path: string, callback: Callback<T, U>): Route<T, U>
export function route<T extends object, U = any>(a: any, b: any, c?: any): Route<T, U> {
  const [method, path, callback]: [string | undefined, string, Callback<T, U>] = c ? [a, b, c] : [undefined, a, b]
  const hint = regexparam(path)

  return function resolve(ctx: ResolveContext<T>, next: Next<T, U>) {
    if (hint.pattern.test(ctx.pathname)) {
      if (method === undefined || method.toLowerCase() === ctx.method?.toLowerCase()) {
        const params = parser.params(ctx.pathname, hint)
        const query = parser.query(ctx.search)
        return callback({ ...ctx, params, query }, next)
      }
    }
    return next(ctx)
  }
}

export function router<T extends object = {}, U = any>(
  routes: Route<T, U>[],
  ctx: Assign<T, { url: string; method?: string }>,
  next?: Next<T, U>,
) {
  const { pathname = '/', search } = parser.url(ctx.url)
  const _ctx = { ...ctx, pathname, search } as ResolveContext<T>
  const _next = next || (() => Promise.reject(new NotFoundError(pathname, ctx.method)))
  return execute(routes, _ctx, _next)
}
