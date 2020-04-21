import test from 'ava'
import { route } from '../src/router'

test('route | route(path, callback)', async (t) => {
  const match = route('/', (ctx) => ctx.pathname)
  const next = () => '/notfound'

  t.is(await match({ pathname: '/' }, next), '/')
  t.is(await match({ pathname: '/path' }, next), '/notfound')
})

test('router | route(method, path, callback)', async (t) => {
  const match = route('GET', '/', (ctx) => ctx.pathname)
  const next = () => '/notfound'

  t.is(await match({ pathname: '/', method: 'GET' }, next), '/')
  t.is(await match({ pathname: '/', method: 'POST' }, next), '/notfound')
  t.is(await match({ pathname: '/path', method: 'GET' }, next), '/notfound')
})
