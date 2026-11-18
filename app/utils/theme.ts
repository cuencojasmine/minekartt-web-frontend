// Light / dark theme helpers shared by plugins/vuetify.ts and composables/useThemeMode.ts.
// The chosen theme is saved in localStorage; first-time visitors get their OS preference.
// The theme name is mirrored on <html data-theme="…"> so main.css can swap the --sk-* tokens.

export type ShopThemeName = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'shopkart-theme'

export function getInitialTheme(): ShopThemeName {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Storage blocked (private mode): fall back to the OS preference
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyThemeAttribute(name: string) {
  document.documentElement.dataset.theme = name
}

// Tab icons for each theme (plugins/vuetify.ts puts them in <head>). Dark mode uses the
// navy cart mark cut from logo-darkmode.png. Bump ?v= whenever an icon file changes, since
// browsers keep cached favicons long after the file is replaced.
export function themeFavicons(name: string) {
  if (name === 'dark') {
    return [{ key: 'tab-icon', rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon-dark.png?v=1' }]
  }
  return [
    { key: 'tab-icon', rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png?v=3' },
    { key: 'tab-icon-16', rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png?v=3' },
    { key: 'tab-icon-ico', rel: 'icon', sizes: 'any', href: '/favicon.ico?v=3' },
  ]
}

export function saveTheme(name: string) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, name)
  } catch {
    // Not saved; the toggle still works for this visit
  }
}
