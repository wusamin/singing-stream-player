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

export const useSongs = async (option?: Partial<Option>) => {
  const { data } = useFetch<{
    data: Song[]
  }>('/api/songs')

  return {
    songs: data.value?.data ?? [],
  }
}

export const usePlayer = (songs: Song[]) => {
  const { video, play, load, stop, setOnStateChange } = useYoutube()

  // 次の曲に飛ぶ処理をこれで無理やり実行する
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

  // プレーヤーが止まった時に次の曲に飛ぶための処理を再実行させたいので、refで処理自体を保持する
  const timeoutHandler = ref<(() => void) | null>(null)

  setOnStateChange((event) => {
    // ポーズした時は時間がずれるのでクリアする
    if (event.data === YT.PlayerState.PAUSED) {
      console.log(event.target.getCurrentTime())
      clearTimeout(timeoutId.value)
      return
    }

    if (event.data === YT.PlayerState.PLAYING) {
      // handlerの時間を変えて入れ直す
      console.log(event.target.getCurrentTime())
    }

    console.log('on usePlayer')
  })

  const start = (startIndex?: number) => {
    clearTimeout(timeoutId.value)
    timeoutHandler.value = null
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

    if (!window) {
      return
    }

    const handler = () => {
      if (songs.length - 1 === index) {
        stop()
        return
      }
      start(index + 1)
    }
    timeoutHandler.value = handler

    timeoutId.value = window.setTimeout(
      handler,
      (song.endAt - song.startAt) * 1000,
    )
  }

  return {
    start,
    nowPlaying,
    video,
    playingTime,
  }
}
