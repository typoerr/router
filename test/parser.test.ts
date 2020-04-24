import test from 'ava'
import * as parser from '@/parser'
import regexparams from 'regexparam'

test('params', (t) => {
  const hint = regexparams('/:a/:b')
  const params = parser.params('/a/b', hint)
  t.deepEqual(params, { a: 'a', b: 'b' })
})

test('query', (t) => {
  const a = 'a=a&b=b'
  const b = '?a=a'
  t.deepEqual(parser.query(a), { a: 'a', b: 'b' })
  t.deepEqual(parser.query(b), { a: 'a' })
  t.deepEqual(parser.query(undefined), {})
})
