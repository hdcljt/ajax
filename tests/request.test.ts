import { request, defaults } from '../src'
import TestServer from '../server'

describe('使用 request 发起请求', () => {
  const server = new TestServer(3080)
  const { hostname, port } = server

  beforeAll(done => {
    server.start(done)
  })

  afterAll(done => {
    server.stop(done)
  })

  it('不会触发拦截器和数据格式化方法， body, headers 的错误格式会被丢弃，返回的数据也是原类型', () => {
    const url = `http://${hostname}:${port}/request/1`
    server.on(url)
    return request({ url }).then(res => {
      expect(res.data).toMatch('/request/1')
    })
  })

  it('配置 headers 和 body', () => {
    const url = `http://${hostname}:${port}/request/cust`
    server.on(url)
    return request({
      url,
      headers: {
        Accept: 'application/json, text/plain, */*'
      },
      body: '{"id": "1234"}'
    }).then(res => {
      expect(res.data).toMatch('/request/cust')
    })
  })

  it('修改 defaults 数据， headers 和 body 会进行过滤', () => {
    defaults.headers = {
      common: {
        Accept: '*/*'
      },
      Accept: 'application/json, text/plain, */*'
    }
    defaults.body = {
      id: 1
    }
    const url = `http://${hostname}:${port}/request/def`
    server.on(url)
    return request({ url }).then(res => {
      expect(res.data).toMatch('/request/def')
    })
  })
})
