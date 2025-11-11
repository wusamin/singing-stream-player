import dayjs from 'dayjs'
import * as R from 'remeda'
import { useUser } from './auth'

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
      channelId: string
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
  const { currentUser } = useUser()

  const searchCondition = ref<Option>({
    channelId: 'unohananonochi',
  })

  watch(currentUser, async () => {
    if (!currentUser.value) {
      return
    }
    await refresh()
  })

  // データ件数が少ないうちは、APIのコール回数を減らすために全権取得する
  const { data, status, refresh } = useFetch<Response>('/api/songs', {
    server: true,
    onRequest: async ({ options }) => {
      if (!currentUser.value) {
        return
      }
      const idToken = await currentUser.value.getIdToken()
      options.headers.set('Authorization', `Bearer ${idToken}`)
    },
  })

  const channelsMap = computed(() => {
    const map: Record<string, Response['channels'][0]> = {}
    data.value?.channels.forEach((channel) => {
      map[channel.id] = channel
    })
    return map
  })

  return {
    songs: computed((): Song[] => {
      return R.pipe(
        data.value?.data ?? [],
        // 検索条件が増えてきたら切り出した方がいいかも
        R.filter((i) =>
          searchCondition.value?.channelId
            ? i.video.channelId === searchCondition.value.channelId
            : true,
        ),
        R.map((i): Song => {
          const channel = channelsMap.value[i.video.channelId]
          if (!channel) {
            throw new Error(`Channel not found: ${i.video.channelId}`)
          }
          return {
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
              channel,
            },
            duration: ((): string => {
              const d = i.endAt - i.startAt
              const seconds = d % 60
              const paddedSeconds = String(seconds).padStart(2, '0')
              return `${Math.floor(d / 60)}:${paddedSeconds}`
            })(),
          }
        }),
      )
    }),
    status,
    searchCondition,
    channels: computed(() => data.value?.channels ?? []),
  }
}
