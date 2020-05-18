import XHRError from '../src/error'

/**
 * 根据状态处理 Promise 回调
 */
function settle(
  result: XHRErrorInfo | XHRResponse,
  reject: (reason: XHRErrorInfo) => void,
  resolve?: (value: XHRResponse) => void
) {
  if (isFunc(resolve)) {
    isError(result) ? reject(result) : resolve(result)
  } else {
    reject(result as XHRErrorInfo)
  }
}

/**
 * 转换数据的处理器
 */
function transformData<T = object>(obj: T, fns?: Function | Function[]): T {
  if (!fns) return obj
  if (!isArray(fns)) {
    fns = [fns]
  }
  return fns.filter(isFunc).reduce((target, fn) => (target = fn(obj)), obj)
}

const isUndefined = (v: unknown): v is undefined => v === void 0

const isFunc = (v: unknown): v is Function => typeof v === 'function'

const isStr = (v: unknown): v is string => typeof v === 'string'

const isArray = Array.isArray

const isObject = (v: unknown): v is object =>
  v !== null && typeof v === 'object'

const isError = (v: unknown): v is XHRErrorInfo => v instanceof XHRError

export { settle, transformData, isUndefined, isFunc, isStr, isArray, isObject }
