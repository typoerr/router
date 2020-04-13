# @typoerr/router

Router for Node.js and Browser.

## Install

```
npm i @typoerr/router
```

## Segments

See [lukeed/regexparam](https://github.com/lukeed/regexparam)

## Example

### node-http

```ts
import http from 'http'
import { route, Route, Router } from '@typoerr/router'

interface Context {
  req: http.IncomingMessage
  res: http.ServerResponse
}

const routes: Route<Context>[] = [
  // noop middleware
  router('/*', (ctx, next) => {
    return next(ctx)
  }),
  route('GET', '/', (ctx) => {
    return ctx.res.end(ctx.pathname)
  }),
  route('/*', (ctx) => {
    ctx.res.statusCode = 302
    ctx.res.setHeader('Location', '/')
    return ctx.res.end()
  }),
]

const router = new Router(routes, (ctx) => ({
  url: ctx.req.url || '/',
  method: ctx.req.method,
}))

const server = http.createServer(async (req, res) => {
  try {
    await router.resolve({ req, res })
  } catch (err) {
    if (err.status === 404) {
      return res.end('404 Not Found')
    }
    console.error(err)
    return res.end('500 Internet Server Error')
  }
})

server.listen(3000)
```

### express

```ts
import express from 'express'
import { route, Route, Router } from '@typoerr/router'

interface Context {
  req: express.Request
  res: express.Response
}

const routes: Route<Context>[] = [
    // noop middleware
  router('/*', (ctx, next) => {
    return next(ctx)
  }),
  route('GET', '/', (ctx) => {
    return ctx.res.send(ctx.req.url)
  }),
  route('GET', '/reject', () => {
    return Promise.reject(new Error('reject'))
  }),
  route('GET', '/error', () => {
    throw new Error('error')
  }),
]

const server = express()

const router = new Router(routes, (ctx) => ({
  url: ctx.req.url,
  method: ctx.req.method,
}))

server.use(async (req, res, next) => {
  try {
    await router.resolve({ req, res })
  } catch (err) {
    console.error(err)
    next(err)
  }
})

server.listen(3000)
```

## API

[Todo]

See `test/router.test.ts` and `src/router.ts`
