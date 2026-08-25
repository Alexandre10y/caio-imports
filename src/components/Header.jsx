import ThemeToggle from './ThemeToggle'
import { Menu, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PriceFilter from './PriceFilter'

export default function Header({
  drawerOpen,
  onToggleDrawer,
  query,
  onQueryChange,
  price,
  onPriceChange,
  bounds,
  onSearch,
  theme,
  onToggleTheme,
}) {
  const [scrolled, setScrolled] = useState(false)
  const [priceOpen, setPriceOpen] = useState(false)
  const priceRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onPointer(event) {
      if (priceRef.current && !priceRef.current.contains(event.target)) {
        setPriceOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [])

  function handleSearch(event) {
    event.preventDefault()
    onSearch?.()
  }

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="site-header__bar flex items-center gap-3">
        <button
          type="button"
          className="icon-btn"
          aria-label={drawerOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={drawerOpen}
          onClick={onToggleDrawer}
        >
          {drawerOpen ? <X size={20} strokeWidth={2.2} /> : <Menu size={20} strokeWidth={2.2} />}
        </button>

        <Link to="/" className="brand-mark">
          <span>CAIO</span>
          <span className="brand-mark__accent">IMPORTS</span>
        </Link>

        <form className="search-bar hidden md:flex items-center gap-2" onSubmit={handleSearch}>
          <Search size={16} strokeWidth={2.2} />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar modelo, marca..."
            aria-label="Buscar chuteiras"
          />
        </form>

        <div className="header-actions ml-auto flex items-center gap-2" ref={priceRef}>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            type="button"
            className={`ghost-btn ghost-btn--filter ${priceOpen ? 'is-active' : ''}`}
            onClick={() => setPriceOpen((open) => !open)}
          >
            <SlidersHorizontal size={15} />
            <span>Filtrar os preços</span>
          </button>

          {priceOpen ? (
            <div className="price-popover">
              <PriceFilter
                min={price.min}
                max={price.max}
                bounds={bounds}
                onChange={onPriceChange}
              />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
