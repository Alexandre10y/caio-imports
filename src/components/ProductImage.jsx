import { productImageSrc } from '../lib/productImage'

export default function ProductImage({
  src,
  width = 900,
  alt = '',
  loading = 'lazy',
  className,
  style,
}) {
  const optimized = productImageSrc(src, { width })

  return (
    <img
      src={optimized}
      alt={alt}
      loading={loading}
      className={className}
      style={style}
      onError={(event) => {
        const img = event.currentTarget
        if (src && img.src !== src) img.src = src
      }}
    />
  )
}
