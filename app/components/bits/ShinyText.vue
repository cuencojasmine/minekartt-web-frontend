<!-- A band of light that sweeps across text, ported from Vue Bits
     (vue-bits.dev/text-animations/shiny-text). Unlike the original it keeps the text's own
     color (set --shine-base and --shine-light on a parent) and pauses between sweeps.
     It starts `delay` seconds after `active` turns true, so it can wait for a Blur Text
     inside it to land (its @complete); the clip would not cover words still blurring in. -->
<template>
  <span class="shiny-text" :class="{ 'is-on': on }" :style="{ '--shine-cycle': `${cycle}s` }">
    <slot />
  </span>
</template>

<script setup lang="ts">
const {
  active = true,
  delay = 0,
  cycle = 6,
} = defineProps<{
  active?: boolean
  delay?: number // seconds after `active` before the first sweep
  cycle?: number // seconds per sweep, including the pause after it
}>()

const on = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  watch(
    () => active,
    (isActive) => {
      clearTimeout(timer)
      if (isActive) timer = setTimeout(() => (on.value = true), delay * 1000)
    },
    { immediate: true },
  )
})

onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
/* Until it starts the text is just its normal color; when it starts, the gradient's
   resting color is that same color, so there is no visible switch. */
.shiny-text.is-on {
  color: transparent;
  background-image: linear-gradient(
    110deg,
    var(--shine-base) 0%,
    var(--shine-base) 40%,
    var(--shine-light) 50%,
    var(--shine-base) 60%,
    var(--shine-base) 100%
  );
  background-size: 250% 100%;
  background-position: 100% 0;
  -webkit-background-clip: text;
  background-clip: text;
  animation: shiny-sweep var(--shine-cycle) ease-in-out infinite;
}

/* Sweep across in the first 40% of the cycle, then rest */
@keyframes shiny-sweep {
  0% {
    background-position: 100% 0;
  }

  40%,
  100% {
    background-position: 0% 0;
  }
}
</style>
