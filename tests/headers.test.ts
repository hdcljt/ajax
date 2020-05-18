import ajax from '../src'
import TestServer from '../server'

describe('设置消息头', () => {
  const server = new TestServer(3040)
  const { hostname, port } = server

  beforeAll(done => {
    server.start(done)
  })

  afterAll(done => {
    server.stop(done)
    document.cookie.split(';').forEach(item => {
      document.cookie = `${
        item.split('=')[0]
      }=; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    })
  })

  it('GET 请求设置 Content-Type 是无效的', () => {
    const url = `http://${hostname}:${port}/get/content-type`
    server.on(url)
    return ajax({
      url,
      headers: {
        get: {
          'Content-Type': 'text/plain'
        }
      }
    }).then(res => {
      expect(res.data).toEqual(
        expect.objectContaining({
          url: '/get/content-type',
          method: 'GET'
        })
      )
    })
  })

  it('请求头携带 cookie', () => {
    document.cookie = 'X-Token=abc123'
    const url = `http://${hostname}:${port}/get/cookie`
    server.on({ url, credentials: true })
    return ajax({ url, withCredentials: true }).then(res => {
      expect(res.data).toEqual(
        expect.objectContaining({
          url: '/get/cookie',
          method: 'GET',
          headers: expect.objectContaining({ cookie: 'X-Token=abc123' })
        })
      )
    })
  })

  it('获取响应头', () => {
    const url = `http://${hostname}:${port}/get/res-headers`
    server.on(
      { url, cors: true, credentials: true },
      { headers: { 'Cache-Control': 'max-age=60' } }
    )
    return ajax({ url, withCredentials: true }).then(res => {
      expect(res).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({ 'cache-control': 'max-age=60' })
        })
      )
    })
  })
})
