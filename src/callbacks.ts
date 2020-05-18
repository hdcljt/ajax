import { isStr, isObject, stringify, setContentType } from '../utils/index'

/**
 * 格式化查询参数，输出字符串
 */
const transformQuery: TransformQueryCallBack = query => {
  if (!query) return ''
  if (isStr(query)) return query
  return stringify(query)
}

/**
 * 格式化请求主体
 */
const transformBody: TransformBodyCallBack = (body, headers) => {
  if (
    !body ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  ) {
    setContentType(headers, '', 'override')
    return body || null
  }
  if (isObject(body)) {
    if (
      headers['Content-Type'] &&
      headers['Content-Type'].includes('application/x-www-form-urlencoded')
    ) {
      return stringify(body)
    } else {
      setContentType(headers, 'application/json;charset=utf-8')
      return JSON.stringify(body)
    }
  }
  // setContentType(headers)
  return body
}

/**
 * 格式化响应数据
 */
const transformResponse: TransformResponseCallBack = data => {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch {}
  }
  return data
}

/**
 * 定义成功响应状态码的取值范围
 */
const validateStatus: ValidateStatusCallBack = status =>
  status >= 200 && status < 300

export { transformQuery, transformBody, transformResponse, validateStatus }
