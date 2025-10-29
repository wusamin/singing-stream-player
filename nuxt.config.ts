// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/scripts', '@nuxtjs/tailwindcss', '@nuxt/icon'],
  typescript: {
    typeCheck: true,
    tsConfig: {
      compilerOptions: {
        types: ['@types/youtube'],
      },
    },
  },
  app: {
    head: {
      title: 'ののちのお歌プレーヤー',
      meta: [{ charset: 'utf-8' }],
      htmlAttrs: { lang: 'ja' },
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
        },
      ],
    },
  },
})
