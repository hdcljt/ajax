/// <reference lib="es2020.promise" />
/// <reference types="../types" />
import ajax, { cancel } from '../src'
import TestServer from '../server'

describe('请求异常', () => {
  const server = new TestServer(3020)
  const { hostname, port } = server

  beforeAll(done => {
    server.start(done)
  })

  afterAll(done => {
    server.stop(done)
  })

  it('错误', () => {
    const url = `http://${hostname}:${port}/err/error`
    server.on({ url, cors: false, methods: 'GET' }) // 发送自定义请求头，但不支持跨域，拒绝 GET
    return ajax({
      url,
      headers: { 'X-Custom-Header': 'Cross Site Not Supported' }
    }).catch(err => {
      expect(err).toEqual(
        expect.objectContaining({ reason: XHRState.NETWORK_ERROR })
      )
    })
  })

  it('超时，单位秒', () => {
    const url = `http://${hostname}:${port}/err/timeout`
    server.on({ url, timeout: 1 }) // 接口1s返回，请求0.5s超时
    return ajax({ url, timeout: 0.5 }).catch(err => {
      expect(err).toEqual(
        expect.objectContaining({ reason: XHRState.REQUEST_TIMEOUT })
      )
    })
  })

  it('状态码异常，默认有效范围 [200, 300)', () => {
    const url = `http://${hostname}:${port}/err/status-def`
    server.on(url, { status: 304 })
    return ajax(url).catch(err => {
      expect(err).toEqual(
        expect.objectContaining({ reason: XHRState.INVALID_STATUS })
      )
    })
  })

  it('状态码异常，自定义有效值为 status === 200', () => {
    const url = `http://${hostname}:${port}/err/status-cust`
    server.on(url, { status: 250 })
    return ajax({ url, validateStatus: status => status === 200 }).catch(
      err => {
        expect(err).toEqual(
          expect.objectContaining({ reason: XHRState.INVALID_STATUS })
        )
      }
    )
  })

  it('中止，所有请求', () => {
    const url1 = `http://${hostname}:${port}/err/abort1`
    const url2 = `http://${hostname}:${port}/err/abort2`
    server.on(url1).on(url2)
    const promise = Promise.allSettled([ajax(url1), ajax(url2)])
    cancel()
    return promise.then(arr => {
      expect(arr.length).toBe(2)
      expect(arr).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            status: 'rejected',
            reason: expect.objectContaining({
              reason: XHRState.REQUEST_ABORTED,
              isCancel: true
            })
          }),
          expect.objectContaining({
            status: 'rejected',
            reason: expect.objectContaining({
              reason: XHRState.REQUEST_ABORTED,
              isCancel: true
            })
          })
        ])
      )
    })
  })

  it('中止，特定请求', () => {
    const url1 = `http://${hostname}:${port}/err/abort3`
    const url2 = `http://${hostname}:${port}/err/abort4`
    server.on(url1).on(url2)
    const promise = Promise.allSettled([
      ajax({ url: url1, signal: 'abc' }),
      ajax({ url: url2, signal: 'def' })
    ])
    cancel('abc')
    return promise.then(arr => {
      expect(arr.length).toBe(2)
      expect(arr).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            status: 'fulfilled',
            value: expect.objectContaining({
              data: expect.objectContaining({
                url: '/err/abort4'
              })
            })
          }),
          expect.objectContaining({
            status: 'rejected',
            reason: expect.objectContaining({
              isCancel: true,
              reason: XHRState.REQUEST_ABORTED,
              config: expect.objectContaining({
                url: `http://${hostname}:${port}/err/abort3`
              })
            })
          })
        ])
      )
    })
  })

  it('中止，再次发起', () => {
    const url = `http://${hostname}:${port}/err/abort`
    server.on({ url })
    ajax(url)
    return ajax(url).then(res => {
      expect(res).toBeTruthy()
    })
  })
})
