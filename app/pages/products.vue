<!-- app/pages/products.vue -->
<template>
  <v-layout class="product-layout">
    <v-app-bar flat height="72" class="shop-header">
      <v-container class="d-flex align-center ga-2">
        <BrandLogo small />

        <v-spacer />

        <v-btn to="/" variant="text" prepend-icon="store" class="d-none d-sm-flex">
          Back to Store
        </v-btn>
        <v-btn to="/" variant="text" icon="store" aria-label="Back to Store" class="d-flex d-sm-none" />

        <ThemeToggle />
      </v-container>
    </v-app-bar>

    <v-main class="product-page">
      <v-container class="py-8">
        <!-- PAGE HEADER -->
        <div class="d-flex flex-wrap align-center justify-space-between ga-4 mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold">Product Management</h1>
            <p class="text-medium-emphasis mt-1 mb-0">
              Manage your e-commerce products
            </p>
          </div>

          <v-btn
            color="primary"
            prepend-icon="plus"
            size="large"
            @click="openCreateDialog"
          >
            Add Product
          </v-btn>
        </div>

        <!-- SEARCH -->
        <v-card class="mb-6" rounded="lg" elevation="1">
          <v-card-text>
            <v-text-field
              v-model="search"
              label="Search product"
              prepend-inner-icon="search"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            />
          </v-card-text>
        </v-card>

        <!-- LOADING STATE: skeleton rows shaped like the table (first load only;
             later reloads after a save keep the table on screen) -->
        <ul v-if="loading && !products.length && isPhone" class="pm-list" aria-busy="true" aria-label="Loading products">
          <li v-for="n in 4" :key="n" class="pm-item" aria-hidden="true">
            <div class="pm-item-main">
              <span class="sk-skel" style="width: 64px; height: 64px; border-radius: 12px; flex: none" />
              <div class="pm-info">
                <span class="sk-skel" style="width: 60%; height: 14px" />
                <span class="sk-skel mt-2" style="width: 85%; height: 10px" />
                <span class="sk-skel mt-2" style="width: 30%; height: 14px" />
              </div>
            </div>
          </li>
        </ul>

        <v-card v-else-if="loading && !products.length" rounded="lg" elevation="1" class="product-table-card" aria-busy="true" aria-label="Loading products">
          <v-table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody aria-hidden="true">
              <tr v-for="n in 5" :key="n">
                <td><span class="sk-skel my-2" style="width: 70px; height: 70px; border-radius: 12px" /></td>
                <td>
                  <span class="sk-skel" style="width: 140px; height: 14px" />
                  <span class="sk-skel mt-2" style="width: 220px; height: 10px" />
                </td>
                <td><span class="sk-skel sk-skel-pill" style="width: 84px; height: 24px" /></td>
                <td><span class="sk-skel" style="width: 76px; height: 14px" /></td>
                <td><span class="sk-skel sk-skel-pill" style="width: 40px; height: 24px" /></td>
                <td><span class="sk-skel sk-skel-pill" style="width: 60px; height: 24px" /></td>
                <td>
                  <div class="d-flex justify-center ga-2">
                    <span v-for="i in 3" :key="i" class="sk-skel sk-skel-circle" style="width: 28px; height: 28px" />
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <!-- EMPTY STATE -->
        <v-card
          v-else-if="filteredProducts.length === 0"
          rounded="lg"
          elevation="1"
        >
          <v-card-text class="text-center py-16">
            <v-icon icon="package-open" size="64" color="grey" />
            <h3 class="mt-4">No Products Found</h3>
            <p class="text-medium-emphasis mt-2">
              Add your first product or try another search.
            </p>
          </v-card-text>
        </v-card>

        <!-- PRODUCT LIST (phones): one card per product instead of a wide table -->
        <ul v-else-if="isPhone" class="pm-list" aria-label="Products">
          <li v-for="product in filteredProducts" :key="product.documentId" class="pm-item">
            <div class="pm-item-main">
              <div class="pm-thumb">
                <img v-if="product.image" :src="getImageUrl(product.image)" :alt="product.name" />
                <v-icon v-else icon="image-off" size="22" color="grey" />
              </div>

              <div class="pm-info">
                <div class="pm-name">{{ product.name }}</div>
                <div class="pm-desc">{{ product.description || 'No description' }}</div>
                <div class="pm-price">{{ formatPrice(product.price) }}</div>
              </div>
            </div>

            <div class="pm-item-foot">
              <div class="pm-chips">
                <v-chip color="primary" variant="tonal" size="x-small">
                  {{ product.category || 'Uncategorized' }}
                </v-chip>
                <v-chip :color="getStockColor(product.stock)" variant="tonal" size="x-small">
                  {{ product.stock }} in stock
                </v-chip>
                <v-chip :color="product.is_active ? 'success' : 'error'" variant="tonal" size="x-small">
                  {{ product.is_active ? 'Active' : 'Inactive' }}
                </v-chip>
              </div>

              <div class="pm-actions">
                <v-btn icon="eye" variant="text" color="info" size="small" :aria-label="`View ${product.name}`" @click="viewProduct(product)" />
                <v-btn icon="pencil" variant="text" color="primary" size="small" :aria-label="`Edit ${product.name}`" @click="openEditDialog(product)" />
                <v-btn icon="trash" variant="text" color="error" size="small" :aria-label="`Delete ${product.name}`" @click="openDeleteDialog(product)" />
              </div>
            </div>
          </li>
        </ul>

        <!-- PRODUCT TABLE -->
        <v-card v-else rounded="lg" elevation="1" class="product-table-card">
          <v-table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="product in filteredProducts" :key="product.documentId">
                <td>
                  <v-avatar rounded="lg" size="70" class="my-2">
                    <v-img
                      v-if="product.image"
                      :src="getImageUrl(product.image)"
                      :alt="product.name"
                      cover
                    />
                    <v-icon v-else icon="image-off" color="grey" />
                  </v-avatar>
                </td>

                <td>
                  <div class="font-weight-bold">{{ product.name }}</div>
                  <div class="description-text text-medium-emphasis">
                    {{ product.description || 'No description' }}
                  </div>
                </td>

                <td>
                  <v-chip color="primary" variant="tonal" size="small">
                    {{ product.category || 'Uncategorized' }}
                  </v-chip>
                </td>

                <td class="font-weight-bold">{{ formatPrice(product.price) }}</td>

                <td>
                  <v-chip :color="getStockColor(product.stock)" variant="tonal" size="small">
                    {{ product.stock }}
                  </v-chip>
                </td>

                <td>
                  <v-chip :color="product.is_active ? 'success' : 'error'" variant="tonal" size="small">
                    {{ product.is_active ? 'Active' : 'Inactive' }}
                  </v-chip>
                </td>

                <td>
                  <div class="d-flex justify-center ga-1">
                    <v-btn icon="eye" variant="text" color="info" size="small" @click="viewProduct(product)" />
                    <v-btn icon="pencil" variant="text" color="primary" size="small" @click="openEditDialog(product)" />
                    <v-btn icon="trash" variant="text" color="error" size="small" @click="openDeleteDialog(product)" />
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <!-- ========================================
             CREATE / EDIT PRODUCT DIALOG
        ========================================= -->
        <v-dialog v-model="productDialog" max-width="880" persistent scrollable>
          <v-card class="pd-card" rounded="xl">
            <!-- HEADER -->
            <header class="pd-header">
              <div class="pd-header-icon">
                <v-icon :icon="isEditing ? 'pencil' : 'package'" size="18" />
              </div>
              <div class="pd-header-text">
                <h2 class="pd-title">{{ isEditing ? 'Edit product' : 'Add product' }}</h2>
                <p class="pd-subtitle">
                  {{ isEditing ? 'Update the details shoppers see in the store.' : 'Fill in the details to list a new product.' }}
                </p>
              </div>
              <v-btn
                icon="x"
                variant="text"
                size="small"
                class="pd-close"
                aria-label="Close"
                @click="closeProductDialog"
              />
            </header>

            <v-card-text class="pd-body">
              <v-form ref="productForm" class="pd-grid" @submit.prevent="saveProduct">
                <!-- IMAGE -->
                <section class="pd-media" aria-label="Product image">
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="d-none"
                    @change="onFilePicked"
                  />

                  <button
                    type="button"
                    class="pd-dropzone"
                    :class="{ 'pd-dropzone--over': dragOver, 'pd-dropzone--filled': previewSrc }"
                    @click="fileInput?.click()"
                    @dragover.prevent="dragOver = true"
                    @dragleave.prevent="dragOver = false"
                    @drop.prevent="onFileDropped"
                  >
                    <img v-if="previewSrc" :src="previewSrc" alt="" class="pd-dropzone-img" />

                    <span v-if="!previewSrc" class="pd-dropzone-empty">
                      <span class="pd-dropzone-icon"><v-icon icon="cloud-upload" size="22" /></span>
                      <span class="pd-dropzone-title">Upload an image</span>
                      <span class="pd-dropzone-hint">Click or drag a file here<br />Any image except SVG · max 5 MB</span>
                    </span>

                    <span v-else class="pd-dropzone-overlay">
                      <v-icon icon="cloud-upload" size="16" />
                      Replace image
                    </span>
                  </button>

                  <div v-if="selectedFileName" class="pd-file">
                    <v-icon icon="paperclip" size="14" class="pd-file-icon" />
                    <span class="pd-file-name">{{ selectedFileName }}</span>
                    <button type="button" class="pd-file-clear" aria-label="Remove selected image" @click="clearSelectedFile">
                      <v-icon icon="x" size="14" />
                    </button>
                  </div>
                  <p v-else class="pd-media-note">
                    {{ previewSrc ? 'Current image' : 'No image yet' }}
                  </p>
                </section>

                <!-- FIELDS -->
                <section class="pd-fields">
                  <div class="pd-field">
                    <label for="pd-name" class="pd-label">Product name</label>
                    <v-text-field
                      id="pd-name"
                      v-model="form.name"
                      placeholder="e.g. Wooden toy set"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      :rules="[(value) => !!value || 'Product name is required']"
                    />
                  </div>

                  <div class="pd-field">
                    <label for="pd-description" class="pd-label">Description</label>
                    <v-textarea
                      id="pd-description"
                      v-model="form.description"
                      placeholder="A short description shoppers will see"
                      variant="outlined"
                      density="compact"
                      rows="3"
                      no-resize
                      hide-details
                    />
                  </div>

                  <div class="pd-row">
                    <div class="pd-field">
                      <label for="pd-price" class="pd-label">Price</label>
                      <v-text-field
                        id="pd-price"
                        v-model.number="form.price"
                        type="number"
                        min="0"
                        prefix="₱"
                        variant="outlined"
                        density="compact"
                        hide-details="auto"
                        :rules="priceRules"
                      />
                    </div>
                    <div class="pd-field">
                      <label for="pd-stock" class="pd-label">Stock</label>
                      <v-text-field
                        id="pd-stock"
                        v-model.number="form.stock"
                        type="number"
                        min="0"
                        suffix="units"
                        variant="outlined"
                        density="compact"
                        hide-details="auto"
                        :rules="stockRules"
                      />
                    </div>
                  </div>

                  <div class="pd-field">
                    <label for="pd-category" class="pd-label">Category</label>
                    <v-select
                      id="pd-category"
                      v-model="form.category"
                      :items="categories"
                      placeholder="Choose a category"
                      variant="outlined"
                      density="compact"
                      hide-details
                    />
                  </div>

                  <div class="pd-status">
                    <div class="pd-status-title">Active Product</div>
                    <v-switch
                      v-model="form.is_active"
                      color="success"
                      inset
                      density="compact"
                      hide-details
                      aria-label="Active Product"
                    />
                  </div>
                </section>
              </v-form>
            </v-card-text>

            <!-- FOOTER -->
            <footer class="pd-footer">
              <v-btn variant="text" class="pd-btn" @click="closeProductDialog">Cancel</v-btn>
              <v-btn color="primary" variant="flat" class="pd-btn" :loading="saving" @click="saveProduct">
                {{ isEditing ? 'Save changes' : 'Add product' }}
              </v-btn>
            </footer>
          </v-card>
        </v-dialog>

        <!-- ========================================
             VIEW PRODUCT DIALOG
        ========================================= -->
        <v-dialog v-model="viewDialog" max-width="600">
          <v-card v-if="selectedProduct" rounded="xl">
            <!-- PRODUCT IMAGE -->
            <v-img
              v-if="selectedProduct.image"
              :src="getImageUrl(selectedProduct.image)"
              height="320"
              contain
              class="product-view-image"
            />

            <!-- NO IMAGE PLACEHOLDER -->
            <div
              v-else
              class="d-flex align-center justify-center no-image-panel"
              style="height: 250px"
            >
              <v-icon icon="image-off" size="80" color="grey" />
            </div>

            <!-- PRODUCT INFORMATION -->
            <v-card-text class="pa-6">
              <div class="d-flex align-start justify-space-between ga-4">
                <div>
                  <h2 class="text-h5 font-weight-bold">
                    {{ selectedProduct.name }}
                  </h2>

                  <v-chip class="mt-2" color="primary" variant="tonal" size="small">
                    {{ selectedProduct.category || 'Uncategorized' }}
                  </v-chip>
                </div>

                <v-chip
                  :color="selectedProduct.is_active ? 'success' : 'error'"
                  variant="tonal"
                >
                  {{ selectedProduct.is_active ? 'Active' : 'Inactive' }}
                </v-chip>
              </div>

              <p class="mt-5 text-medium-emphasis">
                {{ selectedProduct.description || 'No product description.' }}
              </p>

              <v-divider class="my-5" />

              <v-row>
                <v-col cols="6">
                  <div class="text-caption text-medium-emphasis">Price</div>
                  <div class="text-h5 font-weight-bold text-primary">
                    {{ formatPrice(selectedProduct.price) }}
                  </div>
                </v-col>

                <v-col cols="6">
                  <div class="text-caption text-medium-emphasis">Stock</div>
                  <div class="text-h6 font-weight-bold">
                    {{ selectedProduct.stock }} units
                  </div>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions class="pa-5 pt-0">
              <v-spacer />
              <v-btn color="primary" variant="tonal" @click="viewDialog = false">
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- ========================================
             DELETE CONFIRMATION DIALOG
        ========================================= -->
        <v-dialog v-model="deleteDialog" max-width="450">
          <v-card rounded="xl">
            <v-card-text class="text-center pa-8">
              <v-icon icon="trash" size="60" color="error" />
              <h2 class="text-h5 font-weight-bold mt-3">Delete Product?</h2>
              <p class="text-medium-emphasis mt-3">
                Are you sure you want to delete
                <strong>{{ selectedProduct?.name }}</strong>?
              </p>
            </v-card-text>

            <v-card-actions class="pa-5 pt-0">
              <v-btn variant="text" block @click="deleteDialog = false">Cancel</v-btn>
              <!-- Hold-to-confirm instead of a single click. If the delete fails the
                   dialog stays open and the button resets itself after resetAfter. -->
              <BitsHoldButton
                :key="selectedProduct?.documentId"
                block
                done-label="Deleting…"
                @hold="deleteProduct"
              >
                <v-icon icon="trash" size="16" />
                Hold to delete
              </BitsHoldButton>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Messages from showSnackbar appear as toasts (components/ToastStack.vue in app.vue) -->
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
// @ts-nocheck
import { useDisplay } from 'vuetify'

