const xhrFactory = new Map<string, XMLHttpRequest>()

/**
 * 获取请求实例
 * 管理请求实例的目的是：
 * 1. 利用 open() 初始化一个新创建的请求，或重新初始化一个现有的请求
 *  即：当已激活的请求调用 open() 方法相当于调用 abort()
 * 2. 批量中止多个请求
 */
function getXHR(key: string) {
  if (!xhrFactory.has(key)) {
    xhrFactory.set(key, new XMLHttpRequest())
  }
  return xhrFactory.get(key) as XMLHttpRequest
}

/**
 * 取消激活状态的请求
 * 如果传入 signal 则取消与其匹配的请求，如果没有传参则取消所有请求
 */
function cancelXHR(signal?: string) {
  xhrFactory.forEach((xhr, key) => {
    if (signal) {
      const token = key.split('[')[0]
      if (token !== signal) return
    }
    xhr.abort()
  })
}

/**
 * 请求结束，释放资源
 */
function delXHR(key: string) {
  xhrFactory.delete(key)
}

export { getXHR, cancelXHR as cancel, delXHR as complete }
