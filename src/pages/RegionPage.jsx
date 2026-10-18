import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../hooks/useCatalog'
import { usePageMeta } from '../hooks/usePageMeta'
import { onlyDigits } from '../lib/format'
import {
  REGION_DESCRIPTION,
  REGION_PATH,
  REGION_TITLE,
  SERVICE_AREAS,
  graphJsonLd,
  storeJsonLd,
} from '../lib/localSeo'

export default function RegionPage() {
  const { products, whatsapp, instagram } = useCatalog()
  const jsonLd = useMemo(
    () => graphJsonLd([storeJsonLd({ phone: whatsapp, instagram, path: REGION_PATH })]),
    [instagram, whatsapp],
  )

  usePageMeta({
    title: REGION_TITLE,
    description: REGION_DESCRIPTION,
    path: REGION_PATH,
    jsonLd,
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const whatsappHref = `https://wa.me/${onlyDigits(whatsapp)}?text=${encodeURIComponent(
    'Olá, quero ver chuteiras para Laranjeiras do Sul e região.',
  )}`

  return (
    <main className="region">
      <header className="section-head">
        <p className="kicker">Laranjeiras do Sul e região</p>
        <h1 className="section-title">Chuteiras em Laranjeiras do Sul</h1>
        <p className="region-lead">
          A CAIO IMPORTS é loja de chuteiras para quem joga em Laranjeiras do Sul, no Barreiro, em
          Rio Bonito do Iguaçu e em Marquinho. Society, campo e futsal — inclusive o que muita gente
          busca como tênis de futsal — ficam no mesmo catálogo, com pedido pelo WhatsApp.
        </p>
        <div className="region-actions flex flex-wrap gap-3">
          <Link className="cta-volt inline-flex items-center" to={{ pathname: '/', hash: 'vitrine' }}>
            Ver a vitrine
          </Link>
          <a className="ghost-btn inline-flex items-center" href={whatsappHref}>
            Chamar no WhatsApp
          </a>
        </div>
      </header>

      <section className="region-block" aria-labelledby="cidades-atendidas">
        <h2 id="cidades-atendidas">Onde comprar chuteira nessa região</h2>
        <div className="guide-grid grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERVICE_AREAS.map((area) => (
            <article key={area.slug} className="guide-card" id={area.slug}>
              <p className="kicker">Paraná</p>
              <h3>{area.name}</h3>
              <p>{area.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="region-block" aria-labelledby="modalidades-regiao">
        <h2 id="modalidades-regiao">Society, campo e futsal</h2>
        <div className="guide-grid grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="guide-card">
            <h3>Society</h3>
            <p>Solado TF, para grama sintética. É a chuteira de society que a vitrine separa no filtro.</p>
          </article>
          <article className="guide-card">
            <h3>Campo</h3>
            <p>Trava FG, para gramado natural. O par de campo entra na mesma conversa do WhatsApp.</p>
          </article>
          <article className="guide-card">
            <h3>Futsal</h3>
            <p>
              Solado liso para quadra. Na busca, tênis de futsal e chuteira de futsal apontam para esse
              tipo de modelo.
            </p>
          </article>
        </div>
      </section>

      <section className="region-block" aria-labelledby="indice-vitrine">
        <h2 id="indice-vitrine">Modelos na vitrine</h2>
        <p className="region-lead">
          Cada chuteira tem página própria, com marca, modalidade e preço. Esse índice liga o catálogo
          inteiro, além das páginas da vitrine.
        </p>
        <ul className="region-index">
          {products.map((product) => (
            <li key={product.id}>
              <Link to={`/chuteira/${product.id}`}>
                <strong>
                  {product.brand} {product.model}
                </strong>
                <span>{product.modality}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
