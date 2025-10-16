import { drizzle } from 'drizzle-orm/node-postgres';
export { sql, eq, and, or } from 'drizzle-orm'

import * as schema from '../database/schema'

export const tables = schema

export function useDrizzle() {
    return drizzle(process.env.DATABASE_URL || "", { schema })
}

export type Server = typeof schema.server.$inferSelect
export type UserAccount = typeof schema.userAccount.$inferSelect
export type UserPreference = typeof schema.userPreference.$inferSelect
export type UserRating = typeof schema.userRating.$inferSelect