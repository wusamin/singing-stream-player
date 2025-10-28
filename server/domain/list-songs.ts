import { asc, eq, inArray } from 'drizzle-orm'
import { db } from '../db'
import { songs, videoMetas } from '../db/schema'

export interface Song {
  id: string
  video: {
    id: string
    title: string
    publishedAt: Date
    channel: {
      id: string
      displayName: string
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
}

interface Result {
  data: Song[]
  channels: Channel[]
}

interface Input {
  channelIds?: string[]
}

const getDisplayName = (channelId: string): string => {
  switch (channelId) {
    case 'unohananonochi':
      return '兎ノ花ののち'
    case 'KomaiUme':
      return '狛犬うめ'
    case 'sana_natori':
      return '名取さな'
    case 'mishiomolf':
      return '海汐もるふ'
    default:
      return channelId
  }
}

export const listSongs = async (input: Input): Promise<Result> => {
  const result = await db
    .select()
    .from(songs)
    .innerJoin(videoMetas, eq(songs.videoMetaId, videoMetas.id))
    .where(
      input.channelIds
        ? inArray(videoMetas.channelId, input.channelIds)
        : undefined,
    )
    .orderBy(asc(videoMetas.publishedAt), asc(songs.startAt))

  const data = result.map(
    (row) =>
      ({
        id: row.songs.id,
        video: {
          id: String(row.video_metas.videoId),
          title: String(row.video_metas.title),
          publishedAt: row.video_metas.publishedAt,
          channel: {
            id: String(row.video_metas.channelId),
            displayName: getDisplayName(String(row.video_metas.channelId)),
          },
        },
        meta: {
          title: String(row.songs.metaTitle),
          artist: String(row.songs.metaArtist),
        },
        startAt: row.songs.startAt ?? 0,
        endAt: row.songs.endAt ?? 0,
      }) satisfies Song,
  )

  // DBに保有している全チャンネルを取得
  const allVideoMetas = await db
    .selectDistinct({ channelId: videoMetas.channelId })
    .from(videoMetas)

  const channels: Channel[] = allVideoMetas.map((row) => ({
    id: String(row.channelId),
    displayName: getDisplayName(String(row.channelId)),
  }))

  return {
    data,
    channels,
  }
}
