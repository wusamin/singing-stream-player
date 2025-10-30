import dayjs from 'dayjs'
import * as R from 'remeda'

export interface Song {
  id: string
  video: {
    id: string
    title: string
    publishedAt: dayjs.Dayjs
    url: string
    thumbnail: {
      url: string
    }
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
  duration: string
}

type Response = {
  data: {
    id: string
    video: {
      id: string
      title: string
      publishedAt: string
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
  }[]
  channels: {
    id: string
    displayName: string
    owner: {
      displayName: string
      fanMark: string
    }
  }[]
}

interface Option {
  channelIds?: string[]
  channelId?: string
}

export const useSongs = async () => {
  const searchCondition = ref<Option>({
    channelId: 'unohananonochi',
  })

  const { data, status } = useFetch<Response>('/api/songs', {
    query: computed(() => ({
      ...searchCondition.value,
      channelIds: searchCondition.value?.channelId
        ? [searchCondition.value.channelId]
        : undefined,
    })),
  })

  return {
    songs: computed((): Song[] =>
      R.pipe(
        data.value?.data ?? [],
        R.map(
          (i): Song => ({
            ...i,
            video: {
              ...i.video,
              publishedAt: dayjs(i.video.publishedAt),
              url: (() => {
                const url = new URL('https://www.youtube.com/watch')
                url.searchParams.set('v', i.video.id)
                url.searchParams.set('t', `${i.startAt}s`)
                return url.toString()
              })(),
              thumbnail: {
                url: `https://img.youtube.com/vi/${i.video.id}/maxresdefault.jpg`,
              },
            },
            duration: ((): string => {
              const d = i.endAt - i.startAt
              const seconds = d % 60
              const paddedSeconds = String(seconds).padStart(2, '0')
              return `${Math.floor(d / 60)}:${paddedSeconds}`
            })(),
          }),
        ),
      ),
    ),
    status,
    searchCondition,
    channels: computed(() => data.value?.channels ?? []),
  }
}
