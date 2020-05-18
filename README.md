# ajax

[![Build](https://travis-ci.org/hdcljt/ajax.svg?branch=master)](https://travis-ci.org/hdcljt/ajax)
[![Coverage](https://coveralls.io/repos/github/hdcljt/ajax/badge.svg?branch=master)](https://coveralls.io/github/hdcljt/ajax?branch=master)
[![Version](https://img.shields.io/github/package-json/v/hdcljt/ajax)](https://www.npmjs.com/package/@hudc/ajax)
[![License](https://img.shields.io/github/license/hdcljt/ajax)](LICENSE)
[![Types](https://img.shields.io/npm/types/@hudc/ajax)](lib/index.d.ts)

浏览器端的 Ajax 库，支持 Promise，拦截器，批量取消，对象字符串化

## 安装

```sh
npm install @hudc/ajax
```

## 引入

```ts
import ajax, {
  defaults,
  interceptor,
  request,
  cancel,
  stringify
} from '@hudc/ajax'
```

### 发起请求

```ts
function ajax(config: AjaxOptions | string): Promise<any>
```

#### 示例

```ts
// get
ajax('/get')
  .then(res => cosnole.log(res))
  .catch(err => console.log(err.message))
// get
ajax({ url: '/get', method: 'get' })
// post
ajax({ url: '/post', method: 'post' })
// put
ajax({ url: '/put', method: 'put' })
// patch
ajax({ url: '/patch', method: 'patch' })
// delete
ajax({ url: '/del', method: 'delete' })
// head
ajax({ url: '/head', method: 'head' })
// options
ajax({ url: '/options', method: 'options' })
```

### config 配置参数

```ts
interface AjaxOptions {
  /** 请求路径 */
  url: string
  /** 请求方法，默认 'get' */
  method?: 'get' | 'post' | 'put' | 'delete' | 'head' | 'options' | 'patch'
  /** 基础路径，默认 '' */
  baseURL?: string
  /** 路径参数，默认 '' （/api/:params/） */
  params?: string
  /** 查询参数，默认 '' （/api?query） */
  query?: Record<string, any> | string
  /** 请求主体，默认 null */
  body?: Record<string, any> | BodyInit | null
  /** 请求头，默认 {}
   * {
   *   common: {
   *     'X-Custom-Header': '优先级最低的通用配置'
   *   },
   *   get: {
   *     'X-Custom-Header': 'get 方法的专属配置'
   *   },
   *   post: {
   *     'X-Custom-Header': 'post 方法的专属配置'
   *   },
   *   ... // 其他方法的专属配置
   *   'X-Custom-Header': '优先级最高的配置方式'
   * }
   */
  headers?: XHRConfigHeaders
  /** 超时的时长，单位秒，默认 0 （没有超时） */
  timeout?: number
  /** 响应数据的类型，默认 'json' */
  responseType?: '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text'
  /** 跨站点请求时是否携带凭证，默认 false */
  withCredentials?: boolean
  /** 取消请求的信号，如果没有特别指定，则代表所有激活中的请求，默认 '' */
  signal?: string
  /** 查询参数的格式化方法 */
  transformQuery?: TransformQueryCallBack
  /** 请求主体的格式化方法 */
  transformBody?: TransformBodyCallBack
  /** 响应数据的格式化方法 */
  transformResponse?: TransformResponseCallBack
  /** 定义成功响应的状态码范围，默认 [200, 300) */
  validateStatus?: ValidateStatusCallBack
  /** 下载进度的回调，默认 null */
  onDownloadProgress?: ProgressCallBack | null
  /** 上传进度的回调，默认 null */
  onUploadProgress?: ProgressCallBack | null
}
```

### 响应参数

```ts
interface XHRResponse {
  /** 响应主体 */
  data: any
  /** 响应头 */
  headers: Record<string, string | string[]>
  /** 响应的数字状态码 */
  status: number
  /** 响应状态的文本信息 */
  statusText: string
  /** 该响应的请求实例 */
  request: XMLHttpRequest
  /** 该请求的配置信息 */
  config?: AjaxRequiredOptions
}
```

### 错误信息

```ts
interface XHRErrorInfo extends Error {
  /** 异常是否来自请求被中止 */
  readonly isCancel: boolean
  /** 异常原因： 0-状态码 | 1-中止 | 2-错误 | 3-超时 */
  readonly reason: XHRState
  /** 该异常的请求实例 */
  readonly request: XMLHttpRequest
  /** 异常状态码的响应信息 */
  readonly response?: XHRResponse
  /** 该请求的配置信息 */
  config?: AjaxRequiredOptions
}
```

### 拦截器

```ts
interface XHRInterceptor {
  /** 请求拦截器 */
  request?:
    | ((options: AjaxOptions) => AjaxOptions)
    | ((options: AjaxOptions) => AjaxOptions)[]
  /** 成功拦截器 */
  response?:
    | ((response: any) => any)
    | ((response: any) => any)[]
  /** 失败拦截器 */
  error?:
    | ((error: XHRErrorInfo) => XHRErrorInfo)
    | ((error: XHRErrorInfo) => XHRErrorInfo)[]
}
```

#### 示例

```ts
// 1. 请求拦截器，单个
interceptor.request = config => {
  config.timeout = 5
  return config
} // config.timeout = 5 （单位秒）

// 2. 请求拦截器，多个
interceptor.request = [
  config => {
    config.timeout = 3
    return config
  },
  config => {
    config.timeout = 5 * (config.timeout || 0)
    return config
  }
] // config.timeout = 15 （单位秒）

// 3. 成功拦截器，单个
interceptor.response = response => {
  response.statusText = 'zzzz'
  return response
} // response.statusText = 'zzzz'

// 4. 成功拦截器，多个
interceptor.response = [
  response => {
    response.statusText = 'xxxx'
    return response
  },
  response => {
    response.statusText += 'yyyy'
    return response
  }
] // response.statusText = xxxxyyyy

// 5. 失败拦截器，单个
interceptor.error = error => {
  error.message = 'error!!'
  return error
} // error.message = 'error!!'

// 6. 失败拦截器，多个
interceptor.error = [
  error => {
    error.message = 'error1'
    return error
  },
  error => {
    error.message += 'error2'
    return error
  }
] // error.message = 'error1error2'
```

### 默认配置

```ts
const defaults: AjaxRequiredOptions = {
  url: '',
  method: 'get',
  params: '', // user/:params
  query: '', // user?query
  body: null,
  baseURL: '',
  headers: {
    common: {
      Accept: 'application/json, text/plain, */*'
    }
  }, // 优先级由高到低： headers[name] > headers[method][name] > headers.common[name]
  timeout: 0,
  responseType: '',
  withCredentials: false,
  signal: '',
  transformQuery,
  transformBody,
  transformResponse,
  validateStatus,
  onUploadProgress: null,
  onDownloadProgress: null
}
```

### 取消请求

```ts
function cancel(signal?: string): void
```

#### 重新初始化一个现有的请求

```ts
ajax('/reset') // 下一个请求发起后，该请求被取消，之后重新初始化
ajax('/reset') // 利用了 xhr.open() 的原始特性
```

#### 中止所有激活的请求

```ts
ajax('/cancel1').catch(err => err.isCancel === true)
ajax('/cancel2').catch(err => err.isCancel === true)
cancel()
// 请求 /cancel1 和 /cancel2 同时被取消
```

#### 中止特定的请求

```ts
ajax({ url: '/spec1', signal: 's1' }).catch(err => err.isCancel === true)
ajax({ url: '/spec2', signal: 's1' }).catch(err => err.isCancel === true)
ajax({ url: '/spec3', signal: 's2' })
cancel('s1')
// 请求 /spec1 和 /spec2 被取消，/spec3 还处于激活中
```

### 使用 request 发起请求

```ts
function request(config: XHROptions): Promise<XHRResponse>
```

> 是 ajax(config) 发起请求的核心方法（不触发拦截器，不格式化数据），适用于简单请求

#### 示例

```ts
// get
request({ url }).then(res => console.log(res))
// post
request({ url, method: 'post', responseType: 'json' }).then(res =>
  console.log(res)
)
```

### 字符串化

```ts
/**
 * 字符串化，默认 mode = 'brackets'
 * 是 qs 以下模式的简化版
 * qs.stringify(obj, {
 *   format: 'RFC1738',
 *   arrayFormat: 'brackets',
 *   encodeValuesOnly: true,
 *   skipNulls: true
 * })
 */
function stringify(
  obj: Record<string, any>,
  mode?: 'brackets' | 'none' | 'indices'
): string
```

#### 示例

```ts
stringify({ a: 1, b: ['x', { c: 'y' }] })
// a=1&b[]=x&b[][c]=y
stringify({ a: 1, b: ['x', { c: 'y' }] }, 'brackets')
// a=1&b[]=x&b[][c]=y
stringify({ a: 1, b: ['x', { c: 'y' }] }, 'none')
// a=1&b=x&b[c]=y
stringify({ a: 1, b: ['x', { c: 'y' }] }, 'indices')
// a=1&b[0]=x&b[1][c]=y
```

## 参考

- [Using XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest)
- [axios](https://www.npmjs.com/package/axios)
- [qs](https://www.npmjs.com/package/qs)
