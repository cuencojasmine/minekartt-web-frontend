<!-- One product in the homepage grid. -->
<template>
  <BitsSpotlightCard tag="article" class="product-card d-flex flex-column h-100" :class="{ 'is-out': isOutOfStock }">
    <div class="image-wrap">
      <v-img
        v-if="product.image"
        :src="getProductImageUrl(product.image, 'small')"
        :alt="product.name"
        class="product-img sk-product-img"
      >
        <template #placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular indeterminate color="grey-lighten-1" />
          </div>
        </template>
      </v-img>
      <div v-else class="no-image d-flex align-center justify-center">
        <v-icon icon="image-off" size="48" color="grey-lighten-1" />
      </div>

      <v-btn
        icon="heart"
        :color="inWishlist ? 'pink' : undefined"
        :aria-label="inWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
        :aria-pressed="inWishlist"
        variant="text"
        size="small"
        class="wishlist-btn sk-glass"
        :class="{ 'sk-icon-fill': inWishlist }"
        @click="wishlist.toggleWishlist(product)"
      />

      <!-- Each stock state shows once: out of stock as this photo badge, everything else in the
           stock line under the price (green dot = in stock, amber = 10 or fewer left). -->
      <span v-if="isOutOfStock" class="stock-badge badge-out">Out of stock</span>
    </div>

    <div class="card-body d-flex flex-column flex-grow-1">
      <span class="product-category">{{ product.category || 'Uncategorized' }}</span>
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-description">
        {{ product.description || 'No description available.' }}
      </p>

      <div class="d-flex flex-wrap align-end justify-space-between ga-1 mt-auto pt-3">
        <span class="product-price">{{ formatCurrency(product.price) }}</span>
        <!-- Out of stock: the photo badge and the disabled button already say so -->
        <span v-if="!isOutOfStock" class="stock-text" :class="`stock-${stockLevel}`">
          <span class="stock-dot" aria-hidden="true" />{{ stockLabel }}
        </span>
      </div>

      <BitsClickSpark class="mt-3" :disabled="isOutOfStock || isMaxedOut">
        <v-btn
          block
          color="primary"
          :variant="inCart && !isMaxedOut ? 'tonal' : 'flat'"
          rounded="pill"
          class="cart-btn"
          :prepend-icon="buttonIcon"
          :disabled="isOutOfStock || isMaxedOut"
          @click="cart.addToCart(product)"
        >
          <span class="text-truncate">{{ buttonLabel }}</span>
        </v-btn>
      </BitsClickSpark>
    </div>
  </BitsSpotlightCard>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const props = defineProps<{ product: Product }>()

const { xs } = useDisplay()
const cart = useCart()
const wishlist = useWishlist()
const { getProductImageUrl } = useStrapi()

const stock = computed(() => Number(props.product.stock) || 0)
const isOutOfStock = computed(() => stock.value <= 0)
const inCart = computed(() => cart.findItem(props.product.documentId)?.quantity || 0)
const isMaxedOut = computed(() => !isOutOfStock.value && inCart.value >= stock.value)
const inWishlist = computed(() => wishlist.isInWishlist(props.product.documentId))

// Stock status for the dot color: success (> 10), warning (1–10). Out of stock shows no line.
const LOW_STOCK = 10
const stockLevel = computed(() => (stock.value <= LOW_STOCK ? 'low' : 'ok'))

const stockLabel = computed(() =>
  stockLevel.value === 'low' ? `Only ${stock.value} left` : `${stock.value} in stock`,
)

// Shorter labels on phones, where cards are two per row.
const buttonLabel = computed(() => {
  if (isOutOfStock.value) return 'Out of Stock'
  if (isMaxedOut.value) return xs.value ? 'Max in Cart' : 'Max Stock in Cart'
  if (inCart.value) return xs.value ? `Add More (${inCart.value})` : `Add More (${inCart.value} in cart)`
  return 'Add to Cart'
})

const buttonIcon = computed(() => {
  if (isOutOfStock.value) return 'package-x'
  if (isMaxedOut.value) return 'check'
  return 'shopping-cart-plus'
})
</script>

<style scoped>
.product-card {
  padding: 10px;
  background: var(--sk-surface);
  border: 1px solid var(--sk-border);
  border-radius: 22px;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.product-card:hover {
  /* Lift above neighbouring cards so Add to Cart sparks are not drawn underneath them */
  z-index: 2;
  transform: translateY(-4px);
  border-color: var(--sk-selected);
  box-shadow: var(--sk-shadow);
}

.image-wrap {
  position: relative;
  aspect-ratio: 1 / 0.86;
  overflow: hidden;
  background: var(--sk-img-tile);
  border-radius: 16px;
}

.product-img,
.no-image {
  width: 100%;
  height: 100%;
}

.product-img :deep(img) {
  object-fit: contain !important;
  padding: 12px;
  transition: transform 0.3s ease;
}

.product-card:hover .product-img :deep(img) {
  transform: scale(1.05);
}

.is-out .product-img {
  opacity: 0.55;
  filter: grayscale(0.6);
}

.wishlist-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* Un-wishlisted heart: theme-aware so it stays visible in dark mode */
.wishlist-btn:not(.sk-icon-fill) {
  color: var(--sk-ink-soft);
}

.stock-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
}

/* on-error: white on the light theme's red, dark ink on the dark theme's lighter red */
.badge-out {
  color: rgb(var(--v-theme-on-error));
  background: rgb(var(--v-theme-error));
}

.card-body {
  padding: 12px 6px 4px;
}

.product-category {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
}

.product-name {
  margin-top: 2px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--sk-ink);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.45;
  color: var(--sk-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--sk-ink);
}

/* Healthy stock keeps muted text and lets the green dot speak; low stock colors the text too */
.stock-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--sk-muted);
}

.stock-dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.stock-ok .stock-dot {
  background: rgb(var(--v-theme-success));
}

.stock-low {
  font-weight: 700;
  color: rgb(var(--v-theme-warning));
}

.cart-btn :deep(.v-btn__content) {
  min-width: 0;
  white-space: nowrap;
}

@media (max-width: 599px) {
  .product-card {
    padding: 6px;
    border-radius: 18px;
  }

  .image-wrap {
    border-radius: 14px;
  }

  .card-body {
    padding: 10px 4px 2px;
  }

  .product-name {
    font-size: 14px;
  }

  .product-description {
    display: none;
  }

  .product-price {
    font-size: 1rem;
  }

  .stock-text {
    font-size: 11px;
  }

  .cart-btn {
    font-size: 12px;
  }

  .cart-btn :deep(.v-btn__prepend) {
    display: none;
  }
}
</style>
