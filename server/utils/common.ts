/**
 * 统一获取并校验用户Session
 */
export async function requireUserSession(event: any) {
    const session = await getUserSession(event)
    if (!session?.user) {
        throwError(401, 'unauthorized')
    }
    return session
}

/**
 * 标准化错误抛出
 */
export function throwError(code: number = 500, node: string = 'unknown-error', message: string | undefined = undefined) {
    throw createError({
        statusCode: code,
        statusMessage: message || node,
        data: {
            code,
            node,
            message,
            undefined
        }
    })
}

/**
 * 标准化成功返回
 */
export function commonSuccess<T>(data: any = null) {
    return {
        code: 200,
        node: 'success',
        message: null,
        data
    } as CommonResponse<T>
}
