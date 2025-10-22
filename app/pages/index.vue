<script setup lang="ts">
import { usePlayer, useSongs } from '../composables/song'

const { video, play, load } = useYoutube()
const { songs } = useSongs()
const { start } = usePlayer(songs, load)
</script>

<template>
  <div class="w-full bg-[#ffd8dd] h-[40px]"></div>
  <div class="mt-4">
    <button
      @click="
        () => {
          start(0)
        }
      "
    >
      Start Player
    </button>
  </div>
  <div ref="video" class="mt-4" />
  <div class="mt-4">
    <div v-for="song in songs">
      <div>{{ song.meta.title }} - {{ song.meta.artist }}</div>
      <div>
        <button>Play</button>
      </div>
    </div>
  </div>
</template>
