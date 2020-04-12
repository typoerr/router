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
import { route, Route, router } from '@typoerr/router'

interface Context {
  req: http.IncomingMessage
  res: http.ServerResponse
}

const routes: Route<Context, any>[] = [
  route('GET', '/', async (ctx) => {
    return ctx.res.end(ctx.pathname)
  }),
  route('/*', async (ctx) => {
    ctx.res.statusCode = 302
    ctx.res.setHeader('Location', '/')
    return ctx.res.end()
  }),
]

const server = http.createServer(async (req, res) => {
  const url = req.url || '/'
  const method = req.method
  try {
    await router(routes, { req, res, url, method })
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
import { route, Route, router } from '@typoerr/router'

interface Context {
  req: express.Request
  res: express.Response
}

const routes: Route<Context>[] = [
  route('GET', '/', async (ctx) => {
    return ctx.res.send(ctx.req.url)
  }),
  route('GET', '/reject', async () => {
    return Promise.reject(new Error('reject'))
  }),
  route('GET', '/error', async () => {
    throw new Error('error')
  }),
]

const server = express()

server.use(async (req, res, next) => {
  const url = req.url || '/'
  const method = req.method
  try {
    await router(routes, { req, res, url, method })
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
