import { commonSuccess } from '~~/server/utils/common'
import type { UserAccount } from '~~/shared/types/profile'

export default defineEventHandler(async (event) => {
    // 获取当前登录用户
    const session = await getUserSession(event)
    if (!session.user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const userId = session.user.id
    const db = useDrizzle()

    // 查询用户账号列表
    const accounts = await db.query.userAccount.findMany({
        where: eq(tables.userAccount.user_id, userId)
    })

    return commonSuccess<UserAccount>(accounts)
})
