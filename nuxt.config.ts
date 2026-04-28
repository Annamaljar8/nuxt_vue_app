export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],

  css: [
    'vuetify/styles'
  ],

  build: {
    transpile: ['vuetify']
  },

  vite: {
    ssr: {
      noExternal: ['vuetify']
    }
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})