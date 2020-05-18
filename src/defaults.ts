import {
  transformQuery,
  transformBody,
  transformResponse,
  validateStatus
} from './callbacks'

/**
 * 默认配置
 */
const defaults: AjaxRequiredOptions = {
  url: '',
  method: 'get',
  params: '', // user/:params (RESTful接口形式)
  query: '', // user?query (查询参数形式)
  body: null, // post > body (POST消息体)
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

export default defaults
