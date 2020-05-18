import { parseResponseHeaders } from '../utils/index'
import XHRError from './error'

/**
 * 请求成功
 */
function handleLoad(
  xhr: XMLHttpRequest,
  validateStatus: ValidateStatusCallBack
): XHRResponse | XHRErrorInfo {
  let responseData
  if (
    (xhr.responseType === '' || xhr.responseType === 'text') &&
    xhr.responseText
  ) {
    responseData = xhr.responseText
  } else if (xhr.responseType === 'document' && xhr.responseXML) {
    responseData = xhr.responseXML
  } else {
    responseData = xhr.response
  }

  const response: XHRResponse = {
    data: responseData,
    headers: parseResponseHeaders(xhr.getAllResponseHeaders()),
    status: xhr.status,
    statusText: xhr.statusText,
    request: xhr
  }

  return validateStatus(xhr.status)
    ? response
    : new XHRError('响应异常', XHRState.INVALID_STATUS, xhr, response)
}

/**
 * 请求被中止
 */
function handleAbort(xhr: XMLHttpRequest): XHRErrorInfo {
  return new XHRError('请求被中止', XHRState.REQUEST_ABORTED, xhr)
}

/**
 * 请求错误（网络）
 */
function handleError(xhr: XMLHttpRequest): XHRErrorInfo {
  return new XHRError(
    '请求异常，online:' + navigator.onLine,
    XHRState.NETWORK_ERROR,
    xhr
  )
}

/**
 * 请求超时
 */
function handleTimeout(xhr: XMLHttpRequest): XHRErrorInfo {
  return new XHRError(
    '超时，timeout:' + xhr.timeout,
    XHRState.REQUEST_TIMEOUT,
    xhr
  )
}

export { handleLoad, handleAbort, handleError, handleTimeout }
