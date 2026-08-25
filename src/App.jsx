import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Drawer from './components/Drawer'
import Footer from './components/Footer'
import Header from './components/Header'
import { useCatalog } from './hooks/useCatalog'
import { useTheme } from './hooks/useTheme'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'

// O painel só é baixado quando alguém abre /admin — a loja continua leve.
const AdminApp = lazy(() => import('./admin/AdminApp'))

function Storefront() {
  const { products, priceBounds } = useCatalog()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [modality, setModality] = useState('all')
  const [brand, setBrand] = useState('all')
  const [price, setPrice] = useState(priceBounds)
  const [priceTouched, setPriceTouched] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  // Enquanto o dono não mexer no filtro, ele acompanha a faixa real do catálogo.
  useEffect(() => {
    if (priceTouched) return
    setPrice({ min: priceBounds.min, max: priceBounds.max })
  }, [priceBounds.max, priceBounds.min, priceTouched])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return products.filter((item) => {
      const matchesQuery =
        needle.length === 0 ||
        item.model.toLowerCase().includes(needle) ||
        item.brand.toLowerCase().includes(needle)
      const matchesModality = modality === 'all' || item.modality === modality
      const matchesBrand = brand === 'all' || item.brand === brand
      const matchesPrice = item.price >= price.min && item.price <= price.max
      return matchesQuery && matchesModality && matchesBrand && matchesPrice
    })
  }, [brand, modality, price.max, price.min, products, query])

  function goToVitrine() {
    if (location.pathname !== '/') {
      navigate({ pathname: '/', hash: 'vitrine' })
      return
    }
    document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handlePriceChange(next) {
    setPriceTouched(true)
    setPrice(next)
  }

  return (
    <div className="app-shell">
      <div className="grain" aria-hidden="true" />
      <Header
        drawerOpen={drawerOpen}
        onToggleDrawer={() => setDrawerOpen((open) => !open)}
        query={query}
        onQueryChange={setQuery}
        price={price}
        onPriceChange={handlePriceChange}
        bounds={priceBounds}
        onSearch={goToVitrine}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        query={query}
        onQueryChange={setQuery}
        modality={modality}
        onModalityChange={setModality}
        brand={brand}
        onBrandChange={setBrand}
        price={price}
        onPriceChange={handlePriceChange}
        bounds={priceBounds}
        onGoToVitrine={goToVitrine}
      />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              products={filtered}
              modality={modality}
              brand={brand}
              onModalityChange={setModality}
              onBrandChange={setBrand}
            />
          }
        />
        <Route path="/chuteira/:id" element={<ProductPage />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<div className="admin-boot">Carregando painel…</div>}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="/*" element={<Storefront />} />
    </Routes>
  )
}
