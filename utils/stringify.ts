import { isObject, isArray, isFunc, isUndefined } from './others'

/**
 * 对象字符串化，基于 qs.stringify 的简化版，作为一种可被替代的默认实现
 */
export function stringify(
  obj: Record<string, any>,
  mode: 'brackets' | 'none' | 'indices' = 'brackets'
) {
  const pairs: string[] = []
  ;(function loop(obj, grpKey = '') {
    Object.keys(obj)
      .filter(key => isSupport(obj[key]))
      .forEach(key => {
        let val = obj[key]
        key = formatKey(key, grpKey, isArray(obj), mode)
        if (val instanceof Date) {
          val = val.toISOString()
        }
        if (isObject(val)) {
          loop(val, key)
        } else {
          pairs.push(`${encode(key)}=${encode(val)}`)
        }
      })
  })(obj)
  return pairs.join('&')
}

/**
 * 是否为支持字符串化的有效类型
 */
function isSupport(v: any) {
  return !(
    isFunc(v) ||
    isUndefined(v) ||
    v === null ||
    typeof v === 'symbol' ||
    (typeof v === 'number' && !isFinite(v))
  )
}

/**
 * 格式化主键/索引
 */
function formatKey(
  key: string,
  grpKey: string,
  fromArray: boolean,
  mode: 'brackets' | 'none' | 'indices'
) {
  if (!grpKey) return key
  if (!fromArray) return `${grpKey}[${key}]`
  return `${grpKey}${
    mode === 'none' ? '' : mode === 'brackets' ? '[]' : `[${key}]`
  }`
}

/**
 * 编码字符串
 */
function encode(str: string) {
  return encodeURIComponent(str)
    .replace(/%20/g, '+') // RFC1738: %20(' ') => '+'
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
  // .replace(/%2C/gi, ',')
  // .replace(/%3A/gi, ':')
  // .replace(/%40/g, '@')
  // .replace(/%24/g, '$')
  // .replace(/%(40|3A|24|2C|5B|5D)/gi, (m, hex) => String.fromCharCode(parseInt(hex, 16))) // '@:$,[]'
}
