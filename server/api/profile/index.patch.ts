import type { UserProfile } from '~~/shared/types/profile'
import { commonSuccess, requireUserSession, throwError as throwError } from '../../utils/common'

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event)
    const userId = (session.user as NonNullable<typeof session.user>).id
    const db = useDrizzle()
    const body = await readBody<UserProfile>(event)

    // 更新用户偏好设置
    if (body.preference) {
        const existingPreference = await db.query.userPreference.findFirst({
            where: eq(tables.userPreference.user_id, userId)
        })
        if (!existingPreference) {
            throwError(404, 'not-found', 'Preference not found.')
        }
        await db.update(tables.userPreference)
            .set({ ...body.preference })
            .where(eq(tables.userPreference.user_id, userId))
    }

    // 更新账号
    if (body.accounts) {
        const existingAccounts = await db.query.userAccount.findMany({
            where: eq(tables.userAccount.user_id, userId)
        })
        for (const existingAccount of existingAccounts) {
            const updatedAccount = body.accounts.find(acc => acc.id === existingAccount.id)
            if (updatedAccount) {
                await db.update(tables.userAccount)
                    .set({ ...updatedAccount })
                    .where(eq(tables.userAccount.id, existingAccount.id))
            }
        }
    }

    // 查询更新后的用户偏好设置
    const preference = await db.query.userPreference.findFirst({
        where: eq(tables.userPreference.user_id, userId)
    })

    // 查询用户账号列表
    const accounts = await db.query.userAccount.findMany({
        where: eq(tables.userAccount.user_id, userId)
    })

    const profile: UserProfile = {
        preference: preference!,
        accounts: accounts
    }

    return commonSuccess<UserProfile>(profile)
})
