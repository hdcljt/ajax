import { setContentType } from '../utils'

describe('setContentType 分支', () => {
  it('覆盖 Content-Type 值', () => {
    const orig = {
      'Content-Type': 'text/plain'
    }
    expect(setContentType(orig, 'text/html', 'override')).toEqual(
      expect.objectContaining({
        'Content-Type': 'text/html'
      })
    )
  })

  it('保留 Content-Type 值', () => {
    const orig = {
      'Content-Type': 'text/plain'
    }
    expect(setContentType(orig)).toEqual(
      expect.objectContaining({
        'Content-Type': 'text/plain'
      })
    )
  })

  it('使用 Content-Type 默认值', () => {
    expect(setContentType({})).toEqual(
      expect.objectContaining({
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      })
    )
  })
})
