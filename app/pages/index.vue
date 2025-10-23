<script setup lang="ts">
import { usePlayer, useSongs } from '../composables/song'
const { songs } = await useSongs()
const { start, nowPlaying, video, playingTime } = usePlayer(songs)
</script>

<template>
  <div class="w-full bg-[#ffd8dd] h-[40px]"></div>
  <div v-if="nowPlaying">
    <div>
      Now Playing:
      {{ nowPlaying.meta.title + ' - ' + nowPlaying.meta.artist }}
    </div>
    <div>{{ playingTime?.totalTime }}</div>
  </div>
  <div class="mt-4">
    <button @click="() => start()">Start Player</button>
  </div>
  <div class="flex mt-4">
    <div ref="video" />
    <div>
      <div v-for="(song, index) in songs">
        <div>{{ song.meta.title }} - {{ song.meta.artist }}</div>
        <div>
          <button @click="() => start(index)">Play</button>
        </div>
      </div>
    </div>
  </div>
</template>
