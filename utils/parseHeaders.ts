import { mergeHeaders } from './merge'

/**
 * 处理请求头
 */
function parseRequestHeaders(headers: XHRConfigHeaders, method: XHRMethod) {
  // 1. common 属性
  let target = mergeHeaders({}, headers.common)
  // 2. [method] 专职属性
  target = mergeHeaders(target, headers[method])
  // 3. 根属性
  target = mergeHeaders(target, headers)
  // 4. 规范化名称
  return normalizeHeaderName(target, 'Content-Type')
}

/**
 * 规范化请求头的名称（单词首字母大写）
 */
function normalizeHeaderName(headers: XHRRequestHeaders, name: string) {
  return Object.entries(headers).reduce((target, curr) => {
    let key = curr[0]
    if (name && name.toUpperCase() === key.toUpperCase()) {
      key = name
    } else {
      key = key.replace(/\b(\w)/g, m => m.toUpperCase())
    }
    target[key] = curr[1]
    return target
  }, {} as XHRRequestHeaders)
}

/**
 * 设置 'Content-Type'
 */
function setContentType(
  headers: XHRRequestHeaders,
  value = 'application/x-www-form-urlencoded;charset=utf-8',
  mode: 'override' | 'reserve' = 'reserve'
) {
  if (headers['Content-Type']) {
    if (mode === 'override') {
      if (value) {
        headers['Content-Type'] = value
      } else {
        delete headers['Content-Type']
      }
    }
  } else {
    value && (headers['Content-Type'] = value)
  }
  return headers
}

/**
 * 处理响应头
 */
function parseResponseHeaders(headers: string) {
  if (!headers) return {}
  const parsed: XHRResponseHeaders = {}
  headers.split('\n').forEach(line => {
    const matched = line.match(/([^\s]*)\s*:\s*([^\s].*[^\s]|[^\s])(?=\s*$)/)
    if (!matched) return
    let [, key, val] = matched
    parsed[key] = parsed[key] ? ([] as string[]).concat(parsed[key], val) : val
  })
  return parsed
}

export { parseRequestHeaders, setContentType, parseResponseHeaders }
