interface Option {
  initialVideoId: string
}

type PlayerState =
  | 'UNSTARTED'
  | 'ENDED'
  | 'PLAYING'
  | 'PAUSED'
  | 'BUFFERING'
  | 'CUED'
  | 'UNKNOWN'

export const useYoutube = (option?: Partial<Option>) => {
  const video = ref<HTMLElement>()
  const { onLoaded } = useScriptYouTubePlayer({})

  const player = ref<YT.Player | null>(null)
  const onStateChangeCallback = ref<
    ((event: YT.OnStateChangeEvent) => void) | null
  >(null)

  onLoaded(async (instance) => {
    // なんかタイムアウトを入れるとうまくいくが、実際に何がどうなってるかはよくわからない
    setTimeout(async () => {
      const YouTube = await instance.YT

      const PlayerConstructor = YouTube.Player as unknown as typeof YT.Player
      if (PlayerConstructor) {
        const p = new PlayerConstructor(video.value!, {
          videoId: option?.initialVideoId || undefined,
          playerVars: {
            fs: 0,
            iv_load_policy: 3,
            // controls: 0,
          },
        })
        // p.seekTo(12000, true)
        p.addEventListener('onStateChange', (event) => {
          setState()
          // コールバックが設定されていれば呼び出す
          if (onStateChangeCallback.value) {
            onStateChangeCallback.value(event)
          }
        })
        player.value = p
      }
    }, 100)
  })

  const play = () => {
    player.value?.playVideo()
  }

  const load = (videoId: string, startSeconds: number | null) => {
    player.value?.loadVideoById(videoId, startSeconds ?? 0)
  }

  const loadByUrl = (url: string, startSeconds: number | null) => {
    player.value?.loadVideoByUrl(url, startSeconds ?? 0)
  }

  const pause = async () => {
    if (player.value?.getPlayerState() === YT.PlayerState.PAUSED) {
      player.value?.playVideo()
      return
    }
    if (player.value?.getPlayerState() === YT.PlayerState.PLAYING) {
      player.value?.pauseVideo()
      return
    }
    if (player.value?.getPlayerState() === YT.PlayerState.CUED) {
      player.value?.playVideo()
    }
  }

  const state = ref<PlayerState>('UNSTARTED')

  const setState = () => {
    const playerState = player.value?.getPlayerState()

    switch (playerState) {
      case YT.PlayerState.UNSTARTED:
        state.value = 'UNSTARTED'
        return
      case YT.PlayerState.ENDED:
        state.value = 'ENDED'
        return
      case YT.PlayerState.PLAYING:
        state.value = 'PLAYING'
        return
      case YT.PlayerState.PAUSED:
        state.value = 'PAUSED'
        return
      case YT.PlayerState.BUFFERING:
        state.value = 'BUFFERING'
        return
      case YT.PlayerState.CUED:
        state.value = 'CUED'
        return
      default:
        state.value = 'UNKNOWN'
        return
    }
  }

  // コールバックを設定するメソッド
  const setOnStateChange = (
    callback: (event: YT.OnStateChangeEvent) => void,
  ) => {
    onStateChangeCallback.value = callback
  }

  return { video, play, pause, load, loadByUrl, setOnStateChange, state }
}
