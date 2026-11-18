<!-- app/pages/index.vue — MineKartt homepage -->
<template>
  <div>
    <!-- ========================================
         HERO (full-bleed photo; landscape and portrait crops)
    ========================================= -->
    <section class="hero" aria-labelledby="hero-title">
      <!-- The portrait photo leaves its empty wall at the top, the landscape one on the left,
           so the copy moves with it (see the orientation media queries below). -->
      <!-- Light theme: cream-wall photos (hero-mist-*); dark theme: deep-teal ones (hero-dark-*) -->
      <picture class="hero-photo" aria-hidden="true">
        <source v-for="source in heroSources" :key="source.media" :media="source.media" :srcset="heroUrl(heroSet, source.file)" />
        <img :src="heroUrl(heroSet, HERO_DEFAULT)" alt="" fetchpriority="high" decoding="async" />
      </picture>
      <div class="hero-scrim" aria-hidden="true" />

      <v-container class="hero-inner">
        <div class="hero-copy">
          <!-- Entrance order: chip, headline (Blur Text, word by word), then the rest rises in.
               --rise-delay staggers the .sk-rise pieces (main.css). -->
          <span class="hero-chip sk-rise">
            <span class="hero-chip-dot" aria-hidden="true" />
            New arrivals every week
          </span>

          <!-- The accent line keeps going where the first line's words stop (start = 0.1 + 3 words x 0.05),
               then the shine begins once its words have landed -->
          <h1 id="hero-title" class="hero-title">
            <BitsBlurText text="Everything you love," :start="0.1" /> <span class="hero-title-accent"><BitsShinyText :active="heroLanded" :delay="0.4"><BitsBlurText text="in one Kartt." :start="0.25" @complete="heroLanded = true" /></BitsShinyText></span>
          </h1>

          <p class="hero-subtitle sk-rise" style="--rise-delay: 0.4s">
            Gadgets, fashion, sports gear, beauty, and home essentials with free delivery
            and secure checkout.
          </p>

          <form class="hero-search sk-rise" style="--rise-delay: 0.5s" role="search" @submit.prevent="scrollToProducts">
            <v-icon icon="search" class="hero-search-icon" />
            <input
              v-model="search"
              type="search"
              class="hero-search-input"
              placeholder="Search products"
              aria-label="Search products"
            >
            <v-btn type="submit" color="meadow" variant="flat" :icon="xs" class="hero-search-btn" aria-label="Search">
              <v-icon v-if="xs" icon="arrow-right" />
              <span v-else>Search</span>
            </v-btn>
          </form>

          <div class="hero-popular sk-rise" style="--rise-delay: 0.6s">
            <span class="hero-popular-label">Popular</span>
            <button
              v-for="name in popularCategories"
              :key="name"
              type="button"
              class="hero-popular-chip"
              @click="selectCategory(name)"
            >
              {{ name }}
            </button>
          </div>
        </div>
      </v-container>

      <button type="button" class="hero-scroll" aria-label="Scroll to products" @click="scrollToProducts">
        <v-icon icon="chevron-down" size="22" />
      </button>
    </section>

    <!-- ========================================
         WHY MINEKARTT (bento)
    ========================================= -->
    <section class="why">
      <v-container class="pt-8 pt-md-10 pb-8 pb-md-12">
        <div class="why-bento">
          <div v-reveal class="why-intro">
            <div class="sk-eyebrow why-eyebrow">Why MineKartt</div>
            <h2 class="why-title"><BitsBlurText text="Why shoppers choose us" :start="0.15" /></h2>
            <p class="why-text">
              One cart for every part of your day, with prices you can count on and help
              whenever you need it.
            </p>
            <v-btn color="meadow" variant="flat" append-icon="arrow-right" class="mt-6" @click="scrollToProducts">
              Start shopping
            </v-btn>
          </div>

          <div v-for="(feature, index) in features" :key="feature.title" v-reveal="0.08 + index * 0.06" class="why-tile">
            <span class="why-icon" :class="`why-icon-${feature.tone}`">
              <v-icon :icon="feature.icon" size="22" />
            </span>
            <h3 class="why-tile-title">{{ feature.title }}</h3>
            <p class="why-tile-text">{{ feature.text }}</p>
          </div>

          <div v-reveal="0.32" class="why-stats">
            <div class="why-stat">
              <div class="why-stat-value">
                <span v-if="isFirstLoad" class="sk-skel stat-skel" aria-label="Loading" />
                <BitsCountUp v-else :to="products.length" :duration="1.2" />
              </div>
              <div class="why-stat-label">Products</div>
            </div>
            <div class="why-stat">
              <div class="why-stat-value"><BitsCountUp :to="SHOP_CATEGORIES.length" :duration="1.2" :delay="0.15" /></div>
              <div class="why-stat-label">Categories</div>
            </div>
            <div class="why-stat">
              <div class="why-stat-value"><BitsCountUp :to="PAYMENT_METHODS.length" :duration="1.2" :delay="0.3" /></div>
              <div class="why-stat-label">Ways to pay</div>
            </div>
          </div>
        </div>
      </v-container>
    </section>

    <!-- ========================================
         CATEGORIES (bento of clay tiles)
    ========================================= -->
    <section id="categories">
      <v-container class="pb-8 pb-md-12">
        <div class="section-head section-head-center">
          <div v-reveal class="sk-eyebrow">Browse</div>
          <h2 class="sk-section-title"><BitsBlurText text="Shop by Category" /></h2>
        </div>

        <div class="category-bento">
          <button
            v-for="(category, index) in SHOP_CATEGORIES"
            :key="category.name"
            type="button"
            v-reveal="index * 0.05"
            class="category-tile sk-clay"
            :class="[`category-tile-${index}`, { 'category-active': selectedCategory === category.name }]"
            :aria-pressed="selectedCategory === category.name"
            @click="selectCategory(category.name)"
          >
            <span class="category-text">
              <v-avatar :color="category.color" variant="tonal" size="40" class="category-icon">
                <v-icon :icon="category.icon" size="20" />
              </v-avatar>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count">
                {{ categoryCounts[category.name] || 0 }} {{ categoryCounts[category.name] === 1 ? 'item' : 'items' }}
              </span>
            </span>

            <span class="category-art">
              <img
                v-if="categoryImages[category.name]"
                :src="categoryImages[category.name]"
                alt=""
                loading="lazy"
                class="category-img"
              >
              <span v-else-if="isFirstLoad" class="sk-skel category-skel" aria-hidden="true" />
              <v-icon v-else :icon="category.icon" class="category-fallback" />
            </span>

            <span class="category-go" aria-hidden="true">
              <v-icon icon="arrow-up-right" size="16" />
            </span>
          </button>
        </div>
      </v-container>
    </section>

    <!-- ========================================
         PRODUCTS (category tabs, search + sort)
    ========================================= -->
    <section id="products" class="products">
      <v-container class="pb-8 pb-md-12">
        <div class="section-head section-head-center">
          <div v-reveal class="sk-eyebrow">Catalog</div>
          <h2 class="sk-section-title"><BitsBlurText text="Our Products" /></h2>
        </div>

        <!-- Category tabs (Panto-style pill), scrollable on small screens -->
        <div v-reveal class="tabs-wrap">
          <div class="tabs sk-glass sk-scroll-x" role="group" aria-label="Filter by category">
            <button
              v-for="option in categoryOptions"
              :key="option"
              type="button"
              class="tab"
              :class="{ 'tab-active': selectedCategory === option }"
              :aria-pressed="selectedCategory === option"
              @click="setCategory(option)"
            >
              {{ option === ALL_CATEGORIES ? 'All' : option }}
            </button>
          </div>
        </div>

        <div v-reveal="0.06" class="toolbar">
          <form class="toolbar-search" role="search" @submit.prevent>
            <v-icon icon="search" size="20" class="toolbar-search-icon" />
            <input
              v-model="search"
              type="search"
              class="toolbar-search-input"
              placeholder="Search by name, description, or category"
              aria-label="Search products"
            >
          </form>
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            label="Sort by"
            :prepend-inner-icon="xs ? undefined : 'arrow-up-down'"
            variant="solo"
            flat
            density="comfortable"
            hide-details
            class="toolbar-sort"
          />
        </div>

        <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-4">
          <div v-if="(selectedCategory !== ALL_CATEGORIES || search) && !loading && !error" class="d-flex flex-wrap align-center ga-2">
            <span class="text-body-2 text-medium-emphasis">Filters:</span>
            <v-chip
              v-if="selectedCategory !== ALL_CATEGORIES"
              closable
              size="small"
              color="primary"
              @click:close="clearCategory"
            >
              {{ selectedCategory }}
            </v-chip>
            <v-chip v-if="search" closable size="small" color="primary" @click:close="search = ''">
              "{{ search }}"
            </v-chip>
            <v-btn size="small" variant="text" @click="clearFilters">Clear all</v-btn>
          </div>
          <span v-else />
          <span v-if="isFirstLoad" class="sk-skel" style="width: 110px; height: 14px" />
          <span v-else-if="!error" class="text-body-2 text-medium-emphasis">
            Showing {{ filteredProducts.length }} of {{ products.length }}
          </span>
        </div>

        <!-- LOADING: placeholders shaped like ProductCard -->
        <v-row v-if="isFirstLoad" :dense="xs" aria-busy="true" aria-label="Loading products">
          <v-col v-for="n in 8" :key="n" cols="6" md="4" lg="3">
            <ProductCardSkeleton />
          </v-col>
        </v-row>

        <!-- API ERROR -->
        <div v-else-if="error" class="state-card sk-surface">
          <v-avatar color="error" variant="tonal" size="72">
            <v-icon icon="cloud-alert" size="36" />
          </v-avatar>
          <h3 class="mt-4">Could not load products</h3>
          <p class="text-medium-emphasis mt-2">{{ error }}</p>
          <v-btn color="primary" class="mt-5" prepend-icon="refresh-cw" :loading="loading" @click="loadProducts">
            Try Again
          </v-btn>
        </div>

        <!-- EMPTY -->
        <div v-else-if="!filteredProducts.length" class="state-card sk-surface">
          <v-avatar color="primary" variant="tonal" size="72">
            <v-icon icon="package-x" size="36" />
          </v-avatar>
          <h3 class="mt-4">No products found</h3>
          <p class="text-medium-emphasis mt-2">
            {{ products.length ? 'Try another search or category.' : 'There are no active products yet.' }}
          </p>
          <v-btn v-if="products.length" color="primary" variant="tonal" class="mt-5" @click="clearFilters">
            Show All Products
          </v-btn>
          <v-btn v-else color="primary" variant="tonal" class="mt-5" to="/products">
            Add Products
          </v-btn>
        </div>

        <!-- PRODUCT GRID -->
        <v-row v-else :dense="xs">
          <v-col v-for="product in filteredProducts" :key="product.documentId" cols="6" md="4" lg="3">
            <ProductCard :product="product" />
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ========================================
         DEALS (bento in the three palette swatches)
    ========================================= -->
    <section id="deals">
      <v-container class="pb-8 pb-md-12">
        <div class="section-head section-head-center">
          <div v-reveal class="sk-eyebrow">Promos</div>
          <h2 class="sk-section-title"><BitsBlurText text="Deals For You" /></h2>
        </div>

        <div class="promo-bento">
          <div v-for="(promo, index) in promos" :key="promo.category" v-reveal="index * 0.08" class="promo" :class="`promo-${promo.theme}`">
            <div class="promo-content">
              <div class="promo-eyebrow">{{ promo.eyebrow }}</div>
              <h3 class="promo-title">{{ promo.title }}</h3>
              <p class="promo-text">{{ promo.text }}</p>
              <v-btn
                :color="promo.button"
                variant="flat"
                append-icon="arrow-right"
                @click="selectCategory(promo.category)"
              >
                Shop {{ promo.category }}
              </v-btn>
            </div>
            <div class="promo-art">
              <v-img
                v-if="categoryImages[promo.category]"
                :src="categoryImages[promo.category]"
                :alt="`${promo.category} product`"
                class="promo-img sk-product-img"
              />
              <span v-else-if="isFirstLoad" class="sk-skel promo-skel" aria-hidden="true" />
              <v-icon v-else :icon="promo.icon" class="promo-icon" />
            </div>
          </div>
        </div>
      </v-container>
    </section>

    <!-- ========================================
         NEWSLETTER
    ========================================= -->
    <v-container class="pb-8 pb-md-12">
      <section v-reveal class="newsletter">
        <!-- The googly eyes from the MineKartt cart -->
        <span class="newsletter-eyes" aria-hidden="true"><span /><span /></span>
        <div class="newsletter-orb" />
        <v-row align="center" class="position-relative">
          <v-col cols="12" md="6" class="text-center text-md-left">
            <div class="newsletter-eyebrow">Newsletter</div>
            <h2 class="newsletter-title"><BitsBlurText text="Get deals in your inbox" :start="0.15" /></h2>
            <p class="newsletter-text mt-2">
              Updates on new products, exclusive deals, and promos straight to your inbox.
            </p>
          </v-col>
          <v-col cols="12" md="6">
            <v-form ref="newsletterForm" class="newsletter-form d-flex flex-column flex-sm-row ga-2" @submit.prevent="subscribe">
              <v-text-field
                v-model="newsletterEmail"
                placeholder="Enter your email address"
                type="email"
                variant="solo"
                flat
                density="comfortable"
                prepend-inner-icon="mail"
                :rules="emailRules"
                class="flex-grow-1"
              />
              <v-btn type="submit" size="large" color="meadow" variant="flat" class="newsletter-btn">Subscribe</v-btn>
            </v-form>
          </v-col>
        </v-row>
      </section>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useDisplay, useTheme } from 'vuetify'

