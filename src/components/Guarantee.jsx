import { ShieldCheck } from 'lucide-react'
import { useCatalog } from '../hooks/useCatalog'
import BlurText from './bits/BlurText'

export default function Guarantee() {
  const { content } = useCatalog()
  const copy = content.guarantee

  return (
    <section className="guarantee" id="garantia">
      <div className="guarantee__panel flex flex-col lg:flex-row gap-10 lg:gap-16">
        <div className="guarantee__stamp">
          <ShieldCheck size={28} />
          <span>{copy.stampNumber}</span>
          <strong>{copy.stampLabel}</strong>
        </div>
        <div className="guarantee__copy">
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
        </div>
      </div>
    </section>
  )
}
