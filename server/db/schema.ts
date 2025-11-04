import { relations } from 'drizzle-orm'
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const songs = pgTable('songs', {
  id: uuid('id').primaryKey().defaultRandom(),
  videoMetaId: integer('video_meta_id')
    .notNull()
    .references(() => videoMetas.id),
  metaTitle: text('meta_title'),
  metaArtist: text('meta_artist'),
  startAt: integer('start_at'),
  endAt: integer('end_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const songsRelations = relations(songs, ({ one }) => ({
  videoMeta: one(videoMetas, {
    fields: [songs.videoMetaId],
    references: [videoMetas.id],
  }),
}))

export const videoMetas = pgTable('video_metas', {
  id: serial('id').primaryKey(),
  videoId: text('video_id').notNull(),
  channelId: text('channel_id').notNull(),
  title: text('title').notNull(),
  publishedAt: timestamp('published_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const channels = pgTable('channels', {
  id: text('id').primaryKey(),
  channelId: text('channel_id').notNull(),
  displayName: text('display_name').notNull(),
  ownerName: text('owner_name').notNull(),
  fanMark: text('fan_mark'),
})

export const videoMetasRelations = relations(videoMetas, ({ one, many }) => ({
  songs: many(songs),
  channel: one(channels, {
    fields: [videoMetas.channelId],
    references: [channels.channelId],
  }),
}))
