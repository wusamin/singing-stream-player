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
}

interface Result {
  data: Song[]
  channels: Channel[]
}

interface Input {
  channelIds?: string[]
}

const getDisplayName = (
  channelId: string,
): { displayName: string; ownerName: string; fanMark: string } => {
  switch (channelId) {
    case 'unohananonochi':
      return {
        displayName: 'Nonochi Ch. 兎ノ花ののち',
        ownerName: '兎ノ花ののち',
        fanMark: '🐰🌸',
      }
    case 'KomaiUme':
      return {
        displayName: 'Ume Ch. 狛犬うめ',
        ownerName: '狛犬うめ',
        fanMark: '🌐🐾',
      }
    case 'sana_natori':
      return {
        displayName: 'さなちゃんねる',
        ownerName: '名取さな',
        fanMark: '',
      }
    case 'mishiomolf':
      return {
        displayName: 'Molf Ch. 海汐もるふ',
        ownerName: '海汐もるふ',
        fanMark: '☠️⚓️',
      }
    case 'MEMENTOVANITAS':
      return {
        displayName: 'メーメントヴァニタス / MEMENTOVANITAS',
        ownerName: 'メーメントヴァニタス',
        fanMark: '👁️‍🗨️🗝️',
      }

    default:
      return {
        displayName: channelId,
        ownerName: '',
        fanMark: '',
      }
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

  const data = result.map((row): Song => {
    const channelData = getDisplayName(String(row.video_metas.channelId))
    return {
      id: row.songs.id,
      video: {
        id: String(row.video_metas.videoId),
        title: String(row.video_metas.title),
        publishedAt: row.video_metas.publishedAt,
        channel: {
          id: String(row.video_metas.channelId),
          displayName: channelData.displayName,
          owner: {
            displayName: channelData.ownerName,
            fanMark: channelData.fanMark,
          },
        },
      },
      meta: {
        title: String(row.songs.metaTitle),
        artist: String(row.songs.metaArtist),
      },
      startAt: row.songs.startAt ?? 0,
      endAt: row.songs.endAt ?? 0,
    }
  })

  // DBに保有している全チャンネルを取得
  const allVideoMetas = await db
    .selectDistinct({ channelId: videoMetas.channelId })
    .from(videoMetas)

  const channels: Channel[] = allVideoMetas.map((row) => {
    const channel = getDisplayName(String(row.channelId))
    return {
      id: String(row.channelId),
      displayName: channel.displayName,
      owner: { name: channel.ownerName, fanMark: channel.fanMark },
    }
  })

  return {
    data,
    channels,
  }
}