useHead({ title: 'MineKartt | Online Store' })

// Hero photo for each screen shape, first match wins (same order as <source> in the template)
const heroSources = [
  { media: '(orientation: portrait) and (max-width: 640px)', file: 'portrait-sm' },
  { media: '(orientation: portrait)', file: 'portrait' },
  { media: '(max-width: 1100px)', file: 'landscape-sm' },
]
const HERO_DEFAULT = 'landscape'
const theme = useTheme()
// The accent line's shine waits for its Blur Text to finish
const heroLanded = ref(false)
const heroSet = computed(() => (theme.global.current.value.dark ? 'dark' : 'mist'))
const heroUrl = (set: string, file: string) => `/images/hero-${set}-${file}.jpg`

// Once the page has loaded, fetch the other theme's photo for this screen in the background,
// so switching light/dark swaps the hero instantly instead of waiting on a download.
function preloadOtherHero() {
  const file = heroSources.find((source) => window.matchMedia(source.media).matches)?.file ?? HERO_DEFAULT
  new Image().src = heroUrl(heroSet.value === 'dark' ? 'mist' : 'dark', file)
}

const ALL_CATEGORIES = 'All Categories'

const route = useRoute()
const router = useRouter()
const notify = useNotify()
const { xs } = useDisplay()
const { getProductImageUrl } = useStrapi()
const { products, loading, error, loadProducts } = useShopProducts()