// ===== 6. Page settings and Strapi URL =====
definePageMeta({
  layout: false,
})

useHead({
  title: 'Product Management | ShopKart',
})

const { STRAPI_URL } = useStrapi()

// ===== 9. State variables =====
const products = ref([])
const loading = ref(false)
const search = ref('')

const productDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)

const selectedProduct = ref(null)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)

const productForm = ref(null)

const form = reactive({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  is_active: true,
})

const selectedFile = ref(null)
const imagePreview = ref(null)
const currentImage = ref(null)

// Image picker in the product dialog (hidden <input type="file"> + drop zone)
const fileInput = ref(null)
const dragOver = ref(false)
const previewSrc = computed(() => imagePreview.value || getImageUrl(currentImage.value))
const selectedFileName = computed(() => getSelectedFile()?.name || '')

// Same rules as the Strapi upload plugin (shopkart-server/config/plugins.ts):
// any image type except SVG, at most 5 MB.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function pickFile(file) {
  if (!file) return

  if (!file.type?.startsWith('image/')) {
    showSnackbar('Please choose an image file.', 'warning')
    return
  }

  if (file.type === 'image/svg+xml') {
    showSnackbar('SVG images are not allowed. Use PNG, JPG, WEBP or GIF.', 'warning')
    return
  }

  if (file.size > MAX_IMAGE_BYTES) {
    const sizeMb = (file.size / 1024 / 1024).toFixed(1)
    showSnackbar(`This image is ${sizeMb} MB. The limit is 5 MB.`, 'warning')
    return
  }
  selectedFile.value = file
  handleImageChange(file)
}

