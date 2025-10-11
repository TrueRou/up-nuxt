/**
 * 通用响应体
 */
export interface CommonResponse<T = any> {
    /** 响应码 */
    code: number
    /** 响应消息 */
    message: string
    /** 响应数据 */
    data: T | null
}