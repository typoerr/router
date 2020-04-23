import * as parser from './parser'
import { compose, Composed } from './callback-chain'
import { NotFoundError } from './not-found'
import { Route, Next, ResolveContext } from './route'

export interface RouterOption extends parser.URLParserOption {
  url: string
  method?: string
}

export interface RouterOptionParser<T extends object = {}> {
  (ctx: T): RouterOption
}

export class Router<T extends object = {}, U = any> {
  private _resolve: Composed<ResolveContext<T>, U>
  private _option: RouterOptionParser<T>

  constructor(routes: Route<T, U>[], option: RouterOptionParser<T>) {
    this._resolve = compose(routes)
    this._option = option
  }

  resolve = (context: T, next?: Next<T, U>) => {
    const option = this._option(context)
    const { pathname = '/', search } = parser.url(option.url, option)
    const ctx = { ...context, pathname, method: option.method, search }
    const done = next || (() => Promise.reject(new NotFoundError(pathname, option.method)))
    return this._resolve(ctx, done)
  }
}
