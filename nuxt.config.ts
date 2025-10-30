// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: [
    '@nuxt/scripts',
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@nuxtjs/google-fonts',
  ],
  typescript: {
    typeCheck: true,
    tsConfig: {
      compilerOptions: {
        types: ['@types/youtube'],
      },
    },
  },
  googleFonts: {
    families: {
      'Noto+Sans+JP': '200..700', // もしくはtrueを設定する
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
