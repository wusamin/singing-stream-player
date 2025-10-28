<script setup lang="ts">
import { usePlayer, useSongs } from '@/composables'

const { songs, status, channels, searchCondition } = await useSongs()
const {
  start,
  nowPlaying,
  video,
  playingTime,
  playingTimeText,
  next,
  prev,
  pause,
  playerState,
  setPlaylist,
} = usePlayer(songs.value)
</script>

<template>
  <div class="h-[calc(100vh-40px-96px-24px)] lg:h-[calc(100vh-96px-12px)]">
    <div class="flex flex-col h-full">
      <div class="w-full bg-[#ffd8dd] h-[40px]">
        {{ searchCondition.channelIds }}
        チャンネル:
        <select class="w-[128px]" v-model:="searchCondition.channelIds">
          <option :value="undefined">すべて</option>
          <option
            v-for="channel in channels"
            :key="channel.id"
            :value="channel.id"
          >
            {{ channel.displayName }}
          </option>
        </select>
        <button
          @click="
            () => {
              setPlaylist(songs, true)
            }
          "
        >
          aaa
        </button>
      </div>
      <!--      <div class="h-[60px]">-->
      <!--        <div v-if="nowPlaying">-->
      <!--          Now Playing:-->
      <!--          {{ nowPlaying.meta.title + ' - ' + nowPlaying.meta.artist }}-->
      <!--        </div>-->
      <!--      </div>-->
      <!--      <div class="mt-4">-->
      <!--        <button @click="() => start()">Start Player</button>-->
      <!--      </div>-->
      <div class="flex-1 w-full">
        <div
          class="flex mt-4 h-full flex-col sm:flex-col md:flex-col lg:flex-row gap-0 gap-2 justify-center w-full"
        >
          <div
            ref="video"
            class="lg:w-[640px] lg:h-[360px] sm:w-[120px] sm:h-[68px] w-[220px] h-[112px] mx-auto"
          ></div>
          <div class="flex-1 overflow-y-scroll relative w-full">
            <table v-if="status === 'success'" class="absolute w-full">
              <thead>
                <tr class="">
                  <th class="w-[32px] playlist-header"></th>
                  <th class="min-w-[280px] playlist-header">タイトル</th>
                  <th class="min-w-[60px] playlist-header">時間</th>
                  <th class="min-w-[140px] playlist-header">配信</th>
                  <th class="min-w-[240px] playlist-header">配信</th>
                  <!--                  <th class="w-[32px] playlist-header">a</th>-->
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(song, index) in songs"
                  :key="song.id"
                  :class="nowPlaying?.id === song.id ? 'bg-red-50' : ''"
                  class="border-b-2"
                >
                  <td class="text-center align-middle px-2">
                    <button
                      @click="
                        () => start({ startIndex: index, playlist: songs })
                      "
                    >
                      <Icon
                        name="material-symbols:play-circle-outline"
                        class="size-8"
                      />
                    </button>
                  </td>
                  <td class="border-l px-2 py-2">
                    <div class="text-lg">{{ song.meta.title }}</div>
                    <div class="text-sm">{{ song.meta.artist }}</div>
                  </td>
                  <td>
                    {{ song.duration }}
                  </td>
                  <td class="">
                    {{ song.video.publishedAt.format('YYYY年MM月DD日') }}
                  </td>
                  <td
                    class="text-nowrap text-ellipsis overflow-hidden w-[200px] max-w-0"
                  >
                    {{ song.video.title }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else>loading...</div>
          </div>
        </div>
      </div>
    </div>
    <div class="absolute bottom-0 left-0 w-full bg-[#ffd8dd] h-[96px] py-2">
      <div class="w-full flex justify-center items-center gap-2">
        <button @click="prev" class="w-[36px] h-[36px]">
          <Icon
            name="material-symbols:skip-previous-outline"
            class="w-full h-full hover:scale-[1.15]"
          />
        </button>
        <button @click="pause" class="w-[48px] h-[48px]">
          <Icon
            v-if="playerState === 'PLAYING' || playerState === 'BUFFERING'"
            name="material-symbols:pause-circle-outline"
            class="w-full h-full hover:scale-[1.05]"
          />
          <Icon
            v-else
            name="material-symbols:play-circle-outline"
            class="w-full h-full hover:scale-[1.05]"
          />
        </button>
        <button @click="next" class="w-[36px] h-[36px]">
          <Icon
            name="material-symbols:skip-next-outline"
            class="w-full h-full hover:scale-[1.15]"
          />
        </button>
      </div>
      <div class="w-full text-center">
        {{ playingTimeText }} / {{ playingTime?.totalTime ?? '0:00' }}
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.playlist-header {
  @apply text-left bg-[#ffd8dd] sticky top-0 z-10;
}
</style>
