export default defineEventHandler(async (event) => {
    const userId = (await useUser(event)).id
    const db = useDrizzle()
    const config = useRuntimeConfig()

    // 查询用户偏好设置
    const preference = await db.query.userPreference.findFirst({
        where: eq(tables.userPreference.user_id, userId),
    })

    // 如果用户偏好设置不存在，创建默认的偏好设置
    let userPreference = preference
    if (!userPreference) {
        const [newPreference] = await db.insert(tables.userPreference).values({
            user_id: userId,
            characterId: config.leporidDefaultImage.characterId,
            maskId: config.leporidDefaultImage.maskId,
            backgroundId: config.leporidDefaultImage.backgroundId,
            frameId: config.leporidDefaultImage.frameId,
            passnameId: config.leporidDefaultImage.passnameId,
        }).returning()
        userPreference = newPreference
    }

    // 查询用户账号列表
    const accounts = await db.query.userAccount.findMany({
        where: eq(tables.userAccount.user_id, userId),
    })

    const profile: UserProfile = {
        preference: userPreference,
        accounts,
    }

    return {
        code: 200,
        message: '请求成功',
        data: profile,
    }
})
