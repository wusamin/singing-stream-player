<script setup lang="ts">
const { video, play, load } = useYoutube()
</script>

<template>
  <div>
    <div ref="video" />
    <button @click="play">Play</button>
    <button
      type="button"
      @click="
        () => {
          load('')
        }
      "
    >
      Load
    </button>
  </div>
</template>

<style scoped></style>
