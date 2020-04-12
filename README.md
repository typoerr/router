# @typoerr/router

Router for Node.js and Browser.

## Install

```
npm i @typoerr/router
```

## Segments

See [lukeed/regexparam](https://github.com/lukeed/regexparam)

## Usage

```ts
import { IncomingMessage, ServerResponse, createServer } from 'http'
import { route, router, Route, NotFoundError } from '@typoerr/router'

interface Context {
  req: IncomingMessage
  res: ServerResponse
}

const routes: Route<Context, void>[] = [
  // log middleware
  route('/*', async (ctx, next) => {
    const result = await next(ctx)
    console.log({ req: ctx.req, res: ctx.res })
    return result
  }),

  route('GET', '/', async (ctx) => {
    ctx.res.end(ctx.req.url)
  }),
  route('GET', '/:id', async (ctx) => {
    ctx.res.end(ctx.params.id)
  }),
]

const resolve = router(routes)

const server = createServer((req, res) => {
  const url = req.url!
  const method = req.method
  const context = { req, res, url, method }
  try {
    resolve(context)
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.end('404 Not Found')
    }
    res.end('500 Internet Server Error')
  }
})

server.listen(3000)
```

## API

[Todo]

See `test/router.test.ts` and `src/router.ts`
