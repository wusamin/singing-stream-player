import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  multiFactor,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  TotpMultiFactorGenerator,
  type User,
} from 'firebase/auth'

export const useUser = async () => {
  const currentUser = ref<User | null>(null)

  await getAuth().authStateReady()
  currentUser.value = getAuth().currentUser

  const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
    currentUser.value = user
    console.log(JSON.stringify(user, null, 2))
  })

  onUnmounted(() => {
    unsubscribe()
  })

  return { currentUser }
}

export const useSignIn = () => {
  const pending = ref<boolean>(false)
  const signIn = async () => {
    if (pending.value) {
      return
    }
    await signInWithPopup(getAuth(), new GoogleAuthProvider())
  }
  const promise = useUser()
  // onNuxtReady(async () => {
  //   const result = await getRedirectResult(getAuth())
  //   console.log('result', result)
  //   const { currentUser } = await promise
  //   console.log('currentUser', currentUser.value)
  //   // // サインインしていない場合
  //   if (currentUser.value === null) {
  //     pending.value = false
  //     return
  //   }
  //   await navigateTo('/')
  // })
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
