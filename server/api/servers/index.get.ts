import { commonSuccess } from '~~/server/utils/common'
import { Server } from '~~/server/utils/drizzle'

export default defineEventHandler(async (event) => {
    const db = useDrizzle()

    const servers = await db.query.server.findMany()

    return commonSuccess<Server[]>(servers)
})
