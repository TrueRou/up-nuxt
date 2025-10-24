import { H3Event } from 'h3'
import { commonError } from './response'

export async function useUser(event: H3Event): Promise<UserResponse> {
    const cookieName = useRuntimeConfig().leporidCookieName
    const leporidCookie = getCookie(event, cookieName)

    console.log('Requested Leporid Cookie:', leporidCookie)

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
        throw commonError(401, '会话不存在或已被撤销')
    }
}