// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: [
    '@nuxt/scripts',
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@nuxtjs/google-fonts',
    'nuxt-anchorscroll',
  ],
  typescript: {
    typeCheck: process.env.NUXT_TYPESCRIPT_TYPECHECK !== 'false',
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
      script: [{ src: 'https://www.youtube.com/iframe_api' }],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
        },
        {
          rel: 'icon',
          href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text x=%2250%%22 y=%2250%%22 style=%22dominant-baseline:central;text-anchor:middle;font-size:90px;%22>🐰</text></svg>',
        },
      ],
    },
  },
})
