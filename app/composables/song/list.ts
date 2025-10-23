import { useYoutube } from '~/composables/useYoutube'

export interface Song {
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

interface Option {
  channelId: string
}

export const useSongs = async () => {
  const { data } = useFetch<{
    data: Song[]
  }>('/api/songs')

  return {
    songs: data.value?.data ?? [],
  }
}

export const usePlayer = (songs: Song[]) => {
  const { video, play, load, stop } = useYoutube()

  const timeoutId = ref<number | undefined>(undefined)
  const nowPlaying = ref<Song | null>(null)
  const playingTime = computed(() => {
    if (!nowPlaying.value) {
      return null
    }
    const totalTimeSeconds = nowPlaying.value.endAt - nowPlaying.value.startAt
    const minutes = Math.floor(totalTimeSeconds / 60)
    const seconds = totalTimeSeconds % 60
    const paddedSeconds = String(seconds).padStart(2, '0')

    return {
      totalTime: `${minutes}:${paddedSeconds}`,
    }
  })

  const start = (startIndex?: number) => {
    clearTimeout(timeoutId.value)
    // 指定がない場合は0からスタート
    const index = startIndex ?? 0

    if (songs.length < index - 1) {
      return
    }

    const song = songs[index]

    if (!song) {
      return
    }

    load(song.video.id, song.startAt)

    nowPlaying.value = song

    timeoutId.value = setTimeout(
      () => {
        if (songs.length - 1 === index) {
          stop()
          return
        }
        start(index + 1)
      },
      (song.endAt - song.startAt) * 10,
    )
  }

  return {
    start,
    nowPlaying,
    video,
    playingTime,
  }
}
