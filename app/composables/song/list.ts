import dayjs from 'dayjs'
import { useYoutube } from '~/composables/useYoutube'

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

interface Response {
  id: string
  video: {
    id: string
    title: string
    publishedAt: string
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
  const { data, status } = useFetch<{
    data: Response[]
  }>('/api/songs')

  return {
    songs:
      data.value?.data.map(
        (i): Song => ({
          ...i,
          video: {
            ...i.video,
            publishedAt: dayjs(i.video.publishedAt),
          },
          duration: (() => {
            const d = i.endAt - i.startAt
            const seconds = d % 60
            const paddedSeconds = String(seconds).padStart(2, '0')
            return `${Math.floor(d / 60)}:${paddedSeconds}`
          })(),
        }),
      ) ?? [],
    status,
  }
}

const usePlayingText = () => {
  const intervalId = ref<number | undefined>(undefined)
  const playTime = ref<number>(0)
  const playingTimeText = ref<string>('0:00')
  const updatePlayingTime = () => {
    playTime.value += 1
    playingTimeText.value = `${Math.floor(playTime.value / 60)}:${String(
      playTime.value % 60,
    ).padStart(2, '0')}`
  }
  const clear = () => {
    playTime.value = 0
    playingTimeText.value = '0:00'
    stop()
    intervalId.value = undefined
  }

  const start = () => {
    intervalId.value = window.setInterval(updatePlayingTime, 1000)
  }

  const stop = () => clearInterval(intervalId.value)

  const setPlayingTime = (time: number) => {
    playTime.value = time
  }

  return {
    playingTimeText,
    clear,
    start,
    stop,
    setPlayingTime,
  }
}

export const usePlayer = (songs: Song[]) => {
  const { video, play, load, stop, setOnStateChange } = useYoutube()
  const {
    playingTimeText,
    start: startPlayingText,
    stop: stopPlayingText,
    setPlayingTime,
  } = usePlayingText()
  // 次の曲に飛ぶ処理をこれで無理やり実行する
  const timeoutId = ref<number | undefined>(undefined)
  const intervalId = ref<number | undefined>(undefined)
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
      clearTimeout(timeoutId.value)
      stopPlayingText()
      return
    }

    if (event.data === YT.PlayerState.PLAYING) {
      if (nowPlaying.value === null) {
        return
      }

      clearTimeout(timeoutId.value)
      const currentTime = event.target.getCurrentTime()

      if (
        currentTime <= nowPlaying.value.endAt &&
        timeoutHandler.value !== null
      ) {
        timeoutId.value = window.setTimeout(
          timeoutHandler.value,
          (nowPlaying.value.endAt - currentTime) * 1000,
        )
        setPlayingTime(Math.round(currentTime - nowPlaying.value.startAt))
        stopPlayingText()
        startPlayingText()
      }
    }
  })

  const start = (startIndex?: number) => {
    clearTimeout(timeoutId.value)
    clearInterval(intervalId.value)
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
    playingTimeText,
  }
}
