import ajax, { stringify } from '../src'
import TestServer from '../server'

describe('发起 GET 请求', () => {
  const server = new TestServer(3030)
  const { hostname, port } = server

  beforeAll(done => {
    server.start(done)
  })

  afterAll(done => {
    server.stop(done)
  })

  describe('简单模式', () => {
    it('只配置了 url，接口返回为空', () => {
      const url = `http://${hostname}:${port}/get`
      server.on(url)
      return ajax(url).then(res => {
        expect(res.data).toEqual(
          expect.objectContaining({ url: '/get', method: 'GET', data: '' })
        )
      })
    })
  })

  describe('复杂模式', () => {
    it('配置了 url 和 param ，接口返回 xyz', () => {
      const url = `http://${hostname}:${port}/get/1`
      server.on(url, 'xyz')
      return ajax({
        url: `http://${hostname}:${port}/get`,
        params: '1'
      }).then(res => {
        expect(res.data).toEqual(
          expect.objectContaining({ url: '/get/1', method: 'GET', data: 'xyz' })
        )
      })
    })

    it('配置了 url 和 query ，其中 query 为字符串，接口返回 xyz', () => {
      const url = `http://${hostname}:${port}/get?id=1`
      server.on(url, 'xyz')
      return ajax({
        url: `http://${hostname}:${port}/get`,
        query: 'id=1'
      }).then(res => {
        expect(res.data).toEqual(
          expect.objectContaining({
            url: '/get?id=1',
            method: 'GET',
            data: 'xyz'
          })
        )
      })
    })

    it('配置了 url , params 和 query ，其中 query 为简单对象，且 url 包含多余的 /，接口返回 xyz', () => {
      const url = `http://${hostname}:${port}/get/3/4?id=5`
      server.on(url, 'xyz')
      return ajax({
        url: `http://${hostname}:${port}/get/`,
        params: '/3/4/',
        query: {
          id: 5
        }
      }).then(res => {
        expect(res.data).toEqual(
          expect.objectContaining({
            url: '/get/3/4?id=5',
            method: 'GET',
            data: 'xyz'
          })
        )
      })
    })

    describe('配置了 url , query ，其中 query 为复杂对象', () => {
      let query: Record<string, any>
      let queryStr = ''

      beforeEach(() => {
        const date = new Date()
        const dateStr = encodeURIComponent(date.toISOString())
        query = {
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
          arr2: [{ num: 1, bool: true }, date] // &arr2[][num]=1&arr2[][bool]=true&arr2[]=asdf
        }
        queryStr =
          'num=12&str=abc&str2=&bool=false&arr[]=%E5%B0%8F%E6%98%8E&arr[]=Jacky+Cheung&obj[str]=def&obj[arr][]=xx_x%40yy.zz&obj[arr][]=a-aa%40bb.cc&arr2[][num]=1&arr2[][bool]=true&arr2[]=' +
          dateStr
      })

      it('使用默认实现的 stringify 字符串化，接口返回 xyz', () => {
        const url = `http://${hostname}:${port}/get/6?${queryStr}`
        server.on(url, 'xyz')
        return ajax({ url: `http://${hostname}:${port}/get/6`, query }).then(
          res => {
            expect(res.data).toEqual(
              expect.objectContaining({
                url: `/get/6?${queryStr}`,
                method: 'GET',
                data: 'xyz'
              })
            )
          }
        )
      })

      it('在 transformQuery 回调函数中使用第三方库 qs.stringify 字符串化，接口返回 xyz', async () => {
        const stringifyQS = await import('qs').then(m => m.stringify)
        const url = `http://${hostname}:${port}/get/7?id=1&${queryStr}`
        server.on(url, 'xyz')
        const res = await ajax({
          url: `http://${hostname}:${port}/get/7?id=1`,
          query,
          transformQuery: query =>
            stringifyQS(query, {
              format: 'RFC1738',
              arrayFormat: 'brackets',
              encodeValuesOnly: true,
              skipNulls: true
            }) // 这就是默认实现模式
        })
        expect(res.data).toEqual(
          expect.objectContaining({
            url: `/get/7?id=1&${queryStr}`,
            method: 'GET',
            data: 'xyz'
          })
        )
      })

      it('在 transformQuery 回调函数返回数组 ，接口返回 xyz', () => {
        const url = `http://${hostname}:${port}/get/8?${queryStr}`
        server.on(url, 'xyz')
        return ajax({
          url: `http://${hostname}:${port}/get/8`,
          query,
          transformQuery: query => [stringify(query as object)]
        }).then(res => {
          expect(res.data).toEqual(
            expect.objectContaining({
              url: `/get/8?${queryStr}`,
              method: 'GET',
              data: 'xyz'
            })
          )
        })
      })

      it('在 transformQuery 回调函数返回 headers ，接口返回 xyz', () => {
        const url = `http://${hostname}:${port}/get/9?${queryStr}`
        server.on(
          {
            url,
            methods: 'GET,OPTIONS',
            headers: { 'X-Custom-Header': 'ABCDEFG' }
          },
          'xyz'
        )
        return ajax({
          url: `http://${hostname}:${port}/get/9`,
          method: 'get',
          query,
          transformQuery: query => [
            stringify(query as object),
            { 'X-Custom-Header': 'ABCDEFG' }
          ]
        }).then(res => {
          expect(res.data).toEqual(
            expect.objectContaining({
              url: `/get/9?${queryStr}`,
              method: 'GET',
              data: 'xyz'
            })
          )
        })
      })
    })
  })
})
