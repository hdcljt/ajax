import ajax from './ajax'
import defaults from './defaults'
import interceptor from './interceptors'
import request from './request'
import { cancel } from './instances'
import { stringify } from '../utils'

export { defaults, interceptor, request, cancel, stringify }
export default ajax
