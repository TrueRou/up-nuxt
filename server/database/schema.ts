import { boolean, integer, pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const server = pgTable('tbl_server', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    identifier: text('identifier').notNull(),
    tips_title: text('tips_title').notNull(),
    tips_desc: text('tips_desc').notNull(),
    tips_url: text('tips_url').notNull(),
    credentials_strategy: text('credentials_strategy').notNull(),
    credentials_field: text('credentials_field').notNull(),
})

export const userPreference = pgTable('tbl_preference', {
    user_id: uuid('user_id').primaryKey(),
    maimaiVersion: text('maimai_version').notNull().default(''),
    simplifiedCode: text('simplified_code').notNull().default(''),
    characterName: text('character_name').notNull().default(''),
    friendCode: text('friend_code').notNull().default(''),
    displayName: text('display_name').notNull().default(''),
    dxRating: text('dx_rating').notNull().default(''),
    qrSize: integer('qr_size').notNull().default(15),
    maskType: integer('mask_type').notNull().default(0),
    charaInfoColor: text('chara_info_color').notNull().default('#fee37c'),
    dynamicRating: boolean('dynamic_rating').notNull().default(true),
    showDate: boolean('show_date').notNull().default(true),
    characterId: text('character_id').notNull(),
    maskId: text('mask_id').notNull(),
    backgroundId: text('background_id').notNull(),
    frameId: text('frame_id').notNull(),
    passnameId: text('passname_id').notNull(),
})

export const userRating = pgTable('tbl_rating', {
    user_id: uuid('user_id').primaryKey(),
    rating: integer('rating').notNull().default(0),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
})

export const userAccount = pgTable('tbl_account', {
    id: serial('id').primaryKey(),
    user_id: uuid('user_id').notNull(),
    server_id: integer('server_id').notNull().references(() => server.id),
    credentials: text('credentials').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
})
