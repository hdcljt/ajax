import ajax from '../src'
import TestServer from '../server'

describe('发起 DELETE 请求', () => {
  const server = new TestServer(3010)
  const { hostname, port } = server

  beforeAll(done => {
    server.start(done)
  })

  afterAll(done => {
    server.stop(done)
  })

  it('配置了 url , method , param , query 和 body ，接口返回为空', () => {
    const d = new Date()
    const dStr = encodeURIComponent(d.toISOString())
    const body = { acct: 'abc-def@ghi.jk', pwd: '1qaz@WSX' }
    const url = `http://${hostname}:${port}/del/param?id=123&t=${dStr}`

    server.on({ url, method: 'DELETE', methods: 'DELETE,OPTIONS' })

    return ajax({
      url: `http://${hostname}:${port}/del`,
      method: 'delete',
      params: '/param/',
      query: { id: 123, t: d },
      body
    }).then(res => {
      expect(res.data).toEqual(
        expect.objectContaining({
          url: `/del/param?id=123&t=${dStr}`,
          method: 'DELETE',
          data: '',
          body: JSON.stringify(body)
        })
      )
    })
  })
})