// Skeletons only on the first load. Later refreshes keep showing the products already on screen.
// `!error` hides them when the request fails, `!loading` covers the moment before onMounted fires.
const loaded = ref(false)
watch(loading, (isLoading) => {
  if (!isLoading) loaded.value = true
})
const isFirstLoad = computed(() => !products.value.length && !error.value && (loading.value || !loaded.value))

// ===== Filters =====
const search = ref('')
const selectedCategory = ref(getCategoryFromRoute())
const sortBy = ref('newest')

const categoryOptions = [ALL_CATEGORIES, ...SHOP_CATEGORIES.map((category) => category.name)]
const popularCategories = ['Electronics', 'Fashion', 'Sports']

const sortOptions = [
  { title: 'Newest', value: 'newest' },
  { title: 'Price: Low to High', value: 'price-asc' },
  { title: 'Price: High to Low', value: 'price-desc' },
  { title: 'Name: A to Z', value: 'name' },
]

const features = [
  { title: 'Free Delivery', text: 'On every order, nationwide.', icon: 'truck', tone: 'teal' },
  { title: 'Secure Checkout', text: 'Cash on Delivery, GCash, Maya, or bank transfer.', icon: 'shield-check', tone: 'meadow' },
  { title: 'Easy Returns', text: 'Changed your mind? Return within 7 days.', icon: 'rotate-ccw', tone: 'meadow' },
  { title: '24/7 Support', text: 'Real people, ready to help any time.', icon: 'headset', tone: 'teal' },
]

const promos = [
  {
    category: 'Sports',
    theme: 'teal',
    button: 'meadow',
    eyebrow: 'Limited time',
    title: 'Sports Season Sale',
    text: 'Gear up for your next game with our sports collection.',
    icon: 'dumbbell',
  },
  {
    category: 'Beauty',
    theme: 'meadow',
    button: 'brand-900',
    eyebrow: 'New collection',
    title: 'Glow Up Beauty Picks',
    text: 'Skincare and makeup favorites, delivered free.',
    icon: 'sparkles',
  },
  {
    category: 'Electronics',
    theme: 'sky',
    button: 'primary',
    eyebrow: 'Tech week',
    title: 'Upgrade Your Setup',
    text: 'Monitors, gadgets, and accessories for work and play.',
    icon: 'laptop',
  },
]

