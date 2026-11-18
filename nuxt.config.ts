import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
export default defineNuxtConfig({
  // Client-side rendering: products come from Strapi in the browser and the
  // cart / wishlist are saved in localStorage, so there is nothing to pre-render.
  ssr: false,

  // Hides the Nuxt DevTools button (the Nuxt logo pinned to the bottom of the page in
  // dev mode). It never shows on the deployed site either way.
  devtools: { enabled: false },

  app: {
    // Fade between pages (.page-* in main.css); out-in so the two pages never overlap
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [
        // The tab icons follow the light / dark theme, so plugins/vuetify.ts adds them
        // (list in utils/theme.ts). ?v=3 makes browsers drop an old cached icon.
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png?v=3' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      // Overridden by NUXT_PUBLIC_STRAPI_URL (set it on Vercel).
      strapiUrl: 'http://localhost:1337',
    },
  },

  // Basic security headers for every page.
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
  },
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    plugins: [
      vuetify({ autoImport: true }),
    ],
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
})
