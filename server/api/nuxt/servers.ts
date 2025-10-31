export default defineEventHandler(async (_) => {
    const db = useDrizzle()

    return {
        code: 200,
        message: '请求成功',
        data: await db.query.server.findMany(),
    }
})
