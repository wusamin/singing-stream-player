import * as R from 'remeda'
import type { Song } from './useSong'

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
      startSeconds: songs[0]?.startAt ?? undefined,
    },
  )

  const playlist = ref<Song[]>(songs)
  // シャッフルに関連して元のデータが必要なため。
  const songsRef = ref<Song[]>(songs)

  const setPlaylist = async (_playlist: Song[], loadVideo: boolean) => {
    playlist.value = _playlist
    if (loadVideo) {
      const v = _playlist[0]
      if (!v) {
        return
      }
      console.log(v.video.id)
      loadByUrl(`http://www.youtube.com/v/${v.video.id}?version=3`, v.startAt)
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
        nowPlaying.value.endAt < currentTime ||
        timeoutHandler.value === null
      ) {
        console.log('時間外再生検出、次の曲へ移動します')
        return
      }
      timeoutId.value = window.setTimeout(
        timeoutHandler.value,
        (nowPlaying.value.endAt - currentTime) * 1000,
      )
      setPlayingTime(Math.round(currentTime - nowPlaying.value.startAt))
      stopPlayingText()
      startPlayingText()
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

    if (playlist.value.length <= nextIndex) {
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

  const playShuffle = () =>
    start({
      startIndex: 0,
      playlist: R.shuffle(playlist.value),
    })

  const shufflePlaylist = () => {
    if (nowPlaying.value === null) {
      playlist.value = R.shuffle(playlist.value)
      return
    }

    playlist.value = [
      nowPlaying.value,
      ...R.pipe(
        playlist.value,
        R.filter((s) => s.id !== nowPlaying.value!.id),
        R.shuffle(),
      ),
    ]
  }

  const unshufflePlaylist = () => {
    playlist.value = [...songsRef.value]
  }

  // playlistの並びが変更されている場合はシャッフルされている
  const isShuffled = computed(
    () =>
      !R.isShallowEqual(
        songsRef.value.map((s) => s.id),
        playlist.value.map((s) => s.id),
      ),
  )

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
      songsRef.value = option.playlist
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
      throw new Error('window is undefined')
    }

    timeoutHandler.value = () => {
      if (playlist.value.length - 1 === index) {
        stop()
        return
      }
      start({ startIndex: index + 1 })
    }

    timeoutId.value = window.setTimeout(
      timeoutHandler.value,
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
    playShuffle,
    isShuffled,
    shufflePlaylist,
    unshufflePlaylist,
  }
}
