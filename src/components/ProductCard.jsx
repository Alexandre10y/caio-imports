import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../hooks/useCatalog'
import { trackProductEvent } from '../lib/catalog'
import { buildWhatsAppLink, formatBRL } from '../lib/format'
import { WhatsAppIcon } from './icons/BrandIcons'

export default function ProductCard({ product, index, featured = false }) {
  const { whatsapp } = useCatalog()
  const [size, setSize] = useState(product.sizes[Math.floor(product.sizes.length / 2)])
  const [color, setColor] = useState(product.colors[0])

  const whatsappHref = useMemo(
    () =>
      buildWhatsAppLink({
        model: product.model,
        color: color?.name,
        size,
        phone: whatsapp,
      }),
    [color?.name, product.model, size, whatsapp],
  )

  return (
    <article className={`product-card ${featured ? 'is-featured' : ''}`}>
      <Link to={`/chuteira/${product.id}`} className="product-card__media" aria-label={`Ver ${product.model}`}>
        <div className="product-card__visual">
          <img
            src={product.image}
            alt={`${product.brand} ${product.model}`}
            loading={featured ? 'eager' : 'lazy'}
            style={{ filter: color?.filter }}
          />
          <span className="product-card__stamp">{product.brand}</span>
          <span className="product-card__mod">{product.modality}</span>
          <span className="product-card__hint">Ver ângulos</span>
        </div>
      </Link>

      <div className="product-card__body flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="product-card__index">{String(index + 1).padStart(2, '0')} / DROP</p>
            <h3>
              <Link to={`/chuteira/${product.id}`}>{product.model}</Link>
            </h3>
          </div>
          <p className="product-card__price">{formatBRL(product.price)}</p>
        </div>

        <div>
          <p className="selector-label">Numeração</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((value) => (
              <button
                key={value}
                type="button"
                className={`size-pill ${size === value ? 'is-active' : ''}`}
                onClick={() => setSize(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="selector-label">Cor</p>
          <div className="flex items-center gap-3">
            {product.colors.map((option) => (
              <button
                key={option.name}
                type="button"
                className={`color-dot ${color?.name === option.name ? 'is-active' : ''}`}
                style={{ background: option.hex }}
                aria-label={option.name}
                onClick={() => setColor(option)}
              />
            ))}
            <span className="color-name">{color?.name}</span>
          </div>
        </div>

        <p className="product-card__help">
          Número {size} e cor {color?.name} já vão na mensagem do WhatsApp.
        </p>

        <a
          className="whatsapp-btn inline-flex items-center justify-center gap-2 mt-auto"
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackProductEvent(product.dbId, 'whatsapp_click')}
        >
          <WhatsAppIcon />
          Comprar pelo WhatsApp
        </a>
      </div>
    </article>
  )
}
