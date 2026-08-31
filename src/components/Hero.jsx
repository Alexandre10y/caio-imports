import { useRef } from 'react'
import { ArrowDownRight } from 'lucide-react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { useCatalog } from '../hooks/useCatalog'
import { useTheme } from '../hooks/useTheme'
import { DEFAULT_CONTENT } from '../lib/defaultContent'
import Aurora from './bits/Aurora'
import BlurText from './bits/BlurText'
import DecryptedText from './bits/DecryptedText'
import Magnet from './bits/Magnet'
import TiltCard from './bits/TiltCard'

const HERO_SHOT_COUNT = 3

function resolveHeroShots(hero) {
  const defaults = DEFAULT_CONTENT.hero.shots ?? []
  const fromContent = Array.isArray(hero?.shots) ? hero.shots : []

  return Array.from({ length: HERO_SHOT_COUNT }, (_, index) => ({
    src: fromContent[index]?.src?.trim() || defaults[index]?.src || '',
    alt: fromContent[index]?.alt?.trim() || defaults[index]?.alt || 'Chuteira',
  })).filter((shot) => shot.src)
}
export default function Hero() {
  const { theme } = useTheme()
  const { brands, content } = useCatalog()
  const copy = content.hero
  const heroShots = resolveHeroShots(copy)
  const marquee = brands.length > 0 ? brands : ['Adidas', 'Nike', 'Puma']
  const auroraStops =
    theme === 'light' ? ['#8FBF00', '#2BBF8A', '#3B6BFF'] : ['#C8FF00', '#4DFFB0', '#245CFF']

  const reduceMotion = useReducedMotion()
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const stackY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 120])
  const stackRotate = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -4])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 48])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduceMotion ? 1 : 0.35])
  const marqueeX = useTransform(scrollYProgress, [0, 1], ['0%', reduceMotion ? '0%' : '-22%'])
  const smoothMarqueeX = useSpring(marqueeX, { stiffness: 60, damping: 24 })

  return (
    <section className="hero" id="topo" ref={sectionRef}>
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
        <motion.div className="hero__copy" style={{ y: copyY, opacity: copyOpacity }}>
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
            <Magnet padding={56} magnetStrength={5} disabled={Boolean(reduceMotion)}>
              <a className="cta-volt inline-flex items-center gap-2" href="#vitrine">
                {copy.ctaLabel}
                <ArrowDownRight size={18} />
              </a>
            </Magnet>
            <span className="hero__meta">{copy.meta}</span>
          </div>
        </motion.div>

        <motion.div
          className="hero__stack"
          style={{ y: stackY, rotate: stackRotate }}
        >
          {heroShots.map((shot, index) => (
            <TiltCard
              key={`${index}-${shot.src}`}
              className={`hero-shot hero-shot--${index}`}
              rotateAmplitude={reduceMotion ? 0 : 6}
              scaleOnHover={reduceMotion ? 1 : 1.02}
            >
              <img src={shot.src} alt={shot.alt} />
            </TiltCard>
          ))}
          <motion.div
            className="hero-badge"
            initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.55, type: 'spring', stiffness: 220, damping: 16 }}
          >
            <span>LIVE</span>
            {copy.badge}
          </motion.div>
        </motion.div>
      </div>

      <div className="marquee" aria-hidden="true">
        <motion.div className="marquee__scroll" style={{ x: smoothMarqueeX }}>
          <div className="marquee__track">
            {[...marquee, ...marquee, ...marquee, ...marquee].map((brand, index) => (
              <span key={`${brand}-${index}`}>
                {brand} <em>/</em>
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
