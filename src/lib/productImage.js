import { PRODUCT_BUCKET } from './supabase'

/** URL pública do bucket product-images no Supabase deste projeto. */
export function isHostedProductImage(url) {
  if (!url) return false
  return url.includes('supabase.co') && url.includes(`/${PRODUCT_BUCKET}/`)
}

/**
 * Versão mais leve para cards e vitrine (transformação do Supabase Storage).
 * Se a URL não for do nosso bucket, devolve o endereço original.
 */
export function productImageSrc(url, { width = 900, quality = 78 } = {}) {
  if (!url || !isHostedProductImage(url)) return url

  try {
    const parsed = new URL(url)
    const marker = `/storage/v1/object/public/${PRODUCT_BUCKET}/`
    const index = parsed.pathname.indexOf(marker)
    if (index === -1) return url

    const objectPath = parsed.pathname.slice(index + marker.length)
    const renderPath = `/storage/v1/render/image/public/${PRODUCT_BUCKET}/${objectPath}`
    const renderUrl = new URL(renderPath, parsed.origin)
    renderUrl.searchParams.set('width', String(width))
    renderUrl.searchParams.set('quality', String(quality))
    return renderUrl.toString()
  } catch {
    return url
  }
}
