/**
 * 构建完整的请求地址
 */
export function buildFullPath(
  url: string,
  baseURL: string,
  params: string,
  query: string
) {
  if (isAbsoluteURL(url)) {
    baseURL = ''
  }
  return combineURL(baseURL, url, params, query)
}

/**
 * url 是否为绝对路径
 */
function isAbsoluteURL(url: string) {
  return /^(?:[a-z][a-z\d+.\-]*:)?\/\//i.test(url)
}

/**
 * 拼接地址
 */
function combineURL(
  baseURL: string,
  url: string,
  params: string,
  query: string
) {
  if (baseURL) {
    url = baseURL.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '')
  }
  if (params && !url.includes('?')) {
    url = url.replace(/\/+$/, '') + '/' + params.replace(/^\/+/, '')
  }
  if (query) {
    url = url.replace(/\/+$/, '') + (url.includes('?') ? '&' : '?') + query
  }
  url = url.replace(/#.*$/, '')
  return url
}
