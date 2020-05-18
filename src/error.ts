/**
 * 自定义请求错误类
 */
export default class XHRError extends Error implements XHRErrorInfo {
  readonly reason: XHRState
  readonly request: XMLHttpRequest
  readonly response: XHRResponse | undefined
  config: AjaxRequiredOptions | undefined

  constructor(
    message: string,
    reason: XHRState,
    request: XMLHttpRequest,
    response?: XHRResponse
  ) {
    super(message)
    this.name = 'XHRError'
    this.reason = reason
    this.request = request
    this.response = response
  }

  get isCancel() {
    return this.reason === XHRState.REQUEST_ABORTED
  }
}
