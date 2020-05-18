/**
 * 自定义请求错误类
 */
class XHRError extends Error {
    constructor(message, reason, request, response) {
        super(message);
        this.name = 'XHRError';
        this.reason = reason;
        this.request = request;
        this.response = response;
    }
    get isCancel() {
        return this.reason === 1 /* REQUEST_ABORTED */;
    }
}

/**
 * 根据状态处理 Promise 回调
 */
function settle(result, reject, resolve) {
    if (isFunc(resolve)) {
        isError(result) ? reject(result) : resolve(result);
    }
    else {
        reject(result);
    }
}
/**
 * 转换数据的处理器
 */
function transformData(obj, fns) {
    if (!fns)
        return obj;
    if (!isArray(fns)) {
        fns = [fns];
    }
    return fns.filter(isFunc).reduce((target, fn) => (target = fn(obj)), obj);
}
const isUndefined = (v) => v === void 0;
const isFunc = (v) => typeof v === 'function';
const isStr = (v) => typeof v === 'string';
const isArray = Array.isArray;
const isObject = (v) => v !== null && typeof v === 'object';
const isError = (v) => v instanceof XHRError;

/**
 * 合并配置项
 */
function mergeOptions(options, defaults) {
    return Object.keys(defaults).reduce((prev, curr) => {
        const item = defaults[curr];
        if (isObject(item) && isObject(prev[curr])) {
            prev[curr] = mergeOptions(prev[curr], item);
        }
        else if (isUndefined(prev[curr])) {
            prev[curr] = item;
        }
        return prev;
    }, options);
}
/**
 * 合并请求头
 */
function mergeHeaders(target, source = {}) {
    return Object.keys(source)
        .filter(k => source[k] && isStr(source[k]))
        .reduce((t, k) => {
        t[k] = source[k];
        return t;
    }, target);
}

/**
 * 构建完整的请求地址
 */
function buildFullPath(url, baseURL, params, query) {
    if (isAbsoluteURL(url)) {
        baseURL = '';
    }
    return combineURL(baseURL, url, params, query);
}
/**
 * url 是否为绝对路径
 */
function isAbsoluteURL(url) {
    return /^(?:[a-z][a-z\d+.\-]*:)?\/\//i.test(url);
}
/**
 * 拼接地址
 */
function combineURL(baseURL, url, params, query) {
    if (baseURL) {
        url = baseURL.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '');
    }
    if (params && !url.includes('?')) {
        url = url.replace(/\/+$/, '') + '/' + params.replace(/^\/+/, '');
    }
    if (query) {
        url = url.replace(/\/+$/, '') + (url.includes('?') ? '&' : '?') + query;
    }
    url = url.replace(/#.*$/, '');
    return url;
}

/**
 * 处理请求头
 */
function parseRequestHeaders(headers, method) {
    // 1. common 属性
    let target = mergeHeaders({}, headers.common);
    // 2. [method] 专职属性
    target = mergeHeaders(target, headers[method]);
    // 3. 根属性
    target = mergeHeaders(target, headers);
    // 4. 规范化名称
    return normalizeHeaderName(target, 'Content-Type');
}
/**
 * 规范化请求头的名称（单词首字母大写）
 */
function normalizeHeaderName(headers, name) {
    return Object.entries(headers).reduce((target, curr) => {
        let key = curr[0];
        if (name && name.toUpperCase() === key.toUpperCase()) {
            key = name;
        }
        else {
            key = key.replace(/\b(\w)/g, m => m.toUpperCase());
        }
        target[key] = curr[1];
        return target;
    }, {});
}
/**
 * 设置 'Content-Type'
 */
function setContentType(headers, value = 'application/x-www-form-urlencoded;charset=utf-8', mode = 'reserve') {
    if (headers['Content-Type']) {
        if (mode === 'override') {
            if (value) {
                headers['Content-Type'] = value;
            }
            else {
                delete headers['Content-Type'];
            }
        }
    }
    else {
        value && (headers['Content-Type'] = value);
    }
    return headers;
}
/**
 * 处理响应头
 */
function parseResponseHeaders(headers) {
    if (!headers)
        return {};
    const parsed = {};
    headers.split('\n').forEach(line => {
        const matched = line.match(/([^\s]*)\s*:\s*([^\s].*[^\s]|[^\s])(?=\s*$)/);
        if (!matched)
            return;
        let [, key, val] = matched;
        parsed[key] = parsed[key] ? [].concat(parsed[key], val) : val;
    });
    return parsed;
}

/**
 * 设置请求参数
 */
