import { CircleDot, Info, MessageCircle, Ruler, Truck } from 'lucide-react'
import { useCatalog } from '../hooks/useCatalog'
import ScrollReveal from './bits/ScrollReveal'

const ICONS = {
  message: MessageCircle,
  field: CircleDot,
  ruler: Ruler,
  truck: Truck,
  info: Info,
}

export default function StoreGuide() {
  const { content } = useCatalog()
  const copy = content.guide
  const items = Array.isArray(copy.items) ? copy.items : []

  if (items.length === 0) return null

  return (
    <section className="guide" id="info">
      <ScrollReveal className="section-head">
        <p className="kicker">{copy.kicker}</p>
        <h2 className="section-title">{copy.title}</h2>
      </ScrollReveal>
      <div className="guide-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => {
          const Icon = ICONS[item.icon] ?? Info
          return (
            <ScrollReveal
              key={`${item.title}-${index}`}
              delay={Math.min(index * 0.07, 0.28)}
              direction={index % 2 === 0 ? 'left' : 'right'}
            >
              <article className="guide-card">
                <Icon size={22} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            </ScrollReveal>
          )
        })}
      </div>
    </section>
  )
}
