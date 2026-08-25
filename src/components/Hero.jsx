import { ArrowDownRight } from 'lucide-react'
import { useCatalog } from '../hooks/useCatalog'
import { useTheme } from '../hooks/useTheme'
import Aurora from './bits/Aurora'
import BlurText from './bits/BlurText'
import DecryptedText from './bits/DecryptedText'
import TiltCard from './bits/TiltCard'

const HERO_SHOTS = [
  {
    src: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=900',
    alt: 'Chuteira em close sobre gramado',
  },
  {
    src: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=900',
    alt: 'Chuteiras Adidas ao lado de bola de futebol',
  },
  {
    src: 'https://images.unsplash.com/photo-1571267434388-6a1df2649dce?q=80&w=900',
    alt: 'Par de chuteiras pretas no campo',
  },
]

export default function Hero() {
  const { theme } = useTheme()
  const { brands, content } = useCatalog()
  const copy = content.hero
  const marquee = brands.length > 0 ? brands : ['Adidas', 'Nike', 'Puma']
  const auroraStops =
    theme === 'light' ? ['#8FBF00', '#2BBF8A', '#3B6BFF'] : ['#C8FF00', '#4DFFB0', '#245CFF']

  return (
    <section className="hero" id="topo">
      <div className="hero__aurora" aria-hidden="true">
        <Aurora
          key={theme}
          colorStops={auroraStops}
          amplitude={1.15}
          blend={0.62}
          speed={0.85}
        />
      </div>
      <div className="hero__veil" aria-hidden="true" />

      <div className="hero__grid flex flex-col lg:flex-row lg:items-start gap-8">
        <div className="hero__copy">
          <p className="hero__eyebrow">
            <DecryptedText text={copy.eyebrow} sequential speed={22} />
          </p>
          <h1 className="hero__title">
            <BlurText
              key={copy.title}
              text={copy.title}
              animateBy="letters"
              delay={70}
              className="hero__title-line"
              as="span"
            />
            <span className="hero__title-line hero__title-line--accent">
              <DecryptedText text={copy.titleAccent} sequential speed={18} />
            </span>
          </h1>
          <p className="hero__lead">{copy.lead}</p>
          <div className="flex flex-wrap items-center gap-4">
            <a className="cta-volt inline-flex items-center gap-2" href="#vitrine">
              {copy.ctaLabel}
              <ArrowDownRight size={18} />
            </a>
            <span className="hero__meta">{copy.meta}</span>
          </div>
        </div>

        <div className="hero__stack">
          {HERO_SHOTS.map((shot, index) => (
            <TiltCard key={shot.src} className={`hero-shot hero-shot--${index}`} rotateAmplitude={6} scaleOnHover={1.02}>
              <img src={shot.src} alt={shot.alt} />
            </TiltCard>
          ))}
          <div className="hero-badge">
            <span>LIVE</span>
            {copy.badge}
          </div>
        </div>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[...marquee, ...marquee, ...marquee].map((brand, index) => (
            <span key={`${brand}-${index}`}>
              {brand} <em>/</em>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
