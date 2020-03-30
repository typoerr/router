export class NotFoundError extends Error {
  status = 404
  pathname: string
  method?: string
  constructor(pathname: string, method?: string) {
    super('404 - Not Found')
    this.name = this.constructor.name
    this.pathname = pathname
    this.method = method
  }
}