function onFilePicked(event) {
  pickFile(event.target.files?.[0])
  event.target.value = '' // allow picking the same file again
}

function onFileDropped(event) {
  dragOver.value = false
  pickFile(event.dataTransfer?.files?.[0])
}

function clearSelectedFile() {
  selectedFile.value = null
  handleImageChange(null)
}

// ===== 10. Categories, validation, and snackbar state =====
const categories = [
  'Electronics',
  'Fashion',
  'Sports',
  'Bags',
  'Beauty',
  'Home & Living',
  'Toys',
]

const priceRules = [
  (value) => value >= 0 || 'Price cannot be negative',
]

const stockRules = [
  (value) => value >= 0 || 'Stock cannot be negative',
]

const notify = useNotify()

// Below 760px the table no longer fits, so products show as stacked cards.
const { width: viewportWidth } = useDisplay()
const isPhone = computed(() => viewportWidth.value < 760)

// ===== 12. Search filter =====
const filteredProducts = computed(() => {
  if (!search.value) {
    return products.value
  }

  const keyword = search.value.toLowerCase().trim()

  return products.value.filter((product) => {
    const name = product.name?.toLowerCase() || ''
    const description = product.description?.toLowerCase() || ''
    const category = product.category?.toLowerCase() || ''

    return (
      name.includes(keyword) ||
      description.includes(keyword) ||
      category.includes(keyword)
    )
  })
})

