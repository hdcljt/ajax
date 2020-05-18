import ajax from '../src'
import TestServer from '../server'

describe('监听进度事件', () => {
  const server = new TestServer(3070)
  const { hostname, port } = server

  beforeAll(done => {
    server.start(done)
  })

  afterAll(done => {
    server.stop(done)
  })

  it('配置了 onDownloadProgress', () => {
    const onDownloadProgress = jest.fn()
    const url = `http://${hostname}:${port}/post/down`
    server.on({ url, method: 'POST' })
    return ajax({
      url,
      method: 'post',
      onDownloadProgress
    }).then(res => {
      expect(onDownloadProgress).toBeCalled()
      expect(res.data).toEqual(
        expect.objectContaining({
          url: '/post/down',
          method: 'POST'
        })
      )
    })
  })

  it('配置了 onUploadProgress', () => {
    const onUploadProgress = jest.fn()
    const body = new Blob([new Uint8Array()], {
      type: 'application/javascript'
    })
    const url = `http://${hostname}:${port}/post/up`
    server.on({ url, method: 'POST', methods: 'POST,OPTIONS' })
    return ajax({
      url,
      method: 'post',
      body,
      onUploadProgress
    }).then(res => {
      expect(onUploadProgress).toBeCalled()
      expect(res.data).toEqual(
        expect.objectContaining({
          url: '/post/up',
          method: 'POST'
        })
      )
    })
  })
})
