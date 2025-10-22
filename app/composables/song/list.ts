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

export const useSongs = () => {
  const { data } = useFetch<{
    data: Song[]
  }>('/api/singing/list')

  return {
    songs: data.value?.data ?? [],
  }
}

export const usePlayer = (
  songs: Song[],
  playVideo: (videoId: string, startSeconds: number | null) => void,
) => {
  const timeoutId = ref<number | undefined>(undefined)
  const playingIndex = ref<number | undefined>(undefined)

  const start = (startIndex: number | null) => {
    clearTimeout(timeoutId.value)
    // 指定がない場合は0からスタート
    const index = startIndex ?? 0

    playingIndex.value = index
    if (songs.length < playingIndex.value - 1) {
      return
    }

    const song = songs[playingIndex.value]

    if (!song) {
      return
    }

    playVideo(song.video.id, song.startAt)

    timeoutId.value = setTimeout(
      () => {
        start(index + 1)
      },
      (song.endAt - song.startAt) * 1000,
    )
  }

  return { start, playingIndex }
}
