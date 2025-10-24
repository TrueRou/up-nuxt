import { H3Event } from 'h3'

export async function useUser(event: H3Event): Promise<UserResponse> {
    const cookieName = useRuntimeConfig().leporidCookieName
    const leporidCookie = getCookie(event, cookieName)

    try {
        const response = await $fetch<{ data: UserResponse }>('/api/users/me', {
            headers: {
                Cookie: `${cookieName}=${leporidCookie}`
            }
        })
        return response.data
    } catch (error) {
        deleteCookie(event, cookieName)
        deleteCookie(event, 'logged_in')
        throw createError({ statusCode: 401, statusMessage: '会话不存在或已被撤销' })
    }
}