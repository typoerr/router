import test from 'ava'
import Koa from 'koa'
import fetch from 'node-fetch'
import * as URL from 'url'
import { route, compose, ResolveContext } from '@/index'
import listen from '@typoerr/test-listen'

type Context = { koa: Koa.Context }

const router = compose<ResolveContext<Context>>([
  route('GET', '/', (ctx) => (ctx.koa.body = ctx.pathname)),
  route('GET', '/err', (ctx) => ctx.koa.throw('err')),
])

const server = new Koa()

server.silent = true

server.use(async (ctx) => {
  const _url = URL.parse(ctx.request.url)
  const pathname = _url.pathname || '/'
  const search = _url.search
  const method = ctx.request.method
  const notfound = (ctx: Context) => ctx.koa.throw(404, 'NotFound')
  return router({ pathname, search, method, koa: ctx }, notfound)
})

test('/', (t) => {
  return listen(server.callback(), async (url) => {
    const res = await await fetch(url)
    t.is(await res.text(), '/')
  })
})

test('/err', (t) => {
  return listen(server.callback(), async (url) => {
    const res = await fetch(url + '/err')
    t.is(res.status, 500)
  })
})

test('/notfound', (t) => {
  t.plan(1)
  return listen(server.callback(), async (url) => {
    const res = await fetch(url + '/notfound')
    t.is(res.status, 404)
  })
})
