import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import * as R from 'remeda'
import { db } from '../db'
import { channels, songs, videoMetas } from '../db/schema'

export interface Song {
  id: string
  video: {
    id: string
    title: string
    publishedAt: Date
    channelId: string
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
  authenticated?: boolean
}

export const listSongs = async (input: Input): Promise<Result> => {
  const result = await db
    .select()
    .from(songs)
    .innerJoin(videoMetas, eq(songs.videoMetaId, videoMetas.id))
    .innerJoin(channels, eq(videoMetas.channelId, channels.channelId))
    .where(
      and(
        input.channelIds
          ? inArray(videoMetas.channelId, input.channelIds)
          : undefined,
        // privateな動画は公開しないほうが良いので、認証されたユーザーのみ閲覧可能にする
        input?.authenticated ? undefined : eq(videoMetas.visibility, 'public'),
      ),
    )
    .orderBy(
      desc(videoMetas.publishedAt),
      asc(videoMetas.channelId),
      asc(videoMetas.title),
      asc(songs.startAt),
    )

  // publicな動画が存在するチャンネルを取得
  const allChannels = await db
    .selectDistinct({ channels })
    .from(channels)
    .innerJoin(videoMetas, eq(channels.channelId, videoMetas.channelId))
    // ログイン処理を追加した際に復活させる
    .where(
      input?.authenticated ? undefined : eq(videoMetas.visibility, 'public'),
    )
    .orderBy(asc(channels.channelId))

  return {
    data: result.map(
      (row): Song => ({
        id: row.songs.id,
        video: {
          id: String(row.video_metas.videoId),
          title: String(row.video_metas.title),
          publishedAt: row.video_metas.publishedAt,
          channelId: String(row.video_metas.channelId),
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
      allChannels,
      R.map(
        (row): Channel => ({
          id: String(row.channels.channelId),
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

const isAuthenticated = (): boolean => {
  return true
}
