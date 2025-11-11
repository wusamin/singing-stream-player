import { getApps, initializeApp } from 'firebase/app'

export default defineNuxtPlugin(() => {
  if (getApps().length === 0) {
    initializeApp({
      apiKey: 'AIzaSyAwhMQQNVwAGucduDDdUypQdthRt2RwleI',
      // authDomain: 'nonochi-daisuki-851028746708.asia-northeast1.run.app',
      authDomain: 'wusamin.com',
      projectId: 'hydra-652a4',
      storageBucket: 'hydra-652a4.appspot.com',
      messagingSenderId: '851028746708',
      appId: '1:851028746708:web:08992eb150b41ee0143641',
      measurementId: 'G-CQG6GTJ6QK',
      databaseURL:
        'https://hydra-652a4-default-rtdb.asia-southeast1.firebasedatabase.app/',
    })
  }
})
