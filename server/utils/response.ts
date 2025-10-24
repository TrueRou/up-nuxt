export function commonError(code: number = 500, message: string = "服务器错误") {
    return createError({
        statusCode: code,
        statusMessage: message,
        data: {
            code,
            message,
            undefined
        }
    })
}

export function commonSuccess<T>(data: any = null) {
    return {
        code: 200,
        message: "请求成功",
        data
    }
}