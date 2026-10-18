import { useEffect } from 'react'

function upsertMeta(name, content) {
  let element = document.querySelector(`meta[name="${name}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('name', name)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function upsertLink(rel, href) {
  let element = document.querySelector(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

export function usePageMeta({ title, description, path = '/', jsonLd }) {
  const serializedLd = JSON.stringify(jsonLd ?? null)

  useEffect(() => {
    const previousTitle = document.title
    document.title = title
    upsertMeta('description', description)

    const canonical = document.querySelector('link[rel="canonical"]')
    const previousCanonical = canonical?.getAttribute('href') ?? ''
    upsertLink('canonical', `https://caioimports.com${path}`)

    const script = document.getElementById('site-jsonld')
    const previousLd = script?.textContent ?? ''
    if (script && serializedLd !== 'null') script.textContent = serializedLd

    return () => {
      document.title = previousTitle
      if (canonical) canonical.setAttribute('href', previousCanonical)
      if (script) script.textContent = previousLd
    }
  }, [description, path, serializedLd, title])
}
