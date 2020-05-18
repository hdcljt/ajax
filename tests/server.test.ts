import TestServer from '../server'
import ajax from '../src'

describe('测试服务的其他分支', () => {
  const server = new TestServer(3100)
  const { hostname, port } = server

  it('没有启动的状态下，关闭服务是无效的', () => {
    server.stop(() => {})
  })

  describe('异常分支', () => {
    beforeAll(done => {
      server.start(done)
    })

    afterAll(done => {
      server.stop(done)
    })

    it('cors1', () => {
      const url = `http://${hostname}:${port}/serv/cors`
      server.on({ url, cors: false })
      return expect(ajax(url)).rejects.toBeTruthy()
    })
  })
})
