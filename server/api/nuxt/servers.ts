export default defineEventHandler(async (event) => {
    const db = useDrizzle()

    return {
        code: 200,
        message: '请求成功',
        data: await db.query.server.findMany()
    }
})