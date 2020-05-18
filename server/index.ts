import { createServer, Server } from 'http'

interface ServerInit {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
  timeout?: number
  cors?: boolean
  headers?: Record<string, string>
  methods?: string
  credentials?: boolean
}

interface ServerReply {
  status?: number
  data?: Record<string, any> | string | null
  type?: 'json' | 'text' | 'formData' | 'blob' | 'arrayBuffer' | 'document' | ''
  headers?: Record<string, string>
}

function genKey(url: string, method: string) {
  return `${method}:${url}`
}

function getUrlAndMethod(
  hostname: string,
  port: number,
  url: string,
  method = 'GET'
) {
  if (!/^http:\/\//.test(url)) {
    url = `http://${hostname}:${port}${url}`
  }
  return {
    url,
    method
  }
}

export default class TestServer {
  readonly hostname = 'localhost'
  readonly port: number
  private serve: Server | undefined
  private info = new Map<string, [ServerInit, ServerReply]>()
  constructor(port: number) {
    this.port = port
  }

  start(done: (err?: Error) => void) {
    this.serve = createServer((req, res) => {
      const { url, method } = getUrlAndMethod(
        this.hostname,
        this.port,
        req.url as string,
        req.method
      )
      const key = genKey(url, method)
      const [init, reply] = this.info.get(key) || [
        { url: '', method: 'GET', timeout: 0 } as ServerInit,
        { data: null, status: 200, type: '' } as ServerReply
      ]
      const { url: initUrl, method: initMethod } = getUrlAndMethod(
        this.hostname,
        this.port,
        init.url,
        init.method
      )
      // console.log(`init: [${initMethod}] ${initUrl}`)
      // console.log('req: [%s] %s', method, url)
      if (initUrl !== url || (initMethod !== method && method !== 'OPTIONS')) {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.writeHead(404)
        res.end()
        return
      }
      let rawData = ''
      req.on('data', chunk => {
        rawData += chunk
      })
      req.on('end', () => {
        const { data, status = 200, type = '' } = reply
        setTimeout(() => {
          if (init.cors !== false) {
            res.setHeader('Access-Control-Allow-Origin', '*')
          }
          if (init.headers) {
            res.setHeader(
              'Access-Control-Allow-Headers',
              Object.keys(init.headers).join(',')
            )
          }
          if (init.methods) {
            res.setHeader('Access-Control-Allow-Methods', init.methods)
          }
          if (typeof init.credentials === 'boolean') {
            res.setHeader(
              'Access-Control-Allow-Credentials',
              init.credentials + ''
            )
          }
          if (reply.headers) {
            Object.entries(reply.headers).forEach(item => {
              res.setHeader(item[0], item[1])
            })
          }
          let result: typeof data
          if (
            type === 'text' ||
            type === 'formData' ||
            type === 'blob' ||
            type === 'arrayBuffer' ||
            type === 'document'
          ) {
            result = data + ''
            res.writeHead(status)
            res.end(result)
          } else {
            result = {
              url: req.url,
              method: req.method,
              headers: req.headers,
              data,
              body: rawData.toString()
            }
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.writeHead(status)
            res.end(JSON.stringify(result))
          }
        }, (init.timeout || 0) * 1e3)
      })
    })
    this.serve.on('error', done)
    this.serve.listen(this.port, this.hostname, done)
  }
  stop(done: () => void) {
    if (this.serve) {
      this.serve.on('close', () => {
        this.info.clear()
        done()
      })
      this.serve.close()
    }
  }
  on(init: ServerInit | string, reply: ServerReply | string = ''): this {
    if (typeof init === 'string') {
      init = { url: init, method: 'GET' }
    }
    // console.log('orig', init.url)
    if (typeof reply === 'string') {
      reply = { data: reply, status: 200 }
    }
    const { url, method } = getUrlAndMethod(
      this.hostname,
      this.port,
      init.url,
      init.method
    )
    if (init.methods && init.methods.includes('OPTIONS')) {
      this.info.set(genKey(url, 'OPTIONS'), [init, reply])
    }
    this.info.set(genKey(url, method), [init, reply])
    return this
  }
}
