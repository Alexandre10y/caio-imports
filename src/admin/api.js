import { fetchAllProducts, mapProductRow } from '../lib/catalog'
import { PRODUCT_BUCKET, supabase } from '../lib/supabase'

/* ----------------------------------------------------------------- produtos */

export { fetchAllProducts }

export async function fetchProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(id, url, label, position)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? mapProductRow(data) : null
}

function productPayload(values) {
  return {
    slug: values.slug,
    model: values.model.trim(),
    brand: values.brand.trim(),
    modality: values.modality,
    price: Number(values.price) || 0,
    cost: values.cost === '' || values.cost == null ? null : Number(values.cost),
    description: values.description ?? '',
    specs: values.specs ?? {},
    sizes: values.sizes ?? [],
    colors: values.colors ?? [],
    stock: Number(values.stock) || 0,
    featured: Boolean(values.featured),
    active: Boolean(values.active),
    position: Number(values.position) || 0,
    cover_image: values.images?.[0]?.url ?? null,
  }
}

export async function saveProduct({ id, values }) {
  const payload = productPayload(values)

  let productId = id
  if (productId) {
    const { error } = await supabase.from('products').update(payload).eq('id', productId)
    if (error) throw error
  } else {
    const { data, error } = await supabase.from('products').insert(payload).select('id').single()
    if (error) throw error
    productId = data.id
  }

  // A galeria é reescrita inteira: garante ordem e rótulos sem linhas órfãs.
  const { error: clearError } = await supabase
    .from('product_images')
    .delete()
    .eq('product_id', productId)
  if (clearError) throw clearError

  const gallery = (values.images ?? [])
    .filter((image) => image.url?.trim())
    .map((image, index) => ({
      product_id: productId,
      url: image.url.trim(),
      label: image.label?.trim() || `Ângulo ${index + 1}`,
      position: index,
    }))

  if (gallery.length > 0) {
    const { error } = await supabase.from('product_images').insert(gallery)
    if (error) throw error
  }

  return productId
}

export async function setProductFlag(id, patch) {
  const { error } = await supabase.from('products').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function uploadProductImage(file, slug) {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${slug || 'sem-slug'}/${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from(PRODUCT_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/* ------------------------------------------------------------------- vendas */

export const SALE_STATUS = [
  { value: 'negociando', label: 'Negociando' },
  { value: 'pago', label: 'Pago' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelado', label: 'Cancelado' },
]

export const SALE_CHANNELS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'outro', label: 'Outro' },
]

export const PAYMENT_METHODS = [
  { value: 'pix', label: 'Pix' },
  { value: 'credito', label: 'Crédito' },
  { value: 'debito', label: 'Débito' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'outro', label: 'Outro' },
]

// Vendas confirmadas — o que entra no faturamento.
export const CONFIRMED_STATUS = ['pago', 'enviado', 'entregue']

export async function fetchSales({ from, to, status, channel } = {}) {
  let request = supabase.from('sales').select('*').order('sold_at', { ascending: false })

  if (from) request = request.gte('sold_at', `${from}T00:00:00`)
  if (to) request = request.lte('sold_at', `${to}T23:59:59`)
  if (status && status !== 'all') request = request.eq('status', status)
  if (channel && channel !== 'all') request = request.eq('channel', channel)

  const { data, error } = await request
  if (error) throw error
  return data ?? []
}

export async function createSale(payload) {
  const { data, error } = await supabase.from('sales').insert(payload).select('id').single()
  if (error) throw error
  return data.id
}

export async function updateSale(id, payload) {
  const { error } = await supabase.from('sales').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteSale(id) {
  const { error } = await supabase.from('sales').delete().eq('id', id)
  if (error) throw error
}

export async function decrementStock(productId, quantity) {
  const { data, error } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single()
  if (error) throw error

  const next = Math.max(0, (data.stock ?? 0) - quantity)
  const { error: updateError } = await supabase
    .from('products')
    .update({ stock: next })
    .eq('id', productId)
  if (updateError) throw updateError
}

/* ------------------------------------------------------------- monitoramento */

export async function fetchInterestEvents(days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('product_events')
    .select('product_id, type, created_at')
    .gte('created_at', since.toISOString())
    .limit(5000)

  if (error) throw error
  return data ?? []
}
