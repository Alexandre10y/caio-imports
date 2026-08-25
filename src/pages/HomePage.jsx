import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import DropRail from '../components/DropRail'
import Guarantee from '../components/Guarantee'
import Hero from '../components/Hero'
import ProductShowcase from '../components/ProductShowcase'
import StoreGuide from '../components/StoreGuide'

export default function HomePage({ products, modality, brand, onModalityChange, onBrandChange }) {
  const location = useLocation()

  useEffect(() => {
    if (location.hash === '#vitrine') {
      document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash])

  return (
    <main>
      <Hero />
      <DropRail products={products} />
      <ProductShowcase
        products={products}
        modality={modality}
        brand={brand}
        onModalityChange={onModalityChange}
        onBrandChange={onBrandChange}
      />
      <StoreGuide />
      <Guarantee />
    </main>
  )
}
