import ajax, { interceptor } from '../src'
import TestServer from '../server'

describe('拦截器 interceptor', () => {
  const server = new TestServer(3050)
  const { hostname, port } = server

  beforeAll(done => {
    server.start(done)
  })

  afterAll(done => {
    server.stop(done)
  })

  describe('请求拦截器', () => {
    it('单个拦截器', () => {
      interceptor.request = config => {
        config.timeout = 5
        return config
      }
      const url = `http://${hostname}:${port}/interceptor/req1`
      server.on(url)
      return ajax(url).then(res => {
        expect(res).toEqual(
          expect.objectContaining({
            config: expect.objectContaining({ timeout: 5 })
          })
        )
      })
    })

    it('多个拦截器', () => {
      interceptor.request = [
        config => {
          config.timeout = 3
          return config
        },
        config => {
          config.timeout = 5 * (config.timeout || 0)
          return config
        }
      ]
      const url = `http://${hostname}:${port}/interceptor/req2`
      server.on(url)
      return ajax(url).then(res => {
        expect(res).toEqual(
          expect.objectContaining({
            config: expect.objectContaining({ timeout: 15 })
          })
        )
      })
    })
  })

  describe('响应拦截器', () => {
    it('单个拦截器', () => {
      interceptor.response = response => {
        response.statusText = 'zzzz'
        return response
      }
      const url = `http://${hostname}:${port}/interceptor/res1`
      server.on(url)
      return ajax(url).then(res => {
        expect(res).toEqual(
          expect.objectContaining({
            statusText: 'zzzz'
          })
        )
      })
    })

    it('多个拦截器', () => {
      interceptor.response = [
        response => {
          response.statusText = 'xxxx'
          return response
        },
        response => {
          response.statusText += 'yyyy'
          return response
        }
      ]
      const url = `http://${hostname}:${port}/interceptor/res2`
      server.on(url)
      return ajax(url).then(res => {
        expect(res).toEqual(
          expect.objectContaining({
            statusText: 'xxxxyyyy'
          })
        )
      })
    })
  })

  describe('错误拦截器', () => {
    it('单个拦截器', () => {
      interceptor.error = error => {
        error.message = 'error~~~~~~~~~~~~'
        return error
      }
      const url = `http://${hostname}:${port}/interceptor/err1`
      server.on(url, { status: 304 })
      return expect(ajax(url)).rejects.toEqual(
        expect.objectContaining({ message: 'error~~~~~~~~~~~~' })
      )
    })

    it('多个拦截器', () => {
      interceptor.error = [
        error => {
          error.message = 'error1'
          return error
        },
        error => {
          error.message += 'error2'
          return error
        }
      ]
      const url = `http://${hostname}:${port}/interceptor/err2`
      server.on(url, { status: 304 })
      return expect(ajax(url)).rejects.toEqual(
        expect.objectContaining({ message: 'error1error2' })
      )
    })
  })
})