function setRequest(xhr, headers, type, timeout, withCredentials) {
    // 设置请求头
    Object.keys(headers)
        .filter(name => !!headers[name])
        .forEach(name => xhr.setRequestHeader(name, headers[name]));
    // 使用一个用户自定义的字符集，让浏览器不要主动解析数据，直接返回未处理过的字节码
    // xhr.overrideMimeType('text/plain; charset=x-user-defined')
    // 其他参数
    xhr.responseType = type;
    xhr.timeout = timeout * 1e3;
    xhr.withCredentials = withCredentials;
}

/**
 * 对象字符串化，基于 qs.stringify 的简化版，作为一种可被替代的默认实现
 */
function stringify(obj, mode = 'brackets') {
    const pairs = [];
    (function loop(obj, grpKey = '') {
        Object.keys(obj)
            .filter(key => isSupport(obj[key]))
            .forEach(key => {
            let val = obj[key];
            key = formatKey(key, grpKey, isArray(obj), mode);
            if (val instanceof Date) {
                val = val.toISOString();
            }
            if (isObject(val)) {
                loop(val, key);
            }
            else {
                pairs.push(`${encode(key)}=${encode(val)}`);
            }
        });
    })(obj);
    return pairs.join('&');
}
/**
 * 是否为支持字符串化的有效类型
 */
function isSupport(v) {
    return !(isFunc(v) ||
        isUndefined(v) ||
        v === null ||
        typeof v === 'symbol' ||
        (typeof v === 'number' && !isFinite(v)));
}
/**
 * 格式化主键/索引
 */
function formatKey(key, grpKey, fromArray, mode) {
    if (!grpKey)
        return key;
    if (!fromArray)
        return `${grpKey}[${key}]`;
    return `${grpKey}${mode === 'none' ? '' : mode === 'brackets' ? '[]' : `[${key}]`}`;
}
/**
 * 编码字符串
 */
function encode(str) {
    return encodeURIComponent(str)
        .replace(/%20/g, '+') // RFC1738: %20(' ') => '+'
        .replace(/%5B/gi, '[')
        .replace(/%5D/gi, ']');
    // .replace(/%2C/gi, ',')
    // .replace(/%3A/gi, ':')
    // .replace(/%40/g, '@')
    // .replace(/%24/g, '$')
    // .replace(/%(40|3A|24|2C|5B|5D)/gi, (m, hex) => String.fromCharCode(parseInt(hex, 16))) // '@:$,[]'
}

/**
 * 格式化查询参数，输出字符串
 */
const transformQuery = query => {
    if (!query)
        return '';
    if (isStr(query))
        return query;
    return stringify(query);
};
/**
 * 格式化请求主体
 */
const transformBody = (body, headers) => {
    if (!body ||
        body instanceof FormData ||
        body instanceof Blob ||
        body instanceof URLSearchParams ||
        body instanceof ArrayBuffer ||
        ArrayBuffer.isView(body)) {
        setContentType(headers, '', 'override');
        return body || null;
    }
    if (isObject(body)) {
        if (headers['Content-Type'] &&
            headers['Content-Type'].includes('application/x-www-form-urlencoded')) {
            return stringify(body);
        }
        else {
            setContentType(headers, 'application/json;charset=utf-8');
            return JSON.stringify(body);
        }
    }
    // setContentType(headers)
    return body;
};
/**
 * 格式化响应数据
 */
const transformResponse = data => {
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        }
        catch { }
    }
    return data;
};
/**
 * 定义成功响应状态码的取值范围
 */
const validateStatus = status => status >= 200 && status < 300;

/**
 * 默认配置
 */
const defaults = {
    url: '',
    method: 'get',
    params: '',
    query: '',
    body: null,
    baseURL: '',
    headers: {
        common: {
            Accept: 'application/json, text/plain, */*'
        }
    },
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
};

/**
 * 拦截器（请求，响应，错误）
 */
const interceptor = {
    request: undefined,
    response: undefined,
    error: undefined
};

/**
 * 请求成功
 */
function handleLoad(xhr, validateStatus) {
    let responseData;
    if ((xhr.responseType === '' || xhr.responseType === 'text') &&
        xhr.responseText) {
        responseData = xhr.responseText;
    }
    else if (xhr.responseType === 'document' && xhr.responseXML) {
        responseData = xhr.responseXML;
    }
    else {
        responseData = xhr.response;
    }
    const response = {
        data: responseData,
        headers: parseResponseHeaders(xhr.getAllResponseHeaders()),
        status: xhr.status,
        statusText: xhr.statusText,
        request: xhr
    };
    return validateStatus(xhr.status)
        ? response
        : new XHRError('响应异常', 0 /* INVALID_STATUS */, xhr, response);
}
/**
 * 请求被中止
 */
function handleAbort(xhr) {
    return new XHRError('请求被中止', 1 /* REQUEST_ABORTED */, xhr);
}
/**
 * 请求错误（网络）
 */
function handleError(xhr) {
    return new XHRError('请求异常，online:' + navigator.onLine, 2 /* NETWORK_ERROR */, xhr);
}
/**
 * 请求超时
 */
