import test from 'ava'
import express from 'express'
import fetch from 'node-fetch'
import createError from 'http-errors'
import * as URL from 'url'
import { route, compose, ResolveContext } from '@/index'
import listen from '@typoerr/test-listen'

interface Context {
  req: express.Request
  res: express.Response
}

const router = compose<ResolveContext<Context>>([
  route('GET', '/', (ctx) => ctx.res.send('/')),
  route('GET', '/err', () => Promise.reject(new Error('err'))),
])

const server = express()

server.use(async (req, res, next) => {
  const _url = URL.parse(req.url)
  const pathname = _url.pathname || '/'
  const search = _url.search
  const method = req.method
  const notfound = () => Promise.reject(createError(404))
  return router({ pathname, search, method, req, res }, notfound).catch(next)
})

test('/', (t) => {
  return listen(server, async (url) => {
    const res = await fetch(url)
    t.is(await res.text(), '/')
  })
})

test('/err', (t) => {
  return listen(server, async (url) => {
    const res = await fetch(url + '/err')
    t.is(res.status, 500)
  })
})

test('/notfound', (t) => {
  t.plan(1)
  return listen(server, async (url) => {
    const res = await fetch(url + '/notfound')
    t.is(res.status, 404)
  })
})
