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
