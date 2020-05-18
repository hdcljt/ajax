import defaults from './defaults'
import interceptor from './interceptors'
import request from './request'
import {
  transformData,
  mergeOptions,
  parseRequestHeaders,
  setContentType,
  buildFullPath,
  isArray,
  isStr
} from '../utils/index'

export default function ajax(config: AjaxOptions | string) {
  config = isStr(config) ? ({ url: config } as AjaxOptions) : config

  // 1. 请求拦截器（修改配置）
  config = transformData(config, interceptor.request)

  // 2. 合并配置项
  const options = mergeOptions(config, defaults) as AjaxRequiredOptions

  // 3. 处理请求头（剔除冗余配置，规范化名称）
  options.headers = parseRequestHeaders(options.headers, options.method)

  // 4. 处理请求参数和请求头
  if (['get', 'head', 'options', 'delete'].includes(options.method)) {
    // delete 可能有请求主体
    if (options.method !== 'delete') {
      options.body = null
      setContentType(options.headers as XHRRequestHeaders, '', 'override')
    }
    // 4.1 编辑查询参数
    const info = options.transformQuery(
      options.query,
      options.headers as XHRRequestHeaders
    )
    if (isStr(info)) {
      options.query = info
    } else {
      options.query = info[0]
      info[1] && (options.headers = info[1])
    }
  }

  if (['post', 'put', 'patch', 'delete'].includes(options.method)) {
    if (options.method !== 'delete') {
      options.query = ''
    }
    // 4.2 编辑请求主体
    const info = options.transformBody(
      options.body,
      options.headers as XHRRequestHeaders
    )
    if (!isArray(info)) {
      options.body = info
    } else {
      options.body = info[0]
      info[1] && (options.headers = info[1])
    }
  }

  // 5. 构建完整的请求路径
  options.url = buildFullPath(
    options.url,
    options.baseURL,
    options.params,
    options.query + ''
  )

  // 6. 发起请求
  return request(options as XHROptions).then(
    response => {
      // 6.1 处理响应体
      response.data = options.transformResponse(response.data)
      response.config = options
      // 7. 成功拦截器
      response = transformData(response, interceptor.response)
      return response
    },
    (error: XHRErrorInfo) => {
      error.config = options
      // 8. 失败拦截器
      error = transformData(error, interceptor.error)
      return Promise.reject(error)
    }
  )
}
