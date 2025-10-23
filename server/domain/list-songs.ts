import { db } from '../db'

interface Song {
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

export const listSongs = async (): Promise<Result> => {
  const songs = await db.query.songs.findMany({
    with: {
      videoMeta: true,
    },
  })

  console.log(JSON.stringify(songs, null, 2))

  return {
    data: songs.map(
      (song) =>
        ({
          id: song.id,
          video: {
            id: String(song.videoMeta.videoId),
            title: String(song.videoMeta.title),
            publishedAt: song.videoMeta.publishedAt,
          },
          meta: {
            title: String(song.metaTitle),
            artist: String(song.metaArtist),
          },
          startAt: song.startAt ?? 0,
          endAt: song.endAt ?? 0,
        }) satisfies Song,
    ),
  }
}
