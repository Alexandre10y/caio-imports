import { ArrowLeft } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import ProductImage from '../components/ProductImage'
import { WhatsAppIcon } from '../components/icons/BrandIcons'
import { useCatalog } from '../hooks/useCatalog'
import { getSimilar, trackProductEvent } from '../lib/catalog'
import { buildWhatsAppLink, formatBRL } from '../lib/format'

export default function ProductPage() {
  const { id } = useParams()
  const { products, loading, whatsapp } = useCatalog()
  const product = products.find((item) => item.id === id)
  const similar = useMemo(() => getSimilar(products, product), [product, products])
  const [activeIndex, setActiveIndex] = useState(0)
  const [size, setSize] = useState(null)
  const [color, setColor] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    if (!product) return
    setActiveIndex(0)
    setSize(product.sizes[Math.floor(product.sizes.length / 2)])
    setColor(product.colors[0])
  }, [product])

  useEffect(() => {
    if (product?.dbId) trackProductEvent(product.dbId, 'view')
  }, [product?.dbId])

  if (!product) {
    if (loading) {
      return (
        <main className="pdp">
          <p className="empty-state">Carregando o drop…</p>
        </main>
      )
    }
    return <Navigate to="/" replace />
  }

  const activeImage = product.images[activeIndex] ?? product.images[0]
  const whatsappHref = buildWhatsAppLink({
    model: product.model,
    color: color?.name ?? product.colors[0].name,
    size: size ?? product.sizes[0],
    phone: whatsapp,
  })

  return (
    <main className="pdp">
      <Link to="/" className="pdp-back inline-flex items-center gap-2">
        <ArrowLeft size={16} />
        Voltar à vitrine
      </Link>

      <div className="pdp-layout">
        <div className="pdp-gallery">
          <div className="pdp-thumbs" role="list">
            {product.images.map((shot, index) => (
              <button
                key={`${shot.src}-${shot.label}-${index}`}
                type="button"
                role="listitem"
                className={`pdp-thumb ${index === activeIndex ? 'is-active' : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver ângulo ${shot.label}`}
              >
                <ProductImage src={shot.src} width={240} alt="" />
              </button>
            ))}
          </div>

          <figure className="pdp-stage">
            <div className="pdp-stage__frame">
              <ProductImage
                src={activeImage.src}
                width={1600}
                alt={`${product.brand} ${product.model} — ${activeImage.label}`}
                style={{ filter: color?.filter }}
              />
            </div>
            <figcaption>{activeImage.label}</figcaption>
          </figure>
        </div>

        <aside className="pdp-info flex flex-col gap-5">
          <div>
            <p className="kicker">
              {product.brand} · {product.modality}
            </p>
            <h1>{product.model}</h1>
            <p className="pdp-price">{formatBRL(product.price)}</p>
          </div>

          <ul className="pdp-specs">
            {Object.entries(product.specs ?? {}).map(([label, value]) => (
              <li key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </li>
            ))}
          </ul>

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
            className="whatsapp-btn inline-flex items-center justify-center gap-2"
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackProductEvent(product.dbId, 'whatsapp_click')}
          >
            <WhatsAppIcon />
            Comprar pelo WhatsApp
          </a>
        </aside>
      </div>

      <section className="pdp-copy">
        <p className="kicker">Sobre a chuteira</p>
        <h2>Descrição</h2>
        <p>{product.description}</p>
      </section>

      {similar.length > 0 ? (
        <section className="pdp-similar">
          <p className="kicker">Continua o drop</p>
          <h2>Modelos semelhantes</h2>
          <div className="product-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {similar.map((item, index) => (
              <ProductCard key={item.id} product={item} index={index} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
