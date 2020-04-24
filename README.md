# @typoerr/router

Router for Node.js and Browser.

## Install

```
npm i @typoerr/router
```

## Segments

See [lukeed/regexparam](https://github.com/lukeed/regexparam)

## Example

### express

```ts
import express from 'express'
import * as url from 'url'
import { route, compose, ResolveContext } from '@typoerr/router'

interface Context {
  req: express.Request
  res: express.Response
}

const router = compose<ResolveContext<Context>>([
  route('GET', '/', (ctx) => {
    return ctx.res.send(ctx.req.url)
  }),
  route('GET', '/reject', () => {
    return Promise.reject(new Error('reject'))
  }),
  route('GET', '/error', () => {
    throw new Error('error')
  }),
])

const server = express()

server.use(async (req, res, next) => {
  const { pathname, search } = url.parse(req.url)
  const context = { pathname: pathname || '/', search, method: req.method, req, res }
  const notfound = () => Promise.reject(new Error('404 NotFound'))
  try {
    await router(context, notfound)
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
