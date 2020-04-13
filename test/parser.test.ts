import * as parser from '../src/parser'
import regexparams from 'regexparam'

test('params', () => {
  const hint = regexparams('/:a/:b')
  const params = parser.params('/a/b', hint)
  expect(params).toStrictEqual({ a: 'a', b: 'b' })
})

test('query', () => {
  const search = 'a=a&b=b'
  expect(parser.query(search)).toStrictEqual({ a: 'a', b: 'b' })
  expect(parser.query(undefined)).toStrictEqual({})
})

test('url', () => {
  const p1 = 'https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash'
  expect(parser.url(p1)).toStrictEqual({
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
  expect(parser.url(p2)).toStrictEqual({
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
  expect(parser.url(p3)).toStrictEqual({
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
  expect(parser.url(p4)).toStrictEqual({
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
  expect(parser.url(p5)).toStrictEqual({
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
