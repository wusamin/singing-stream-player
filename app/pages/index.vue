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
} = usePlayer(songs.value)
</script>

<template>
  <div class="h-svh flex flex-col bg-gray-100">
    <div class="flex flex-col h-full flex-1">
      <div class="w-full bg-[#ffd8dd] h-[40px] px-5 flex items-center">
        <select class="channel-selector" v-model:="searchCondition.channelId">
          <option :value="undefined">すべて</option>
          <option
            v-for="channel in channels"
            :key="channel.id"
            :value="channel.id"
          >
            {{ channel.displayName }}
          </option>
        </select>
      </div>
      <div class="flex-1 w-full mt-2">
        <div
          class="flex h-full flex-col lg:flex-row gap-0 gap-2 justify-center w-full"
        >
          <div class="flex px-2">
            <div
              ref="video"
              class="w-[220px] h-[112px] lg:w-[640px] lg:h-[360px]"
            ></div>
            <div class="ml-2 lg:hidden">
              <span class="block font-medium text-lg">
                {{ nowPlaying?.meta.title ?? '-' }}
              </span>
              <span class="block text-sm">
                {{ nowPlaying?.meta.artist ?? '-' }}
              </span>
            </div>
          </div>
          <div class="flex-1 overflow-y-scroll relative w-full">
            <table v-if="status === 'success'" class="absolute w-full">
              <thead class="">
                <tr class="">
                  <th class="w-[32px] playlist-header"></th>
                  <th class="min-w-[280px] playlist-header">タイトル</th>
                  <th class="min-w-[60px] playlist-header"></th>
                  <th
                    class="min-w-[140px] playlist-header hidden md:table-cell"
                  >
                    配信日
                  </th>
                  <th
                    class="min-w-[240px] playlist-header hidden md:table-cell"
                  >
                    配信
                  </th>
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
                    <div class="text-lg font-bold">{{ song.meta.title }}</div>
                    <div class="text-sm">{{ song.meta.artist }}</div>
                    <div class="mt-2 text-sm md:hidden">
                      {{ song.video.title }}
                    </div>
                    <div
                      class="mt-1 text-sm md:hidden text-nowrap text-ellipsis overflow-hidden w-full"
                    >
                      {{ song.video.publishedAt.format('YYYY年MM月DD日') }}
                    </div>
                  </td>
                  <td>
                    {{ song.duration }}
                  </td>
                  <td class="hidden md:table-cell">
                    {{ song.video.publishedAt.format('YYYY年MM月DD日') }}
                  </td>
                  <td
                    class="text-nowrap text-ellipsis overflow-hidden w-[200px] max-w-0 hidden md:table-cell"
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
    <div class="w-full bg-[#ffd8dd] h-[96px] py-2">
      <div
        class="w-full flex items-center gap-2 lg:pl-10 justify-center lg:justify-normal"
      >
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
        <div class="ml-10 hidden lg:block">
          {{ nowPlaying?.meta.title ?? '再生中の曲はありません' }}
          {{ nowPlaying ? ' - ' + nowPlaying.meta.artist : '' }}
        </div>
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

.channel-selector {
  @apply w-[260px] appearance-none rounded-md px-1 bg-gray-50;
}
</style>