// ===== 13. READ =====
async function getProducts() {
  loading.value = true

  try {
    const response = await $fetch(`${STRAPI_URL}/api/products`, {
      query: {
        populate: 'image',
        sort: 'createdAt:desc',
        'pagination[pageSize]': 100,
      },
    })

    products.value = response.data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    showSnackbar('Unable to load products.', 'error')
  } finally {
    loading.value = false
  }
}

// ===== Dialog functions =====
function openCreateDialog() {
  resetForm()
  isEditing.value = false
  selectedProduct.value = null
  productDialog.value = true
}

function openEditDialog(product) {
  selectedProduct.value = product
  isEditing.value = true

  form.name = product.name || ''
  form.description = product.description || ''
  form.price = Number(product.price) || 0
  form.stock = Number(product.stock) || 0
  form.category = product.category || ''
  form.is_active = product.is_active ?? true

  currentImage.value = product.image || null
  selectedFile.value = null
  imagePreview.value = null
  productDialog.value = true
}

function viewProduct(product) {
  selectedProduct.value = product
  viewDialog.value = true
}

function openDeleteDialog(product) {
  selectedProduct.value = product
  deleteDialog.value = true
}

// ===== 24. Decide between CREATE and UPDATE =====
async function saveProduct() {
  const validation = await productForm.value?.validate()
  if (validation && !validation.valid) return

  saving.value = true

  try {
    if (isEditing.value) {
      await updateProduct()
    } else {
      await createProduct()
    }

    closeProductDialog()
    await getProducts()
  } catch (error) {
    console.error('Error saving product:', error)
    showSnackbar(getErrorMessage(error), 'error')
  } finally {
    saving.value = false
  }
}

