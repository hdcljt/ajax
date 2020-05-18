import { parseResponseHeaders } from '../utils'

describe('parseResponseHeaders 分支', () => {
  it('解析 headers 格式错误', () => {
    const headers = 'Content-Type = text/plain'
    expect(parseResponseHeaders(headers)).toEqual({})
  })

  it('解析 headers 多个值', () => {
    const headers = 'Set-Cookie: abc=123\nSet-Cookie: def=xxx'
    expect(parseResponseHeaders(headers)).toEqual({
      'Set-Cookie': ['abc=123', 'def=xxx']
    })
  })
})
