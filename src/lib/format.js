export function formatBRL(value) {
  const number = Number(value ?? 0)
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function toDateInput(value) {
  const date = value ? new Date(value) : new Date()
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function onlyDigits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

export function slugify(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildWhatsAppLink({ model, color, size, phone }) {
  const text = `Olá, tenho interesse na chuteira ${model} na cor ${color}, tamanho ${size}`
  return `https://wa.me/${onlyDigits(phone)}?text=${encodeURIComponent(text)}`
}

export function buildDirectWhatsAppLink(phone, message = '') {
  const digits = onlyDigits(phone)
  if (!digits) return null
  const suffix = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digits}${suffix}`
}
