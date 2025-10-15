import { pgTable, integer, text, boolean } from "drizzle-orm/pg-core"

export const users = pgTable('users', {
    id: integer('id').primaryKey(),
    username: text('username').notNull().unique()
});

export const userPreferences = pgTable("tbl_preferences", {
    username: text("username").primaryKey().references(() => users.username),
    maimaiVersion: text("maimai_version"),
    simplifiedCode: text("simplified_code"),
    characterName: text("character_name"),
    friendCode: text("friend_code"),
    displayName: text("display_name"),
    dxRating: text("dx_rating"),
    qrSize: integer("qr_size").notNull().default(15),
    maskType: integer("mask_type").notNull().default(0),
    charaInfoColor: text("chara_info_color").notNull().default("#fee37c"),
    showDate: boolean("show_date").notNull().default(true),
    characterId: text("character_id"),
    backgroundId: text("background_id"),
    frameId: text("frame_id"),
    passnameId: text("passname_id")
});