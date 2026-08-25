import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { brandsFrom, fetchPublicCatalog, fetchSiteContent, priceBoundsFrom } from '../lib/catalog'
import { DEFAULT_CONTENT } from '../lib/defaultContent'
import { supabase } from '../lib/supabase'
import { products as fallbackProducts } from '../mockData'

const CatalogContext = createContext(null)

function mergeContent(remote) {
  const keys = new Set([...Object.keys(DEFAULT_CONTENT), ...Object.keys(remote ?? {})])
  const merged = {}
  keys.forEach((key) => {
    merged[key] = { ...(DEFAULT_CONTENT[key] ?? {}), ...(remote?.[key] ?? {}) }
  })
  return merged
}

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState(fallbackProducts)
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [live, setLive] = useState(false)

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [catalog, remoteContent] = await Promise.all([fetchPublicCatalog(), fetchSiteContent()])
      if (catalog.length > 0) setProducts(catalog)
      setContent(mergeContent(remoteContent))
      setLive(true)
    } catch {
      // Mantém o catálogo local para a loja nunca aparecer vazia.
      setLive(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const value = useMemo(
    () => ({
      products,
      content,
      loading,
      live,
      reload: load,
      brands: brandsFrom(products),
      priceBounds: priceBoundsFrom(products),
      whatsapp: content.contact?.whatsapp ?? DEFAULT_CONTENT.contact.whatsapp,
      instagram: content.contact?.instagram ?? DEFAULT_CONTENT.contact.instagram,
    }),
    [content, live, load, loading, products],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('useCatalog precisa estar dentro de CatalogProvider')
  return context
}
