import { ShieldCheck } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useCatalog } from '../hooks/useCatalog'
import BlurText from './bits/BlurText'
import ScrollReveal from './bits/ScrollReveal'

export default function Guarantee() {
  const { content } = useCatalog()
  const copy = content.guarantee
  const reduceMotion = useReducedMotion()

  return (
    <section className="guarantee" id="garantia">
      <div className="guarantee__panel flex flex-col lg:flex-row gap-10 lg:gap-16">
        <motion.div
          className="guarantee__stamp"
          initial={reduceMotion ? false : { rotate: -18, scale: 0.7, opacity: 0 }}
          whileInView={{ rotate: -6, scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14 }}
          whileHover={reduceMotion ? undefined : { rotate: 0, scale: 1.04 }}
        >
          <ShieldCheck size={28} />
          <span>{copy.stampNumber}</span>
          <strong>{copy.stampLabel}</strong>
        </motion.div>
        <ScrollReveal className="guarantee__copy" direction="right" delay={0.1}>
          <p className="kicker">{copy.kicker}</p>
          <BlurText
            key={copy.title}
            text={copy.title}
            animateBy="words"
            delay={70}
            className="section-title"
            as="h2"
          />
          <p>{copy.text}</p>
          <p className="guarantee__fine">{copy.fine}</p>
        </ScrollReveal>
      </div>
    </section>
  )
}
