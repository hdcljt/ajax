/**
 * 设置请求参数
 */
export function setRequest(
  xhr: XMLHttpRequest,
  headers: XHRRequestHeaders,
  type: XMLHttpRequestResponseType,
  timeout: number,
  withCredentials: boolean
) {
  // 设置请求头
  Object.keys(headers)
    .filter(name => !!headers[name])
    .forEach(name => xhr.setRequestHeader(name, headers[name]))
  // 使用一个用户自定义的字符集，让浏览器不要主动解析数据，直接返回未处理过的字节码
  // xhr.overrideMimeType('text/plain; charset=x-user-defined')
  // 其他参数
  xhr.responseType = type
  xhr.timeout = timeout * 1e3
  xhr.withCredentials = withCredentials
}
