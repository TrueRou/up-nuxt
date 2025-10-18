// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-auth-utils', '@pinia/nuxt', '@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  i18n: {
    defaultLocale: 'zh-CN',
    strategy: 'no_prefix',
    locales: [
      {
        code: "en-GB",
        flag: "GB",
        name: 'English (International)',
        file: 'en-GB.json'
      },
      {
        code: "zh-CN",
        flag: "CN",
        name: '简体中文 (中国)',
        file: 'zh-CN.json'
      },
    ]
  },
  runtimeConfig: {
    leporidApi: 'http://localhost:8080',
    leporidDefaultImage: {
      characterId: 'value',
      maskId: 'value',
      backgroundId: 'value',
      frameId: 'value',
      passnameId: 'value',
    },
    public: {
      imageApi: 'http://localhost:8080',
    }
  }
})