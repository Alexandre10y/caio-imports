import { formatBRL } from '../lib/format'

export default function PriceFilter({ min, max, bounds, onChange }) {
  const span = bounds.max - bounds.min || 1
  const left = ((min - bounds.min) / span) * 100
  const right = 100 - ((max - bounds.min) / span) * 100

  function handleMin(event) {
    const next = Math.min(Number(event.target.value), max - 10)
    onChange({ min: next, max })
  }

  function handleMax(event) {
    const next = Math.max(Number(event.target.value), min + 10)
    onChange({ min, max: next })
  }

  return (
    <div className="price-filter">
      <div className="flex items-center justify-between gap-3">
        <span className="price-filter__label">Filtrar os preços</span>
        <span className="price-filter__value">
          {formatBRL(min)} — {formatBRL(max)}
        </span>
      </div>
      <div className="price-filter__track">
        <div className="price-filter__range" style={{ left: `${left}%`, right: `${right}%` }} />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          value={min}
          onChange={handleMin}
          aria-label="Preço mínimo"
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          value={max}
          onChange={handleMax}
          aria-label="Preço máximo"
        />
      </div>
    </div>
  )
}
