/// <reference types="@types/youtube" />
export const useYoutube = () => {
  const video = ref<HTMLElement>()
  const { onLoaded } = useScriptYouTubePlayer({})

  const player = ref<YT.Player | null>(null)
  // onMounted(() => {
  onLoaded(async (instance) => {
    // we need to wait for the internal YouTube APIs to be ready
    const YouTube = await instance.YT

    // The YouTube API is ready at this point
    // Create the player instance with proper type casting
    const PlayerConstructor = YouTube.Player as unknown as typeof YT.Player
    player.value = new PlayerConstructor(video.value!, {
      videoId: 'd_IFKP1Ofq0',
    })
  })
  // })

  const play = () => player.value?.playVideo()

  return { video, play }
}
