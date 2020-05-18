import { isObject, isUndefined, isStr } from './others'

/**
 * 合并配置项
 */
function mergeOptions(
  options: Record<string, any>,
  defaults: Record<string, any>
): Record<string, any> {
  return Object.keys(defaults).reduce((prev, curr) => {
    const item = defaults[curr]
    if (isObject(item) && isObject(prev[curr])) {
      prev[curr] = mergeOptions(prev[curr], item)
    } else if (isUndefined(prev[curr])) {
      prev[curr] = item
    }
    return prev
  }, options)
}

/**
 * 合并请求头
 */
function mergeHeaders(
  target: XHRRequestHeaders,
  source: XHRConfigHeaders = {}
) {
  return Object.keys(source)
    .filter(k => source[k] && isStr(source[k]))
    .reduce((t, k) => {
      t[k] = source[k] as string
      return t
    }, target)
}

export { mergeOptions, mergeHeaders }
