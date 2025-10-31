export default defineEventHandler(async (event) => {
    const userId = (await useUser(event)).id
    const db = useDrizzle()
    const body = await readBody<UserProfile>(event)

    // 更新用户偏好设置
    if (body.preference) {
        const existingPreference = await db.query.userPreference.findFirst({
            where: eq(tables.userPreference.user_id, userId),
        })
        if (existingPreference) {
            await db.update(tables.userPreference)
                .set({ ...body.preference })
                .where(eq(tables.userPreference.user_id, userId))
        }
        else {
            await db.insert(tables.userPreference).values({
                ...body.preference,
                user_id: userId,
            })
        }
    }

    if (body.accounts) {
        const existingAccounts = await db.query.userAccount.findMany({
            where: eq(tables.userAccount.user_id, userId),
        })
        const existingMap = new Map(existingAccounts.map(account => [account.id, account]))
        const incomingIds = new Set<number>()

        for (const account of body.accounts) {
            if (account.id != null) {
                incomingIds.add(account.id)
            }

            const existingAccount = account.id != null ? existingMap.get(account.id) : undefined
            if (existingAccount) {
                await db.update(tables.userAccount)
                    .set({ ...account })
                    .where(eq(tables.userAccount.id, existingAccount.id))
            }
            else {
                await db.insert(tables.userAccount).values({
                    ...account,
                    user_id: userId,
                })
            }
        }

        for (const account of existingAccounts) {
            if (account.id != null && !incomingIds.has(account.id)) {
                await db.delete(tables.userAccount)
                    .where(eq(tables.userAccount.id, account.id))
            }
        }
    }

    // 查询更新后的用户偏好设置
    const preference = await db.query.userPreference.findFirst({
        where: eq(tables.userPreference.user_id, userId),
    })

    // 查询用户账号列表
    const accounts = await db.query.userAccount.findMany({
        where: eq(tables.userAccount.user_id, userId),
    })

    const profile: UserProfile = {
        preference: preference!,
        accounts,
    }

    return {
        code: 200,
        message: '请求成功',
        data: profile,
    }
})
