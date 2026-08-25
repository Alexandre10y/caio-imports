import { useCatalog } from '../hooks/useCatalog'
import { MODALITIES } from '../lib/catalog'
import BlurText from './bits/BlurText'
import ProductCard from './ProductCard'

export default function ProductShowcase({
  products,
  modality,
  brand,
  onModalityChange,
  onBrandChange,
}) {
  const { brands, content } = useCatalog()
  const copy = content.showcase
  const featured = products.find((item) => item.featured) ?? products[0]
  const rest = products.filter((item) => item.id !== featured?.id)

  return (
    <section className="vitrine" id="vitrine">
      <div className="section-head">
        <p className="kicker">{copy.kicker}</p>
        <BlurText
          key={copy.title}
          text={copy.title}
          animateBy="words"
          delay={90}
          className="section-title"
          as="h2"
        />
      </div>

      <div className="vitrine-filters flex flex-wrap gap-2">
        <button
          type="button"
          className={`chip ${modality === 'all' ? 'is-active' : ''}`}
          onClick={() => onModalityChange('all')}
        >
          Todas
        </button>
        {MODALITIES.map((item) => (
          <button
            key={item}
            type="button"
            className={`chip ${modality === item ? 'is-active' : ''}`}
            onClick={() => onModalityChange(modality === item ? 'all' : item)}
          >
            {item}
          </button>
        ))}
        <span className="chip-divider" />
        {brands.map((item) => (
          <button
            key={item}
            type="button"
            className={`chip chip--ghost ${brand === item ? 'is-active' : ''}`}
            onClick={() => onBrandChange(brand === item ? 'all' : item)}
          >
            {item}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="empty-state">Nenhuma chuteira nesse recorte. Solta o filtro e volta pro jogo.</p>
      ) : (
        <>
          {featured ? <ProductCard product={featured} index={0} featured /> : null}
          <div className="product-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {rest.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index + 1} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
