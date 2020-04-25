import test from 'ava'
import { JSDOM } from 'jsdom'
import { route, compose } from '@/index'

const dom = new JSDOM('', {
  url: 'https://example.org/page1',
})

const router = compose([
  //
  route('/page1', () => 'page1'),
  route('/page2', () => 'page2'),
])

test('match', async (t) => {
  const loc = dom.window.location
  const { pathname, search } = loc
  const notfound = () => '/notfound'
  const result = await router({ pathname, search }, notfound)
  t.is(result, 'page1')
})
