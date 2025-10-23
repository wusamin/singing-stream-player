export const useYoutube = () => {
  const video = ref<HTMLElement>()
  const { onLoaded } = useScriptYouTubePlayer({})

  const player = ref<YT.Player | null>(null)
  const onStateChangeCallback = ref<((event: YT.OnStateChangeEvent) => void) | null>(null)

  onLoaded(async (instance) => {
    // なんかタイムアウトを入れるとうまくいくが、実際に何がどうなってるかはよくわからない
    setTimeout(async () => {
      const YouTube = await instance.YT

      const PlayerConstructor = YouTube.Player as unknown as typeof YT.Player
      if (PlayerConstructor) {
        const p = new PlayerConstructor(video.value!)
        p.addEventListener('onStateChange', (event) => {
          // コールバックが設定されていれば呼び出す
          if (onStateChangeCallback.value) {
            onStateChangeCallback.value(event)
          }
        })
        player.value = p
      }
    }, 100)
  })

  const play = () => player.value?.playVideo()

  const load = (videoId: string, startSeconds: number | null) => {
    player.value?.loadVideoById(videoId, startSeconds ?? 0)
  }

  const stop = () => player.value?.stopVideo()

  // コールバックを設定するメソッド
  const setOnStateChange = (callback: (event: YT.OnStateChangeEvent) => void) => {
    onStateChangeCallback.value = callback
  }

  return { video, play, stop, load, setOnStateChange }
}
