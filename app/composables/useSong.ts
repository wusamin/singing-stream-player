import dayjs from 'dayjs'
import * as R from 'remeda'

export interface Song {
  id: string
  video: {
    id: string
    title: string
    publishedAt: dayjs.Dayjs
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
  }[]
}

interface Option {
  channelIds?: string[]
}

export const useSongs = async () => {
  const searchCondition = ref<Option>({})

  const { data, status } = useFetch<Response>('/api/songs', {
    query: computed(() => ({
      ...searchCondition.value,
      channelIds: searchCondition.value?.channelIds
        ? [searchCondition.value.channelIds].join(',')
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
