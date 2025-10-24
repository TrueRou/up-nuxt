import { UserResponse } from "~~/shared/types/leporid/user";

/**
 * 标准化错误抛出
 */
export function throwError(code: number = 500, message: string = "服务器错误") {
    throw createError({
        statusCode: code,
        statusMessage: message,
        data: {
            code,
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
        message: "请求成功",
        data
    }
}

export async function updateFromRemoteSession(event: any) {
    const leporidCookie = getCookie(event, useRuntimeConfig().leporidCookieName)
    const leporidApi = useRuntimeConfig().leporidApi;

    console.log("Updating user session from remote...")

    try {
        const userResponse = await $fetch<{ data: UserResponse }>(`${leporidApi}/users/me`, {
            headers: {
                "Cookie": `${useRuntimeConfig().leporidCookieName}=${leporidCookie}`
            }
        })

        await setUserSession(event, {
            user: {
                id: userResponse.data.id,
                username: userResponse.data.username,
                phone: userResponse.data.phone,
                privileges: userResponse.data.privileges,
            }
        })
    } catch (error) {

        await clearUserSession(event) // 无效会话，清除 Nuxt 会话
    }
}