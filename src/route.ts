import regexparam from 'regexparam'
import { Assign, PartialMap } from './utils'
import * as parser from './parser'

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

export interface Next<T extends object = {}, U = any> {
  (context: ResolveContext<T>): Promise<U> | U
}

export type HandlerContext<T extends object = {}> = Assign<Assign<T, LookUpHint>, MatchContext>

export interface Handler<T extends object = {}, U = any> {
  (context: HandlerContext<T>, next: Next<T, U>): Promise<U> | U
}

export interface Route<T extends object = {}, U = any> {
  (context: ResolveContext<T>, next: Next<T, U>): Promise<U>
}

export function route<T extends object, U = any>(method: string, path: string, callback: Handler<T, U>): Route<T, U>
export function route<T extends object, U = any>(path: string, callback: Handler<T, U>): Route<T, U>
export function route<T extends object, U = any>(a: any, b: any, c?: any): Route<T, U> {
  const [method, path, callback]: [string | undefined, string, Handler<T, U>] = c ? [a, b, c] : [undefined, a, b]
  const hint = regexparam(path)

  return async function resolve(ctx: ResolveContext<T>, next: Next<T, U>) {
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
