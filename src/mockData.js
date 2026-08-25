// Catálogo de reserva: só aparece se o Supabase estiver fora do ar.
// O conteúdo real da loja vive em public.products / public.site_content.
const sizesAdult = [38, 39, 40, 41, 42, 43, 44]
const sizesWide = [37, 38, 39, 40, 41, 42, 43, 44, 45]

const catalog = [
  {
    id: 'predator-elite-fg',
    model: 'Predator Elite FG',
    brand: 'Adidas',
    modality: 'Campo',
    price: 1290,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1571267434388-6a1df2649dce?q=80&w=1200',
    colors: [
      { name: 'Volt', hex: '#C8FF00', filter: 'saturate(1.08) contrast(1.04)' },
      { name: 'Preto', hex: '#111111', filter: 'grayscale(0.35) contrast(1.1)' },
      { name: 'Branco', hex: '#F4F4F0', filter: 'brightness(1.18) saturate(0.7)' },
    ],
    sizes: sizesWide,
  },
  {
    id: 'mercurial-vapor-16',
    model: 'Mercurial Vapor 16',
    brand: 'Nike',
    modality: 'Campo',
    price: 1190,
    image:
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1200',
    colors: [
      { name: 'Crimson', hex: '#E10600', filter: 'hue-rotate(-18deg) saturate(1.4)' },
      { name: 'Ice', hex: '#7EE0FF', filter: 'hue-rotate(160deg) saturate(1.2)' },
      { name: 'Preto', hex: '#161616', filter: 'grayscale(0.5)' },
    ],
    sizes: sizesAdult,
  },
  {
    id: 'future-ultimate-tf',
    model: 'Future Ultimate TF',
    brand: 'Puma',
    modality: 'Society',
    price: 890,
    image:
      'https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=1200',
    colors: [
      { name: 'Neon', hex: '#D4FF00', filter: 'saturate(1.1) contrast(1.05)' },
      { name: 'Roxo', hex: '#7A3CFF', filter: 'hue-rotate(240deg) saturate(1.3)' },
    ],
    sizes: sizesAdult,
  },
  {
    id: 'morelia-neo-iv',
    model: 'Morelia Neo IV',
    brand: 'Mizuno',
    modality: 'Campo',
    price: 980,
    image:
      'https://images.unsplash.com/photo-1570498839593-e565b39455fc?q=80&w=1200',
    colors: [
      { name: 'Ouro', hex: '#D4B45A', filter: 'sepia(0.45) saturate(1.2)' },
      { name: 'Azul', hex: '#1C4ED8', filter: 'hue-rotate(190deg) saturate(1.15)' },
    ],
    sizes: sizesWide,
  },
  {
    id: 'top-flex-in',
    model: 'Top Flex IN',
    brand: 'Joma',
    modality: 'Futsal',
    price: 620,
    image:
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200',
    colors: [
      { name: 'Branco', hex: '#F5F5F5', filter: 'brightness(1.2) saturate(0.6)' },
      { name: 'Preto', hex: '#0E0E0E', filter: 'grayscale(0.4) contrast(1.15)' },
      { name: 'Laranja', hex: '#FF6A00', filter: 'hue-rotate(-30deg) saturate(1.35)' },
    ],
    sizes: sizesAdult,
  },
  {
    id: 'furon-v7-pro',
    model: 'Furon v7 Pro',
    brand: 'New Balance',
    modality: 'Campo',
    price: 1050,
    image:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1200',
    colors: [
      { name: 'Lime', hex: '#B8FF00', filter: 'hue-rotate(20deg) saturate(1.3)' },
      { name: 'Grafite', hex: '#2A2A2E', filter: 'grayscale(0.55)' },
    ],
    sizes: sizesAdult,
  },
  {
    id: 'copa-pure-3',
    model: 'Copa Pure 3 TF',
    brand: 'Adidas',
    modality: 'Society',
    price: 740,
    image:
      'https://images.unsplash.com/photo-1486286701208-1d58e9338013?q=80&w=1200',
    colors: [
      { name: 'Marrom', hex: '#6B3E26', filter: 'sepia(0.55) saturate(1.1)' },
      { name: 'Branco', hex: '#EEEDE8', filter: 'brightness(1.16)' },
    ],
    sizes: sizesAdult,
  },
  {
    id: 'phantom-gx-2',
    model: 'Phantom GX 2 Academy',
    brand: 'Nike',
    modality: 'Society',
    price: 690,
    image:
      'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=1200',
    colors: [
      { name: 'Midnight', hex: '#0B1B3A', filter: 'hue-rotate(200deg) saturate(1.1)' },
      { name: 'Volt', hex: '#C8FF00', filter: 'saturate(1.35)' },
    ],
    sizes: sizesAdult,
  },
  {
    id: 'ultra-5-match',
    model: 'Ultra 5 Match IT',
    brand: 'Puma',
    modality: 'Futsal',
    price: 560,
    image:
      'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1200',
    colors: [
      { name: 'Rosa', hex: '#FF4FA3', filter: 'hue-rotate(300deg) saturate(1.4)' },
      { name: 'Preto', hex: '#101010', filter: 'grayscale(0.45)' },
    ],
    sizes: sizesAdult,
  },
  {
    id: 'alpha-pro-fs',
    model: 'Alpha Pro FS',
    brand: 'Joma',
    modality: 'Futsal',
    price: 490,
    image:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200',
    colors: [
      { name: 'Royal', hex: '#1E4DFF', filter: 'hue-rotate(210deg) saturate(1.25)' },
      { name: 'Branco', hex: '#F7F7F7', filter: 'brightness(1.2) saturate(0.5)' },
    ],
    sizes: sizesAdult,
  },
  {
    id: 'rebula-cup',
    model: 'Rebula Cup Japan',
    brand: 'Mizuno',
    modality: 'Campo',
    price: 1340,
    image:
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1200',
    colors: [
      { name: 'Prata', hex: '#C9CDD3', filter: 'grayscale(0.25) brightness(1.15)' },
      { name: 'Verde', hex: '#1FAE5A', filter: 'hue-rotate(90deg) saturate(1.2)' },
    ],
    sizes: sizesWide,
  },
  {
    id: 'tekela-v4-pro',
    model: 'Tekela v4 Pro',
    brand: 'New Balance',
    modality: 'Society',
    price: 820,
    image:
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=1200',
    colors: [
      { name: 'Flame', hex: '#FF3B1F', filter: 'hue-rotate(-10deg) saturate(1.45)' },
      { name: 'Preto', hex: '#121212', filter: 'grayscale(0.5) contrast(1.1)' },
    ],
    sizes: sizesAdult,
  },
]

