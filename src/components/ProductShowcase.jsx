import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCatalog } from '../hooks/useCatalog'
import { MODALITIES } from '../lib/catalog'
import { REGION_PATH } from '../lib/localSeo'
import BlurText from './bits/BlurText'
import ScrollReveal from './bits/ScrollReveal'
import ProductCard from './ProductCard'

// 15 cards na grade. O destaque fica só na primeira página, fora dessa conta,
// então a abertura mostra no máximo 16 chuteiras e as seguintes, 15.
const PAGE_SIZE = 15

function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)

  const visible = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...visible].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b)
  const slots = []

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) slots.push('gap')
    slots.push(page)
  })

  return slots
}

export default function ProductShowcase({
  products,
  modality,
  brand,
  filterKey = '',
  onModalityChange,
  onBrandChange,
}) {
  const { brands, content, loading } = useCatalog()
  const copy = content.showcase
  const [searchParams, setSearchParams] = useSearchParams()
  const featured = products.find((item) => item.featured) ?? products[0]
  const catalog = products.filter((item) => item.id !== featured?.id)
  const totalPages = Math.max(1, Math.ceil(catalog.length / PAGE_SIZE) || 1)
  const requested = Math.max(1, Number(searchParams.get('pagina')) || 1)
  const safePage = Math.min(requested, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const rest = catalog.slice(start, start + PAGE_SIZE)
  const featuredOnPage = safePage === 1 && Boolean(featured)
  const shownFrom = featured ? start + (featuredOnPage ? 1 : 2) : start + 1
  const shownTo = (featured ? 1 : 0) + start + rest.length
  const showPager = totalPages > 1
  const pages = pageWindow(safePage, totalPages)
  const skipFilterReset = useRef(true)

  useEffect(() => {
    if (skipFilterReset.current) {
      skipFilterReset.current = false
      return
    }
    setSearchParams(
      (prev) => {
        if (!prev.get('pagina')) return prev
        const next = new URLSearchParams(prev)
        next.delete('pagina')
        return next
      },
      { replace: true },
    )
  }, [brand, filterKey, modality, setSearchParams])

  useEffect(() => {
    if (loading || requested <= totalPages) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (totalPages <= 1) next.delete('pagina')
        else next.set('pagina', String(totalPages))
        return next
      },
      { replace: true },
    )
  }, [loading, requested, setSearchParams, totalPages])

  function pageHref(target) {
    const params = new URLSearchParams(searchParams)
    if (target <= 1) params.delete('pagina')
    else params.set('pagina', String(target))
    const search = params.toString()
    return { pathname: '/', search: search ? `?${search}` : '', hash: 'vitrine' }
  }

  function scrollToVitrine() {
    window.requestAnimationFrame(() => {
      document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <section className="vitrine" id="vitrine">
      <ScrollReveal className="section-head">
        <p className="kicker">{copy.kicker}</p>
        <BlurText
          key={copy.title}
          text={copy.title}
          animateBy="words"
          delay={90}
          className="section-title"
          as="h2"
        />
      </ScrollReveal>

      <ScrollReveal delay={0.08} className="vitrine-filters flex flex-wrap gap-2">
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
        <button
          type="button"
          className={`chip chip--ghost ${brand === 'all' ? 'is-active' : ''}`}
          onClick={() => onBrandChange('all')}
        >
          Todas
        </button>
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
      </ScrollReveal>

      {products.length === 0 ? (
        <p className="empty-state">Nenhuma chuteira nesse recorte. Solta o filtro e volta pro jogo.</p>
      ) : (
        <>
          {featuredOnPage ? (
            <ScrollReveal key={featured.id} delay={0.05}>
              <ProductCard product={featured} index={0} featured />
            </ScrollReveal>
          ) : null}
          <div
            className={`product-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${
              featuredOnPage ? '' : 'product-grid--continued'
            }`}
          >
            {rest.map((product, index) => (
              <ScrollReveal key={product.id} delay={Math.min(index * 0.06, 0.3)} once>
                <ProductCard product={product} index={start + index + 1} />
              </ScrollReveal>
            ))}
          </div>

          <nav className="vitrine-pager" aria-label="Páginas da vitrine">
            <p className="vitrine-pager__meta">
              {shownFrom === shownTo
                ? `Mostrando 1 de ${products.length}`
                : `Mostrando ${shownFrom}–${shownTo} de ${products.length}`}
            </p>
            {showPager ? (
              <div className="vitrine-pager__controls">
                {safePage === 1 ? (
                  <button type="button" className="vitrine-pager__btn" disabled>
                    Anterior
                  </button>
                ) : (
                  <Link to={pageHref(safePage - 1)} className="vitrine-pager__btn" onClick={scrollToVitrine}>
                    Anterior
                  </Link>
                )}
                {pages.map((item, index) =>
                  item === 'gap' ? (
                    <span key={`gap-${index}`} className="vitrine-pager__gap" aria-hidden="true">
                      …
                    </span>
                  ) : (
                    <Link
                      key={item}
                      to={pageHref(item)}
                      className={`vitrine-pager__btn ${item === safePage ? 'is-active' : ''}`}
                      aria-label={`Página ${item}`}
                      aria-current={item === safePage ? 'page' : undefined}
                      onClick={scrollToVitrine}
                    >
                      {item}
                    </Link>
                  ),
                )}
                {safePage === totalPages ? (
                  <button type="button" className="vitrine-pager__btn" disabled>
                    Próxima
                  </button>
                ) : (
                  <Link to={pageHref(safePage + 1)} className="vitrine-pager__btn" onClick={scrollToVitrine}>
                    Próxima
                  </Link>
                )}
              </div>
            ) : null}
          </nav>
          <Link to={REGION_PATH} className="vitrine-region">
            Chuteiras em Laranjeiras do Sul, Barreiro, Rio Bonito do Iguaçu e Marquinho
          </Link>
        </>
      )}
    </section>
  )
}
