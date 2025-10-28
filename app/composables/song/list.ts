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
  const { video, state, load, pause, setOnStateChange, loadByUrl } = useYoutube(
    {
      initialVideoId: songs[0]?.video.id,
    },
  )

  const playlist = ref<Song[]>(songs)

  const setPlaylist = async (_playlist: Song[], loadVideo: boolean) => {
    playlist.value = _playlist
    if (loadVideo) {
      const v = _playlist[0]
      if (!v) {
        return
      }
      console.log(v.video.id)
      await loadByUrl(
        `http://www.youtube.com/v/${v.video.id}?version=3`,
        v.startAt,
      )
    }
  }

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
        // 同じビデオは複数存在するが、nowPlayingがnullかつ、プレイリスト以外から再生する場合は1曲目が選ばれているはずなので、ここでは問題ない
        const playingVideo = playlist.value.find(
          (v) => v.video.id === event.target.getVideoData().video_id,
        )
        if (!playingVideo) {
          console.error(
            '再生された曲がプレイリスト内に存在しません',
            event.target.getVideoData().video_id,
          )
          return
        }
        nowPlaying.value = playingVideo
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
    const currentIndex = playlist.value.findIndex(
      (song) => song.id === nowPlaying.value?.id,
    )
    const nextIndex = currentIndex + 1

    if (songs.length <= nextIndex) {
      stop()
      clearPlayingText()

      return
    }

    start({ startIndex: nextIndex })
  }

  const prev = () => {
    if (!nowPlaying.value) {
      return
    }

    const currentIndex = playlist.value.findIndex(
      (song) => song.id === nowPlaying.value?.id,
    )

    if (3 < elapsedSeconds.value) {
      start({ startIndex: currentIndex })
      return
    }

    const prevIndex = currentIndex - 1

    if (prevIndex < 0) {
      stop()
      clearPlayingText()
      return
    }

    start({ startIndex: prevIndex })
  }

  const start = (
    option?: Partial<{
      startIndex: number
      playlist: Song[]
    }>,
  ) => {
    clearTimeout(timeoutId.value)
    clearPlayingText()
    timeoutHandler.value = null
    // 指定がない場合は0からスタート
    const index = option?.startIndex ?? 0

    if (option?.playlist) {
      playlist.value = option.playlist
    }

    if (playlist.value.length < index - 1) {
      return
    }

    const song = playlist.value[index]

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
      start({ startIndex: index + 1 })
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
    playerState: state,
    setPlaylist,
  }
}