const ANGLE_BANK = [
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1200',
  'https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=1200',
  'https://images.unsplash.com/photo-1571267434388-6a1df2649dce?q=80&w=1200',
  'https://images.unsplash.com/photo-1570498839593-e565b39455fc?q=80&w=1200',
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200',
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1200',
  'https://images.unsplash.com/photo-1486286701208-1d58e9338013?q=80&w=1200',
  'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=1200',
  'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=1200',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200',
  'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1200',
  'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=1200',
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1200',
  'https://images.unsplash.com/photo-1575361204480-aadea25e6f68?q=80&w=1200',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?q=80&w=1200',
  'https://images.unsplash.com/photo-1518091043644-c1d4457512c8?q=80&w=1200',
]

const ANGLE_LABELS = ['Frontal', 'Lateral', 'Solado', 'Detalhe', 'Em campo']

const PRODUCT_COPY = {
  'predator-elite-fg': {
    description:
      'A Predator Elite FG é a chuteira de trava para quem vive de passe e finalização. Cabedal aderente, silhueta agressiva e grip de campo para o drop premium da CAIO IMPORTS.',
    specs: { cabedal: 'Primeknit', solado: 'FG — campo', peso: 'Leve', origem: 'Importada' },
  },
  'mercurial-vapor-16': {
    description:
      'Mercurial Vapor 16 pensada para explosão. Perfil baixo, bico afiado e trava de campo para quem quer velocidade sem perder presença no gramado.',
    specs: { cabedal: 'Flyknit', solado: 'FG — campo', peso: 'Ultra leve', origem: 'Importada' },
  },
  'future-ultimate-tf': {
    description:
      'Future Ultimate TF mistura society e street. Solado de borracha para grama sintética, ajuste envolvente e visual neon para quem joga à noite.',
    specs: { cabedal: 'FUZIONFIT', solado: 'TF — society', peso: 'Médio', origem: 'Importada' },
  },
  'morelia-neo-iv': {
    description:
      'Morelia Neo IV é couro, toque e tradição japonesa. Leve no campo, precisa no domínio e com acabamento que pede close em todos os ângulos.',
    specs: { cabedal: 'Couro kangaroo', solado: 'FG — campo', peso: 'Leve', origem: 'Importada' },
  },
  'top-flex-in': {
    description:
      'Top Flex IN é a clássica de futsal: flexível na ponta, estável no pivô e pronta para quadra. Ideal para quem quer controle curto e giro rápido.',
    specs: { cabedal: 'Couro sintético', solado: 'IN — futsal', peso: 'Leve', origem: 'Importada' },
  },
  'furon-v7-pro': {
    description:
      'Furon v7 Pro entrega chute limpo e arrancada. Cabedal firme no peito do pé e solado de campo para quem finaliza de média distância.',
    specs: { cabedal: 'Hypoknit', solado: 'FG — campo', peso: 'Leve', origem: 'Importada' },
  },
  'copa-pure-3': {
    description:
      'Copa Pure 3 TF traz o toque da Copa para o society. Silhueta clean, solado de borracha e visual clássico que funciona na rua e na pelada.',
    specs: { cabedal: 'Couro sintético', solado: 'TF — society', peso: 'Médio', origem: 'Importada' },
  },
  'phantom-gx-2': {
    description:
      'Phantom GX 2 Academy é controle de bola em society. Textura no cabedal, solado TF e design midnight para quem arma o jogo no miolo.',
    specs: { cabedal: 'Mesh texturizado', solado: 'TF — society', peso: 'Leve', origem: 'Importada' },
  },
  'ultra-5-match': {
    description:
      'Ultra 5 Match IT é futsal rápido: perfil baixo, solado indoor e visual rosa/preto para quem vive de contra-ataque na quadra.',
    specs: { cabedal: 'ULTRAWEAVE', solado: 'IT — futsal', peso: 'Ultra leve', origem: 'Importada' },
  },
  'alpha-pro-fs': {
    description:
      'Alpha Pro FS equilibra preço e desempenho no futsal. Cabedal resistente, solado de borracha para quadra e numeração completa para o dia a dia.',
    specs: { cabedal: 'Sintético premium', solado: 'FS — futsal', peso: 'Médio', origem: 'Importada' },
  },
  'rebula-cup': {
    description:
      'Rebula Cup Japan é o topo Mizuno: toque cirúrgico, silhueta japonesa e trava de campo para quem trata o jogo como precisão, não volume.',
    specs: { cabedal: 'Couro premium', solado: 'FG — campo', peso: 'Leve', origem: 'Importada' },
  },
  'tekela-v4-pro': {
    description:
      'Tekela v4 Pro é society com pegada de speed. Cabedal envolvente, solado TF e cor flame para quem quer ser visto no primeiro toque.',
    specs: { cabedal: 'Knit técnico', solado: 'TF — society', peso: 'Leve', origem: 'Importada' },
  },
}

function buildImages(mainSrc, index) {
  const extras = ANGLE_BANK.filter((src) => src !== mainSrc)
  const rotated = extras.slice(index).concat(extras.slice(0, index))
  const sources = [mainSrc, ...rotated.slice(0, 4)]
  return sources.map((src, i) => ({
    src,
    label: ANGLE_LABELS[i] ?? `Ângulo ${i + 1}`,
  }))
}

export const products = catalog.map((item, index) => ({
  ...item,
  ...PRODUCT_COPY[item.id],
  images: buildImages(item.image, index),
  stock: 0,
}))

