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
  playShuffle,
  shufflePlaylist,
  unshufflePlaylist,
  isShuffled,
} = usePlayer(songs.value)
</script>

<template>
  <div class="h-svh flex flex-col bg-[#F4F5F7]">
    <div class="flex flex-col h-full flex-1">
      <div class="w-full accent-color h-[44px] px-2 flex items-center">
        <select
          class="channel-selector cursor-pointer focus:border-0 focus:outline-none"
          v-model:="searchCondition.channelId"
        >
          <option :value="undefined">すべて</option>
          <option
            v-for="channel in channels"
            :key="channel.id"
            :value="channel.id"
          >
            {{ channel.displayName }} {{ channel.owner.fanMark }}
          </option>
        </select>
      </div>
      <div class="flex-1 w-full mt-2">
        <div
          class="flex h-full flex-col lg:flex-row gap-2 justify-center w-full"
        >
          <div class="flex px-2 lg:flex-col lg:w-[640px] h-[124px] lg:h-auto">
            <div
              ref="video"
              class="w-[220px] h-[124px] lg:w-[640px] lg:h-[360px]"
            ></div>
            <div class="ml-4 lg:hidden py-4 flex-1">
              <div class="font-medium text-lg flex items-center gap-1 w-full">
                <Icon name="material-symbols:music-note" class="text-lg" />
                <span>{{ nowPlaying?.meta.title ?? '-' }}</span>
              </div>
              <div class="mt-1 flex items-center gap-1 text-sm">
                <Icon name="material-symbols:artist-outline" class="text-lg" />
                {{ nowPlaying?.meta.artist ?? '-' }}
              </div>
              <div class="mt-4 flex items-center gap-1 text-sm">
                <Icon name="ic:round-access-time" class="text-lg" />
                <span class="">
                  {{
                    nowPlaying?.video.publishedAt.format('YYYY年MM月DD日') ??
                    '-'
                  }}
                </span>
              </div>
            </div>
            <div class="hidden lg:block mt-4 flex-1">
              <div>
                <div class="font-bold text-2xl flex items-center gap-2">
                  <Icon name="material-symbols:music-note" class="text-2xl" />
                  <span class="ml-1">
                    {{ nowPlaying?.meta.title ?? '-' }}
                  </span>
                </div>
                <div
                  class="ml-1 mt-2 flex items-center text-nowrap text-ellipsis overflow-hidden gap-2"
                >
                  <Icon
                    name="material-symbols:artist-outline"
                    class="w-[20px] h-[20px]"
                  />
                  <span class="ml-[4px]">
                    {{ nowPlaying?.meta.artist ?? '-' }}
                  </span>
                </div>
              </div>
              <div class="mt-4">
                <div
                  class="wrap-anywhere break-all ml-1 flex items-center gap-2"
                >
                  <Icon
                    name="material-symbols:youtube-tv-outline"
                    class="w-[20px] h-[20px]"
                  />
                  <div v-if="!nowPlaying" class="ml-1">-</div>
                  <NuxtLink
                    v-else
                    external
                    target="_blank"
                    :to="nowPlaying?.video.url"
                    class="underline hover:text-red-600 ml-1 flex items-center"
                  >
                    {{ nowPlaying.video.title }}
                    <Icon
                      name="system-uicons:external"
                      class="w-[20px] h-[20px]"
                    />
                  </NuxtLink>
                </div>
                <div class="mt-1 ml-1 flex h-[24px] items-center gap-2">
                  <Icon name="ic:round-access-time" class="w-[20px] h-[20px]" />
                  <span class="ml-1">
                    {{
                      nowPlaying?.video.publishedAt.format('YYYY年MM月DD日') ??
                      '-'
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex-1 overflow-y-scroll relative w-full rounded-sm lg:ml-2"
          >
            <table class="absolute w-full bg-[#ffffff] table-fixed">
              <thead>
                <tr>
                  <th class="w-[40px] playlist-header"></th>
                  <th class="min-w-[280px] playlist-header"></th>
                  <th class="w-[45px] playlist-header text-center">
                    <Icon
                      name="mdi:clock-time-three-outline"
                      class="w-[20px] h-[20px]"
                    />
                  </th>
                  <th
                    v-if="!searchCondition.channelId"
                    class="w-[140px] playlist-header"
                  ></th>
                  <th class="w-[140px] playlist-header hidden md:table-cell">
                    配信日
                  </th>
                  <th
                    class="min-w-[240px] playlist-header hidden md:table-cell"
                  >
                    配信
                  </th>
                </tr>
              </thead>
              <tbody v-if="status === 'success'">
                <tr
                  v-for="(song, index) in songs"
                  :id="`${song.id}`"
                  :key="song.id"
                  :class="nowPlaying?.id === song.id ? 'bg-red-50' : ''"
                  class="border-b-2 playlist-row"
                >
                  <td class="text-center align-middle">
                    <button
                      @click="
                        () => start({ startIndex: index, playlist: songs })
                      "
                    >
                      <Icon
                        name="material-symbols:play-circle-outline"
                        class="size-8"
                        :class="
                          nowPlaying?.id === song.id ? 'accent-color' : ''
                        "
                      />
                    </button>
                  </td>
                  <td
                    class="border-l px-2 py-2"
                    :class="nowPlaying?.id === song.id ? 'text-[#d86b98]' : ''"
                  >
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
                  <td v-if="!searchCondition.channelId" class="text-sm">
                    {{ song.video.channel.owner.fanMark }}
                    {{ song.video.channel.owner.displayName }}
                  </td>
                  <td class="hidden md:table-cell text-sm">
                    {{ song.video.publishedAt.format('YYYY年MM月DD日') }}
                  </td>
                  <td
                    class="text-nowrap text-ellipsis overflow-hidden w-[200px] max-w-0 hidden md:table-cell text-sm"
                  >
                    {{ song.video.title }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="status !== 'success'">loading...</div>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full weak-color h-[88px] py-2">
      <div class="w-full flex items-center gap-4 justify-center">
        <div class="w-[140px] flex flex-row-reverse">
          <button
            @click="
              () => (isShuffled ? unshufflePlaylist() : shufflePlaylist())
            "
          >
            <Icon
              name="ic:round-shuffle"
              class="w-[24px] h-[24px] hover:scale-[1.15]"
              :class="isShuffled ? 'accent-color' : 'bg-gray-400'"
            />
          </button>
        </div>
        <div class="flex items-center w-[140px] gap-4">
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
        <div class="flex items-center w-[140px]">
          <button @click="playShuffle" class="w-[24px] h-[24px]">
            <Icon name="ix:random" class="w-full h-full hover:scale-[1.15]" />
          </button>
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
  @apply w-[260px] h-[32px] appearance-none rounded-md px-2;
}

.accent-color {
  @apply bg-[#d86b98];
}

.weak-color {
  @apply bg-[#ffd8dd];
}

.playlist-row {
  transition: background-color 0.3s ease;
}

.playlist-row:hover {
  @apply bg-gray-100;
}

::-webkit-scrollbar {
  width: 16px;
  height: 0px;
}

::-webkit-scrollbar-track {
  background: #f4f5f7;
  opacity: 0.1;
}

::-webkit-scrollbar-thumb {
  background: rgba(216, 107, 152, 0.2);
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(216, 107, 152, 0.7);
}
</style>
