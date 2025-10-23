export const useYoutube = () => {
  const video = ref<HTMLElement>()
  const { onLoaded } = useScriptYouTubePlayer({})

  const player = ref<YT.Player | null>(null)
  onLoaded(async (instance) => {
    const YouTube = await instance.YT

    const PlayerConstructor = YouTube.Player as unknown as typeof YT.Player
    if (!PlayerConstructor) {
      // なんかタイムアウトを入れるとうまくいくが、実際に何がどうなってるかはよくわからない
      setTimeout(async () => {
        const YouTube = await instance.YT

        const PlayerConstructor = YouTube.Player as unknown as typeof YT.Player
        if (PlayerConstructor) {
          player.value = new PlayerConstructor(video.value!)
        }
      }, 100)
    }
    player.value = new PlayerConstructor(video.value!)
  })

  const play = () => player.value?.playVideo()

  const load = (videoId: string, startSeconds: number | null) => {
    player.value?.loadVideoById(videoId, startSeconds ?? 0)
  }

  const stop = () => player.value?.stopVideo()

  return { video, play, stop, load }
}
