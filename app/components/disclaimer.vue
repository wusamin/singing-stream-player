<script setup lang="ts">
const props = defineProps<{
  visible: boolean
  dismiss: () => void
}>()
</script>

<template>
  <Transition name="fade-modal" appear @after-leave="props.dismiss">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-30"
      @click.self="dismiss"
    >
      <div class="bg-gray-100 shadow-lg p-6 w-64 w-7/12 h-[65%] rounded-lg">
        <h2 class="text-2xl">このサイトについて</h2>
        <p class="mt-4">
          当サイトは当該YouTuberのファンが非公式に運営しているサイトです。<br />
          当サイトにつきまして、YouTuber様本人、及び所属組織等にお問い合わせされるのはお控えください。<br />
        </p>
        <p class="mt-2">
          当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねます。ご了承ください。
        </p>
        <p class="mt-4">
          何かございましたら、お手数ではありますが<NuxtLink
            external
            href="https://x.com/mongol_gh"
            class="underline mx-1"
            >制作者（@mongol_gh）</NuxtLink
          >までご連絡ください。
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="css">
.fade-modal-enter-active {
  animation: fade-in-disclaimer 0.1s ease-out;
}

.fade-modal-leave-active {
  animation: fade-out-disclaimer 0.1s ease-in;
}

@keyframes fade-in-disclaimer {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes fade-out-disclaimer {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
