import { CommonResponse } from '~~/shared/types/common';
import type { UserResponse, UserTokenCreateResponse } from '~~/shared/types/leporid/user'

export default defineEventHandler(async (event) => {
    const { username, password } = await readBody(event);
    const leporidApi: string = useRuntimeConfig().leporidApi;

    try {
        const tokenResponse = await $fetch<UserTokenCreateResponse>(`${leporidApi}/auth/token`, {
            method: 'POST',
            query: {
                "grant_type": "password",
                "username": username,
                "password": password,
            }
        });

        const userResponse = await $fetch<{ data: UserResponse }>(`${leporidApi}/users/me`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${tokenResponse.access_token}`
            }
        });

        await setUserSession(event, {
            user: {
                id: userResponse.data.id,
                username: userResponse.data.username,
                phone: userResponse.data.phone,
                privileges: userResponse.data.privileges,
            },
            secure: {
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token,
                expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
            }
        })

        return {
            code: 200,
            node: 'success',
            message: null,
            data: null
        } as CommonResponse<void>;
    } catch (error) {
        throw createError(error as Error);
    }
})