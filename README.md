# MineKartt — Storefront

The customer-facing storefront for MineKartt (formerly ShopKart), built with **Nuxt 4** and **Vuetify**.
Product data comes from the Strapi backend ([minekartt-web-server](https://github.com/cuencojasmine/minekartt-web-server)).

**Live site:** https://web-shopkart.vercel.app

## Features

- Product catalogue with search
- Cart and wishlist drawers (saved in the browser)
- Checkout page
- Product management for the store manager
- Light and dark themes, responsive layout for mobile

## Running locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set the backend address:

   ```bash
   NUXT_PUBLIC_STRAPI_URL=http://localhost:1337
   ```

3. Start the dev server on `http://localhost:3000`:

   ```bash
   npm run dev
   ```

## Production build

```bash
npm run build
npm run preview
```
