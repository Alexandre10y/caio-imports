import { motion, useReducedMotion } from 'motion/react'

const OFFSETS = {
  up: { y: 36, x: 0 },
  down: { y: -28, x: 0 },
  left: { y: 0, x: 40 },
  right: { y: 0, x: -40 },
}

/**
 * Revela o bloco ao entrar na viewport. Experiência fixa da empresa —
 * não vira controle no painel do lojista.
 */
export default function ScrollReveal({
  children,
  className = '',
  as = 'div',
  direction = 'up',
  delay = 0,
  once = true,
  amount = 0.22,
}) {
  const reduceMotion = useReducedMotion()
  const MotionTag = motion[as] ?? motion.div
  const offset = OFFSETS[direction] ?? OFFSETS.up

  if (reduceMotion) {
    const StaticTag = as
    return <StaticTag className={className}>{children}</StaticTag>
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount, margin: '0px 0px -8% 0px' }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionTag>
  )
}
