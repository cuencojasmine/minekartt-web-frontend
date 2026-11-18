<!-- Words that blur in one after another, ported from Vue Bits
     (vue-bits.dev/text-animations/blur-text). The original uses motion-v; this one is plain
     CSS and starts when scrolled into view.
     Animating filter: blur() cannot run on the GPU compositor (Chrome keeps it on the main
     thread, so it stutters whenever the page is busy rendering). Instead each word is two
     copies: a sharp one and one with a fixed blur behind it. Only opacity and transform
     animate (sharp fades in, blurred copy fades out, the word rises), which the compositor
     runs on its own, so the words keep moving smoothly while products load.
     Once every word has landed it renders as plain text again, so nothing stays blurred,
     transformed or composited (a parent like Shiny Text can then clip it cleanly).
     Screen readers get the whole sentence once; the animated words are aria-hidden. -->
<template>
  <span ref="rootRef" class="blur-text">
    <template v-if="done">{{ text }}</template>
    <template v-else>
      <span class="blur-text-sr">{{ text }}</span>
      <span aria-hidden="true">
        <template v-for="(word, index) in words" :key="index">
          <span
            class="blur-text-word"
            :class="{ 'is-in': inView }"
            :style="{ '--word-delay': `${start + index * step}s`, '--word-dur': `${duration}s` }"
          ><span class="blur-text-sharp">{{ word }}</span><span class="blur-text-soft">{{ word }}</span></span>{{ index < words.length - 1 ? ' ' : '' }}
        </template>
      </span>
    </template>
  </span>
</template>

<script setup lang="ts">
const {
  text,
  start = 0, // seconds before the first word
  step = 0.05, // seconds between words
  duration = 0.55, // seconds each word takes (same as --sk-dur-slow, the fade-up speed)
  threshold = 0.2,
} = defineProps<{
  text: string
  start?: number
  step?: number
  duration?: number
  threshold?: number
}>()

const emit = defineEmits<{ complete: [] }>()

const rootRef = useTemplateRef<HTMLSpanElement>('rootRef')
const words = computed(() => text.split(' '))
const inView = ref(false)
const done = ref(false)

let observer: IntersectionObserver | undefined
let doneTimer: ReturnType<typeof setTimeout> | undefined

function finish() {
  done.value = true
  emit('complete')
}

function play() {
  inView.value = true
  const total = start + (words.value.length - 1) * step + duration
  doneTimer = setTimeout(finish, total * 1000 + 50)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    finish()
    return
  }
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      observer?.disconnect()
      play()
    },
    { threshold },
  )
  if (rootRef.value) observer.observe(rootRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  clearTimeout(doneTimer)
})
</script>

<style scoped>
/* The word rises in one smooth movement with a tiny settle at the end (the curve overshoots
   by a few percent), instead of the original's stop half-way up. */
.blur-text-word {
  position: relative;
  display: inline-block;
}

.blur-text-sharp,
.blur-text-soft {
  opacity: 0;
}

/* The blurred copy sits exactly on top of the sharp one */
.blur-text-soft {
  position: absolute;
  inset: 0;
  filter: blur(8px);
  pointer-events: none;
}

.blur-text-word.is-in {
  will-change: transform;
  animation: blur-text-rise var(--word-dur) cubic-bezier(0.3, 1.25, 0.5, 1) var(--word-delay) both;
}

.is-in .blur-text-sharp {
  will-change: opacity;
  animation: blur-text-sharpen var(--word-dur) cubic-bezier(0.4, 0, 0.3, 1) var(--word-delay) both;
}

.is-in .blur-text-soft {
  will-change: opacity;
  animation: blur-text-unblur var(--word-dur) ease-out var(--word-delay) both;
}

@keyframes blur-text-rise {
  from {
    transform: translateY(0.4em);
  }

  to {
    transform: none;
  }
}

/* Sharp copy: hidden at first, fully in by the end */
@keyframes blur-text-sharpen {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* Blurred copy: shows up first, then hands over to the sharp one */
@keyframes blur-text-unblur {
  0% {
    opacity: 0;
  }

  30% {
    opacity: 0.9;
  }

  100% {
    opacity: 0;
  }
}

.blur-text-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
