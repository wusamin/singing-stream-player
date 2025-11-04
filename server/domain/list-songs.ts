import { asc, eq, inArray } from 'drizzle-orm'
import * as R from 'remeda'
import { db } from '../db'
import { channels, songs, videoMetas } from '../db/schema'

export interface Song {
  id: string
  video: {
    id: string
    title: string
    publishedAt: Date
    channel: {
      id: string
      displayName: string
      owner: {
        displayName: string
        fanMark: string
      }
    }
  }
  meta: {
    title: string
    artist: string
  }
  startAt: number
  endAt: number
}

export interface Channel {
  id: string
  displayName: string
  owner: {
    displayName: string
    fanMark: string
  }
}

interface Result {
  data: Song[]
  channels: Channel[]
}

interface Input {
  channelIds?: string[]
}

export const listSongs = async (input: Input): Promise<Result> => {
  const result = await db
    .select()
    .from(songs)
    .innerJoin(videoMetas, eq(songs.videoMetaId, videoMetas.id))
    .innerJoin(channels, eq(videoMetas.channelId, channels.channelId))
    .where(
      input.channelIds
        ? inArray(videoMetas.channelId, input.channelIds)
        : undefined,
    )
    .orderBy(
      asc(videoMetas.publishedAt),
      asc(videoMetas.channelId),
      asc(songs.startAt),
    )

  // DBに保有している全チャンネルを取得
  const allVideoMetas = await db
    .selectDistinct()
    .from(videoMetas)
    .innerJoin(channels, eq(videoMetas.channelId, channels.channelId))

  return {
    data: result.map(
      (row): Song => ({
        id: row.songs.id,
        video: {
          id: String(row.video_metas.videoId),
          title: String(row.video_metas.title),
          publishedAt: row.video_metas.publishedAt,
          channel: {
            id: String(row.video_metas.channelId),
            displayName: row.channels.displayName,
            owner: {
              displayName: row.channels.ownerName,
              fanMark: row.channels.fanMark || '',
            },
          },
        },
        meta: {
          title: String(row.songs.metaTitle),
          artist: String(row.songs.metaArtist),
        },
        startAt: row.songs.startAt ?? 0,
        endAt: row.songs.endAt ?? 0,
      }),
    ),
    channels: R.pipe(
      allVideoMetas,
      R.map(
        (row): Channel => ({
          id: String(row.video_metas.channelId),
          displayName: row.channels.displayName,
          owner: {
            displayName: row.channels.ownerName,
            fanMark: row.channels.fanMark || '',
          },
        }),
      ),
      R.uniqueBy((i) => i.id),
    ),
  }
}
