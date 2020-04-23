import test from 'ava'
import * as parser from '@/parser'
import regexparams from 'regexparam'

test('params', (t) => {
  const hint = regexparams('/:a/:b')
  const params = parser.params('/a/b', hint)
  t.deepEqual(params, { a: 'a', b: 'b' })
})

test('query', (t) => {
  const search = 'a=a&b=b'
  t.deepEqual(parser.query(search), { a: 'a', b: 'b' })
  t.deepEqual(parser.query(undefined), {})
})

test('url', (t) => {
  const p1 = 'https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash'
  t.deepEqual(parser.url(p1), {
    protocol: 'https:',
    username: 'user',
    password: 'pass',
    hostname: 'sub.example.com',
    port: '8080',
    pathname: '/p/a/t/h',
    search: '?query=string',
    hash: '#hash',
  })

  const p2 = '/p/a/t/h?query=string'
  t.deepEqual(parser.url(p2), {
    protocol: undefined,
    username: undefined,
    password: undefined,
    hostname: undefined,
    port: undefined,
    pathname: '/p/a/t/h',
    search: '?query=string',
    hash: undefined,
  })

  const p3 = '/p/a/t/h/?query=string'
  t.deepEqual(parser.url(p3), {
    protocol: undefined,
    username: undefined,
    password: undefined,
    hostname: undefined,
    port: undefined,
    pathname: '/p/a/t/h',
    search: '?query=string',
    hash: undefined,
  })

  const p4 = '/?query=string'
  t.deepEqual(parser.url(p4), {
    protocol: undefined,
    username: undefined,
    password: undefined,
    hostname: undefined,
    port: undefined,
    pathname: '/',
    search: '?query=string',
    hash: undefined,
  })

  const p5 = encodeURIComponent('https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash')
  t.deepEqual(parser.url(p5), {
    protocol: 'https:',
    username: 'user',
    password: 'pass',
    hostname: 'sub.example.com',
    port: '8080',
    pathname: '/p/a/t/h',
    search: '?query=string',
    hash: '#hash',
  })
})
