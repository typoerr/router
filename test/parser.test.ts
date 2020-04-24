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
