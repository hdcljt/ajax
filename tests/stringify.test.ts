import { stringify } from '../utils'

describe('stringify', () => {
  let obj: Record<string, any>
  const d = new Date()
  const dStr = encodeURIComponent(d.toISOString())
  beforeEach(() => {
    obj = {
      a: ['12', { b: true }],
      c: {
        d,
        e: 34
      },
      f: undefined,
      g: null
    }
  })

  it('object', () => {
    const obj = { a: 1, b: 2 }
    expect(stringify(obj)).toMatch('a=1&b=2')
  })

  it('array', () => {
    const obj = [1, 2]
    expect(stringify(obj)).toMatch('0=1&1=2')
  })

  it('object.array', () => {
    const obj = { a: [1, 2], b: [3] }
    expect(stringify(obj)).toMatch('a[]=1&a[]=2&b[]=3')
  })

  it('mode = brackets', () => {
    expect(stringify(obj)).toMatch(`a[]=12&a[][b]=true&c[d]=${dStr}&c[e]=34`)
  })

  it('mode = none', () => {
    expect(stringify(obj, 'none')).toMatch(
      `a=12&a[b]=true&c[d]=${dStr}&c[e]=34`
    )
  })

  it('mode = indices', () => {
    expect(stringify(obj, 'indices')).toMatch(
      `a[0]=12&a[1][b]=true&c[d]=${dStr}&c[e]=34`
    )
  })
})
