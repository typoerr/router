# @typoerr/router

Router for Node.js and browsers.

## Install

```
npm i @typoerr/router
```

## Segments

See [lukeed/regexparam: A tiny (308B) utility that converts route patterns into RegExp. Limited alternative to `path-to-regexp` 🙇‍♂️](https://github.com/lukeed/regexparam)

## Usage

```ts
import {route, use, resolve} from '@typoerr/router'

const noopMiddleware = (ctx, next) => {
  // `next` is a next-middleware, route-handler or final-handler
  // final-handler: () => Promise.reject(new NotFoundError(ctx.pathname, ctx.method))
  const result = next(ctx)
  return result
}

const logMiddleware = (ctx, next) => {
  const result = next(ctx)
  console.log(result)
  return result
}

const routes = [
  use('/*', [logMiddleware, noopMiddleware])
  route('GET', '/', () => '1'),
  route('POST', '/:id', (ctx) => ctx.params.id),
]

;(async function run() {
  try {
    const context = {pathname: '/', method: 'GET', /* ...and other context for handler */}
    const result = await resolve(routes, context)
    console.log(result) // '1'
  } catch(err) {
    if (err.status === 404) {
      // Route not found
    }
  }
})()
```

## API

[Todo]

See `test/router.test.ts` and `src/router.ts`