// ===== 19. CREATE =====
async function createProduct() {
  const response = await $fetch(`${STRAPI_URL}/api/products`, {
    method: 'POST',
    body: {
      data: {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        is_active: form.is_active,
      },
    },
  })

  if (selectedFile.value && response.data) {
    await uploadProductImage(response.data.id)
  }

  showSnackbar('Product created successfully.', 'success')
}

// ===== 20. Upload and attach the Product image =====
async function uploadProductImage(productId) {
  const file = getSelectedFile()
  if (!file) return

  const formData = new FormData()
  formData.append('files', file)
  formData.append('ref', 'api::product.product')
  formData.append('refId', String(productId))
  formData.append('field', 'image')

  // Do not set Content-Type manually; the browser adds the multipart boundary.
  await $fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  })
}

// ===== 23. UPDATE (uses documentId) =====
async function updateProduct() {
  if (!selectedProduct.value) return

  const response = await $fetch(
    `${STRAPI_URL}/api/products/${selectedProduct.value.documentId}`,
    {
      method: 'PUT',
      body: {
        data: {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          stock: Number(form.stock),
          category: form.category,
          is_active: form.is_active,
        },
      },
    },
  )

  if (selectedFile.value && response.data) {
    await uploadProductImage(response.data.id)
  }

  showSnackbar('Product updated successfully.', 'success')
}

