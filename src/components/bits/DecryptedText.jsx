import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&'

export default function DecryptedText({
  text,
  speed = 28,
  maxIterations = 12,
  sequential = true,
  className = '',
  encryptedClassName = 'decrypted-text__ghost',
  animateOn = 'view',
}) {
  const [displayText, setDisplayText] = useState(text)
  const [revealed, setRevealed] = useState(() => new Set())
  const [isAnimating, setIsAnimating] = useState(false)
  const hasAnimated = useRef(false)
  const containerRef = useRef(null)

  const shuffle = useCallback(
    (original, currentRevealed) =>
      original
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' '
          if (currentRevealed.has(i)) return original[i]
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        })
        .join(''),
    [],
  )

  const triggerDecrypt = useCallback(() => {
    setRevealed(new Set())
    setIsAnimating(true)
  }, [])

  useEffect(() => {
    if (!isAnimating) return

    let iteration = 0
    const interval = setInterval(() => {
      setRevealed((prev) => {
        if (sequential) {
          if (prev.size < text.length) {
            const next = new Set(prev)
            let idx = next.size
            while (idx < text.length && text[idx] === ' ') {
              next.add(idx)
              idx += 1
            }
            if (idx < text.length) next.add(idx)
            setDisplayText(shuffle(text, next))
            if (next.size >= text.length) {
              clearInterval(interval)
              setIsAnimating(false)
              setDisplayText(text)
            }
            return next
          }
          clearInterval(interval)
          setIsAnimating(false)
          setDisplayText(text)
          return prev
        }

        setDisplayText(shuffle(text, prev))
        iteration += 1
        if (iteration >= maxIterations) {
          clearInterval(interval)
          setIsAnimating(false)
          setDisplayText(text)
        }
        return prev
      })
    }, speed)

    return () => clearInterval(interval)
  }, [isAnimating, maxIterations, sequential, shuffle, speed, text])

  useEffect(() => {
    if (animateOn !== 'view') {
      triggerDecrypt()
      return undefined
    }

    const node = containerRef.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          triggerDecrypt()
        }
      },
      { threshold: 0.25 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [animateOn, triggerDecrypt])

  const chars = useMemo(() => displayText.split(''), [displayText])

  return (
    <span ref={containerRef} className={`decrypted-text ${className}`.trim()} aria-label={text}>
      {chars.map((char, index) => {
        const done = revealed.has(index) || (!isAnimating && displayText === text)
        return (
          <span key={`${char}-${index}`} className={done ? undefined : encryptedClassName}>
            {char}
          </span>
        )
      })}
    </span>
  )
}
