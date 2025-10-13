export interface CommonResponse<T = any> {
    code: number
    node: string
    message: string | null
    data: T | null
}