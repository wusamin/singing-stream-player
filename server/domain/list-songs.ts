import { asc, eq, inArray } from 'drizzle-orm'
import { db } from '../db'
import { songs, videoMetas } from '../db/schema'

export type Song = {
  id: string
  video: {
    id: string
    title: string
    publishedAt: Date
  }
  meta: {
    title: string
    artist: string
  }
  startAt: number
  endAt: number
}

interface Result {
  data: Song[]
}

interface Input {
  channelIds?: string[]
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

  return {
    data: result.map(
      (row) =>
        ({
          id: row.songs.id,
          video: {
            id: String(row.video_metas.videoId),
            title: String(row.video_metas.title),
            publishedAt: row.video_metas.publishedAt,
          },
          meta: {
            title: String(row.songs.metaTitle),
            artist: String(row.songs.metaArtist),
          },
          startAt: row.songs.startAt ?? 0,
          endAt: row.songs.endAt ?? 0,
        }) satisfies Song,
    ),
  }
}
