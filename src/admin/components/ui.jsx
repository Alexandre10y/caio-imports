import { Loader2 } from 'lucide-react'

export function Panel({ title, description, actions, children, className = '' }) {
  return (
    <section className={`ad-panel ${className}`}>
      {title || actions ? (
        <header className="ad-panel__head">
          <div>
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className="ad-panel__actions">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}

export function Field({ label, hint, children, wide = false }) {
  return (
    <label className={`ad-field ${wide ? 'ad-field--wide' : ''}`}>
      <span className="ad-field__label">{label}</span>
      {children}
      {hint ? <span className="ad-field__hint">{hint}</span> : null}
    </label>
  )
}

export function StatCard({ label, value, hint, tone = 'default' }) {
  return (
    <article className={`ad-stat ad-stat--${tone}`}>
      <p className="ad-stat__label">{label}</p>
      <strong className="ad-stat__value">{value}</strong>
      {hint ? <p className="ad-stat__hint">{hint}</p> : null}
    </article>
  )
}

const STATUS_LABEL = {
  negociando: 'Negociando',
  pago: 'Pago',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

export function StatusBadge({ status }) {
  return <span className={`ad-badge ad-badge--${status}`}>{STATUS_LABEL[status] ?? status}</span>
}

export function Spinner({ label = 'Carregando…' }) {
  return (
    <p className="ad-loading">
      <Loader2 size={16} className="ad-spin" />
      {label}
    </p>
  )
}

export function Feedback({ state }) {
  if (!state?.message) return null
  return <p className={`ad-feedback ad-feedback--${state.type ?? 'info'}`}>{state.message}</p>
}

export function EmptyState({ children }) {
  return <p className="ad-empty">{children}</p>
}
