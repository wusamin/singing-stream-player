// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/scripts', '@nuxtjs/tailwindcss', '@nuxt/icon'],
  typescript: {
    typeCheck: true,
    tsConfig: {
      compilerOptions: {
        types: ['@types/youtube']
      }
    }
  }
})