import { ChevronRight, Search, X } from 'lucide-react'
import { useEffect } from 'react'
import { useCatalog } from '../hooks/useCatalog'
import { MODALITIES } from '../lib/catalog'
import PriceFilter from './PriceFilter'

export default function Drawer({
  open,
  onClose,
  query,
  onQueryChange,
  modality,
  onModalityChange,
  brand,
  onBrandChange,
  price,
  onPriceChange,
  bounds,
  onGoToVitrine,
}) {
  const { brands } = useCatalog()

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  function pick(kind, value) {
    if (kind === 'modality') onModalityChange(value)
    if (kind === 'brand') onBrandChange(value)
    onClose()
    onGoToVitrine?.()
  }

  return (
    <>
      <div
        className={`drawer-overlay ${open ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open} aria-label="Navegação">
        <div className="flex items-center justify-between gap-4">
          <p className="drawer__kicker">Menu de jogo</p>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar menu">
            <X size={18} />
          </button>
        </div>

        <form
          className="search-bar search-bar--drawer flex md:hidden items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            pick()
          }}
        >
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar chuteira..."
            aria-label="Buscar chuteiras"
          />
        </form>

        <section className="drawer__block">
          <h2>Modalidades</h2>
          <ul className="drawer__list">
            {MODALITIES.map((item, index) => (
              <li key={item}>
                <button
                  type="button"
                  className={`drawer__link ${modality === item ? 'is-active' : ''}`}
                  onClick={() => pick('modality', item)}
                >
                  <span>0{index + 1}</span>
                  <strong>{item}</strong>
                  <ChevronRight size={16} />
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className={`drawer__link ${modality === 'all' ? 'is-active' : ''}`}
                onClick={() => pick('modality', 'all')}
              >
                <span>00</span>
                <strong>Todas</strong>
                <ChevronRight size={16} />
              </button>
            </li>
          </ul>
        </section>

        <section className="drawer__block">
          <h2>Marcas</h2>
          <div className="flex flex-wrap gap-2">
            {brands.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip ${brand === item ? 'is-active' : ''}`}
                onClick={() => pick('brand', item)}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              className={`chip ${brand === 'all' ? 'is-active' : ''}`}
              onClick={() => pick('brand', 'all')}
            >
              Todas
            </button>
          </div>
        </section>

        <section className="drawer__block">
          <PriceFilter min={price.min} max={price.max} bounds={bounds} onChange={onPriceChange} />
        </section>
      </aside>
    </>
  )
}
