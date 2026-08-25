import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { formatBRL } from '../lib/format'

/**
 * Scroll vertical vira trilha horizontal de drops — peça-assinatura da loja.
 * Em monitores largos a trilha é medida em px, preenchida em loop e avança
 * mais rápido (menos altura vertical → mais deslocamento lateral).
 */
export default function DropRail({ products = [] }) {
  const reduceMotion = useReducedMotion()
  const [narrow, setNarrow] = useState(false)
  const [travel, setTravel] = useState(0)
  const sectionRef = useRef(null)
  const stickyRef = useRef(null)
  const trackRef = useRef(null)
  const base = products.slice(0, 10)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)')
    const sync = () => setNarrow(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  // Em telas largas repetimos o drop para a trilha sempre estourar a viewport.
  const loopCopies = narrow || reduceMotion ? 1 : 3
  const items = Array.from({ length: loopCopies }, (_, copy) =>
    base.map((product, index) => ({
      ...product,
      railKey: `${product.id}-${copy}-${index}`,
      displayIndex: index,
    })),
  ).flat()

  useLayoutEffect(() => {
    if (narrow || reduceMotion) return undefined

    function measure() {
      const track = trackRef.current
      const sticky = stickyRef.current
      if (!track || !sticky) return
      // Sobras além da viewport + um “empurrão” extra para o loop parecer contínuo.
      const overflow = Math.max(track.scrollWidth - sticky.clientWidth, 0)
      const loopStride = track.scrollWidth / loopCopies
      setTravel(Math.max(overflow, loopStride * 0.92))
    }

    measure()
    const observer = new ResizeObserver(measure)
    if (trackRef.current) observer.observe(trackRef.current)
    if (stickyRef.current) observer.observe(stickyRef.current)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [items.length, loopCopies, narrow, reduceMotion])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const rawX = useTransform(scrollYProgress, [0, 1], [0, -travel])
  const x = useSpring(rawX, { stiffness: 95, damping: 28, mass: 0.28 })

  if (base.length < 3) return null

  const staticMode = reduceMotion || narrow

  if (staticMode) {
    return (
      <section className="drop-rail drop-rail--static" aria-label="Drops em destaque">
        <div className="drop-rail__intro">
          <p className="kicker">Scroll do drop</p>
          <h2 className="section-title">ARRASTA O OLHO. TRAVA O PAR.</h2>
        </div>
        <div className="drop-rail__static-track">
          {base.map((product, index) => (
            <DropCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>
    )
  }

  // Altura curta: pouco scroll vertical → trilha anda rápido para o lado.
  const sectionStyle = {
    height: `max(135vh, calc(100vh + ${Math.round(travel * 0.55)}px))`,
  }

  return (
    <section
      ref={sectionRef}
      className="drop-rail"
      style={sectionStyle}
      aria-label="Drops em destaque"
    >
      <div className="drop-rail__sticky" ref={stickyRef}>
        <div className="drop-rail__intro">
          <p className="kicker">Scroll do drop</p>
          <h2 className="section-title">ARRASTA O OLHO. TRAVA O PAR.</h2>
          <p className="drop-rail__hint">Desce um pouco — a trilha corre de lado.</p>
        </div>

        <motion.div className="drop-rail__track" ref={trackRef} style={{ x }}>
          {items.map((product) => (
            <DropCard
              key={product.railKey}
              product={product}
              index={product.displayIndex}
            />
          ))}
        </motion.div>

        <motion.div className="drop-rail__meter" aria-hidden="true">
          <motion.span style={{ scaleX: scrollYProgress }} />
        </motion.div>
      </div>
    </section>
  )
}

function DropCard({ product, index }) {
  return (
    <Link to={`/chuteira/${product.id}`} className="drop-rail__card">
      <span className="drop-rail__index">{String(index + 1).padStart(2, '0')}</span>
      <div className="drop-rail__media">
        <img src={product.image} alt="" loading="lazy" />
      </div>
      <div className="drop-rail__meta">
        <small>{product.brand}</small>
        <strong>{product.model}</strong>
        <em>{formatBRL(product.price)}</em>
      </div>
    </Link>
  )
}