// Search (name, description, category) + category filter + sort.
const filteredProducts = computed(() => {
  const keyword = (search.value || '').toLowerCase().trim()

  const result = products.value.filter((product) => {
    const matchesCategory =
      selectedCategory.value === ALL_CATEGORIES || product.category === selectedCategory.value

    const matchesSearch =
      !keyword ||
      product.name?.toLowerCase().includes(keyword) ||
      product.description?.toLowerCase().includes(keyword) ||
      product.category?.toLowerCase().includes(keyword)

    return matchesCategory && matchesSearch
  })

  return [...result].sort((a, b) => {
    if (sortBy.value === 'price-asc') return Number(a.price) - Number(b.price)
    if (sortBy.value === 'price-desc') return Number(b.price) - Number(a.price)
    if (sortBy.value === 'name') return a.name.localeCompare(b.name)
    return 0 // "newest" keeps the Strapi order (sort=createdAt:desc)
  })
})

const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const product of products.value) {
    const category = product.category || 'Uncategorized'
    counts[category] = (counts[category] || 0) + 1
  }
  return counts
})

// First product image in each category, used by the category tiles and promo banners.
const categoryImages = computed(() => {
  const images: Record<string, string> = {}
  for (const product of products.value) {
    if (product.category && product.image && !images[product.category]) {
      images[product.category] = getProductImageUrl(product.image, 'small')
    }
  }
  return images
})

function getCategoryFromRoute() {
  const category = route.query.category
  return typeof category === 'string' && categoryOptions.includes(category) ? category : ALL_CATEGORIES
}

// Footer links use /?category=Sports#products
watch(() => route.query.category, () => {
  selectedCategory.value = getCategoryFromRoute()
})

// Category tiles, promos, and hero chips: pick a category (or unpick it) and jump to the grid.
function selectCategory(category: string) {
  selectedCategory.value = selectedCategory.value === category ? ALL_CATEGORIES : category
  scrollToProducts()
}

// Tabs above the grid: the grid is already in view, so no scrolling.
function setCategory(category: string) {
  if (category === ALL_CATEGORIES) clearCategory()
  else selectedCategory.value = category
}

function clearCategory() {
  selectedCategory.value = ALL_CATEGORIES
  if (route.query.category) router.replace({ query: {}, hash: route.hash })
}

function clearFilters() {
  search.value = ''
  clearCategory()
}

function scrollToProducts() {
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
}

// ===== Newsletter =====
const newsletterForm = ref()
const newsletterEmail = ref('')
const emailRules = [
  (value: string) => !!value || 'Email is required',
  (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address',
]

async function subscribe() {
  const { valid } = await newsletterForm.value.validate()
  if (!valid) return

  notify.success(`Thanks! ${newsletterEmail.value} is now subscribed.`)
  newsletterForm.value.reset()
}

// Always fetch fresh products (and stock) when the homepage opens.
onMounted(() => {
  loadProducts()
  if (route.hash) nextTick(() => document.querySelector(route.hash)?.scrollIntoView({ behavior: 'smooth' }))
  if (document.readyState === 'complete') setTimeout(preloadOtherHero, 1500)
  else window.addEventListener('load', () => setTimeout(preloadOtherHero, 1500), { once: true })
})
</script>

<style scoped>
/* ---------- Hero ---------- */
.hero {
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  /* Runs up behind the floating glass App Bar */
  margin-top: calc(var(--v-layout-top, 84px) * -1);
  padding-top: var(--v-layout-top, 84px);
  height: 100vh;
  height: 100svh;
  min-height: 600px;
  background: var(--sk-hero-wall); /* matches the photo's wall, so its faded edges blend in */
}

.hero-photo {
  position: absolute;
  inset: 0;
  /* Fades in (opacity only). A scale-in here made the GPU re-draw the whole masked photo
     every frame at the busiest moment of the load, which was the biggest frame-rate cost. */
  animation: hero-photo-in 0.9s var(--sk-ease) both;
}

.hero-photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Landscape screens: the products fill the right three quarters of the photo, so the photo
   is anchored bottom-right at 76% width and its left and top edges fade into the wall.
   That leaves the left side free for the copy, and the hero is as tall as the photo. */
@media (orientation: landscape) {
  .hero {
    height: calc(76vw * 941 / 1672 + var(--v-layout-top, 84px));
    max-height: 100vh;
    max-height: 100svh;
  }

  .hero-photo {
    inset: auto 0 0 auto;
    width: 76%;
    aspect-ratio: 1672 / 941;
    -webkit-mask-image:
      linear-gradient(90deg, transparent 0%, #000 24%),
      linear-gradient(180deg, transparent 0%, #000 16%);
    -webkit-mask-composite: source-in;
    mask-image:
      linear-gradient(90deg, transparent 0%, #000 24%),
      linear-gradient(180deg, transparent 0%, #000 16%);
    mask-composite: intersect;
  }
}

/* Narrower landscape screens (tablets on their side, small laptops): a smaller photo
   and a narrower copy column, so the text does not run into the products */
@media (orientation: landscape) and (max-width: 1144px) {
  .hero-photo {
    width: 68%;
  }

  .hero-copy {
    max-width: 470px;
  }

  .hero-subtitle {
    max-width: 400px;
  }
}

.hero-scrim {
  position: absolute;
  inset: 0;
  background: var(--sk-hero-scrim);
  pointer-events: none;
}

/* Fades the photo into the page so there is no hard edge */
.hero::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 90px;
  background: linear-gradient(180deg, transparent, var(--sk-bg));
  pointer-events: none;
}

.hero-inner {
  position: relative;
  z-index: 1;
  padding-bottom: 48px;
}

.hero-copy {
  max-width: 540px;
}

.hero-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--sk-accent-ink);
  background: var(--sk-glass-bg);
  border: 1px solid var(--sk-glass-border);
  border-radius: 999px;
  box-shadow: 0 0 0 1px var(--sk-glass-edge), var(--sk-glass-sheen), var(--sk-shadow-sm);
  -webkit-backdrop-filter: var(--sk-glass-blur);
  backdrop-filter: var(--sk-glass-blur);
}

.hero-chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--sk-meadow-500);
  box-shadow: 0 0 0 3px rgba(var(--sk-meadow-500-rgb), 0.3);
}