function handleTimeout(xhr) {
    return new XHRError('超时，timeout:' + xhr.timeout, 3 /* REQUEST_TIMEOUT */, xhr);
}

const xhrFactory = new Map();
/**
 * 获取请求实例
 * 管理请求实例的目的是：
 * 1. 利用 open() 初始化一个新创建的请求，或重新初始化一个现有的请求
 *  即：当已激活的请求调用 open() 方法相当于调用 abort()
 * 2. 批量中止多个请求
 */
function getXHR(key) {
    if (!xhrFactory.has(key)) {
        xhrFactory.set(key, new XMLHttpRequest());
    }
    return xhrFactory.get(key);
}
/**
 * 取消激活状态的请求
 * 如果传入 signal 则取消与其匹配的请求，如果没有传参则取消所有请求
 */
function cancelXHR(signal) {
    xhrFactory.forEach((xhr, key) => {
        if (signal) {
            const token = key.split('[')[0];
            if (token !== signal)
                return;
        }
        xhr.abort();
    });
}
/**
 * 请求结束，释放资源
 */
function delXHR(key) {
    xhrFactory.delete(key);
}

/**
 * 过滤请求头
 */
const filterHeaders = (headers) => Object.keys(headers).reduce((t, k) => {
    const item = headers[k];
    if (isStr(item)) {
        t[k] = item;
    }
    return t;
}, {});
/**
 * 过滤请求体
 */
const filterBody = (body) => !body ||
    isStr(body) ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
    ? body || null
    : null;
/**
 * 发起请求的方法
 */
function request({ url, method = defaults.method, body = filterBody(defaults.body), headers = filterHeaders(defaults.headers), timeout = defaults.timeout, responseType = defaults.responseType, withCredentials = defaults.withCredentials, validateStatus = defaults.validateStatus, onUploadProgress = defaults.onUploadProgress, onDownloadProgress = defaults.onDownloadProgress, signal = defaults.signal }) {
    return new Promise((resolve, reject) => {
        const mode = method.toUpperCase();
        const key = `${signal}[${mode}](${url})`;
        const xhr = getXHR(key);
        xhr.open(mode, url);
        xhr.onload = () => settle(handleLoad(xhr, validateStatus), reject, resolve);
        xhr.onabort = () => settle(handleAbort(xhr), reject);
        xhr.onerror = () => settle(handleError(xhr), reject);
        xhr.ontimeout = () => settle(handleTimeout(xhr), reject);
        xhr.onloadend = () => delXHR(key);
        if (isFunc(onDownloadProgress)) {
            xhr.onprogress = onDownloadProgress;
        }
        if (isFunc(onUploadProgress)) {
            xhr.upload.onprogress = onUploadProgress;
        }
        setRequest(xhr, headers, responseType, timeout, withCredentials);
        xhr.send(body || null);
    });
}

function ajax(config) {
    config = isStr(config) ? { url: config } : config;
    // 1. 请求拦截器（修改配置）
    config = transformData(config, interceptor.request);
    // 2. 合并配置项
    const options = mergeOptions(config, defaults);
    // 3. 处理请求头（剔除冗余配置，规范化名称）
    options.headers = parseRequestHeaders(options.headers, options.method);
    // 4. 处理请求参数和请求头
    if (['get', 'head', 'options', 'delete'].includes(options.method)) {
        // delete 可能有请求主体
        if (options.method !== 'delete') {
            options.body = null;
            setContentType(options.headers, '', 'override');
        }
        // 4.1 编辑查询参数
        const info = options.transformQuery(options.query, options.headers);
        if (isStr(info)) {
            options.query = info;
        }
        else {
            options.query = info[0];
            info[1] && (options.headers = info[1]);
        }
    }
    if (['post', 'put', 'patch', 'delete'].includes(options.method)) {
        if (options.method !== 'delete') {
            options.query = '';
        }
        // 4.2 编辑请求主体
        const info = options.transformBody(options.body, options.headers);
        if (!isArray(info)) {
            options.body = info;
        }
        else {
            options.body = info[0];
            info[1] && (options.headers = info[1]);
        }
    }
    // 5. 构建完整的请求路径
    options.url = buildFullPath(options.url, options.baseURL, options.params, options.query + '');
    // 6. 发起请求
    return request(options).then(response => {
        // 6.1 处理响应体
        response.data = options.transformResponse(response.data);
        response.config = options;
        // 7. 成功拦截器
        response = transformData(response, interceptor.response);
        return response;
    }, (error) => {
        error.config = options;
        // 8. 失败拦截器
        error = transformData(error, interceptor.error);
        return Promise.reject(error);
    });
}

export default ajax;
export { cancelXHR as cancel, defaults, interceptor, request, stringify };
