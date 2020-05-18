import ajax, { defaults } from '../src'
import TestServer from '../server'

describe('修改 defaults 配置', () => {
  const server = new TestServer(3000)
  const { hostname, port } = server

  beforeAll(done => {
    server.start(done)
  })

  afterAll(done => {
    server.stop(done)
  })

  describe('配置了 defaults.baseURL', () => {
    it('url 为相对路径', () => {
      defaults.baseURL = `http://${hostname}:${port}/relative`
      const url = `${defaults.baseURL}/baseurl`
      server.on(url)
      return ajax({ url: '/baseurl' }).then(res => {
        expect(res.data).toEqual(
          expect.objectContaining({ url: '/relative/baseurl' })
        )
      })
    })

    it('url 为绝对路径', () => {
      defaults.baseURL = `http://${hostname}:${port}/get`
      const url = `http://${hostname}:${port}/absolute/baseurl`
      server.on(url)
      return ajax(url).then(res => {
        expect(res.data).toEqual(
          expect.objectContaining({ url: '/absolute/baseurl' })
        )
      })
    })
  })
})
