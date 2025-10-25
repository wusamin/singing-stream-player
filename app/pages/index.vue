<script setup lang="ts">
import { usePlayer, useSongs } from '@/composables/song'

const { songs, status } = await useSongs()
const { start, nowPlaying, video, playingTime, playingTimeText } =
  usePlayer(songs)
</script>

<template>
  <div>
    <div class="w-full bg-[#ffd8dd] h-[40px]"></div>
    <div v-if="nowPlaying">
      <div>
        Now Playing:
        {{ nowPlaying.meta.title + ' - ' + nowPlaying.meta.artist }}
      </div>
      <div>{{ playingTime?.totalTime }}</div>
      <div>{{ playingTimeText }}</div>
    </div>

    <div class="mt-4">
      <button @click="() => start()">Start Player</button>
    </div>
    <div class="flex mt-4">
      <div ref="video" class="w-[640px]"></div>
      <div class="ml-4 flex-1">
        <table v-if="status === 'success'">
          <thead>
            <tr>
              <th class="w-[32px]"></th>
              <th class="text-left min-w-[240px]">タイトル</th>
              <th class="text-left w-[60px]">時間</th>
              <th class="text-left w-[140px]">配信日</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(song, index) in songs"
              :key="song.id"
              :class="nowPlaying?.id === song.id ? 'bg-red-50' : ''"
            >
              <td class="text-center align-middle px-2">
                <button @click="() => start(index)">
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
              <td>
                {{ song.video.publishedAt.format('YYYY年MM月DD日') }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else>loading...</div>
      </div>
    </div>
  </div>
</template>
