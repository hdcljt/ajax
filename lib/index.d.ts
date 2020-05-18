/**
 * 请求方法
 */
export type XHRMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'head'
  | 'options'
  | 'patch'

/**
 * 规范化的请求头格式
 */
export type XHRRequestHeaders = Record<string, string>

/**
 * 各请求方法对应的请求头配置格式
 */
type XHRMethodHeaders = Partial<Record<'common' | XHRMethod, XHRRequestHeaders>>

/**
 * 可配置的请求头格式
 */
export type XHRConfigHeaders = XHRMethodHeaders &
  Record<string, string | XHRRequestHeaders>

/**
 * 查询参数的配置格式
 */
export type XHRQuery = Record<string, any> | string

/**
 * 请求主体的配置格式
 */
export type XHRBody = Record<string, any> | BodyInit | null

/**
 * 响应头解析后的格式
 */
export type XHRResponseHeaders = Record<string, string | string[]>

/**
 * 格式化查询参数的回调方法
 */
export interface TransformQueryCallBack {
  (query: XHRQuery, headers: XHRRequestHeaders):
    | string
    | [string]
    | [string, XHRRequestHeaders]
}

/**
 * 格式化请求主体的回调方法
 */
export interface TransformBodyCallBack {
  (body: XHRBody, headers: XHRRequestHeaders):
    | BodyInit
    | null
    | [BodyInit | null]
    | [BodyInit | null, XHRRequestHeaders]
}

/**
 * 格式化响应数据的回调方法
 */
export interface TransformResponseCallBack {
  (data?: any): any
}

/**
 * 设置成功响应状态码的取值范围
 */
export interface ValidateStatusCallBack {
  (status: number): boolean
}

/**
 * 进度事件的回调方法
 */
export interface ProgressCallBack {
  (progressEvent: ProgressEvent): void
}

/**
 * ajax 请求的可配置项
 */
export interface AjaxOptions {
  /** 请求路径 */
  url: string
  /** 请求方法，默认 'get' */
  method?: XHRMethod
  /** 基础路径，默认 '' */
  baseURL?: string
  /** 路径参数，默认 '' （/api/:params/） */
  params?: string
  /** 查询参数，默认 '' （/api?query） */
  query?: XHRQuery
  /** 请求主体，默认 null */
  body?: XHRBody
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
  responseType?: XMLHttpRequestResponseType
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

/**
 * request 请求的最小化配置
 */
export type XHROptions = Pick<
  AjaxOptions,
  | 'url'
  | 'method'
  | 'timeout'
  | 'responseType'
  | 'withCredentials'
  | 'signal'
  | 'validateStatus'
  | 'onDownloadProgress'
  | 'onUploadProgress'
> & { body?: BodyInit | null; headers?: XHRRequestHeaders }

/**
 * ajax 请求的全量配置
 */
export type AjaxRequiredOptions = Required<AjaxOptions>

/**
 * 响应状态
 */
export declare const enum XHRState {
  /** 响应状态异常 */
  INVALID_STATUS,
  /** 请求被中止 */
  REQUEST_ABORTED,
  /** 请求发生错误 */
  NETWORK_ERROR,
  /** 请求超时 */
  REQUEST_TIMEOUT
}

/**
 * 响应体结构
 */
export interface XHRResponse {
  /** 响应主体 */
  data: any
  /** 响应头 */
  headers: XHRResponseHeaders
  /** 响应的数字状态码 */
  status: number
  /** 响应状态的文本信息 */
  statusText: string
  /** 该响应的请求实例 */
  request: XMLHttpRequest
  /** 该请求的配置信息 */
  config?: AjaxRequiredOptions
}

/**
 * 错误信息
 */
export interface XHRErrorInfo extends Error {
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

/**
 * 拦截器的可配置项
 */
export interface XHRInterceptor {
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

/**
 * 发起请求
 * 依次触发请求拦截器 -> 请求数据格式化 -> request -> 响应数据格式化 -> 成功或失败拦截器
 */
declare function ajax(config: AjaxOptions | string): Promise<any>

/**
 * 发起请求的核心方法（不会触发拦截器和数据格式化）
 */
declare function request(config: XHROptions): Promise<XHRResponse>

/**
 * 取消请求，如果没有传入 signal 则取消所有激活中的请求
 */
declare function cancel(signal?: string): void

/**
 * 默认配置
 */
declare const defaults: AjaxRequiredOptions

/**
 * 拦截器（请求、响应、错误）
 */
declare const interceptor: XHRInterceptor

/**
 * 对象字符串化，是 qs.stringify 的简化版，作为一种可被替代的默认实现
 */
declare function stringify(
  obj: Record<string, any>,
  mode?: 'brackets' | 'none' | 'indices'
): string

export { defaults, interceptor, request, cancel, stringify }

export default ajax
