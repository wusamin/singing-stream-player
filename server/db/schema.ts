import { pgTable, uuid, timestamp, integer, text } from 'drizzle-orm/pg-core'

export const song = pgTable('song', {
  id: uuid('id').primaryKey(),
  videoMetaId: uuid('video_meta_id')
    .notNull()
    .references(() => videoMeta.id),
  metaTitle: text('meta_title'),
  metaArtist: text('meta_artist'),
  startAt: integer('start_at'),
  endAt: integer('end_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const videoMeta = pgTable('video_meta', {
  id: uuid('id').primaryKey(),
  videoId: text('video_id').notNull(),
  channelId: text('channel_id').notNull(),
  title: text('title').notNull(),
  publishedAt: timestamp('published_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