// ===== 25. DELETE (uses documentId) =====
async function deleteProduct() {
  if (!selectedProduct.value) return

  deleting.value = true

  try {
    await $fetch(
      `${STRAPI_URL}/api/products/${selectedProduct.value.documentId}`,
      { method: 'DELETE' },
    )

    deleteDialog.value = false
    showSnackbar('Product deleted successfully.', 'success')
    await getProducts()
  } catch (error) {
    showSnackbar(getErrorMessage(error), 'error')
  } finally {
    deleting.value = false
  }
}

// ===== 16 & 21. Image, price, and stock helpers =====
function getImageUrl(image) {
  if (!image?.url) return ''

  if (image.url.startsWith('http://') || image.url.startsWith('https://')) {
    return image.url
  }

  return `${STRAPI_URL}${image.url}`
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(price || 0))
}

function getStockColor(stock) {
  if (Number(stock) === 0) return 'error'
  if (Number(stock) <= 5) return 'warning'
  return 'success'
}

function handleImageChange(value) {
  const file = getFileFromValue(value)

  if (!file) {
    if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = null
    return
  }

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }

  imagePreview.value = URL.createObjectURL(file)
}

function getSelectedFile() {
  return getFileFromValue(selectedFile.value)
}

function getFileFromValue(value) {
  if (!value) return null
  if (value instanceof File) return value
  if (Array.isArray(value) && value.length > 0) return value[0]
  return null
}

// ===== 27.2 Snackbar and error helpers =====
// color is 'success' | 'error' | 'warning' | 'info'
function showSnackbar(message, color = 'success') {
  notify[color](message)
}

function getErrorMessage(error) {
  if (error?.statusCode === 403) {
    return 'Strapi refused this action. Check the Public role permissions in the Strapi admin panel.'
  }

  return (
    error?.data?.error?.message ||
    error?.data?.message ||
    error?.message ||
    'Something went wrong.'
  )
}

// ===== 28. Reset and close the form =====
function resetForm() {
  form.name = ''
  form.description = ''
  form.price = 0
  form.stock = 0
  form.category = ''
  form.is_active = true

  selectedFile.value = null
  currentImage.value = null

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }

  imagePreview.value = null
}

function closeProductDialog() {
  productDialog.value = false
  resetForm()
}

onMounted(() => {
  getProducts()
})
</script>

<style scoped>
.product-layout {
  min-height: 100vh;
}

.product-page {
  min-height: 100vh;
  background: var(--sk-bg);
}

.shop-header {
  background: var(--sk-glass-bg) !important;
  -webkit-backdrop-filter: var(--sk-glass-blur);
  backdrop-filter: var(--sk-glass-blur);
  border-bottom: 1px solid var(--sk-border);
}

.logo-link {
  text-decoration: none;
  white-space: nowrap;
}

.product-table-card {
  overflow-x: auto;
}

/* ===== Product list on phones ===== */
.pm-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pm-item {
  padding: 12px;
  background: var(--sk-surface);
  border: 1px solid var(--sk-border);
  border-radius: 14px;
  box-shadow: var(--sk-shadow-sm);
}

.pm-item-main {
  display: flex;
  gap: 12px;
  min-width: 0;
}

.pm-thumb {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  overflow: hidden;
  background: var(--sk-img-tile);
  border-radius: 12px;
}

.pm-thumb img {
  width: 100%;
  height: 100%;
  padding: 4px;
  object-fit: contain;
}

.pm-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.pm-name {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--sk-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pm-desc {
  margin-top: 2px;
  font-size: 12.5px;
  color: var(--sk-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pm-price {
  margin-top: auto;
  padding-top: 4px;
  font-size: 15px;
  font-weight: 700;
  color: var(--sk-ink);
}

.pm-item-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--sk-border);
}

.pm-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.pm-actions {
  display: flex;
  flex: none;
  margin-right: -6px;
}

.description-text {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

/* ===== Create / edit product dialog ===== */
.pd-card {
  background: var(--sk-surface) !important;
  border: 1px solid var(--sk-border);
  box-shadow: var(--sk-shadow-lg) !important;
}

.pd-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 20px 16px 24px;
  border-bottom: 1px solid var(--sk-border);
}

.pd-header-icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  color: var(--sk-accent-ink);
  background: var(--sk-tile);
  border: 1px solid var(--sk-border);
}

.pd-header-text {
  flex: 1;
  min-width: 0;
}

.pd-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--sk-ink);
}

.pd-subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--sk-muted);
}

.pd-close {
  align-self: flex-start;
  color: var(--sk-muted) !important;
}

.pd-body {
  padding: 24px !important;
}

.pd-grid {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 28px;
}

