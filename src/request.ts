import defaults from './defaults'
import { handleLoad, handleAbort, handleError, handleTimeout } from './events'
import { getXHR, complete } from './instances'
import { settle, isFunc, isStr, setRequest } from '../utils/index'

/**
 * 过滤请求头
 */
const filterHeaders = (headers: XHRConfigHeaders) =>
  Object.keys(headers).reduce((t, k) => {
    const item = headers[k]
    if (isStr(item)) {
      t[k] = item
    }
    return t
  }, {} as XHRRequestHeaders)

/**
 * 过滤请求体
 */
const filterBody = (body: XHRBody) =>
  !body ||
  isStr(body) ||
  body instanceof FormData ||
  body instanceof Blob ||
  body instanceof URLSearchParams ||
  body instanceof ArrayBuffer ||
  ArrayBuffer.isView(body)
    ? body || null
    : null

/**
 * 发起请求的方法
 */
export default function request({
  url,
  method = defaults.method,
  body = filterBody(defaults.body),
  headers = filterHeaders(defaults.headers),
  timeout = defaults.timeout,
  responseType = defaults.responseType,
  withCredentials = defaults.withCredentials,
  validateStatus = defaults.validateStatus,
  onUploadProgress = defaults.onUploadProgress,
  onDownloadProgress = defaults.onDownloadProgress,
  signal = defaults.signal
}: XHROptions) {
  return new Promise<XHRResponse>((resolve, reject) => {
    const mode = method.toUpperCase()
    const key = `${signal}[${mode}](${url})`
    const xhr = getXHR(key)

    xhr.open(mode, url)

    xhr.onload = () => settle(handleLoad(xhr, validateStatus), reject, resolve)
    xhr.onabort = () => settle(handleAbort(xhr), reject)
    xhr.onerror = () => settle(handleError(xhr), reject)
    xhr.ontimeout = () => settle(handleTimeout(xhr), reject)
    xhr.onloadend = () => complete(key)

    if (isFunc(onDownloadProgress)) {
      xhr.onprogress = onDownloadProgress
    }
    if (isFunc(onUploadProgress)) {
      xhr.upload.onprogress = onUploadProgress
    }

    setRequest(xhr, headers, responseType, timeout, withCredentials)

    xhr.send(body || null)
  })
}
