<!-- MineKartt logo (cart mark + wordmark) used in the App Bar, footer, and Product Management header. -->
<template>
  <NuxtLink to="/" class="brand d-inline-flex align-center" :class="{ 'brand-small': small }" aria-label="MineKartt home">
    <span class="brand-mark">
      <img src="/logo.png" alt="" width="40" height="40" class="brand-img brand-img--light" />
      <img src="/logo-dark.png" alt="" width="40" height="40" class="brand-img brand-img--dark" />
    </span>
    <span class="brand-name"><span class="brand-mine">Mine</span><span class="brand-kartt">Kartt</span></span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ small?: boolean }>()
</script>

<style scoped>
.brand {
  gap: 10px;
  text-decoration: none;
  white-space: nowrap;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 0 0 2px #ffffff,
    0 6px 14px -6px rgba(var(--sk-brand-700-rgb), 0.7);
}

.brand-img {
  display: block;
  width: 100%;
  height: 100%;
}

/* Cream mark in light mode, navy mark (from logo-darkmode.png) in dark mode.
   Both are in the page so the theme toggle swaps them with no reload. */
.brand-img--dark,
html[data-theme='dark'] .brand-img--light {
  display: none;
}

html[data-theme='dark'] .brand-img--dark {
  display: block;
}

/* Rounded display face and the logo's two colors (deeper tones so they read on light glass) */
.brand-name {
  font-family: var(--sk-font-display);
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.01em;
}

.brand-mine {
  color: var(--sk-meadow-700);
}

.brand-kartt {
  color: var(--sk-brand-700);
}

html[data-theme='dark'] .brand-mine {
  color: var(--sk-meadow-500);
}

html[data-theme='dark'] .brand-kartt {
  color: var(--sk-brand-300);
}

html[data-theme='dark'] .brand-mark {
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.85),
    0 6px 14px -6px rgba(0, 0, 0, 0.6);
}

.brand-small .brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
}

.brand-small .brand-name {
  font-size: 21px;
}
</style>
