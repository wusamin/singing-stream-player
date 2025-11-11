import { applicationDefault, initializeApp } from 'firebase-admin/app'

export default defineNitroPlugin((nitroApp) => {
  initializeApp({
    credential: applicationDefault(),
  })
})
