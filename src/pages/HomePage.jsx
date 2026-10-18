import { useEffect, useMemo } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import Guarantee from '../components/Guarantee'
import Hero from '../components/Hero'
import ProductShowcase from '../components/ProductShowcase'
import StoreGuide from '../components/StoreGuide'
import { useCatalog } from '../hooks/useCatalog'
import { usePageMeta } from '../hooks/usePageMeta'
import { HOME_DESCRIPTION, HOME_TITLE, graphJsonLd, storeJsonLd } from '../lib/localSeo'

export default function HomePage({
  products,
  modality,
  brand,
  filterKey,
  onModalityChange,
  onBrandChange,
}) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('pagina')) || 1)
  const { whatsapp, instagram } = useCatalog()
  const jsonLd = useMemo(
    () => graphJsonLd([storeJsonLd({ phone: whatsapp, instagram, path: page > 1 ? `/?pagina=${page}` : '/' })]),
    [instagram, page, whatsapp],
  )

  usePageMeta({
    title: page > 1 ? `Chuteiras · Página ${page} | CAIO IMPORTS` : HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: page > 1 ? `/?pagina=${page}` : '/',
    jsonLd,
  })

  useEffect(() => {
    if (location.hash === '#vitrine') {
      document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash])

  return (
    <main>
      <Hero />
      <ProductShowcase
        products={products}
        modality={modality}
        brand={brand}
        onModalityChange={onModalityChange}
        onBrandChange={onBrandChange}
        filterKey={filterKey}
      />
      <StoreGuide />
      <Guarantee />
    </main>
  )
}
