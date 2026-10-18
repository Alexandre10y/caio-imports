export const SITE_ORIGIN = 'https://caioimports.com'
export const REGION_PATH = '/chuteiras-na-regiao'

export const HOME_TITLE = 'CAIO IMPORTS · Chuteiras em Laranjeiras do Sul e região'
export const HOME_DESCRIPTION =
  'Chuteiras de society, campo e futsal em Laranjeiras do Sul, Barreiro, Rio Bonito do Iguaçu e Marquinho. CAIO IMPORTS, pedido pelo WhatsApp.'

export const REGION_TITLE =
  'Chuteiras em Laranjeiras do Sul, Rio Bonito do Iguaçu, Marquinho e Barreiro | CAIO IMPORTS'
export const REGION_DESCRIPTION =
  'Onde comprar chuteira em Laranjeiras do Sul e região: society, campo e futsal na CAIO IMPORTS, com pedido pelo WhatsApp.'

export const SERVICE_AREAS = [
  {
    slug: 'laranjeiras-do-sul',
    name: 'Laranjeiras do Sul',
    kind: 'City',
    text: 'Em Laranjeiras do Sul, a compra de chuteira de society, campo ou futsal fica na vitrine da CAIO IMPORTS. Você escolhe marca, número e cor, e o pedido segue pelo WhatsApp.',
  },
  {
    slug: 'barreiro',
    name: 'Barreiro',
    kind: 'Place',
    containedIn: 'Laranjeiras do Sul',
    text: 'Quem está no Barreiro, em Laranjeiras do Sul, usa o mesmo catálogo. O frete e a forma de pagamento são combinados no WhatsApp, conforme o CEP.',
  },
  {
    slug: 'rio-bonito-do-iguacu',
    name: 'Rio Bonito do Iguaçu',
    kind: 'City',
    text: 'Em Rio Bonito do Iguaçu a loja atende com o catálogo completo de chuteiras importadas. Não precisa de uma vitrine física na cidade para ver modelo, preço e numeração.',
  },
  {
    slug: 'marquinho',
    name: 'Marquinho',
    kind: 'City',
    text: 'Em Marquinho, society, campo e futsal saem do mesmo estoque. A mensagem do WhatsApp já leva o modelo que você escolheu no site.',
  },
]

export function areaServedNodes() {
  return SERVICE_AREAS.map((area) => {
    if (area.kind === 'Place') {
      return {
        '@type': 'Place',
        name: `${area.name}, ${area.containedIn}`,
        containedInPlace: {
          '@type': 'City',
          name: area.containedIn,
          containedInPlace: { '@type': 'State', name: 'Paraná' },
        },
      }
    }
    return {
      '@type': 'City',
      name: area.name,
      containedInPlace: { '@type': 'State', name: 'Paraná' },
    }
  })
}

export function storeJsonLd({ phone, instagram, path = '/' } = {}) {
  const node = {
    '@type': 'SportingGoodsStore',
    name: 'CAIO IMPORTS',
    url: `${SITE_ORIGIN}${path}`,
    image: `${SITE_ORIGIN}/favicon.svg`,
    description: HOME_DESCRIPTION,
    areaServed: areaServedNodes(),
    knowsAbout: [
      'chuteira society',
      'chuteira de campo',
      'chuteira de futsal',
      'tênis de futsal',
      'chuteiras importadas',
    ],
  }
  if (instagram) node.sameAs = [instagram]
  if (phone) node.telephone = `+${String(phone).replace(/\D/g, '')}`
  return node
}

export function productJsonLd(product) {
  const image = product.image || product.images?.[0]?.src
  return {
    '@type': 'Product',
    name: `${product.brand} ${product.model}`,
    sku: product.slug || product.id,
    category: `Chuteira de ${product.modality}`,
    brand: { '@type': 'Brand', name: product.brand },
    description:
      product.description ||
      `Chuteira de ${product.modality} ${product.brand} ${product.model} na CAIO IMPORTS.`,
    image: image ? [image] : undefined,
    offers: {
      '@type': 'Offer',
      url: `${SITE_ORIGIN}/chuteira/${product.id}`,
      priceCurrency: 'BRL',
      price: Number(product.price ?? 0),
      availability:
        Number(product.stock ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  }
}

export function graphJsonLd(nodes) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean),
  }
}
