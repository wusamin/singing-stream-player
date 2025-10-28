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
    query: searchCondition.value,
  })

  return {
    songs: R.pipe(
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
    status,
    searchCondition,
    channels: data.value?.channels ?? [],
  }
}

const usePlayingTime = () => {
  const intervalId = ref<number | undefined>(undefined)
  const elapsedSeconds = ref<number>(0)
  const playingTimeText = ref<string>('0:00')
  const updatePlayingTime = () => {
    elapsedSeconds.value += 1
    playingTimeText.value = `${Math.floor(elapsedSeconds.value / 60)}:${String(
      elapsedSeconds.value % 60,
    ).padStart(2, '0')}`
  }
  const clear = () => {
    elapsedSeconds.value = 0
    playingTimeText.value = '0:00'
    stop()
    intervalId.value = undefined
  }

  const start = () => {
    intervalId.value = window.setInterval(updatePlayingTime, 1000)
  }

  const stop = () => clearInterval(intervalId.value)

  const setPlayingTime = (time: number) => {
    elapsedSeconds.value = time
  }

  return {
    playingTimeText,
    clear,
    start,
    stop,
    setPlayingTime,
    elapsedSeconds,
  }
}

export const usePlayer = (songs: Song[]) => {
  const { video, play, load, pause, setOnStateChange } = useYoutube({
    initialVideoId: songs[0]?.video.id,
  })
  const {
    playingTimeText,
    start: startPlayingText,
    stop: stopPlayingText,
    clear: clearPlayingText,
    setPlayingTime,
    elapsedSeconds,
  } = usePlayingTime()
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

  const next = () => {
    if (!nowPlaying.value) {
      return
    }
    const currentIndex = songs.findIndex(
      (song) => song.id === nowPlaying.value?.id,
    )
    const nextIndex = currentIndex + 1

    if (nextIndex < songs.length) {
      start(nextIndex)
    } else {
      stop()
      clearPlayingText()
    }
  }

  const prev = () => {
    if (!nowPlaying.value) {
      return
    }

    const currentIndex = songs.findIndex(
      (song) => song.id === nowPlaying.value?.id,
    )

    if (3 < elapsedSeconds.value) {
      start(currentIndex)
      return
    }

    const prevIndex = currentIndex - 1

    if (0 <= prevIndex) {
      start(prevIndex)
    } else {
      stop()
      clearPlayingText()
    }
  }

  const start = (startIndex?: number) => {
    clearTimeout(timeoutId.value)
    clearPlayingText()
    timeoutHandler.value = null
    // 指定がない場合は0からスタート
    const index = startIndex ?? 0

    if (songs.length < index - 1) {
      return
    }

    const song = songs[index]

    if (!song) {
      console.error('song is undefined')
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
    next,
    prev,
    pause,
    nowPlaying,
    video,
    playingTime,
    playingTimeText,
  }
}
