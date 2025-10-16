import { pgTable, integer, text, boolean, timestamp, serial } from "drizzle-orm/pg-core"

export const server = pgTable("tbl_server", {
    id: serial('id').primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    identifier: text("identifier").notNull(),
    tips_title: text("tips_title").notNull(),
    tips_desc: text("tips_desc").notNull(),
    tips_url: text("tips_url").notNull(),
    credentials_strategy: text("credentials_strategy").notNull(),
    credentials_field: text("credentials_field").notNull(),
});

export const userPreference = pgTable("tbl_preference", {
    user_id: integer("user_id").primaryKey(),
    maimaiVersion: text("maimai_version"),
    simplifiedCode: text("simplified_code"),
    characterName: text("character_name"),
    friendCode: text("friend_code"),
    displayName: text("display_name"),
    dxRating: text("dx_rating"),
    qrSize: integer("qr_size").notNull().default(15),
    maskType: integer("mask_type").notNull().default(0),
    charaInfoColor: text("chara_info_color").notNull().default("#fee37c"),
    dynamicRating: boolean("dynamic_rating").notNull().default(true),
    showDate: boolean("show_date").notNull().default(true),
    characterId: text("character_id"),
    backgroundId: text("background_id"),
    frameId: text("frame_id"),
    passnameId: text("passname_id")
});

export const userRating = pgTable("tbl_rating", {
    user_id: integer("user_id").primaryKey(),
    rating: integer("rating").notNull().default(0),
    updated_at: timestamp("updated_at").notNull().defaultNow()
});

export const userAccount = pgTable("tbl_account", {
    id: serial('id').primaryKey(),
    user_id: integer("user_id").notNull(),
    server_id: integer("server_id").references(() => server.id).notNull(),
    credentials: text("credentials").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow()
});
