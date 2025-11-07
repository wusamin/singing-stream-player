<script setup lang="ts">
const props = defineProps<{
  visible: boolean
  dismiss: () => void
}>()

// 内部状態: メニューコンテンツが表示中か、非表示アニメーション中か
const isContentVisible = ref(props.visible)

// 親コンポーネントから visible が true になったら、コンテンツも表示する
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      isContentVisible.value = true
    }
  },
)

// メニュー外クリックやボタンクリックで非表示をリクエストされたときの処理
const handleDismiss = () => {
  // 非表示アニメーションを開始 (Transitionがこれを検知)
  isContentVisible.value = false
}
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-30"
    @click.self="handleDismiss"
  >
    <Transition name="fade" appear @after-leave="props.dismiss">
      <div v-if="isContentVisible" class="bg-gray-100 shadow-lg p-6 w-64 menu">
        <ul class="space-y-4">
          <li><button>このサイトについて</button></li>
          <li><button>管理者ログイン</button></li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="css">
.fade-enter-active {
  animation: fade-in-left 0.2s ease-out;
}

.fade-leave-active {
  animation: fade-out 0.2s ease-in;
}

@keyframes fade-in-left {
  0% {
    opacity: 0;
    transform: translateX(100px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fade-out {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(100px);
  }
}
</style>
