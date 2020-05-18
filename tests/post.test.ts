import ajax, { stringify } from '../src'
import TestServer from '../server'

describe('发起 POST 请求', () => {
  const server = new TestServer(3060)
  const { hostname, port } = server

  beforeAll(done => {
    server.start(done)
  })

  afterAll(done => {
    server.stop(done)
  })

  describe('简单模式', () => {
    it('只配置了 url 和 method 空', () => {
      const url = `http://${hostname}:${port}/post`
      server.on({ url, method: 'POST' })
      return ajax({ url, method: 'post' }).then(res => {
        expect(res.data).toEqual(
          expect.objectContaining({ url: '/post', method: 'POST', data: '' })
        )
      })
    })
  })

  describe('复杂模式', () => {
    it('配置了 url , method 和 param ', () => {
      const url = `http://${hostname}:${port}/posts/1`
      server.on({ url, method: 'POST' }, 'xyz')
      return ajax({
        url: `http://${hostname}:${port}/posts/`,
        params: '1',
        method: 'post'
      }).then(res => {
        expect(res.data).toEqual(
          expect.objectContaining({
            url: '/posts/1',
            method: 'POST',
            data: 'xyz'
          })
        )
      })
    })

    it('配置了 url , method 和 query ，但配置 query 是无效的', () => {
      const url = `http://${hostname}:${port}/posts/2`
      server.on({ url, method: 'POST' })
      return ajax({ url, query: 'id=1', method: 'post' }).then(res => {
        expect(res.data).toEqual(
          expect.objectContaining({
            url: '/posts/2',
            method: 'POST'
          })
        )
      })
    })

    it('配置了 url , method 和 body ，其中 body 为字符串', () => {
      const url = `http://${hostname}:${port}/posts/str`
      const body = '{"userId": "123456"}'
      server.on({ url, method: 'POST' }, 'xyz')
      return ajax({ url, method: 'post', body }).then(res => {
        expect(res.data).toEqual(
          expect.objectContaining({
            url: '/posts/str',
            method: 'POST',
            data: 'xyz',
            body
          })
        )
      })
    })

    it('配置了 url , method 和 body ，其中 body 为简单对象', () => {
      const url = `http://${hostname}:${port}/posts/3`
      const body = {
        userId: 123456
      }
      server.on({ url, method: 'POST' }, 'xyz')
      return ajax({ url, method: 'post', body }).then(res => {
        expect(res.data).toEqual(
          expect.objectContaining({
            url: '/posts/3',
            method: 'POST',
            data: 'xyz',
            body: JSON.stringify(body)
          })
        )
      })
    })

    describe('请求体为普通对象', () => {
      let body: Record<string, any>
      let bodyStr = ''

      beforeEach(() => {
        const date = new Date()
        const dateStr = encodeURIComponent(date.toISOString())
        body = {
          num: 12, // ?num=12
          str: 'abc', // &str=abc
          str2: '', // &str2=
          bool: false, // &bool=false
          nouse: undefined, // ''
          none: null, // ''
          arr: ['小明', 'Jacky Cheung'], // &arr[]=%E5%B0%8F%E6%98%8E&arr[]=Jacky+Cheung
          obj: {
            str: 'def', // &obj[str]=def
            arr: ['xx_x@yy.zz', 'a-aa@bb.cc'] // &obj[arr][]=xx_x%40yy.zz&obj[arr][]=a-aa%40bb.cc
          },
          arr2: [{ num: 1, bool: true }, date] // &arr2[][num]=1&arr2[][bool]=true&arr2[]=${dateStr}
        }
        bodyStr =
          'num=12&str=abc&str2=&bool=false&arr[]=%E5%B0%8F%E6%98%8E&arr[]=Jacky+Cheung&obj[str]=def&obj[arr][]=xx_x%40yy.zz&obj[arr][]=a-aa%40bb.cc&arr2[][num]=1&arr2[][bool]=true&arr2[]=' +
          dateStr
      })

      it('默认使用 JSON.stringify 字符串化', () => {
        const url = `http://${hostname}:${port}/posts/4`
        server.on({ url, method: 'POST' }, 'xyz')
        return ajax({ url, method: 'post', body }).then(res => {
          expect(res.data).toEqual(
            expect.objectContaining({
              url: '/posts/4',
              method: 'POST',
              data: 'xyz',
              body: JSON.stringify(body)
            })
          )
        })
      })

      it('配置了 Content-Type ，使用内部实现的 stringify 字符串化', () => {
        const url = `http://${hostname}:${port}/posts/5`
        server.on({ url, method: 'POST' }, 'xyz')
        return ajax({
          url,
          method: 'post',
          body,
          headers: {
            post: {
              'content-type': 'application/x-www-form-urlencoded; charset=utf-8'
            }
          }
        }).then(res => {
          expect(res.data).toEqual(
            expect.objectContaining({
              url: '/posts/5',
              method: 'POST',
              data: 'xyz',
              body: bodyStr
            })
          )
        })
      })

      it('配置了 Content-Type ，在 transformBody 回调函数中使用第三方库 qs.stringify 字符串化', async () => {
        const stringifyQS = await import('qs').then(m => m.stringify)
        const url = `http://${hostname}:${port}/posts/6`
        server.on({ url, method: 'POST' })
        const res = await ajax({
          url,
          method: 'post',
          body,
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=utf-8'
          },
          transformBody: body =>
            stringifyQS(body, {
              format: 'RFC1738',
              arrayFormat: 'brackets',
              encodeValuesOnly: true,
              skipNulls: true
            }) // 这就是 stringifyDef 的默认实现
        })
        expect(res.data).toEqual(
          expect.objectContaining({
            url: '/posts/6',
            method: 'POST',
            body: bodyStr
          })
        )
      })

      it('配置了 Content-Type ，在 transformBody 回调函数返回数组', () => {
        const url = `http://${hostname}:${port}/posts/7`
        server.on({ url, method: 'POST' })
        return ajax({
          url,
          method: 'post',
          body,
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=utf-8'
          },
          transformBody: body => [stringify(body as object)]
        }).then(res => {
          expect(res.data).toEqual(
            expect.objectContaining({
              url: '/posts/7',
              method: 'POST',
              body: bodyStr
            })
          )
        })
      })

      it('在 transformBody 回调函数中返回 headers ', () => {
        const url = `http://${hostname}:${port}/posts/8`
        server.on({ url, method: 'POST' })
        return ajax({
          url,
          method: 'post',
          body,
          transformBody: body => [
            JSON.stringify(body),
            {
              'content-type': 'application/json; charset=utf-8'
            }
          ]
        }).then(res => {
          expect(res.data).toEqual(
            expect.objectContaining({
              url: '/posts/8',
              method: 'POST',
              body: JSON.stringify(body)
            })
          )
        })
      })

      it('在 transformBody 回调函数中返回增量 headers ', () => {
        const url = `http://${hostname}:${port}/posts/8`
        server.on({ url, method: 'POST' })
        return ajax({
          url,
          method: 'post',
          body,
          transformBody: (body, headers) => [
            JSON.stringify(body),
            {
              ...headers,
              'content-type': 'application/json; charset=utf-8'
            }
          ]
        }).then(res => {
          expect(res.data).toEqual(
            expect.objectContaining({
              url: '/posts/8',
              method: 'POST',
              body: JSON.stringify(body)
            })
          )
        })
      })
    })

    describe('请求体为 FormData', () => {
      it('FormData', () => {
        const body = new FormData()
        body.append('a', '112')
        body.append('b', 'xxy')
        const url = `http://${hostname}:${port}/posts/formdata`
        server.on({ url, method: 'POST', methods: 'POST,OPTIONS' }, 'xyz')
        return ajax({ url, method: 'post', body }).then(res => {
          expect(res.data).toEqual(
            expect.objectContaining({
              url: '/posts/formdata',
              method: 'POST',
              data: 'xyz'
            })
          )
        })
      })
    })
  })
})
