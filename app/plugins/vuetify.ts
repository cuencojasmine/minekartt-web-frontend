import 'vuetify/styles'
import { h } from 'vue'
import { createVuetify } from 'vuetify'
import type { IconSet } from 'vuetify'

// Renders plain icon strings ("shopping-bag") with the matching Lucide component.
const lucide: IconSet = {
  component: (props) => {
    const Icon = typeof props.icon === 'string' ? lucideIcons[props.icon] : undefined
    if (!Icon && import.meta.dev) {
      console.warn(`[icons] "${String(props.icon)}" is not registered in app/utils/icons.ts`)
    }
    return h(props.tag, null, Icon ? [h(Icon)] : [])
  },
}

// MineKartt palette: Teal Waters (#204654), Spring Meadow (#CAFFA6), Glacial Sky (#A9E0F1)
// and Morning Mist (#F7F9E1). Teal is stretched into a scale for text, buttons and tints
// (Glacial Sky sits in it as the 300 step); Spring Meadow is the accent (shopper CTAs,
// highlights) and always carries teal text. The same values live in main.css as
// --sk-brand-* / --sk-meadow-*.
const teal = {
  900: '#102A33', // headings, dark surfaces
  800: '#173843', // primary hover / pressed
  700: '#204654', // Teal Waters, primary: white text on it is 10.4:1
  500: '#3D7F92', // decorative accents, active borders
  300: '#A9E0F1', // Glacial Sky
  200: '#D2EFF8', // selected rows, badge backgrounds
  50: '#EAF7FB', // tiles, tinted panels
}

const meadow = {
  900: '#23461A',
  700: '#3B7520', // meadow-green text on white (5.6:1)
  500: '#CAFFA6', // Spring Meadow: teal text on it is 8.9:1
  300: '#DDFFC6',
  100: '#F1FFE6',
}

// The brand scale is the same in both themes (bg-brand-200, color="brand-900", …).
// Status colors stay outside the palette so they are never mistaken for brand UI.
const brandColors = {
  'brand-900': teal[900],
  'brand-800': teal[800],
  'brand-700': teal[700],
  'brand-500': teal[500],
  'brand-300': teal[300],
  'brand-200': teal[200],
  'brand-50': teal[50],
  'meadow-900': meadow[900],
  'meadow-700': meadow[700],
  'meadow-300': meadow[300],
  'meadow-100': meadow[100],
}

export default defineNuxtPlugin((app) => {
  // ssr: false, so the saved theme is known before the first render (no light flash)
  const initialTheme = getInitialTheme()
  applyThemeAttribute(initialTheme)

  const vuetify = createVuetify({
    icons: {
      defaultSet: 'lucide',
      sets: { lucide },
      aliases: vuetifyLucideAliases,
    },
    theme: {
      // Saved choice, else the OS preference (see utils/theme.ts). ThemeToggle switches it.
      defaultTheme: initialTheme,
      themes: {
        light: {
          dark: false,
          colors: {
            primary: teal[700], // buttons, links: white text on it is 10.4:1
            'primary-darken-1': teal[800], // hover / pressed
            secondary: teal[900], // headings, dark surfaces
            accent: teal[700], // icons, focus rings
            // Shopper CTAs (Search, Subscribe): Spring Meadow with Teal Waters text (8.9:1)
            meadow: meadow[500],
            'on-meadow': teal[700],
            // Wishlist hearts and sale badges: the one warm color next to teal and meadow
            rose: '#C8466B',
            background: '#F7F9E1', // Morning Mist
            surface: '#FFFFFF',
            'surface-variant': teal[900], // tooltips, snackbars
            ...brandColors,
            success: '#3F7D20',
            warning: '#B45309',
            error: '#D03A3A',
            info: teal[700],
          },
        },
        // Deep teal surfaces with Glacial Sky as the primary; dark text on primary buttons.
        // The same surface values live in main.css under html[data-theme='dark'].
        dark: {
          dark: true,
          colors: {
            primary: teal[300], // Glacial Sky: 10.6:1 on the page background
            'on-primary': '#0C1F26',
            'primary-darken-1': '#8FD3E8',
            secondary: teal[200],
            accent: teal[300],
            meadow: meadow[500],
            'on-meadow': '#0C1F26',
            rose: '#F08AA5',
            'on-rose': '#0C1F26',
            background: '#0C1F26',
            surface: '#122B34',
            'surface-bright': '#1A3A45',
            'surface-variant': teal[200], // tooltips, snackbars
            'on-surface-variant': '#0C1F26',
            ...brandColors,
            'meadow-700': meadow[500], // meadow text and icons read light on teal
            // Status colors are light here, so text on them (badges, flat buttons) is dark.
            success: '#8BC34A',
            'on-success': '#0C1F26',
            warning: '#F59E0B',
            'on-warning': '#0C1F26',
            error: '#F87171',
            'on-error': '#0C1F26',
            info: teal[300],
          },
        },
      },
    },
    // Shared component defaults so every page gets the same clean look.
    defaults: {
      VBtn: { rounded: 'pill', class: 'text-none font-weight-bold', style: 'letter-spacing: 0' },
      VCard: { rounded: 'xl' },
      VChip: { rounded: 'lg' },
      VTextField: { rounded: 'lg' },
      VTextarea: { rounded: 'lg' },
      VSelect: { rounded: 'lg' },
      VAlert: { rounded: 'lg' },
    },
  })
  app.vueApp.use(vuetify)

  // Tab icon for the current theme (navy cart mark in dark mode)
  useHead({ link: computed(() => themeFavicons(vuetify.theme.global.name.value)) })

  // Runs synchronously so the view-transition snapshot already has the new tokens.
  watch(vuetify.theme.global.name, (name) => {
    applyThemeAttribute(name)
    saveTheme(name)
  }, { flush: 'sync' })
})