.hero-title {
  margin-top: 18px;
  font-family: var(--sk-font-display);
  font-size: clamp(2.5rem, 5.4vw, 4.4rem);
  font-weight: 600;
  line-height: 1.02;
  letter-spacing: -0.02em;
  color: var(--sk-hero-ink);
}

/* A lighter teal than the first line, so "in one Kartt." still reads as the accent
   (4.2:1 on the cream wall; large text needs 3:1) */
.hero-title-accent {
  color: var(--sk-brand-500);
  /* Shiny Text colors: rests on the accent color, the sweep is a paler teal */
  --shine-base: var(--sk-brand-500);
  --shine-light: #8ed3e6;
}

html[data-theme='dark'] .hero-title-accent {
  color: var(--sk-meadow-500);
  --shine-base: var(--sk-meadow-500);
  --shine-light: #ffffff;
}

.hero-subtitle {
  margin-top: 16px;
  max-width: 440px;
  font-size: 1.075rem;
  font-weight: 500;
  line-height: 1.6;
  color: var(--sk-hero-copy);
}

/* Search pill (glass) with the meadow button, as in the Panto reference */
.hero-search {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 480px;
  margin-top: 28px;
  padding: 6px 6px 6px 16px;
  background: var(--sk-glass-strong);
  border: 1px solid var(--sk-glass-border);
  border-radius: 999px;
  box-shadow: 0 0 0 1px var(--sk-glass-edge), 0 18px 40px -18px var(--sk-shadow-soft);
  -webkit-backdrop-filter: var(--sk-glass-blur);
  backdrop-filter: var(--sk-glass-blur);
}

.hero-search:focus-within {
  box-shadow: 0 0 0 2px rgba(var(--sk-brand-500-rgb), 0.55), 0 18px 40px -18px var(--sk-shadow-soft);
}

.hero-search-icon {
  color: var(--sk-muted);
}

.hero-search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 44px;
  font-size: 15px;
  color: var(--sk-ink);
  background: transparent;
  border: none;
  outline: none;
}

.hero-search-input::placeholder {
  color: var(--sk-placeholder);
}

.hero-search-btn {
  flex-shrink: 0;
  height: 44px !important;
  padding: 0 22px !important;
}

.hero-search-btn.v-btn--icon {
  width: 44px !important;
  padding: 0 !important;
}

.hero-popular {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

/* Solid teal tag: plain text here sat straight on the photo and got lost over busy
   parts (the plant leaves), so give it a backing like the chips beside it. */
.hero-popular-label {
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #ffffff;
  background: var(--sk-brand-700);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  box-shadow: 0 6px 16px -8px rgba(var(--sk-brand-700-rgb), 0.8);
}

.hero-popular-chip {
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--sk-accent-ink);
  background: var(--sk-glass-bg);
  border: 1px solid var(--sk-glass-border);
  border-radius: 999px;
  box-shadow: 0 0 0 1px var(--sk-glass-edge);
  -webkit-backdrop-filter: var(--sk-glass-blur);
  backdrop-filter: var(--sk-glass-blur);
  transition: background-color var(--sk-dur-fast) var(--sk-ease), color var(--sk-dur-fast) var(--sk-ease);
}

.hero-popular-chip:hover {
  color: var(--sk-brand-900);
  background: var(--sk-meadow-300);
}

.hero-popular-chip:focus-visible,
.hero-scroll:focus-visible {
  outline: 2px solid var(--sk-brand-700);
  outline-offset: 2px;
}

.hero-scroll {
  position: absolute;
  left: 50%;
  bottom: 28px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  color: var(--sk-brand-900);
  background: var(--sk-glass-strong);
  border: 1px solid var(--sk-glass-border);
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--sk-glass-edge), var(--sk-shadow);
  transform: translateX(-50%);
  /* Rises in after the hero copy, then starts bobbing */
  animation: sk-rise var(--sk-dur-slow) var(--sk-ease) 0.8s both, hero-bob 2.4s ease-in-out 1.4s infinite;
}

html[data-theme='dark'] .hero-scroll {
  color: var(--sk-ink);
}

@keyframes hero-photo-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes hero-bob {
  0%,
  100% {
    transform: translate(-50%, 0);
  }

  50% {
    transform: translate(-50%, 6px);
  }
}

/* Portrait screens (phones, tablets held upright): the portrait photo fills the hero and
   the copy sits in its exact middle, centered both ways (as in the Panto reference). */
