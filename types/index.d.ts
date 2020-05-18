type XHRMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'head'
  | 'options'
  | 'patch'

type XHRRequestHeaders = Record<string, string>

type XHRMethodHeaders = Partial<Record<'common' | XHRMethod, XHRRequestHeaders>>

type XHRConfigHeaders = XHRMethodHeaders &
  Record<string, string | XHRRequestHeaders>

type XHRQuery = Record<string, any> | string

type XHRBody = Record<string, any> | BodyInit | null

type XHRResponseHeaders = Record<string, string | string[]>

interface TransformQueryCallBack {
  (query: XHRQuery, headers: XHRRequestHeaders):
    | string
    | [string]
    | [string, XHRRequestHeaders]
}

interface TransformBodyCallBack {
  (body: XHRBody, headers: XHRRequestHeaders):
    | BodyInit
    | null
    | [BodyInit | null]
    | [BodyInit | null, XHRRequestHeaders]
}

interface TransformResponseCallBack {
  (data?: any): any
}

interface ValidateStatusCallBack {
  (status: number): boolean
}

interface ProgressCallBack {
  (progressEvent: ProgressEvent): void
}

interface AjaxOptions {
  url: string
  method?: XHRMethod
  baseURL?: string
  params?: string
  query?: XHRQuery
  body?: XHRBody
  headers?: XHRConfigHeaders
  timeout?: number
  responseType?: XMLHttpRequestResponseType
  withCredentials?: boolean
  signal?: string
  transformQuery?: TransformQueryCallBack
  transformBody?: TransformBodyCallBack
  transformResponse?: TransformResponseCallBack
  validateStatus?: ValidateStatusCallBack
  onDownloadProgress?: ProgressCallBack | null
  onUploadProgress?: ProgressCallBack | null
}

type XHROptions = Pick<
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

type AjaxRequiredOptions = Required<AjaxOptions>

declare const enum XHRState {
  INVALID_STATUS, // 响应状态异常
  REQUEST_ABORTED, // 请求被中止
  NETWORK_ERROR, // 网络错误
  REQUEST_TIMEOUT // 请求超时
}

interface XHRResponse {
  data: any
  headers: XHRResponseHeaders
  status: number
  statusText: string
  request: XMLHttpRequest
  config?: Required<AjaxOptions>
}

interface XHRErrorInfo extends Error {
  readonly isCancel: boolean
  readonly reason: XHRState
  readonly request: XMLHttpRequest
  readonly response?: XHRResponse
  config?: Required<AjaxOptions>
}

interface XHRInterceptor {
  request?:
    | ((options: AjaxOptions) => AjaxOptions)
    | ((options: AjaxOptions) => AjaxOptions)[]
  response?:
    | ((response: any) => any)
    | ((response: any) => any)[]
  error?:
    | ((error: XHRErrorInfo) => XHRErrorInfo)
    | ((error: XHRErrorInfo) => XHRErrorInfo)[]
}
