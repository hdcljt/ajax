import ajax from '../src'
import TestServer from '../server'

describe('获取响应数据格式', () => {
  const server = new TestServer(3090)
  const { hostname, port } = server

  beforeAll(done => {
    server.start(done)
  })

  afterAll(done => {
    server.stop(done)
  })

  it('配置 responseType 为 "text" 默认为 "" ， 接收 responseText', () => {
    const url = `http://${hostname}:${port}/type/empty`
    server.on(url, { data: 'abc', type: 'text' })
    return ajax({ url, responseType: 'text' }).then(res => {
      expect(res.data).toMatch('abc')
    })
  })

  it('配置 responseType 为 "document" ， 接收 responseXML', () => {
    const url = `http://${hostname}:${port}/type/empty`
    server.on(url, { data: '<div>123</div>', type: 'document' })
    return ajax({ url, responseType: 'document' }).then(res => {
      expect(res.data instanceof Document).toBe(true)
    })
  })
})