@media (orientation: portrait) {
  /* One screen tall; grows only if the copy ever needs more room (very short screens) */
  .hero {
    height: auto;
    min-height: 100vh;
    min-height: 100svh;
  }

  .hero-photo img {
    object-position: 50% 100%;
  }

  /* A soft oval of wall color (deep teal in dark mode) behind the copy, so the text stays
     readable where the middle of the photo meets the top of the products */
  .hero-scrim {
    background: var(--sk-hero-scrim-portrait);
  }

  /* The hero's top padding clears the App Bar; the same padding at the bottom puts the
     center of the copy at the center of the photo, not just of the space under the bar. */
  .hero-inner {
    padding-top: 16px;
    padding-bottom: calc(var(--v-layout-top, 84px) + 16px);
  }

  .hero-copy {
    max-width: 560px;
    margin: 0 auto;
    text-align: center;
  }

  /* "in one Kartt." always gets its own line, so the two centered lines stay even
     instead of leaving "in" hanging at the end of the first line */
  .hero-title-accent {
    display: block;
  }

  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
    text-wrap: balance;
  }

  .hero-search {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-popular {
    justify-content: center;
  }

  /* Products fill the bottom of the photo; the cue would sit on them */
  .hero-scroll {
    display: none;
  }
}

/* Short landscape screens (phones turned sideways): keep the copy compact */
@media (orientation: landscape) and (max-height: 520px) {
  .hero {
    min-height: 460px;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    display: none;
  }

  .hero-search {
    margin-top: 18px;
  }

  .hero-scroll {
    display: none;
  }
}

/* ---------- Why MineKartt (bento) ---------- */
.why-bento {
  display: grid;
  grid-template-columns: 1.25fr repeat(3, minmax(0, 1fr));
  grid-auto-rows: minmax(180px, auto);
  gap: 16px;
}

.why-intro {
  grid-row: span 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 32px;
  color: #ffffff;
  border-radius: var(--sk-radius-lg);
  background:
    radial-gradient(circle at 85% 90%, rgba(var(--sk-brand-500-rgb), 0.55), transparent 55%),
    linear-gradient(160deg, var(--sk-brand-800) 0%, var(--sk-brand-900) 100%);
}

.why-eyebrow {
  color: var(--sk-meadow-500);
}

.why-title {
  margin-top: 6px;
  font-family: var(--sk-font-display);
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 600;
  line-height: 1.1;
}

.why-text {
  margin-top: 12px;
  margin-bottom: 20px; /* minimum gap above the button, which is pushed to the bottom */
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--sk-brand-200);
}

.why-intro .v-btn {
  margin-top: auto !important;
}

.why-tile {
  padding: 24px;
  background: var(--sk-surface);
  border: 1px solid var(--sk-border);
  border-radius: var(--sk-radius-lg);
  transition: transform var(--sk-dur) var(--sk-ease), box-shadow var(--sk-dur) var(--sk-ease);
}

.why-tile:hover {
  transform: translateY(-3px);
  box-shadow: var(--sk-shadow);
}

.why-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
}

.why-icon-teal {
  color: var(--sk-brand-800);
  background: var(--sk-brand-50);
}

.why-icon-meadow {
  color: var(--sk-meadow-900);
  background: var(--sk-meadow-100);
}

html[data-theme='dark'] .why-icon-teal {
  color: var(--sk-brand-200);
  background: rgba(var(--sk-brand-500-rgb), 0.2);
}

html[data-theme='dark'] .why-icon-meadow {
  color: var(--sk-meadow-300);
  background: rgba(var(--sk-meadow-500-rgb), 0.16);
}

.why-tile-title {
  margin-top: 16px;
  font-size: 16px;
  font-weight: 700;
  color: var(--sk-ink);
}

.why-tile-text {
  margin-top: 6px;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--sk-muted);
}

/* Stats tile: meadow swatch with deep teal text */
.why-stats {
  grid-column: span 2;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  gap: 12px;
  padding: 24px 28px;
  color: var(--sk-brand-900);
  border-radius: var(--sk-radius-lg);
  background:
    radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.45), transparent 50%),
    var(--sk-meadow-500);
}

.why-stat-value {
  font-family: var(--sk-font-display);
  font-size: clamp(1.8rem, 3.4vw, 2.6rem);
  font-weight: 600;
  line-height: 1.1;
}

.why-stat-label {
  margin-top: 2px;
  font-size: 13px;
  font-weight: 700;
  color: var(--sk-meadow-900);
}

.stat-skel {
  --sk-skel-base: rgba(var(--sk-brand-900-rgb), 0.14);
  width: 48px;
  height: 2.2rem;
  margin: 4px 0;
}

/* ---------- Section header ---------- */
/* Section rhythm: 64px between sections on desktop, 48px on phones (container padding),
   4px from the eyebrow to the title, 24px (20px on phones) from the title to the content */
.section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 24px;
}

