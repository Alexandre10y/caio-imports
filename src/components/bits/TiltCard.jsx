import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'

const springValues = {
  damping: 22,
  stiffness: 180,
  mass: 0.7,
}

export default function TiltCard({
  children,
  className = '',
  rotateAmplitude = 11,
  scaleOnHover = 1.035,
}) {
  const ref = useRef(null)
  const rotateX = useSpring(useMotionValue(0), springValues)
  const rotateY = useSpring(useMotionValue(0), springValues)
  const scale = useSpring(1, springValues)
  const glareX = useSpring(50, springValues)
  const glareY = useSpring(50, springValues)
  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(200,255,0,0.12), transparent 42%)`,
  )

  function handleMouse(e) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - rect.width / 2
    const offsetY = e.clientY - rect.top - rect.height / 2
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude)
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude)
    glareX.set(((e.clientX - rect.left) / rect.width) * 100)
    glareY.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  return (
    <div
      ref={ref}
      className={`tilt-stage ${className}`.trim()}
      onMouseMove={handleMouse}
      onMouseEnter={() => scale.set(scaleOnHover)}
      onMouseLeave={() => {
        scale.set(1)
        rotateX.set(0)
        rotateY.set(0)
        glareX.set(50)
        glareY.set(50)
      }}
    >
      <motion.div className="tilt-inner" style={{ rotateX, rotateY, scale }}>
        {children}
        <motion.span className="tilt-glare" style={{ background: glareBackground }} />
      </motion.div>
    </div>
  )
}
