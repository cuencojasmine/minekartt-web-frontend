// v-reveal: fades and lifts an element in the first time it scrolls into view.
// The value is an optional delay in seconds, for staggering tiles: v-reveal="index * 0.05".
// One shared IntersectionObserver for the whole page. With reduced motion (or no observer
// support) the directive does nothing, so the element simply shows. Styles: .sk-reveal in main.css.
export default defineNuxtPlugin((nuxtApp) => {
  const enabled =
    'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const observer = enabled
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            entry.target.classList.add('is-visible')
            observer?.unobserve(entry.target)
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
      )
    : null

  nuxtApp.vueApp.directive<HTMLElement, number | undefined>('reveal', {
    mounted(el, { value }) {
      if (!observer) return
      el.classList.add('sk-reveal')
      if (value) el.style.setProperty('--reveal-delay', `${value}s`)
      observer.observe(el)
    },
    unmounted(el) {
      observer?.unobserve(el)
    },
  })
})