.section-head-center {
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.section-head-center .sk-section-title {
  font-family: var(--sk-font-display);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* ---------- Categories (bento of clay tiles) ---------- */
.category-bento {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: 168px;
  gap: 16px;
}

/* Electronics is the big tile; Home & Living and Toys stretch across the last row */
.category-tile-0 {
  grid-column: span 2;
  grid-row: span 2;
}

.category-tile-5,
.category-tile-6 {
  grid-column: span 2;
}

.category-tile {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
  padding: 18px;
  text-align: left;
  border-radius: var(--sk-radius-lg);
  cursor: pointer;
  transition: transform var(--sk-dur) var(--sk-ease), box-shadow var(--sk-dur) var(--sk-ease);
}

.category-tile:hover {
  transform: translateY(-2px);
  box-shadow:
    0 1px 2px rgba(var(--sk-brand-900-rgb), 0.05),
    0 10px 20px -12px var(--sk-shadow-soft),
    inset 0 -2px 5px var(--sk-clay-inset),
    inset 0 2px 4px var(--sk-clay-highlight);
}

.category-tile:focus-visible {
  outline: 3px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.category-active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow:
    0 0 0 2px rgb(var(--v-theme-primary)),
    0 8px 18px -12px rgba(var(--sk-brand-700-rgb), 0.45);
}

.category-text {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.category-icon {
  margin-bottom: auto;
  box-shadow: inset 0 2px 4px var(--sk-clay-highlight);
}

.category-name {
  margin-top: 12px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--sk-ink);
}

.category-count {
  font-size: 12.5px;
  color: var(--sk-muted);
}

.category-art {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46%;
  height: 72%;
}

.category-tile-0 .category-art {
  width: 62%;
  height: 74%;
}

.category-tile-0 .category-name {
  font-family: var(--sk-font-display);
  font-size: clamp(1.4rem, 2.4vw, 1.9rem);
  font-weight: 600;
}

.category-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* Blends white product photos into the tile */
  mix-blend-mode: multiply;
  transition: transform var(--sk-dur-slow) var(--sk-ease);
}

html[data-theme='dark'] .category-img {
  mix-blend-mode: normal;
  border-radius: 16px;
  background: var(--sk-img-tile);
  padding: 6px;
}

.category-tile:hover .category-img {
  transform: scale(1.06) rotate(-2deg);
}

.category-skel {
  width: 100%;
  height: 100%;
  border-radius: 16px;
}

.category-fallback {
  font-size: 56px !important;
  opacity: 0.18;
}

.category-go {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  color: var(--sk-brand-900);
  background: var(--sk-meadow-500);
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity var(--sk-dur) var(--sk-ease), transform var(--sk-dur) var(--sk-ease);
}

.category-tile:hover .category-go,
.category-tile:focus-visible .category-go,
.category-active .category-go {
  opacity: 1;
  transform: none;
}

/* ---------- Products ---------- */
.tabs-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  gap: 4px;
  max-width: 100%;
  padding: 5px;
  border-radius: 999px;
}

.tab {
  flex-shrink: 0;
  padding: 8px 16px;
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--sk-ink-soft);
  background: transparent;
  border: 0;
  border-radius: 999px;
  transition: background-color var(--sk-dur-fast) var(--sk-ease), color var(--sk-dur-fast) var(--sk-ease);
}

.tab:hover {
  color: var(--sk-accent-ink);
  background: var(--sk-hover);
}

.tab:focus-visible {
  outline: 2px solid var(--sk-brand-700);
  outline-offset: -2px;
}

.tab-active,
.tab-active:hover {
  color: #ffffff;
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 6px 14px -8px rgba(var(--sk-brand-700-rgb), 0.9);
}

html[data-theme='dark'] .tab-active,
html[data-theme='dark'] .tab-active:hover {
  color: rgb(var(--v-theme-on-primary));
}

.toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 12px;
  margin-bottom: 16px;
}

.toolbar-search {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 0 16px;
  background: var(--sk-surface);
  border: 1px solid var(--sk-border);
  border-radius: 999px;
  transition: border-color var(--sk-dur-fast) var(--sk-ease), box-shadow var(--sk-dur-fast) var(--sk-ease);
}

.toolbar-search:focus-within {
  border-color: var(--sk-brand-500);
  box-shadow: 0 0 0 3px rgba(var(--sk-brand-500-rgb), 0.2);
}

.toolbar-search-icon {
  color: var(--sk-muted);
}

.toolbar-search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 46px;
  font-size: 14.5px;
  color: var(--sk-ink);
  background: transparent;
  border: none;
  outline: none;
}

.toolbar-search-input::placeholder {
  color: var(--sk-placeholder);
}

.toolbar-sort :deep(.v-field) {
  border-radius: 999px;
  background: var(--sk-surface);
  border: 1px solid var(--sk-border);
}

.state-card {
  padding: 48px 24px;
  text-align: center;
}

/* ---------- Promo bento ---------- */
.promo-bento {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  grid-template-rows: repeat(2, minmax(200px, auto));
  gap: 16px;
}

.promo {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  padding: 28px;
  border-radius: var(--sk-radius-lg);
}

.promo:first-child {
  grid-row: span 2;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
}

.promo-content {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  max-width: 340px;
}

.promo-eyebrow {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.8;
}

.promo-title {
  margin-top: 6px;
  font-family: var(--sk-font-display);
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.15;
}

.promo:first-child .promo-title {
  font-size: clamp(1.8rem, 3.2vw, 2.5rem);
}

.promo-text {
  margin: 8px 0 18px;
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.85;
}

.promo-art {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 140px;
}

.promo:first-child .promo-art {
  align-self: flex-end;
  width: min(100%, 300px);
  height: 220px;
}

.promo-img {
  --sk-img-bg: transparent;
  width: 100%;
  height: 100%;
  border-radius: 16px;
}

.promo-teal .promo-img {
  --sk-img-bg: #ffffff;
}

.promo-meadow .promo-img {
  --sk-img-bg: var(--sk-promo-meadow-img);
}

.promo-sky .promo-img {
  --sk-img-bg: var(--sk-promo-sky-img);
}

.promo-img :deep(img) {
  object-fit: contain !important;
}

.promo-icon {
  font-size: 110px !important;
  opacity: 0.25;
}

/* Teal Waters swatch */
.promo-teal {
  color: #ffffff;
  background:
    radial-gradient(circle at 80% 85%, rgba(255, 255, 255, 0.22), transparent 50%),
    linear-gradient(150deg, #2c5b6b 0%, var(--sk-brand-700) 60%, var(--sk-brand-800) 100%);
}

.promo-teal .promo-eyebrow {
  color: var(--sk-meadow-300);
  opacity: 1;
}

.promo-teal .promo-art {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.28);
  padding: 12px;
}

/* Spring Meadow swatch */
.promo-meadow {
  color: var(--sk-brand-900);
  background: var(--sk-promo-meadow);
}

/* Glacial Sky swatch */
.promo-sky {
  color: var(--sk-promo-ink);
  background: var(--sk-promo-sky);
  border: 1px solid var(--sk-border);
}

