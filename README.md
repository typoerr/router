# @typoerr/router

![npm](https://img.shields.io/npm/v/@typoerr/router?color=blue)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@typoerr/router)

Router for Node.js and Browser.

## Install

```
npm i @typoerr/router
```

https://www.npmjs.com/package/@typoerr/router

## Path expression

See [lukeed/regexparam](https://github.com/lukeed/regexparam).

## Example

```ts
import { route, compose, ResolveHint } from '@typoerr/router'

const router = compose([
  route('GET', '/', (ctx) => ctx.pathname),
  route('GET', '/err', (ctx) => Promise.reject(ctx.pathname)),
])

async function main(context: ResolveHint) {
  const notfound = () => Promise.reject(new Error('404 NotFound'))
  try {
    const reulst = await router(context, notfound)
    console.assert(result === context.pathname)
  } catch(err) {
    console.error(err)
  }
}
```

And See `test/example/*.test.ts`.

## API

See `src/route.ts` and `test/route.test.ts`.

## Inspired

- [serviejs/throwback: An asynchronous middleware pattern](https://github.com/serviejs/throwback)
- [serviejs/servie-route: Simple route middleware for Servie](https://github.com/serviejs/servie-route)
