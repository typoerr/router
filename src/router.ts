import * as parser from './parser'
import { execute } from './callback-chain'
import { NotFoundError } from './not-found'
import { Route, Next } from './route'

export interface RouterOption extends parser.URLParserOption {
  url: string
  method?: string
}

export interface RouterOptionParser<T extends object = {}> {
  (ctx: T): RouterOption
}

export class Router<T extends object = {}, U = any> {
  private routes: Route<T, U>[]
  private option: RouterOptionParser<T>

  constructor(routes: Route<T, U>[], option: RouterOptionParser<T>) {
    this.routes = routes
    this.option = option
  }

  resolve = (context: T, next?: Next<T, U>) => {
    const option = this.option(context)
    const { pathname = '/', search } = parser.url(option.url, option)
    const ctx = { ...context, pathname, method: option.method, search }
    const done = next || (() => Promise.reject(new NotFoundError(pathname, option.method)))
    return execute(this.routes, ctx, done)
  }
}