html[data-theme='dark'] .promo-teal {
  background:
    radial-gradient(circle at 80% 85%, rgba(var(--sk-brand-500-rgb), 0.4), transparent 50%),
    linear-gradient(150deg, var(--sk-brand-800) 0%, var(--sk-brand-900) 100%);
}

html[data-theme='dark'] .promo-meadow {
  color: var(--sk-meadow-100);
}

/* Dark mode: give the dark cards an edge against the page */
html[data-theme='dark'] .promo,
html[data-theme='dark'] .newsletter,
html[data-theme='dark'] .why-intro {
  border: 1px solid var(--sk-border);
}

/* ---------- Newsletter ---------- */
.newsletter {
  position: relative;
  overflow: hidden;
  padding: 48px 40px 40px;
  border-radius: var(--sk-radius-lg);
  background:
    radial-gradient(circle at 100% 0%, rgba(var(--sk-meadow-500-rgb), 0.28), transparent 40%),
    linear-gradient(135deg, var(--sk-brand-900) 0%, var(--sk-brand-800) 55%, var(--sk-brand-700) 100%);
}

.newsletter-orb {
  position: absolute;
  top: -80px;
  right: -60px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Two outlined eyes peeking over the card's top edge, like the cart in the logo */
.newsletter-eyes {
  position: absolute;
  top: 14px;
  right: 72px;
  z-index: 1;
  display: flex;
  gap: 6px;
}

.newsletter-eyes span {
  position: relative;
  width: 26px;
  height: 32px;
  border: 2px solid rgba(255, 255, 255, 0.85);
  border-radius: 50% 50% 46% 46%;
}

.newsletter-eyes span::after {
  content: '';
  position: absolute;
  top: 8px;
  left: 6px;
  width: 8px;
  height: 12px;
  border-radius: 50%;
  background: #f7f9e1; /* Morning Mist */
}

.newsletter-eyebrow {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--sk-meadow-500);
}

.newsletter-title {
  margin-top: 4px;
  font-family: var(--sk-font-display);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 600;
  color: #ffffff;
}

.newsletter-text {
  color: var(--sk-brand-200);
}

.newsletter-form :deep(.v-field) {
  border-radius: 999px;
}

.newsletter-btn {
  height: 48px !important;
}

/* ---------- Responsive ---------- */
@media (max-width: 1144px) {
  .why-bento {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: auto;
  }

  .why-intro {
    grid-row: auto;
    grid-column: span 2;
  }

  .category-bento {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  /* 3 columns: big tile spans 2x2, the rest fill in single cells */
  .category-tile-5,
  .category-tile-6 {
    grid-column: auto;
  }

  .category-tile-6 {
    grid-column: span 3;
  }
}

@media (max-width: 839px) {
  .why-intro {
    padding: 26px;
  }

  .category-bento {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: minmax(150px, auto);
  }

  .category-tile-0 {
    grid-row: span 1;
    min-height: 190px;
  }

  /* One row tall here, so the photo keeps to the right half, clear of the name */
  .category-tile-0 .category-art {
    width: 50%;
    height: 82%;
  }

  .category-tile-6 {
    grid-column: auto;
  }

  .toolbar {
    grid-template-columns: minmax(0, 1fr) 190px;
  }

  .promo-bento {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
  }

  .promo:first-child {
    grid-row: auto;
    grid-column: span 2;
    flex-direction: row;
    align-items: center;
  }

  .promo:first-child .promo-art {
    align-self: center;
    width: 200px;
    height: 180px;
  }

  .promo {
    flex-direction: column;
    align-items: flex-start;
  }

  .promo-art {
    align-self: flex-end;
    width: 120px;
    height: 120px;
  }

  .newsletter {
    padding: 48px 24px 32px;
  }
}

@media (max-width: 599px) {
  .section-head {
    margin-bottom: 20px;
  }

  .hero-title {
    font-size: clamp(2.1rem, 9.5vw, 2.6rem);
  }

  .hero-subtitle {
    font-size: 0.98rem;
  }

  .hero-search {
    margin-top: 20px;
    padding: 5px 5px 5px 14px;
  }

  .hero-search-input {
    height: 42px;
    font-size: 14px;
  }

  .why-bento {
    gap: 10px;
  }

  .why-tile {
    padding: 16px;
    border-radius: 20px;
  }

  .why-tile-title {
    margin-top: 12px;
    font-size: 14.5px;
  }

  .why-tile-text {
    font-size: 12.5px;
  }

  .why-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .why-stats {
    padding: 20px 16px;
    gap: 8px;
    text-align: center;
  }

  .why-stat-label {
    font-size: 12px;
  }

  .category-bento {
    gap: 10px;
    grid-auto-rows: minmax(140px, auto);
  }

  .category-tile {
    padding: 14px;
    border-radius: 20px;
  }

  .category-name {
    font-size: 13.5px;
  }

  .category-count {
    font-size: 11.5px;
  }

  .category-art {
    width: 50%;
    height: 58%;
    right: 8px;
    bottom: 8px;
  }

  .tabs-wrap {
    justify-content: flex-start;
    margin: 0 -16px 16px;
    padding: 0 16px;
  }

  .toolbar {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .promo-bento {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .promo,
  .promo:first-child {
    grid-column: auto;
    flex-direction: row;
    align-items: center;
    padding: 22px;
  }

  .promo:first-child .promo-art,
  .promo-art {
    align-self: center;
    width: 96px;
    height: 96px;
  }

  .promo-teal .promo-art {
    padding: 8px;
    border-radius: 18px;
  }

  .promo:first-child .promo-title {
    font-size: 1.5rem;
  }

  .newsletter-eyes {
    right: 24px;
  }
}
</style>
