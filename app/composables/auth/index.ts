import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'

export const useUser = () => {
  const currentUser = ref<User | null>(null)

  // 初期化処理を非同期で実行するが、コンポーザブル自体は同期的に返す
  getAuth()
    .authStateReady()
    .then(() => {
      currentUser.value = getAuth().currentUser
    })

  const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
    currentUser.value = user
  })

  onUnmounted(() => {
    unsubscribe()
  })

  return { currentUser }
}

export const useSignIn = () => {
  const route = useRoute()
  const { currentUser } = useUser()
  const pending = ref<boolean>(false)
  const signIn = async () => {
    if (pending.value) {
      return
    }
    await signInWithPopup(getAuth(), new GoogleAuthProvider())
  }

  onNuxtReady(async () => {
    const result = await getRedirectResult(getAuth())
    // // サインインしていない場合
    if (currentUser.value === null) {
      pending.value = false
      return
    }
    await navigateTo({
      path: '/',
      query: route.query,
    })
  })
  return { signIn, pending }
}

export const useSignOut = (onSuccess = () => console.debug('signOut')) => {
  return {
    signOut: async () => {
      await signOut(getAuth())
      onSuccess()
    },
  }
}