/* Image column */
.pd-media {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pd-dropzone {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1 / 1;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background: var(--sk-img-tile);
  border: 1.5px dashed var(--sk-brand-300);
  border-radius: 16px;
  transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}

.pd-dropzone--filled {
  border-style: solid;
  border-color: var(--sk-border);
}

.pd-dropzone:hover,
.pd-dropzone--over {
  border-color: var(--sk-brand-500);
}

.pd-dropzone--over {
  box-shadow: 0 0 0 4px rgba(var(--sk-brand-500-rgb), 0.18);
}

.pd-dropzone:focus-visible {
  outline: none;
  border-color: var(--sk-brand-700);
  box-shadow: 0 0 0 3px rgba(var(--sk-brand-500-rgb), 0.35);
}

.pd-dropzone-img {
  width: 100%;
  height: 100%;
  padding: 18px;
  object-fit: contain;
}

.pd-dropzone-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px;
  text-align: center;
}

.pd-dropzone-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-bottom: 4px;
  color: var(--sk-brand-700);
  background: var(--sk-surface);
  border-radius: 50%;
  box-shadow: var(--sk-shadow-sm);
}

.pd-dropzone-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--sk-accent-ink);
}

.pd-dropzone-hint {
  font-size: 12px;
  line-height: 1.5;
  color: var(--sk-muted);
}

.pd-dropzone-overlay {
  position: absolute;
  left: 50%;
  bottom: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  color: #fff;
  background: rgba(var(--sk-brand-900-rgb), 0.82);
  border-radius: 999px;
  opacity: 0;
  transform: translate(-50%, 4px);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.pd-dropzone:hover .pd-dropzone-overlay,
.pd-dropzone:focus-visible .pd-dropzone-overlay {
  opacity: 1;
  transform: translate(-50%, 0);
}

.pd-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px 7px 12px;
  font-size: 13px;
  color: var(--sk-ink-soft);
  background: var(--sk-tile);
  border-radius: 10px;
}

.pd-file-icon {
  color: var(--sk-muted);
}

.pd-file-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pd-file-clear {
  display: inline-flex;
  padding: 4px;
  color: var(--sk-muted);
  border-radius: 6px;
}

.pd-file-clear:hover {
  color: var(--sk-ink);
  background: var(--sk-hover);
}

.pd-media-note {
  margin: 0;
  font-size: 12px;
  text-align: center;
  color: var(--sk-muted);
}

/* Fields column */
.pd-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.pd-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.pd-field {
  min-width: 0;
}

.pd-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--sk-ink-soft);
}

.pd-fields :deep(.v-field) {
  border-radius: 10px;
  font-size: 14px;
}

.pd-fields :deep(.v-field__outline) {
  --v-field-border-opacity: 0.16;
}

.pd-fields :deep(.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 1;
}

.pd-fields :deep(.v-text-field__prefix),
.pd-fields :deep(.v-text-field__suffix) {
  font-size: 13px;
  color: var(--sk-muted);
  opacity: 1;
}

/* Hide number spinners; they crowd the ₱ / units affixes */
.pd-fields :deep(input[type='number']) {
  -moz-appearance: textfield;
  appearance: textfield;
}

.pd-fields :deep(input[type='number']::-webkit-inner-spin-button),
.pd-fields :deep(input[type='number']::-webkit-outer-spin-button) {
  margin: 0;
  -webkit-appearance: none;
}

.pd-fields :deep(input::placeholder),
.pd-fields :deep(textarea::placeholder) {
  color: var(--sk-placeholder);
  opacity: 1;
}

.pd-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 10px 10px 14px;
  background: var(--sk-tile);
  border-radius: 12px;
}

.pd-status-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--sk-ink);
}

.pd-status :deep(.v-switch) {
  flex: none;
}

.pd-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 24px;
  border-top: 1px solid var(--sk-border);
}

.pd-btn {
  min-width: 96px;
  height: 40px !important;
  padding: 0 18px !important;
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

@media (max-width: 720px) {
  .pd-body {
    padding: 18px !important;
  }

  .pd-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .pd-dropzone {
    aspect-ratio: auto;
    height: 180px;
  }

  .pd-header {
    padding: 16px 14px 14px 18px;
  }

  .pd-footer {
    padding: 12px 18px;
  }
}

.product-view-image {
  background: var(--sk-img-tile);
}

.no-image-panel {
  background: var(--sk-tile);
}
</style>
