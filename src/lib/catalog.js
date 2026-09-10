import { supabase } from './supabase'

export const MODALITIES = ['Society', 'Campo', 'Futsal']
export const SIZE_RANGE = Array.from({ length: 14 }, (_, index) => 33 + index)
export const FALLBACK_COLOR = { name: 'Padrão', hex: '#C8FF00' }

const PRODUCT_SELECT = '*, product_images(id, url, label, position, color_name)'

export function normalizeColors(raw) {
  const list = Array.isArray(raw) ? raw : []
  const clean = list
    .filter((item) => item && (item.name || item.hex))
    .map((item) => ({
      name: item.name || 'Cor',
      hex: item.hex || '#C8FF00',
    }))
  return clean.length > 0 ? clean : [FALLBACK_COLOR]
}

export function imagesForColor(product, colorName) {
  const images = product?.images ?? []
  if (images.length === 0) return []

  const needle = (colorName || '').trim().toLowerCase()
  const matched = needle
    ? images.filter((image) => (image.colorName || '').trim().toLowerCase() === needle)
    : []

  if (matched.length > 0) return matched

  // Fallback: primeira cor que tiver fotos, senão a galeria inteira.
  for (const color of product?.colors ?? []) {
    const name = (color.name || '').trim().toLowerCase()
    if (!name) continue
    const group = images.filter((image) => (image.colorName || '').trim().toLowerCase() === name)
    if (group.length > 0) return group
  }

  return images
}

export function coverForColor(product, colorName) {
  return imagesForColor(product, colorName)[0]?.src || product?.image || ''
}

export function mapProductRow(row) {
  const images = [...(row.product_images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((item) => ({
      id: item.id,
      src: item.url,
      label: item.label || 'Ângulo',
      colorName: item.color_name || '',
    }))

  const colors = normalizeColors(row.colors)
  const defaultGallery = imagesForColor(
    { images, colors },
    colors[0]?.name,
  )
  const cover = row.cover_image || defaultGallery[0]?.src || images[0]?.src || ''
  const sizes = [...(row.sizes ?? [])].sort((a, b) => a - b)

  return {
    id: row.slug,
    dbId: row.id,
    slug: row.slug,
    model: row.model,
    brand: row.brand,
    modality: row.modality,
    price: Number(row.price ?? 0),
    cost: row.cost == null ? null : Number(row.cost),
    description: row.description ?? '',
    specs: row.specs ?? {},
    sizes: sizes.length > 0 ? sizes : [40],
    colors,
    image: cover,
    images: images.length > 0 ? images : cover ? [{ src: cover, label: 'Frontal', colorName: colors[0]?.name || '' }] : [],
    stock: row.stock ?? 0,
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    position: row.position ?? 0,
    updatedAt: row.updated_at,
  }
}

export async function fetchPublicCatalog() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('active', true)
    .order('position', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapProductRow)
}

export async function fetchAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('position', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapProductRow)
}

export async function fetchProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data ? mapProductRow(data) : null
}

export async function fetchSiteContent() {
  const { data, error } = await supabase.from('site_content').select('key, value')
  if (error) throw error

  return (data ?? []).reduce((acc, row) => {
    acc[row.key] = row.value ?? {}
    return acc
  }, {})
}

export async function saveSiteContent(key, value) {
  const { error } = await supabase
    .from('site_content')
    .upsert({ key, value }, { onConflict: 'key' })
  if (error) throw error
}

export function brandsFrom(products) {
  return [...new Set(products.map((item) => item.brand).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  )
}

export function priceBoundsFrom(products) {
  if (products.length === 0) return { min: 0, max: 2000 }
  const prices = products.map((item) => item.price)
  return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) }
}

export function getSimilar(products, product, limit = 3) {
  if (!product) return []
  return products
    .filter((item) => item.id !== product.id)
    .map((item) => ({
      item,
      score: (item.brand === product.brand ? 2 : 0) + (item.modality === product.modality ? 2 : 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item)
}

// Monitoramento anônimo de interesse — sem dado pessoal, só o produto e o tipo.
export function trackProductEvent(productDbId, type) {
  if (!supabase || !productDbId) return
  void supabase
    .from('product_events')
    .insert({ product_id: productDbId, type })
    .then(() => {})
    .catch(() => {})
}
