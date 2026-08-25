import { CircleDot, Info, MessageCircle, Ruler, Truck } from 'lucide-react'
import { useCatalog } from '../hooks/useCatalog'

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
      <div className="section-head">
        <p className="kicker">{copy.kicker}</p>
        <h2 className="section-title">{copy.title}</h2>
      </div>
      <div className="guide-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => {
          const Icon = ICONS[item.icon] ?? Info
          return (
            <article key={`${item.title}-${index}`} className="guide-card">
              <Icon size={22} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
